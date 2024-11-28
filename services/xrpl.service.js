import { Client, NFTokenMint, NFTokenCreateOffer } from "xrpl";

class XRPLService {
  constructor() {
    this.client = null;
    this.NETWORKS = {
      MAINNET: "wss://xrplcluster.com",
      TESTNET: "wss://s.altnet.rippletest.net:51233",
      DEVNET: "wss://s.devnet.rippletest.net:51233",
    };
    this.currentNetwork = this.NETWORKS.TESTNET;

    // IPFS Gateway URLs in order of preference
    this.IPFS_GATEWAYS = [
      "https://gateway.pinata.cloud/ipfs/",
      "https://ipfs.io/ipfs/",
      "https://cloudflare-ipfs.com/ipfs/",
      "https://gateway.ipfs.io/ipfs/",
    ];

    // XRPL Flags
    this.FLAGS = {
      tfSellToken: 1, // Flag for selling an NFT
      tfBuyToken: 0, // Flag for buying an NFT
    };
  }

  // Helper function to decode hex to string
  hexToString(hex) {
    try {
      if (!hex) return null;
      // Remove '0x' if present
      hex = hex.replace("0x", "");
      // Convert hex to string
      const str = Buffer.from(hex, "hex").toString("utf8");
      return str;
    } catch (error) {
      console.error("Error decoding hex:", error);
      return null;
    }
  }

