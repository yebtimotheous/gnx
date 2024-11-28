import Image from "next/image";

const trendingData = [
  {
    id: 1,
    name: "Bored Ape XRPL",
    creator: "BoredApeClub",
    price: "1000 XRP",
    image: "https://picsum.photos/300/300?random=14",
    volume: "50,000 XRP",
    items: 10000,
    change: "+12.5%",
    rank: 1,
  },
  {
    id: 2,
    name: "Crypto Punks X",
    creator: "CryptoPunks",
    price: "800 XRP",
    image: "https://picsum.photos/300/300?random=15",
    volume: "45,000 XRP",
    items: 9999,
    change: "+10.2%",
    rank: 2,
  },
  {
    id: 3,
    name: "Doodles XRPL",
    creator: "DoodleTeam",
    price: "500 XRP",
    image: "https://picsum.photos/300/300?random=16",
    volume: "30,000 XRP",
    items: 8888,
    change: "+8.7%",
    rank: 3,
  },
  {
    id: 4,
    name: "Azuki X",
    creator: "AzukiTeam",
    price: "600 XRP",
    image: "https://picsum.photos/300/300?random=17",
    volume: "35,000 XRP",
    items: 7777,
    change: "+7.5%",
    rank: 4,
  },
];

export default function TrendingCollections() {
  return (
    <div className="py-12 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold font-playfair">
            Trending Collections
          </h2>
          <select className="bg-white border border-gray-300 rounded-lg px-4 py-2">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>All time</option>
          </select>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50 rounded-t-lg font-semibold text-sm text-gray-500">
          <div className="col-span-2 font-poppins">Collection</div>
          <div className="text-right">Floor Price</div>
          <div className="text-right">Volume</div>
          <div className="text-right">Items</div>
          <div className="text-right">24h %</div>
          <div className="text-right">Owners</div>
        </div>

        {/* Collection List */}
        <div className="bg-white rounded-b-lg shadow divide-y">
          {trendingData.map((collection) => (
            <div
              key={collection.id}
              className="hover:bg-gray-50 transition-colors duration-200 px-6 py-4"
            >
              <div className="md:grid md:grid-cols-7 md:gap-4 items-center">
                {/* Collection Info - Mobile & Desktop */}
                <div className="flex items-center col-span-2 mb-4 md:mb-0">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 font-medium min-w-[1.5rem]">
                      {collection.rank}
                    </span>
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{collection.name}</h3>
                      <p className="text-sm text-gray-500">
                        by {collection.creator}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats - Desktop */}
                <div className="hidden md:block text-right">
                  <span className="font-medium">{collection.price}</span>
                </div>
                <div className="hidden md:block text-right">
                  <span className="font-medium">{collection.volume}</span>
                </div>
                <div className="hidden md:block text-right">
                  <span className="font-medium">
                    {collection.items.toLocaleString()}
                  </span>
                </div>
                <div className="hidden md:block text-right">
                  <span className="text-green-500 font-medium">
                    {collection.change}
                  </span>
                </div>
                <div className="hidden md:block text-right">
                  <span className="font-medium">
                    {Math.floor(collection.items * 0.7).toLocaleString()}
                  </span>
                </div>

                {/* Stats - Mobile */}
                <div className="grid grid-cols-2 gap-4 md:hidden">
                  <div>
                    <p className="text-sm text-gray-500">Floor Price</p>
                    <p className="font-medium">{collection.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Volume</p>
                    <p className="font-medium">{collection.volume}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Items</p>
                    <p className="font-medium">
                      {collection.items.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">24h %</p>
                    <p className="text-green-500 font-medium">
                      {collection.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-6 text-center">
          <button className="btn-primary px-8 py-3 rounded-full">
            View All Collections
          </button>
        </div>
      </div>
    </div>
  );
}
