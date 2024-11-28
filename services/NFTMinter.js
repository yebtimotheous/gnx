import { pinataService } from "./pinata.service";
import { xrplService } from "./xrpl.service";

export class NFTMinter {
  constructor() {
    this.pinata = pinataService;
    this.xrpl = xrplService;
  }

  async mintNFT(formData) {
    try {
      // Validate form data first
      this.validateFormData(formData);

      // 1. Upload image to IPFS first
      const imageUploadResult = await this.uploadImageToIPFS(
        formData.image,
        formData.name
      );
      if (!imageUploadResult?.ipfsHash) {
        throw new Error("Failed to upload image to IPFS");
      }

      // Format the image IPFS URI correctly
      const imageUri = `ipfs://${imageUploadResult.ipfsHash}`;
      console.log("Image URI:", imageUri);

      // 2. Create and upload metadata
      const metadataUploadResult = await this.createAndUploadMetadata(
        formData,
        imageUploadResult.ipfsHash
      );
      if (!metadataUploadResult?.ipfsHash) {
        throw new Error("Failed to upload metadata to IPFS");
      }

      // Format the metadata URI correctly
      const metadataUri = `ipfs://${metadataUploadResult.ipfsHash}`;
      console.log("Metadata URI:", metadataUri);

      // 3. Mint NFT on XRPL with the correct metadata URI
      const mintResult = await this.xrpl.mintNFT(
        formData.account,
        metadataUri, // Use the properly formatted URI
        Number(formData.taxon) || 0,
        Number(formData.transferFee) * 1000,
        8
      );

      return {
        success: true,
        tokenId: mintResult.NFTokenID,
        ipfsHash: metadataUploadResult.ipfsHash,
        imageIpfsHash: imageUploadResult.ipfsHash,
        metadata: metadataUploadResult.metadata,
        metadataUri,
        imageUri,
        ...mintResult,
      };
    } catch (error) {
      console.error("NFT Minting failed:", error);
      throw error;
    }
  }

  async createAndUploadMetadata(formData, imageIpfsHash) {
    // Create standardized metadata
    const metadata = {
      name: formData.name,
      description: formData.description,
      // Use consistent IPFS URI format
      image: `ipfs://${imageIpfsHash}`,
      // Include additional image formats for compatibility
      image_url: `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`,
      image_data: `ipfs://${imageIpfsHash}`,
      external_url: `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`,
      attributes: formData.attributes || [],
      properties: {
        name: formData.name,
        description: formData.description,
        image: `ipfs://${imageIpfsHash}`,
        royalties: formData.royalties || 0,
        collection: formData.collection || "",
        creator: formData.account,
        originalImage: imageIpfsHash,
        ...(formData.additionalMetadata || {}),
      },
    };

    console.log("Uploading metadata:", metadata);

    // Upload metadata to IPFS
    const metadataUploadResult = await this.pinata.uploadJSON(metadata);

    return {
      ...metadataUploadResult,
      metadata,
    };
  }

  async uploadImageToIPFS(imageFile, name) {
    const imageMetadata = {
      name: `${name}-image`,
      keyvalues: {
        type: "nft-image",
        fileName: imageFile.name,
        contentType: imageFile.type,
      },
    };

    const result = await this.pinata.uploadFile(imageFile, {
      pinataMetadata: imageMetadata,
    });

    console.log("Image upload result:", result);
    return result;
  }

  validateFormData(formData) {
    if (!formData.name || !formData.description || !formData.image) {
      throw new Error("Missing required fields: name, description, or image");
    }

    if (!formData.image.type.startsWith("image/")) {
      throw new Error("Invalid image file type");
    }

    if (!formData.account) {
      throw new Error("No wallet address provided");
    }
  }
}
