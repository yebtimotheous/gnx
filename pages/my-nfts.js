import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useWallet } from "../context/WalletContext";
import { xrplService } from "../services/xrpl.service";
import NFTCard from "../components/NFTCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MyNFTsPage() {
  const router = useRouter();
  const { isConnected, account } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);

  useEffect(() => {
    if (!isConnected) {
      router.push("/?connect=true");
      return;
    }

    const fetchNFTsAndNetwork = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get network info first
        const network = await xrplService.getNetworkInfo();
        setNetworkInfo(network);

        // Then fetch NFTs
        const userNFTs = await xrplService.getNFTsForAccount(account);
        setNfts(userNFTs);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to load your NFTs: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTsAndNetwork();
  }, [isConnected, account, router]);

  if (!isConnected) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section with Network Info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold font-playfair text-gray-900">
                My NFTs
              </h1>
              {networkInfo && (
                <p className="text-sm text-gray-500 mt-1 font-body">
                  Connected to {networkInfo.network} • Ledger #
                  {networkInfo.networkLedger}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => router.push("/create-nft")}
            className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="font-medium">Create New NFT</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        ) : nfts.length === 0 ? (
          // Empty State
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No NFTs Found
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't created or collected any NFTs yet.
            </p>
            <button
              onClick={() => router.push("/create-nft")}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Create Your First NFT</span>
            </button>
          </div>
        ) : (
          // NFT Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <NFTCard key={nft.NFTokenID} nft={nft} isOwned={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
