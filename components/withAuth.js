import { useRouter } from "next/router";
import { useWallet } from "../context/WalletContext";
import { useEffect } from "react";

export function withAuth(WrappedComponent) {
  return function AuthWrapper(props) {
    const { isConnected, isConnecting } = useWallet();
    const router = useRouter();

    useEffect(() => {
      // If not connected and not currently connecting, redirect to home
      if (!isConnected && !isConnecting) {
        router.push("/");
      }
    }, [isConnected, isConnecting, router]);

    // Show loading or prevent render if not connected
    if (!isConnected && !isConnecting) {
      return null; // or a loading component
    }

    return <WrappedComponent {...props} />;
  };
}
