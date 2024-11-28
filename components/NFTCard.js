import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import NFTManageModal from "./NFTManageModal";
import { xrplService } from "../services/xrpl.service";
import { createPortal } from "react-dom";

export default function NFTCard({ nft, isOwned }) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [saleInfo, setSaleInfo] = useState(null);
  const [isCheckingSale, setIsCheckingSale] = useState(true);

  const checkSaleStatus = useCallback(async () => {
    if (!nft?.NFTokenID) {
      console.log("No NFT Token ID available");
      setIsCheckingSale(false);
      return;
    }

    try {
      setIsCheckingSale(true);
      console.log("Checking sale status for NFT:", nft.NFTokenID);

      const offers = await xrplService.checkNFTOffers(nft.NFTokenID);
      console.log("Received offers:", offers);

      if (offers && offers.length > 0) {
        const latestOffer = offers[0];
        console.log("Found active sell offer:", latestOffer);

        const priceInXRP = Number(latestOffer.amount) / 1000000;

        setSaleInfo({
          isOnSale: true,
          price: priceInXRP,
          offerIndex: latestOffer.nft_offer_index,
          seller: latestOffer.owner,
        });

        console.log("Set sale info:", {
          isOnSale: true,
          price: priceInXRP,
          offerIndex: latestOffer.nft_offer_index,
          seller: latestOffer.owner,
        });
      } else {
        console.log("No active sell offers found");
        setSaleInfo({ isOnSale: false });
      }
    } catch (error) {
      console.error("Error checking sale status:", error);
      setSaleInfo({ isOnSale: false, error: error.message });
    } finally {
      setIsCheckingSale(false);
    }
  }, [nft?.NFTokenID]);

  useEffect(() => {
    checkSaleStatus();
  }, [checkSaleStatus]);

  useEffect(() => {
    console.log("Current sale info:", saleInfo);
    console.log("Is checking sale:", isCheckingSale);
  }, [saleInfo, isCheckingSale]);

  const getImageUrl = (ipfsUrl) => {
    if (!ipfsUrl) return "/placeholder-nft.png";
    if (ipfsUrl.startsWith("http")) return ipfsUrl;
    if (ipfsUrl.startsWith("ipfs://")) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.replace(
        "ipfs://",
        ""
      )}`;
    }
    if (ipfsUrl.startsWith("Qm") || ipfsUrl.startsWith("bafy")) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
    }
    return ipfsUrl;
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const imageUrl = getImageUrl(nft.metadata?.image);

  const getExplorerUrl = (tokenId) => {
    const baseUrl =
      nft.network === "Testnet"
        ? "https://testnet.xrpl.org"
        : "https://xrpl.org";
    return `${baseUrl}/nft/${tokenId}`;
  };

  return (
    <>
      <div className="nft-card-modern group">
        {/* Image Container */}
        <div className="relative h-72 w-full overflow-hidden rounded-t-xl">
          {!imageError ? (
            <>
              <Image
                src={imageUrl}
                alt={nft.metadata?.name || "NFT"}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onLoadingComplete={() => setIsLoading(false)}
                onError={handleImageError}
              />
              {/* Sale Status Badge */}
              {saleInfo?.isOnSale && (
                <div className="absolute top-4 left-4 z-20">
                  <div className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>On Sale: {saleInfo.price} XRP</span>
                  </div>
                </div>
              )}
              {/* Network Badge */}
              <div className="absolute top-4 right-4">
                <span className="nft-category-tag">
                  {nft.network || "Testnet"}
                </span>
              </div>
              {/* Ownership Badge */}
              {isOwned && (
                <div className="absolute bottom-4 left-4">
                  <span className="nft-time-tag">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {saleInfo?.isOnSale ? "Listed" : "Owned"}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center p-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500 font-medium">
                  Image not available
                </p>
              </div>
            </div>
          )}
          {isLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 bg-white rounded-b-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl mb-2 font-playfair">
                {nft.metadata?.name || "Unnamed NFT"}
              </h3>
              <p className="text-gray-600 text-sm flex items-center">
                by {nft.metadata?.creator || "Unknown"}
                {nft.metadata?.properties && (
                  <>
                    <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mx-2"></span>
                    {Object.keys(nft.metadata.properties).length} properties
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() =>
                window.open(getExplorerUrl(nft.NFTokenID), "_blank")
              }
              className="nft-like-button"
              title="View on Explorer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </div>

          {/* Properties Preview */}
          {nft.metadata?.properties &&
            Object.keys(nft.metadata.properties).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(nft.metadata.properties)
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="px-3 py-1 bg-indigo-50 rounded-full text-xs font-medium text-indigo-600"
                    >
                      {key}: {value}
                    </div>
                  ))}
                {Object.keys(nft.metadata.properties).length > 2 && (
                  <div className="px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-600">
                    +{Object.keys(nft.metadata.properties).length - 2} more
                  </div>
                )}
              </div>
            )}

          {/* Footer with Sale Status */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-semibold text-gray-900">
                {isCheckingSale ? (
                  <span className="text-gray-400">Checking status...</span>
                ) : saleInfo?.isOnSale ? (
                  <span className="flex items-center gap-1.5 text-purple-600">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Listed for {saleInfo.price} XRP
                  </span>
                ) : isOwned ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="text-emerald-700">Owned</span>
                  </span>
                ) : (
                  "Not for sale"
                )}
              </p>
            </div>
            {isOwned && (
              <button
                onClick={() => setShowManageModal(true)}
                className="px-4 py-1.5 text-xs font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                {saleInfo?.isOnSale ? "Update Listing" : "Manage NFT"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manage Modal */}
      {showManageModal &&
        createPortal(
          <NFTManageModal
            nft={nft}
            onClose={() => {
              setShowManageModal(false);
              checkSaleStatus();
            }}
            currentSaleInfo={saleInfo}
            onSaleUpdate={(newSaleInfo) => setSaleInfo(newSaleInfo)}
          />,
          document.body
        )}
    </>
  );
}
