import { xrplService } from "../../../services/xrpl.service";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { account, uri, flags, transferFee } = req.body;
    const result = await xrplService.mintNFT(account, uri, flags, transferFee);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error minting NFT:", error);
    res.status(500).json({ message: "Error minting NFT" });
  }
}
