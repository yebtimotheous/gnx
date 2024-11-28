import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useWallet } from "../hooks/useWallet";
import { xrplService } from "../services/xrpl.service";
import { pinataService } from "../services/pinata.service";
import NFTForm from "../components/NFTForm";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import { NFTMinter } from "../services/NFTMinter";

export default function CreateNFT() {
  const router = useRouter();
  const { isConnected, account, isConnecting } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");

  // Check wallet connection status
  useEffect(() => {
    const checkConnection = async () => {
      // Wait for connection state to be determined
      if (isConnecting) return;

      // If not connected and not connecting, redirect to connect
      if (!isConnected && !isConnecting) {
        router.push("/?connect=true");
      }
    };

    checkConnection();
  }, [isConnected, isConnecting, router]);

  const handleNFTCreation = async (formData) => {
    if (isLoading) {
      console.log("Minting already in progress");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setStatus("Starting NFT creation process...");

      const nftMinter = new NFTMinter();

      // The NFTMinter service now handles the entire process
      const result = await nftMinter.mintNFT({
        ...formData,
        account: account,
      });

      console.log("NFT minted successfully:", result);

      setStatus("NFT created successfully!");
      toast.success("NFT created successfully!");

      // Immediate redirect after success
      router.replace("/my-nfts");
    } catch (err) {
      console.error("Error in NFT creation process:", err);
      setError(err.message || "Failed to create NFT");
      toast.error(err.message || "Failed to create NFT");
    } finally {
      setIsLoading(false);
      setStatus("");
    }
  };

  // Show loading state while checking connection
  if (isConnecting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Show form only if connected
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl mb-4">
          Please connect your wallet to create NFTs
        </h2>
        <button
          onClick={() => router.push("/?connect=true")}
          className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 font-playfair">Create NFT</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">
            {status || "Creating your NFT..."}
          </p>
        </div>
      ) : (
        <NFTForm onSubmit={handleNFTCreation} />
      )}
    </div>
  );
}
