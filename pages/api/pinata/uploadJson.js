import pinataSDK from "@pinata/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

    const metadata = req.body;
    const options = {
      pinataMetadata: {
        name: `Maven-NFT-Metadata-${Date.now()}`,
      },
    };

    const result = await pinata.pinJSONToIPFS(metadata, options);

    return res.status(200).json({
      success: true,
      ipfsHash: result.IpfsHash,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload metadata" });
  }
}
