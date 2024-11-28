import Image from "next/image";

const creators = [
  {
    id: 1,
    name: "Alex Digital",
    avatar: "https://picsum.photos/200/200?random=7",
    totalSales: "120,000 XRP",
    nftsSold: 234,
    followers: "15.3K",
    verified: true,
  },
  {
    id: 2,
    name: "Sarah NFTArtist",
    avatar: "https://picsum.photos/200/200?random=8",
    totalSales: "98,500 XRP",
    nftsSold: 189,
    followers: "12.1K",
    verified: true,
  },
  {
    id: 3,
    name: "CryptoMaster",
    avatar: "https://picsum.photos/200/200?random=9",
    totalSales: "87,200 XRP",
    nftsSold: 156,
    followers: "10.5K",
    verified: true,
  },
  {
    id: 4,
    name: "Digital Dreams",
    avatar: "https://picsum.photos/200/200?random=10",
    totalSales: "76,800 XRP",
    nftsSold: 143,
    followers: "9.8K",
    verified: false,
  },
];

export default function TopCreators() {
  return (
    <div className="py-12 bg-white font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 font-playfair">
            Top Creators
          </h2>
          <p className="text-gray-600">
            Discover the artists shaping the NFT space
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={creator.avatar}
                    alt={creator.name}
                    layout="fill"
                    className="rounded-full"
                    objectFit="cover"
                  />
                  {creator.verified && (
                    <div className="absolute -right-1 -bottom-1 bg-blue-500 rounded-full p-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{creator.name}</h3>
                  <p className="text-gray-600 text-sm">
                    Total Sales: {creator.totalSales}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">NFTs Sold</p>
                  <p className="font-bold">{creator.nftsSold}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">Followers</p>
                  <p className="font-bold">{creator.followers}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
