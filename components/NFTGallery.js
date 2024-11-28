import Image from "next/image";

const nftData = [
  {
    id: 1,
    name: "Cosmic Voyager #1",
    creator: "SpaceArtist",
    price: "500 XRP",
    image: "https://picsum.photos/500/400?random=1",
    likes: 234,
    category: "Art",
    timeLeft: "2 days",
    bidders: 12,
  },
  {
    id: 2,
    name: "Digital Dreams #7",
    creator: "DigitalMaster",
    price: "300 XRP",
    image: "https://picsum.photos/500/400?random=2",
    likes: 189,
    category: "Digital",
    timeLeft: "5 hours",
    bidders: 8,
  },
  {
    id: 3,
    name: "Abstract Mind #4",
    creator: "ArtisticSoul",
    price: "450 XRP",
    image: "https://picsum.photos/500/400?random=3",
    likes: 156,
    category: "Abstract",
    timeLeft: "1 day",
    bidders: 15,
  },
  {
    id: 4,
    name: "Pixel World #2",
    creator: "PixelMaster",
    price: "200 XRP",
    image: "https://picsum.photos/500/400?random=4",
    likes: 321,
    category: "Pixel Art",
    timeLeft: "3 days",
    bidders: 6,
  },
  {
    id: 5,
    name: "Nature's Call #9",
    creator: "NatureArtist",
    price: "600 XRP",
    image: "https://picsum.photos/500/400?random=5",
    likes: 278,
    category: "Nature",
    timeLeft: "12 hours",
    bidders: 20,
  },
  {
    id: 6,
    name: "Future City #5",
    creator: "FutureVision",
    price: "550 XRP",
    image: "https://picsum.photos/500/400?random=6",
    likes: 198,
    category: "Futuristic",
    timeLeft: "4 days",
    bidders: 10,
  },
];

export default function NFTGallery() {
  return (
    <div className="py-12 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-4xl font-bold font-playfair mb-4">
              Explore NFTs
            </h2>
            <p className="text-gray-600">
              Discover unique digital artworks from talented creators
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <select className="nft-filter-select">
                <option>All Categories</option>
                <option>Art</option>
                <option>Digital</option>
                <option>Abstract</option>
                <option>Pixel Art</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <div className="relative">
              <select className="nft-filter-select">
                <option>Recently Listed</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Most Liked</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {nftData.map((nft) => (
            <div key={nft.id} className="nft-card-modern group">
              <div className="relative h-72 w-full overflow-hidden rounded-t-xl">
                <Image
                  src={nft.image}
                  alt={nft.name}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <span className="nft-category-tag">{nft.category}</span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="nft-time-tag">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {nft.timeLeft} left
                  </span>
                </div>
              </div>

              <div className="p-6 bg-white rounded-b-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl mb-2 font-playfair">
                      {nft.name}
                    </h3>
                    <p className="text-gray-600 text-sm flex items-center">
                      by {nft.creator}
                      <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mx-2"></span>
                      {nft.bidders} bidders
                    </p>
                  </div>
                  <button className="nft-like-button">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="ml-1">{nft.likes}</span>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Current Bid</p>
                    <p className="text-xl font-bold text-black">{nft.price}</p>
                  </div>
                  <button className="bid-button">Place Bid</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="load-more-button">Load More NFTs</button>
        </div>
      </div>
    </div>
  );
}