  // Helper function to fetch metadata with retries
  async fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { timeout: 5000 });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }

  // Helper function to try multiple IPFS gateways
  async fetchIPFSMetadata(ipfsHash) {
    let lastError = null;
    for (const gateway of this.IPFS_GATEWAYS) {
      try {
        const url = `${gateway}${ipfsHash.replace("ipfs://", "")}`;
        console.log(`Trying IPFS gateway: ${url}`);
        const metadata = await this.fetchWithRetry(url);
        return metadata;
      } catch (error) {
        console.log(`Failed to fetch from ${gateway}:`, error);
        lastError = error;
      }
    }
    throw lastError;
  }

  async getNFTsForAccount(account) {
    try {
      const client = await this.connect();
      console.log(
        `Fetching NFTs for account ${account} on ${this.currentNetwork}`
      );

      // Get NFT listings
      const nfts = await client.request({
        command: "account_nfts",
        account: account,
        limit: 400, // Adjust as needed
      });

      console.log(`Found ${nfts.result.account_nfts.length} NFTs`);

      // Process NFTs in batches to avoid rate limiting
      const batchSize = 5;
      const processedNFTs = [];

      for (let i = 0; i < nfts.result.account_nfts.length; i += batchSize) {
        const batch = nfts.result.account_nfts.slice(i, i + batchSize);
        const batchPromises = batch.map(async (nft) => {
          try {
            // Basic NFT info
            const processedNFT = {
              ...nft,
              network:
                this.currentNetwork === this.NETWORKS.MAINNET
                  ? "Mainnet"
                  : "Testnet",
              metadata: null,
              error: null,
            };

            if (!nft.URI) {
              console.log(`No URI for NFT ${nft.NFTokenID}`);
              return processedNFT;
            }

            // Decode URI
            const decodedUri = this.hexToString(nft.URI);
            if (!decodedUri) {
              console.log(`Invalid URI format for NFT ${nft.NFTokenID}`);
              return { ...processedNFT, error: "Invalid URI format" };
            }

            console.log(`Decoded URI for ${nft.NFTokenID}:`, decodedUri);

            // Fetch metadata based on URI type
            let metadata;
            if (
              decodedUri.startsWith("ipfs://") ||
              decodedUri.startsWith("Qm")
            ) {
              const ipfsHash = decodedUri.replace("ipfs://", "");
              metadata = await this.fetchIPFSMetadata(ipfsHash);
            } else if (decodedUri.startsWith("http")) {
              metadata = await this.fetchWithRetry(decodedUri);
            } else {
              throw new Error(`Unsupported URI format: ${decodedUri}`);
            }

            // Process image URL in metadata
            if (metadata?.image) {
              if (metadata.image.startsWith("ipfs://")) {
                const imageHash = metadata.image.replace("ipfs://", "");
                metadata.image = `${this.IPFS_GATEWAYS[0]}${imageHash}`;
              }
            }

            return {
              ...processedNFT,
              metadata,
              decodedUri,
            };
          } catch (error) {
            console.error(`Error processing NFT ${nft.NFTokenID}:`, error);
            return {
              ...nft,
              network:
                this.currentNetwork === this.NETWORKS.MAINNET
                  ? "Mainnet"
                  : "Testnet",
              metadata: null,
              error: error.message,
              decodedUri: this.hexToString(nft.URI),
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        processedNFTs.push(...batchResults);

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < nfts.result.account_nfts.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log(`Successfully processed ${processedNFTs.length} NFTs`);
      return processedNFTs;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      throw new Error(`Failed to fetch NFTs: ${error.message}`);
    }
  }

  setNetwork(network) {
    if (this.NETWORKS[network]) {
      this.currentNetwork = this.NETWORKS[network];
      // Disconnect existing client when changing networks
      if (this.client) {
        this.disconnect();
      }
    }
  }

  async connect() {
    if (!this.client) {
      console.log(`Connecting to XRPL network: ${this.currentNetwork}`);
      this.client = new Client(this.currentNetwork);
      await this.client.connect();
    }
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }

  async getNetworkInfo() {
    const client = await this.connect();
    try {
      const serverInfo = await client.request({
        command: "server_info",
      });
      return {
        network:
          this.currentNetwork === this.NETWORKS.MAINNET ? "Mainnet" : "Testnet",
        serverStatus: serverInfo.result.info.server_state,
        networkLedger: serverInfo.result.info.validated_ledger.seq,
      };
    } catch (error) {
      console.error("Error getting network info:", error);
      throw new Error("Failed to get network information");
    }
  }

  async mintNFT(account, tokenURI, taxon = "0", transferFee = "0", flags = 8) {
    try {
      const client = await this.connect();
      console.log(`Minting NFT on ${this.currentNetwork}`);

      // Convert URI to hex
      const uriHex = Buffer.from(tokenURI).toString("hex").toUpperCase();

      // Prepare mint transaction
      const mintTx = {
        TransactionType: "NFTokenMint",
        Account: account,
        URI: uriHex,
        Flags: flags, // Use the provided flags (default: tfTransferable)
        TransferFee: parseInt(transferFee),
        NFTokenTaxon: parseInt(taxon),
      };

      console.log("Prepared mint transaction:", mintTx);

      // Get the prepared transaction
      const prepared = await client.autofill(mintTx);

      // Create XUMM payload for signing
      const xummPayload = {
        txjson: prepared,
        options: {
          submit: true,
          return_url: {
            web: window.location.href,
          },
        },
      };

      console.log("Sending to XUMM for signing:", xummPayload);

      // Send to XUMM for signing
      const response = await fetch("/api/xumm/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(xummPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to create XUMM signing request");
      }

      const signData = await response.json();
      console.log("XUMM signing request created:", signData);

      // Open XUMM for signing
      window.open(signData.next.always, "XUMM", "width=500,height=700");

      // Wait for signing
      const signingResult = await this.waitForTransactionSigning(signData.uuid);
      if (!signingResult.signed) {
        throw new Error("Transaction was not signed");
      }

      console.log("Transaction signed, waiting for validation...");

      // Wait for validation
      const validationResult = await this.waitForTransactionValidation(
        signingResult.txid
      );
      if (!validationResult) {
        throw new Error("Transaction failed to validate");
      }

      console.log("Transaction validated, getting NFTokenID...");

      // Get the NFTokenID from the transaction result
      const nftokenID = await this.getNFTokenIDFromTx(validationResult);
      if (!nftokenID) {
        throw new Error("Failed to get NFTokenID from transaction");
      }

      return {
        success: true,
        NFTokenID: nftokenID,
        hash: signingResult.txid,
        validated: true,
      };
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  }

  // Helper method to extract NFTokenID from transaction result
  async getNFTokenIDFromTx(txResult) {
    try {
      // Find the NFTokenID in the transaction metadata
      const nftNode = txResult.meta.AffectedNodes.find(
        (node) =>
          node.CreatedNode && node.CreatedNode.LedgerEntryType === "NFTokenPage"
      );

      if (nftNode) {
        // Extract the NFTokenID from the created NFTokenPage
        const nftokenID =
          nftNode.CreatedNode.NewFields.NFTokens[0].NFToken.NFTokenID;
        console.log("Found NFTokenID:", nftokenID);
        return nftokenID;
      }

      // If not found in CreatedNode, check ModifiedNode
      const modifiedNode = txResult.meta.AffectedNodes.find(
        (node) =>
          node.ModifiedNode &&
          node.ModifiedNode.LedgerEntryType === "NFTokenPage"
      );

      if (modifiedNode) {
        // Extract the NFTokenID from the modified NFTokenPage
        const nftokenID =
          modifiedNode.ModifiedNode.FinalFields.NFTokens[0].NFToken.NFTokenID;
        console.log("Found NFTokenID in modified node:", nftokenID);
        return nftokenID;
      }

      throw new Error("NFTokenID not found in transaction result");
    } catch (error) {
      console.error("Error extracting NFTokenID:", error);
      throw error;
    }
  }

  async waitForTransactionSigning(uuid) {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50; // 5 minutes maximum
      let attempts = 0;

      const checkStatus = async () => {
        try {
          const response = await fetch(`/api/xumm/status/${uuid}`);
          if (!response.ok) {
            throw new Error("Failed to check signing status");
          }

          const data = await response.json();
          console.log("Signing status:", data);

          if (data.signed) {
            resolve({
              signed: true,
              txid: data.txid,
            });
            return;
          }

          if (data.expired) {
            reject(new Error("Signing request expired"));
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error("Signing timeout"));
            return;
          }

          // Check again in 6 seconds
          setTimeout(checkStatus, 6000);
        } catch (error) {
          reject(error);
        }
      };

      // Start checking
      checkStatus();
    });
  }

  async getNFTokenID(account, txHash) {
    try {
      const client = await this.connect();

      // Wait for transaction to be validated
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Get transaction result
      const tx = await client.request({
        command: "tx",
        transaction: txHash,
      });

      if (tx.result.validated) {
        // Get account NFTs
        const nfts = await client.request({
          command: "account_nfts",
          account: account,
        });

        // Find the newly minted NFT (should be the latest one)
        const latestNFT =
          nfts.result.account_nfts[nfts.result.account_nfts.length - 1];
        return latestNFT.NFTokenID;
      }

      throw new Error("Transaction not validated");
    } catch (error) {
      console.error("Error getting NFTokenID:", error);
      throw error;
    }
  }

  async getNFTs(account) {
    const client = await this.connect();
    try {
      const response = await client.request({
        command: "account_nfts",
        account: account,
      });
      return response.result.account_nfts;
    } catch (error) {
      console.error("Error getting NFTs:", error);
      throw error;
    }
  }

  async createSellOffer(account, tokenId, amount) {
    const client = await this.connect();
    try {
      console.log(`Creating sell offer for NFT ${tokenId} at ${amount} drops`);

      // Prepare the transaction
      const offerTx = {
        TransactionType: "NFTokenCreateOffer",
        Account: account,
        NFTokenID: tokenId,
        Amount: amount,
        Flags: this.FLAGS.tfSellToken,
      };

      // Get the prepared transaction
      const prepared = await client.autofill(offerTx);
      console.log("Prepared transaction:", prepared);

      // Create XUMM payload for signing
      const xummPayload = {
        txjson: prepared,
        options: {
          submit: true,
          return_url: {
            web: window.location.href,
          },
        },
      };

      // Send to XUMM for signing
      const response = await fetch("/api/xumm/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(xummPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to create XUMM signing request");
      }

      const signData = await response.json();
      console.log("XUMM signing request created:", signData);

      // Open XUMM for signing
      window.open(signData.next.always, "XUMM", "width=500,height=700");

      // Wait for signing
      const signingResult = await this.waitForTransactionSigning(signData.uuid);
      if (!signingResult.signed) {
        throw new Error("Transaction was not signed");
      }

      // Wait for validation
      const validationResult = await this.waitForTransactionValidation(
        signingResult.txid
      );

      // Get the NFTokenOffer index from the transaction result
      const offerIndex = validationResult.meta.AffectedNodes.find(
        (node) =>
          node.CreatedNode &&
          node.CreatedNode.LedgerEntryType === "NFTokenOffer"
      )?.CreatedNode.LedgerIndex;

      return {
        success: true,
        hash: signingResult.txid,
        validated: true,
        offerIndex,
      };
    } catch (error) {
      console.error("Error creating sell offer:", error);
      throw new Error(`Failed to create sell offer: ${error.message}`);
    }
  }

  // Add helper method to wait for transaction signing
  async waitForTransactionSigning(uuid, timeout = 60000) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/xumm/status?uuid=${uuid}`);
          const data = await response.json();

          if (data.meta.resolved) {
            clearInterval(checkInterval);
            clearTimeout(timeoutId);
            resolve({
              signed: data.meta.signed,
              txid: data.response?.txid,
              account: data.response?.account,
            });
          }
        } catch (error) {
          console.error("Error checking signing status:", error);
        }
      }, 3000);

      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Transaction signing timed out"));
      }, timeout);
    });
  }

  // Helper method to format NFT Token ID
  formatNFTokenID(tokenId) {
    // Remove any spaces or special characters
    tokenId = tokenId.replace(/\s+/g, "");

    // Ensure the ID is in uppercase
    tokenId = tokenId.toUpperCase();

    // Add '00' prefix if not present (required by XRPL)
    if (!tokenId.startsWith("00")) {
      tokenId = "00" + tokenId;
    }

    return tokenId;
  }

  // Method to get existing offers for an NFT
  async getNFTOffers(tokenId) {
    try {
      const client = await this.ensureConnection();

      // Format the NFT Token ID
      const formattedTokenId = this.formatNFTokenID(tokenId);
      console.log(`Fetching offers for NFT: ${formattedTokenId}`);

      // Get sell offers with retry logic
      const sellOffersResponse = await this.retryRequest(async () => {
        const response = await client.request({
          command: "nft_sell_offers",
          nft_id: formattedTokenId,
        });
        return response;
      });

      console.log("Sell offers response:", sellOffersResponse);

      // Get buy offers with retry logic
      const buyOffersResponse = await this.retryRequest(async () => {
        const response = await client.request({
          command: "nft_buy_offers",
          nft_id: formattedTokenId,
        });
        return response;
      });

      console.log("Buy offers response:", buyOffersResponse);

      const sellOffers = sellOffersResponse.result?.offers || [];
      const buyOffers = buyOffersResponse.result?.offers || [];

      // Log the found offers
      if (sellOffers.length > 0) {
        console.log(
          `Found ${sellOffers.length} sell offers for NFT ${formattedTokenId}`
        );
        console.log("First sell offer:", sellOffers[0]);
      }

      return {
        sellOffers,
        buyOffers,
      };
    } catch (error) {
      // Check if it's a "not found" error and return empty offers instead of throwing
      if (error.message && error.message.includes("not found")) {
        console.log(`No offers found for NFT ${tokenId}`);
        return {
          sellOffers: [],
          buyOffers: [],
        };
      }

      console.error(`Error fetching offers for NFT ${tokenId}:`, error);
      throw error;
    }
  }

  // Method to cancel an existing offer
  async cancelOffer(account, offerIndex) {
    const client = await this.connect();
    try {
      console.log(`Cancelling offer ${offerIndex} for account ${account}`);

      // Prepare cancel transaction
      const cancelTx = {
        TransactionType: "NFTokenCancelOffer",
        Account: account,
        NFTokenOffers: [offerIndex],
      };

      // Get the prepared transaction
      const prepared = await client.autofill(cancelTx);
      console.log("Prepared cancel transaction:", prepared);

      // Create XUMM payload for signing
      const xummPayload = {
        txjson: prepared,
        options: {
          submit: true,
          return_url: {
            web: window.location.href,
          },
        },
      };

      // Send to XUMM for signing
      const response = await fetch("/api/xumm/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(xummPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to create XUMM signing request");
      }

      const signData = await response.json();
      console.log("XUMM signing request created:", signData);

      // Open XUMM for signing
      window.open(signData.next.always, "XUMM", "width=500,height=700");

      // Wait for signing
      const signingResult = await this.waitForTransactionSigning(signData.uuid);
      if (!signingResult.signed) {
        throw new Error("Transaction was not signed");
      }

      // Wait for validation
      const validationResult = await this.waitForTransactionValidation(
        signingResult.txid
      );

      return {
        success: true,
        hash: signingResult.txid,
        validated: true,
      };
    } catch (error) {
      console.error("Error canceling offer:", error);
      throw new Error(`Failed to cancel offer: ${error.message}`);
    }
  }

  async transferNFT(account, destination, tokenId) {
    const client = await this.connect();
    try {
      console.log(`Transferring NFT ${tokenId} to ${destination}`);
      const createOfferTx = {
        TransactionType: "NFTokenCreateOffer",
        Account: account,
        NFTokenID: tokenId,
        Amount: "0",
        Destination: destination,
        Flags: 1, // tfSellToken
      };

      const prepared = await client.autofill(createOfferTx);
      const response = await client.submit(prepared, { wallet: account });
      return response;
    } catch (error) {
      console.error("Error transferring NFT:", error);
      throw error;
    }
  }

  async acceptBuyOffer(account, tokenId, amount) {
    const client = await this.connect();
    try {
      // First get the offer index
      const offers = await client.request({
        command: "nft_buy_offers",
        nft_id: tokenId,
      });

      if (!offers.result.offers || offers.result.offers.length === 0) {
        throw new Error("No buy offers found for this NFT");
      }

      const acceptTx = {
        TransactionType: "NFTokenAcceptOffer",
        Account: account,
        NFTokenBuyOffer: offers.result.offers[0].nft_offer_index,
      };

      const prepared = await client.autofill(acceptTx);
      const response = await client.submit(prepared, { wallet: account });
      return response;
    } catch (error) {
      console.error("Error accepting buy offer:", error);
      throw error;
    }
  }

  async ensureConnection() {
    try {
      if (!this.client || !this.client.isConnected()) {
        console.log("Creating new XRPL client connection...");
        if (this.client) {
          await this.disconnect();
        }
        this.client = new Client(this.currentNetwork);
        await this.client.connect();
        console.log("Successfully connected to XRPL");
      }
      return this.client;
    } catch (error) {
      console.error("Error ensuring XRPL connection:", error);
      throw new Error("Failed to connect to XRPL");
    }
  }

  // Helper method to retry failed requests
  async retryRequest(operation, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.ensureConnection();
        return await operation();
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  async checkNFTOffers(nftokenID, maxRetries = 5) {
    try {
      console.log(`Checking offers for NFT: ${nftokenID}`);

      let offers = null;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        console.log(`\nAttempt ${retryCount + 1} to fetch offers...`);

        // Wait between retries
        if (retryCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        const client = await this.ensureConnection();
        const response = await client.request({
          command: "nft_sell_offers",
          nft_id: nftokenID,
        });

        offers = response.result.offers;

        if (offers && offers.length > 0) {
          console.log("\n🎯 Sell Offers Found!");
          offers.forEach((offer, index) => {
            console.log(`\nOffer ${index + 1} Details:`);
            console.log(
              `- Amount: ${offer.amount} drops (${
                parseInt(offer.amount) / 1000000
              } XRP)`
            );
            console.log(`- Owner: ${offer.owner}`);
            console.log(`- Offer Index: ${offer.nft_offer_index}`);
            console.log(`- Expiration: ${offer.expiration || "No expiration"}`);
            console.log(`- Flags: ${offer.flags}`);
          });
          break;
        } else {
          console.log("No offers found yet, retrying...");
          retryCount++;
        }
      }

      if (!offers || offers.length === 0) {
        console.log("\n⚠️ No sell offers found after all retries");
      }

      return offers || [];
    } catch (error) {
      console.error("Check offers error:", error);
      throw error;
    }
  }

  async uploadImageToIPFS(imageFile) {
    try {
      console.log("Uploading image to IPFS...");

      // Create form data
      const formData = new FormData();
      formData.append("file", imageFile);

      // Upload to Pinata through our API route
      const response = await fetch("/api/pinata/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image to IPFS");
      }

      const result = await response.json();
      console.log("Image uploaded to IPFS:", result.ipfsHash);
      return `ipfs://${result.ipfsHash}`;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async createAndUploadMetadata(name, description, imageIpfsUrl, attributes) {
    try {
      console.log("Creating and uploading metadata...");

      // Create metadata object
      const metadata = {
        name,
        description,
        image: imageIpfsUrl,
        attributes: attributes || [],
        // Add additional fields as needed
        created_at: new Date().toISOString(),
        schema_version: "1.0.0",
      };

      // Upload metadata to Pinata through our API route
      const response = await fetch("/api/pinata/uploadJson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error("Failed to upload metadata to IPFS");
      }

      const result = await response.json();
      console.log("Metadata uploaded to IPFS:", result.ipfsHash);
      return result.ipfsHash;
    } catch (error) {
      console.error("Metadata creation error:", error);
      throw new Error(`Failed to create metadata: ${error.message}`);
    }
  }

  async mintNFTWithXUMM(
    account,
    name,
    description,
    imageFile,
    attributes,
    transferFee = 0,
    taxon = 0
  ) {
    try {
      if (!account || !name || !description || !imageFile) {
        throw new Error("Missing required parameters for minting NFT");
      }

      console.log("Starting NFT minting process with params:", {
        account,
        name,
        description,
        attributes,
        transferFee,
        taxon,
      });

      // 1. Upload image to IPFS
      const imageIpfsUrl = await this.uploadImageToIPFS(imageFile);
      console.log("Image uploaded to IPFS:", imageIpfsUrl);

      // 2. Create and upload metadata
      const metadataIpfsHash = await this.createAndUploadMetadata(
        name,
        description,
        imageIpfsUrl,
        attributes
      );
      console.log("Metadata uploaded to IPFS:", metadataIpfsHash);

      // 3. Mint NFT using the metadata URI
      const tokenURI = `ipfs://${metadataIpfsHash}`;
      const flags = 8; // Transfer fee flag
      const mintResult = await this.mintNFT(
        account,
        tokenURI,
        taxon,
        transferFee,
        flags
      );

      if (!mintResult || !mintResult.hash) {
        throw new Error("Minting transaction failed");
      }

      console.log("Mint transaction successful:", mintResult);

      // 4. Wait for transaction validation and get NFT ID
      const nftokenID = await this.getNFTokenID(account, mintResult.hash);
      console.log("Retrieved NFTokenID:", nftokenID);

      return {
        success: true,
        hash: mintResult.hash,
        nftokenID,
        metadataIpfsHash,
        imageIpfsUrl,
        metadata: {
          name,
          description,
          image: imageIpfsUrl,
          attributes,
        },
      };
    } catch (error) {
      console.error("NFT minting process error:", {
        error,
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to mint NFT: ${error.message}`);
    }
  }

  // Add helper method to wait for transaction validation
  async waitForTransactionValidation(txHash) {
    const client = await this.connect();
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        console.log(
          `Checking transaction validation (attempt ${
            attempts + 1
          }/${maxAttempts})`
        );
        const tx = await client.request({
          command: "tx",
          transaction: txHash,
        });

        if (tx.result.validated) {
          console.log("Transaction validated:", tx.result);
          return tx.result;
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error checking transaction:", error);
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error("Transaction validation timed out");
  }
}

export const xrplService = new XRPLService();
