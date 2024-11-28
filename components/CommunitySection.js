export default function CommunitySection() {
  return (
    <div className="py-24 bg-black text-white font-poppins relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute transform rotate-45 -left-1/4 -top-1/4 w-1/2 h-1/2 bg-gradient-to-r from-primary/20 to-transparent" />
        <div className="absolute transform rotate-45 -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-gradient-to-l from-primary/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-block mb-6">
              <span className="community-badge">Join 50K+ Members</span>
            </div>
            <h2 className="text-5xl font-bold mb-8 font-playfair leading-tight">
              Be Part of Our
              <span className="text-gradient block">NFT Community</span>
            </h2>
            <p className="text-gray-300 text-lg mb-12 leading-relaxed max-w-xl">
              Connect with fellow collectors and creators. Stay updated with the
              latest drops and opportunities in the XRPL NFT space.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <button className="community-btn-new discord">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Join Discord
              </button>
              <button className="community-btn-new twitter">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                Follow Twitter
              </button>
            </div>
          </div>

          {/* Right Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="community-stat-card">
              <div className="stat-icon-wrapper">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="stat-number">50K+</h3>
              <p className="stat-label">Community Members</p>
            </div>
            <div className="community-stat-card">
              <div className="stat-icon-wrapper">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="stat-number">10K+</h3>
              <p className="stat-label">Discord Members</p>
            </div>
            <div className="community-stat-card">
              <div className="stat-icon-wrapper">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="stat-number">5K+</h3>
              <p className="stat-label">Daily Transactions</p>
            </div>
            <div className="community-stat-card">
              <div className="stat-icon-wrapper">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="stat-number">100+</h3>
              <p className="stat-label">Active Artists</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
