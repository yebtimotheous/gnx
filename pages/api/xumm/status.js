import { createXummSdk } from "@/services/xumm-sdk-helper";

export default async function handler(req, res) {
  try {
    // Validate request method
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    // Extract UUID
    const { uuid } = req.query;

    // Validate UUID
    if (!uuid) {
      return res.status(400).json({ message: "UUID is required" });
    }

    // Create SDK instance
    const xummSdk = createXummSdk();

    // Validate SDK creation
    if (!xummSdk) {
      console.error("Failed to create XUMM SDK");
      return res.status(500).json({
        message: "XUMM SDK initialization failed",
        details: "Unable to create SDK instance",
      });
    }

    // Fetch payload status
    const payload = await xummSdk.payload.get(uuid);

    // Validate payload
    if (!payload) {
      return res.status(404).json({
        message: "Payload not found",
        uuid,
      });
    }

    // Return payload
    return res.status(200).json(payload);
  } catch (error) {
    // Comprehensive error logging
    console.error("XUMM Status Check Error:", {
      message: error.message,
      stack: error.stack,
      uuid: req.query.uuid,
    });

    // Detailed error response
    return res.status(500).json({
      message: "Failed to check payload status",
      details: error.message,
    });
  }
}
