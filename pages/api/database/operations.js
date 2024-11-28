import fs from "fs/promises";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const dbPath = path.join(process.cwd(), "database.json");

  if (req.method === "GET") {
    try {
      const data = await fs.readFile(dbPath, "utf8");
      const db = JSON.parse(data);
      return res.status(200).json(db);
    } catch (error) {
      console.error("Error reading database:", error);
      return res.status(500).json({ message: "Failed to read database" });
    }
  }

  if (req.method === "POST") {
    try {
      const { action, data } = req.body;

      if (action === "addNFT") {
        const currentDb = await fs.readFile(dbPath, "utf8");
        const db = JSON.parse(currentDb);

        // Add new NFT record
        db.minted_nfts.nft_records.push({
          tokenId: data.tokenId,
          collection: data.collection,
          name: data.name,
          description: data.description,
          minter: data.minter,
          owner: data.minter,
          mintedAt: new Date().toISOString(),
          metadata: {
            image: data.image,
            attributes: data.attributes,
            transferFee: data.transferFee,
            taxon: data.taxon,
            royalties: data.royalties,
          },
          saleHistory: [
            {
              type: "mint",
              from: null,
              to: data.minter,
              price: null,
              date: new Date().toISOString(),
            },
          ],
        });

        // Update collection stats
        const collectionStats =
          db.minted_nfts.collection_stats[data.collection];
        if (collectionStats) {
          collectionStats.total_minted += 1;
          collectionStats.unique_holders = new Set([
            ...db.minted_nfts.nft_records
              .filter((nft) => nft.collection === data.collection)
              .map((nft) => nft.owner),
          ]).size;
        }

        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ message: "Invalid action" });
    } catch (error) {
      console.error("Error updating database:", error);
      return res.status(500).json({ message: "Failed to update database" });
    }
  }
}
