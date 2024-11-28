import formidable from "formidable";
import pinataSDK from "@pinata/sdk";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Initialize Pinata
    if (!process.env.PINATA_JWT) {
      throw new Error("Pinata JWT not configured");
    }

    const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

    // Test Pinata connection
    try {
      await pinata.testAuthentication();
    } catch (err) {
      console.error("Pinata authentication failed:", err);
      throw new Error("Failed to authenticate with Pinata");
    }

    // Parse the incoming form data
    const form = formidable({
      maxFileSize: 20 * 1024 * 1024, // 20MB max file size
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get the uploaded file
    const file = files.file;
    if (!file) {
      throw new Error("No file uploaded");
    }

    // Verify file exists and is accessible
    if (!fs.existsSync(file.filepath)) {
      throw new Error("Uploaded file not found");
    }

    // Prepare Pinata options
    const options = {
      pinataMetadata: {
        name: `Maven-NFT-Image-${Date.now()}`,
        keyvalues: {
          type: "NFT Image",
          timestamp: Date.now().toString(),
        },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    console.log("Uploading file to Pinata:", {
      filepath: file.filepath,
      originalFilename: file.originalFilename,
      size: file.size,
    });

    // Upload to Pinata
    const result = await pinata.pinFromFS(file.filepath, options);
    console.log("Pinata upload result:", result);

    // Clean up the temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (err) {
      console.error("Failed to clean up temporary file:", err);
    }

    return res.status(200).json({
      success: true,
      ipfsHash: result.IpfsHash,
      size: file.size,
      originalName: file.originalFilename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "Failed to upload file",
      details: error.message,
    });
  }
}
