import { createXummSdk } from "@/services/xumm-sdk-helper";

export default async function handler(req, res) {
  try {
    // Validate request method
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
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

    // Create sign-in payload
    const request = {
      txjson: {
        TransactionType: "SignIn",
      },
    };

    // Attempt to create payload
    const payload = await xummSdk.payload.create(request);

    // Validate payload
    if (!payload || !payload.next || !payload.next.always) {
      console.error("Invalid payload response", payload);
      return res.status(500).json({
        message: "Failed to create XUMM payload",
        details: "Invalid payload structure",
      });
    }

    // Return successful response
    return res.status(200).json({
      url: payload.next.always,
      uuid: payload.uuid,
    });
  } catch (error) {
    // Comprehensive error logging
    console.error("XUMM Connection Error:", {
      message: error.message,
      stack: error.stack,
      apiKey: !!process.env.NEXT_PUBLIC_XUMM_API_KEY,
      apiSecret: !!process.env.XUMM_API_SECRET,
    });

    // Detailed error response
    return res.status(500).json({
      message: "Failed to initiate XUMM connection",
      details: error.message,
      diagnostics: {
        apiKeyPresent: !!process.env.NEXT_PUBLIC_XUMM_API_KEY,
        apiSecretPresent: !!process.env.XUMM_API_SECRET,
      },
    });
  }
}
