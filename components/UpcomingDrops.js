import Image from "next/image";

const upcomingDrops = [
  {
    id: 1,
    name: "Cosmic Collection",
    creator: "SpaceArtist",
    date: "2024-04-01T10:00:00Z",
    image: "https://picsum.photos/600/400?random=11",
    price: "Starting at 500 XRP",
    totalItems: 1000,
    description: "A unique collection of cosmic-themed digital art",
    countdown: "2 days 5 hours",
    totalArtists: 5,
    category: "Digital Art",
  },
  {
    id: 2,
    name: "Digital Dreamscape",
    creator: "DreamTeam",
    date: "2024-04-05T15:00:00Z",
    image: "https://picsum.photos/600/400?random=12",
    price: "Starting at 300 XRP",
    totalItems: 2000,
    description: "Enter a world of digital dreams and surreal landscapes",
    countdown: "6 days 12 hours",
    totalArtists: 3,
    category: "Landscapes",
  },
  {
    id: 3,
    name: "Future Artifacts",
    creator: "TechnoArt",
    date: "2024-04-10T18:00:00Z",
    image: "https://picsum.photos/600/400?random=13",
    price: "Starting at 400 XRP",
    totalItems: 1500,
    description: "Artifacts from the future, created today",
    countdown: "11 days 8 hours",
    totalArtists: 7,
    category: "Futuristic",
  },
];

export default function UpcomingDrops() {
  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-4xl font-bold font-playfair mb-4">
              Upcoming Drops
            </h2>
            <p className="text-gray-600">
              Exclusive NFT collections dropping soon
            </p>
          </div>
          <div className="flex gap-4">
            <select className="upcoming-filter-select">
              <option>All Categories</option>
              <option>Digital Art</option>
              <option>Landscapes</option>
              <option>Futuristic</option>
            </select>
          </div>
        </div>

        {/* Drops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingDrops.map((drop) => (
            <div key={drop.id} className="upcoming-drop-card group">
              {/* Image Container */}
              <div className="relative h-64 w-full overflow-hidden rounded-t-xl">
                <Image
                  src={drop.image}
                  alt={drop.name}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className="upcoming-category-tag">{drop.category}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-center text-white">
                    <span className="upcoming-countdown-tag">
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
                      {drop.countdown}
                    </span>
                    <span className="text-sm font-medium">
                      {drop.totalArtists} Artists
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 bg-white rounded-b-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl mb-2 font-playfair group-hover:text-blue-600 transition-colors duration-300">
                      {drop.name}
                    </h3>
                    <p className="text-gray-600 text-sm flex items-center">
                      by{" "}
                      <span className="font-medium ml-1 hover:text-blue-600 cursor-pointer">
                        {drop.creator}
                      </span>
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                  {drop.description}
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Collection Size
                    </p>
                    <p className="font-semibold">
                      {drop.totalItems.toLocaleString()} Items
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Starting Price
                    </p>
                    <p className="font-semibold">{drop.price}</p>
                  </div>
                </div>
                <button className="upcoming-notify-btn w-full mt-6">
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    Get Notified
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
