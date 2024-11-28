import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { xummService } from "../services/xumm.service";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // More intelligent connection attempt
  const connectWallet = useCallback(async () => {
    if (isConnecting) {
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const connectionResult = await xummService.initiateConnection();

      if (!connectionResult) {
        return;
      }

      const { url, uuid } = connectionResult;
      const popup = window.open(url, "XUMM Signin", "width=500,height=700");

      const checkStatus = setInterval(async () => {
        try {
          const payload = await xummService.checkPayloadStatus(uuid);

          if (payload?.meta.resolved && payload?.response.account) {
            clearInterval(checkStatus);
            const connectedAccount = payload.response.account;

            // Update all connection state
            setAccount(connectedAccount);
            setIsConnected(true);
            localStorage.setItem("xumm_account", connectedAccount);
            localStorage.setItem("xumm_connection_state", "connected");
            localStorage.setItem(
              "xumm_connection_timestamp",
              Date.now().toString()
            );

            if (popup) popup.close();
          }
        } catch (err) {
          clearInterval(checkStatus);
          setError("Connection failed. Please try again.");
          console.error("Status check error:", err);
        }
      }, 5000);

      setTimeout(() => {
        clearInterval(checkStatus);
        if (!isConnected) {
          setError("Connection timed out. Please try again.");
          setIsConnecting(false);
        }
      }, 180000);
    } catch (error) {
      setError("Failed to connect. Please try again.");
      console.error("Wallet connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected]);

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setError(null);
    localStorage.removeItem("xumm_account");
    localStorage.removeItem("xumm_connection_timestamp");
    localStorage.removeItem("xumm_payload_uuid");
  };

  // Initialize connection state on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem("xumm_account");
    if (savedAccount && !xummService.isConnectionStale()) {
      setAccount(savedAccount);
      setIsConnected(true);
    }
  }, []);

  // Add this effect to check connection status on page load
  useEffect(() => {
    const checkConnection = async () => {
      const savedAccount = localStorage.getItem("xumm_account");
      const connectionState = localStorage.getItem("xumm_connection_state");

      if (
        savedAccount &&
        connectionState === "connected" &&
        !xummService.isConnectionStale()
      ) {
        setAccount(savedAccount);
        setIsConnected(true);
      } else {
        // Clear stale connection data
        localStorage.removeItem("xumm_account");
        localStorage.removeItem("xumm_connection_state");
        setIsConnected(false);
        setAccount(null);
      }
    };

    checkConnection();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        account,
        error,
        isConnecting,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
