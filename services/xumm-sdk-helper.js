import { XummSdk } from "xumm-sdk";

export function createXummSdk() {
  const apiKey = process.env.NEXT_PUBLIC_XUMM_API_KEY;
  const apiSecret = process.env.XUMM_API_SECRET;

  // Comprehensive validation
  if (!apiKey) {
    console.error("XUMM API Key is missing");
    return null;
  }

  if (!apiSecret) {
    console.error("XUMM API Secret is missing");
    return null;
  }

  try {
    // Attempt SDK creation with detailed logging
    console.log("Initializing XUMM SDK", {
      apiKeyLength: apiKey.length,
      apiSecretLength: apiSecret.length,
    });

    const sdk = new XummSdk(apiKey, apiSecret);

    // Additional validation
    if (!sdk) {
      console.error("SDK creation failed");
      return null;
    }

    return sdk;
  } catch (error) {
    console.error("XUMM SDK Initialization Error:", {
      message: error.message,
      stack: error.stack,
    });
    return null;
  }
}
