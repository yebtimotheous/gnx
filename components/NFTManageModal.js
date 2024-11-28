import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { xrplService } from "../services/xrpl.service";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function NFTManageModal({
  nft,
  onClose,
  currentSaleInfo,
  onSaleUpdate,
}) {
  // Set initial active tab based on sale status
  const [activeTab, setActiveTab] = useState(
    currentSaleInfo ? "update" : "sell"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [sellPrice, setSellPrice] = useState(
    currentSaleInfo ? (currentSaleInfo.price || "").toString() : ""
  );
  const [recipientAddress, setRecipientAddress] = useState("");
  const { account } = useWallet();

  // Get available tabs based on sale status
  const getTabs = () => {
    if (currentSaleInfo) {
      return ["update", "transfer"];
    }
    return ["sell", "transfer"];
  };

  const handleSellOffer = async (e) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      if (!sellPrice || parseFloat(sellPrice) <= 0) {
        throw new Error("Please enter a valid price");
      }

      const priceInDrops = (parseFloat(sellPrice) * 1000000).toString();

      // If updating existing offer, cancel it first
      if (currentSaleInfo?.offerIndex) {
        console.log("Cancelling existing offer:", currentSaleInfo.offerIndex);
        const cancelResult = await xrplService.cancelOffer(
          account,
          currentSaleInfo.offerIndex
        );

        if (!cancelResult.validated) {
          throw new Error("Failed to cancel existing offer");
        }

        // Wait a moment for the cancel to be processed
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log("Creating sell offer:", {
        tokenID: nft.NFTokenID,
        price: priceInDrops,
        account,
      });

      const result = await xrplService.createSellOffer(
        account,
        nft.NFTokenID,
        priceInDrops
      );

      if (!result.validated) {
        throw new Error("Failed to create new offer");
      }

      console.log("Sell offer result:", result);
      toast.success(
        currentSaleInfo
          ? "Offer updated successfully!"
          : "Sell offer created successfully!"
      );

      if (onSaleUpdate) {
        onSaleUpdate({
          isOnSale: true,
          price: parseFloat(sellPrice),
          offerIndex: result.offerIndex,
        });
      }

      onClose();
    } catch (error) {
      console.error("Error with sell offer:", error);
      setError(error.message || "Failed to process sell offer");
      toast.error(error.message || "Failed to process sell offer");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      if (!recipientAddress) {
        throw new Error("Please enter a recipient address");
      }

      // If NFT is listed for sale, cancel the offer first
      if (currentSaleInfo?.offerIndex) {
        console.log(
          "Cancelling existing offer before transfer:",
          currentSaleInfo.offerIndex
        );
        const cancelResult = await xrplService.cancelOffer(
          account,
          currentSaleInfo.offerIndex
        );

        if (!cancelResult.validated) {
          throw new Error("Failed to cancel existing offer");
        }

        // Wait a moment for the cancel to be processed
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log("Transferring NFT:", {
        tokenID: nft.NFTokenID,
        recipient: recipientAddress,
        account,
      });

      const result = await xrplService.transferNFT(
        account,
        recipientAddress,
        nft.NFTokenID
      );

      if (!result.validated) {
        throw new Error("Failed to transfer NFT");
      }

      console.log("Transfer result:", result);
      toast.success("NFT transferred successfully!");

      if (onSaleUpdate) {
        onSaleUpdate({
          isOnSale: false,
          price: null,
          offerIndex: null,
        });
      }

      onClose();
    } catch (error) {
      console.error("Error transferring NFT:", error);
      setError(error.message || "Failed to transfer NFT");
      toast.error(error.message || "Failed to transfer NFT");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        {/* NFT Preview Section with Gradient Overlay */}
        <div className="relative h-44">
          {/* Background Image with Blur */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={nft.metadata?.image || "/placeholder-nft.png"}
              alt="background"
              layout="fill"
              objectFit="cover"
              className="opacity-30 blur-xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/30 to-purple-600/30 mix-blend-overlay" />
          </div>

          {/* NFT Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-xl transform hover:scale-105 transition-transform duration-300">
              <Image
                src={nft.metadata?.image || "/placeholder-nft.png"}
                alt={nft.metadata?.name || "NFT Preview"}
                layout="fill"
                objectFit="cover"
                className="hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white backdrop-blur-sm transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 pt-4">
          {/* NFT Info */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold font-playfair bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              {nft.metadata?.name || "Unnamed NFT"}
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide">
              TOKEN ID: {nft.NFTokenID?.slice(0, 6)}...
              {nft.NFTokenID?.slice(-6)}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 rounded-2xl bg-black/5 backdrop-blur-xl mb-5">
            {getTabs().map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50/50 border border-red-100 backdrop-blur-sm">
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* Sell/Update Tab */}
          {(activeTab === "sell" || activeTab === "update") && (
            <form onSubmit={handleSellOffer} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {currentSaleInfo ? "Update Price" : "Set Your Price"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.000001"
                    min="0"
                    className="w-full px-4 py-3 pl-12 rounded-2xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 text-sm font-medium placeholder-gray-400"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-indigo-600 font-semibold text-sm">
                      ₽
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Price in XRP (1 XRP = 1,000,000 drops)
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </div>
                ) : currentSaleInfo ? (
                  "Update Offer"
                ) : (
                  "Create Offer"
                )}
              </button>
            </form>
          )}

          {/* Transfer Tab */}
          {activeTab === "transfer" && (
            <form onSubmit={handleTransfer} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter XRPL address"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 text-sm font-medium placeholder-gray-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Transfer NFT"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
