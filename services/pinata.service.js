import axios from "axios";

const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;

class PinataService {
  constructor() {
    this.baseURL = "https://api.pinata.cloud";
    this.headers = {
      Authorization: `Bearer ${pinataJWT}`,
    };
  }

  async uploadFile(file) {
    try {
      if (!pinataJWT) {
        throw new Error("Pinata JWT not found in environment variables");
      }

      const formData = new FormData();
      formData.append("file", file);

      // Add metadata to help organize your pins
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          type: "nft-image",
          timestamp: new Date().toISOString(),
        },
      });
      formData.append("pinataMetadata", metadata);

      // Add options for pinning
      const options = JSON.stringify({
        cidVersion: 1,
        wrapWithDirectory: false,
      });
      formData.append("pinataOptions", options);

      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...this.headers,
            "Content-Type": "multipart/form-data",
          },
          maxBodyLength: "Infinity", // This is needed to prevent axios from erroring out with large files
        }
      );

      // Return the IPFS gateway URL for immediate viewing
      return {
        ipfsHash: response.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
      };
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw new Error(
        error.response?.data?.error || "Error uploading to Pinata"
      );
    }
  }

  async uploadJSON(metadata) {
    try {
      if (!pinataJWT) {
        throw new Error("Pinata JWT not found in environment variables");
      }

      const pinataMetadata = {
        name: `${metadata.name}-metadata`,
        keyvalues: {
          type: "nft-metadata",
          timestamp: new Date().toISOString(),
        },
      };

      const pinataOptions = {
        cidVersion: 1,
        wrapWithDirectory: false,
      };

      const response = await axios.post(
        `${this.baseURL}/pinning/pinJSONToIPFS`,
        {
          pinataContent: metadata,
          pinataMetadata,
          pinataOptions,
        },
        {
          headers: this.headers,
        }
      );

      return {
        ipfsHash: response.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
      };
    } catch (error) {
      console.error("Error uploading JSON to Pinata:", error);
      throw new Error(
        error.response?.data?.error || "Error uploading metadata to Pinata"
      );
    }
  }

  // Helper method to get pin list
  async getPinList() {
    try {
      const response = await axios.get(`${this.baseURL}/data/pinList`, {
        headers: this.headers,
      });
      return response.data.rows;
    } catch (error) {
      console.error("Error getting pin list:", error);
      throw error;
    }
  }

  // Helper method to unpin content
  async unpin(hashToUnpin) {
    try {
      await axios.delete(`${this.baseURL}/pinning/unpin/${hashToUnpin}`, {
        headers: this.headers,
      });
      return true;
    } catch (error) {
      console.error("Error unpinning content:", error);
      throw error;
    }
  }
}

export const pinataService = new PinataService();
