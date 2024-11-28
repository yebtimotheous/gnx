import { createXummSdk } from "@/services/xumm-sdk-helper";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("Received signing request:", req.body);

    const xummSdk = createXummSdk();
    if (!xummSdk) {
      throw new Error("Failed to initialize XUMM SDK");
    }

    // Create the payload with proper options
    const payload = await xummSdk.payload.create({
      txjson: req.body.txjson,
      options: {
        submit: true,
        expire: 5,
        return_url: req.body.options?.return_url,
      },
    });

    console.log("XUMM payload created:", payload);

    if (!payload || !payload.next) {
      throw new Error("Invalid payload response from XUMM");
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error("XUMM signing error:", error);
    return res.status(500).json({
      message: "Failed to create signing request",
      details: error.message,
    });
  }
}
