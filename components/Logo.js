export default function Logo() {
  return (
    <div className="flex items-center">
      <div className="logo-container">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ripple-logo"
        >
          {/* Outer Circle */}
          <circle
            cx="16"
            cy="16"
            r="16"
            className="logo-circle"
            fill="#23292F"
          />

          {/* Ripple Effect - Three curved lines */}
          <path
            d="M16 7C19.9 7 23.1 9.5 24.1 13"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            className="ripple-wave"
          />
          <path
            d="M16 7C12.1 7 8.9 9.5 7.9 13"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            className="ripple-wave"
          />
          <path
            d="M24.1 19C23.1 22.5 19.9 25 16 25"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            className="ripple-wave"
          />
          <path
            d="M7.9 19C8.9 22.5 12.1 25 16 25"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            className="ripple-wave"
          />

          {/* Center Dot */}
          <circle cx="16" cy="16" r="4" fill="#ffffff" className="logo-dot" />
        </svg>
      </div>
      <div className="flex flex-col ml-3">
        <span className="text-2xl font-bold bg-gradient-text">dripples</span>
        <span className="text-xs text-gray-600">XRPL NFT Marketplace</span>
      </div>
    </div>
  );
}
