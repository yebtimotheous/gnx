import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getCollections } from "../utils/databaseOperations";
import { NFTMinter } from "../services/NFTMinter";
import { useWallet } from "../context/WalletContext";

export default function NFTForm({ onSubmit }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [properties, setProperties] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const { account, isConnected } = useWallet();

  const [taxon, setTaxon] = useState("0");
  const [transferFee, setTransferFee] = useState("0");
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    // Load collections from database
    const dbCollections = getCollections();
    setCollections(Object.values(dbCollections));
  }, []);

  // Debug log for wallet connection
  useEffect(() => {
    if (account) {
      console.log("Wallet Debug Info:", {
        isConnected,
        account,
        accountType: typeof account,
        accountKeys: Object.keys(account),
      });
    }
  }, [isConnected, account]);

  const getWalletAddress = () => {
    if (!account) return null;

    // Log the full account object to see its structure
    console.log("Full account object:", account);

    // Try different possible address properties
    const address =
      account.address || // Standard format
      account.classicAddress || // XRPL format
      (typeof account === "string" ? account : null); // Direct address string

    console.log("Extracted address:", address);
    return address;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploading) {
      return;
    }

    setError("");

    try {
      // Get form values
      const name = e.target.nftName.value.trim();
      const description = e.target.description.value.trim();

      // Validate form data
      if (!name) {
        throw new Error("Please enter a name for your NFT");
      }

      if (!description) {
        throw new Error("Please enter a description for your NFT");
      }

      if (!image || !image.type.startsWith("image/")) {
        throw new Error("Please select a valid image for your NFT");
      }

      // Check wallet connection
      if (!isConnected) {
        throw new Error("Please connect your wallet first");
      }

      const walletAddress = getWalletAddress();
      if (!walletAddress) {
        throw new Error(
          "Wallet address not found. Please check your wallet connection."
        );
      }

      setIsUploading(true);

      // Log form data before submission
      console.log("Submitting NFT data:", {
        name,
        description,
        imageType: image.type,
        imageSize: image.size,
        walletAddress,
      });

      // Prepare form data
      const formData = {
        name,
        description,
        image,
        taxon: taxon || "0",
        transferFee: transferFee || "0",
        attributes: properties.filter((prop) => prop.trait_type && prop.value),
        account: walletAddress,
        additionalMetadata: {
          royalties: parseFloat(e.target.royalties?.value) || 0,
          collection: e.target.collection?.value || "",
        },
      };

      // Submit form data
      await onSubmit(formData);

      // Clear form after successful submission
      e.target.reset();
      setImage(null);
      setPreview("");
      setProperties([]);
      setTaxon("0");
      setTransferFee("0");
    } catch (error) {
      console.error("Error creating NFT:", error);
      setError(error.message || "Failed to create NFT. Please try again.");
      setIsUploading(false); // Reset upload state on error
    }
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addProperty = () => {
    setProperties([...properties, { trait_type: "", value: "" }]);
  };

  const removeProperty = (index) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const updateProperty = (index, field, value) => {
    const updatedProperties = [...properties];
    updatedProperties[index] = {
      ...updatedProperties[index],
      [field]: value,
    };
    setProperties(updatedProperties);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* File Upload Section */}
      <section className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6">
          Upload NFT
        </h2>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />

          {preview ? (
            <div className="relative h-[400px] w-full">
              <Image
                src={preview}
                alt="NFT Preview"
                fill
                className="object-contain rounded-2xl"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">
                Drag & drop or click to upload
              </p>
              <p className="text-sm text-gray-500 mt-2">
                PNG, JPG, GIF, WEBP. Max 100MB.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* NFT Details Section */}
      <section className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6">
          NFT Details
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-medium font-body text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="nftName"
              name="nftName"
              placeholder="Enter NFT name"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-black transition-colors duration-300 font-body"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium font-body text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your NFT"
              rows="4"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-black transition-colors duration-300 font-body"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium font-body text-gray-700">
                Taxon <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={taxon}
                onChange={(e) => setTaxon(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-black transition-colors duration-300 font-body"
                required
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Taxon is a required field for XRPL NFTs
              </p>
            </div>
            <div>
              <label className="block mb-2 font-medium font-body text-gray-700">
                Transfer Fee <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={transferFee}
                onChange={(e) => setTransferFee(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-black transition-colors duration-300 font-body"
                required
                min="0"
                max="50000"
                step="1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Transfer fee in basis points (0-50000, where 10000 = 100%)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Optional Properties Section */}
      <section className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold font-playfair text-gray-900">
              Additional Properties
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Add custom properties to your NFT (e.g., Collection, Rarity,
              Edition)
            </p>
          </div>
          <button
            type="button"
            onClick={addProperty}
            className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-300 font-body text-sm"
          >
            + Add Property
          </button>
        </div>
        <div className="space-y-4">
          {properties.map((property, index) => (
            <div
              key={index}
              className="flex space-x-4 bg-gray-50 p-4 rounded-xl items-center"
            >
              <input
                type="text"
                placeholder="Property Name"
                value={property.trait_type}
                onChange={(e) =>
                  updateProperty(index, "trait_type", e.target.value)
                }
                className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-black bg-white font-body"
              />
              <input
                type="text"
                placeholder="Value"
                value={property.value}
                onChange={(e) => updateProperty(index, "value", e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-black bg-white font-body"
              />
              <button
                type="button"
                onClick={() => removeProperty(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-300"
                title="Remove Property"
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
          {properties.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No properties added yet. Click "Add Property" to get started.
            </div>
          )}
        </div>
      </section>

      {/* Advanced Settings */}
      <section className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6">
          Advanced Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium font-body text-gray-700">
              Royalties (%)
            </label>
            <input
              type="number"
              id="royalties"
              name="royalties"
              placeholder="Enter royalty percentage"
              min="0"
              max="20"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-black transition-colors duration-300 font-body"
            />
            <p className="text-sm text-gray-500 mt-2 font-body">
              Suggested: 0%, 5%, 10%, 15%
            </p>
          </div>
          <div>
            <label className="block mb-2 font-medium font-body text-gray-700">
              Collection
            </label>
            <select
              id="collection"
              name="collection"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-black transition-colors duration-300 font-body"
              onChange={(e) => {
                const selectedCollection = collections.find(
                  (c) => c.id === e.target.value
                );
                if (selectedCollection) {
                  setTaxon(selectedCollection.taxon.toString());
                  setTransferFee(
                    selectedCollection.defaultTransferFee.toString()
                  );
                }
              }}
            >
              <option value="">Select Collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isUploading}
        className={
          isUploading
            ? "w-full py-4 rounded-xl transition-all duration-300 font-medium relative bg-gray-400 cursor-not-allowed text-white"
            : "w-full py-4 rounded-xl transition-all duration-300 font-medium relative bg-black hover:bg-gray-800 text-white"
        }
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
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
            Creating NFT...
          </div>
        ) : (
          "Create NFT"
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
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
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
