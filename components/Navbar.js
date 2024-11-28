import Link from "next/link";
import { useWallet } from "../context/WalletContext";
import { useState } from "react";
import Logo from "./Logo";
import styles from "../styles/WalletButton.module.css";

export default function Navbar() {
  const {
    isConnected,
    account,
    connectWallet,
    disconnectWallet,
    error,
    isConnecting,
  } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Helper function to shorten address
  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Updated wallet button component
  const WalletButton = () => {
    if (isConnecting) {
      return (
        <button className={styles.walletButton} disabled>
          <span className={styles.loadingSpinner}></span>
          Connecting...
        </button>
      );
    }

    if (isConnected && account) {
      return (
        <div className={styles.walletContainer}>
          <button
            className={`${styles.walletButton} ${styles.connected}`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className={styles.buttonContent}>
              <span className={styles.connectedDot}></span>
              <span className={styles.walletAddress}>
                {shortenAddress(account)}
              </span>
              <svg
                className={`${styles.dropdownArrow} ${
                  showDropdown ? styles.rotated : ""
                }`}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>

          {showDropdown && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>
                <svg
                  className={styles.walletIcon}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 7h-1V6a3 3 0 00-3-3H5a3 3 0 00-3 3v12a3 3 0 003 3h14a3 3 0 003-3v-8a3 3 0 00-3-3zM5 5h10a1 1 0 011 1v1H5a1 1 0 010-2zm15 13a1 1 0 01-1 1H5a1 1 0 01-1-1V8h15a1 1 0 011 1v9z"
                    fill="currentColor"
                  />
                  <path d="M16 11h-2v2h2v-2z" fill="currentColor" />
                </svg>
                <span className={styles.dropdownTitle}>Connected Wallet</span>
              </div>

              <div className={styles.dropdownBody}>
                <div className={styles.accountInfo}>
                  <div className={styles.label}>Account</div>
                  <div className={styles.address}>
                    <span>{shortenAddress(account)}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(account)}
                      className={styles.copyButton}
                      title="Copy address"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16 3H4v13h12V3zM8 7h8M8 11h8M8 15h5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles.dropdownDivider}></div>

                <div className={styles.dropdownActions}>
                  <button
                    onClick={() => {
                      window.open(
                        `https://xrpscan.com/account/${account}`,
                        "_blank"
                      );
                    }}
                    className={styles.actionButton}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    View on Explorer
                  </button>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setShowDropdown(false);
                    }}
                    className={styles.disconnectButton}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <button className={styles.walletButton} onClick={connectWallet}>
        <svg
          className={styles.walletIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 7h-1V6a3 3 0 00-3-3H5a3 3 0 00-3 3v12a3 3 0 003 3h14a3 3 0 003-3v-8a3 3 0 00-3-3z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Connect Wallet
      </button>
    );
  };

  return (
    <nav className="nav-wrapper backdrop-blur-md">
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 text-sm">{error}</div>
      )}
      <div className="nav-content">
        <div className="flex justify-between items-center h-20 border-b border-gray-100">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="nav-links-container">
              <Link
                href="/"
                className="nav-link-modern text-black font-medium hover:text-gray-600"
              >
                Explore
              </Link>
              <Link
                href="/create-nft"
                className="nav-link-modern text-black font-medium hover:text-gray-600"
              >
                Create
              </Link>
              <Link
                href="/my-nfts"
                className={`nav-link-modern text-black font-medium hover:text-gray-600 ${
                  !isConnected ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                My NFTs
              </Link>
            </div>

            <div className="flex items-center space-x-4 pl-6 border-l border-gray-200">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search NFTs..."
                  className="search-input-new"
                />
                <span className="search-icon-new">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
              </div>

              <WalletButton />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-btn"
            >
              <div className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="flex flex-col space-y-4 p-4">
              <div className="mobile-search-container mb-4">
                <input
                  type="text"
                  placeholder="Search NFTs..."
                  className="mobile-search-input-new"
                />
                <span className="mobile-search-icon-new">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <Link href="/" className="mobile-nav-link-new">
                  Explore
                </Link>
                <Link href="/create-nft" className="mobile-nav-link-new">
                  Create
                </Link>
                <Link
                  href="/my-nfts"
                  className={`mobile-nav-link-new ${
                    !isConnected ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  My NFTs
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <WalletButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
