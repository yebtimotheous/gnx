import database from "../database.json";

export const getCollections = () => {
  return database.collections;
};

export const getCollectionByTaxon = (taxon) => {
  return Object.values(database.collections).find(
    (collection) => collection.taxon === parseInt(taxon)
  );
};

export const addMintedNFT = async (nftData) => {
  try {
    const response = await fetch("/api/database/operations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "addNFT",
        data: nftData,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update database");
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error updating database:", error);
    return false;
  }
};
