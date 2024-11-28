class XummService {
  constructor() {
    this.CONNECTION_STATES = {
      IDLE: "idle",
      PENDING: "pending",
      CONNECTED: "connected",
      ERROR: "error",
    };
  }

  async initiateConnection() {
    try {
      // Check if a connection is already in progress
      const existingState = this.getConnectionState();
      if (existingState === this.CONNECTION_STATES.PENDING) {
        console.log("Connection already in progress");
        return null;
      }

      // Set connection state to pending
      this.setConnectionState(this.CONNECTION_STATES.PENDING);

      const response = await fetch("/api/xumm/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        this.setConnectionState(this.CONNECTION_STATES.ERROR);
        const errorBody = await response.json();
        console.error("Connection API Error:", errorBody);
        throw new Error(
          errorBody.details || "Failed to initiate XUMM connection"
        );
      }

      const data = await response.json();

      // Store connection details
      localStorage.setItem("xumm_payload_uuid", data.uuid);
      localStorage.setItem("xumm_connection_timestamp", Date.now().toString());

      return {
        url: data.url,
        uuid: data.uuid,
      };
    } catch (error) {
      this.setConnectionState(this.CONNECTION_STATES.ERROR);
      console.error("XUMM connection error:", error);
      throw error;
    }
  }

  async checkPayloadStatus(uuid) {
    try {
      // Check if enough time has passed since last check
      const lastCheckTime = parseInt(
        localStorage.getItem("xumm_last_status_check") || "0"
      );
      const currentTime = Date.now();

      // Enforce minimum 5-second interval between status checks
      if (currentTime - lastCheckTime < 5000) {
        console.log("Skipping status check to prevent rate limiting");
        return null;
      }

      localStorage.setItem("xumm_last_status_check", currentTime.toString());

      const response = await fetch(`/api/xumm/status?uuid=${uuid}`);

      if (!response.ok) {
        const errorBody = await response.json();
        console.error("Status API Error:", errorBody);
        throw new Error(errorBody.details || "Failed to check payload status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking payload status:", error);
      throw error;
    }
  }

  // Helper methods for connection state management
  setConnectionState(state) {
    localStorage.setItem("xumm_connection_state", state);
  }

  getConnectionState() {
    return (
      localStorage.getItem("xumm_connection_state") ||
      this.CONNECTION_STATES.IDLE
    );
  }

  // Method to check if connection is stale
  isConnectionStale() {
    const connectionTimestamp = parseInt(
      localStorage.getItem("xumm_connection_timestamp") || "0"
    );
    const currentTime = Date.now();
    // Consider connection stale after 30 minutes
    return currentTime - connectionTimestamp > 30 * 60 * 1000;
  }
}

export const xummService = new XummService();
