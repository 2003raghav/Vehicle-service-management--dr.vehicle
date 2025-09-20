import { Search } from "lucide-react";

export default function SearchBar({ searchQuery, setSearchQuery, handleSearch }) {
  const onKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={onKeyPress}
        placeholder="Search services, vehicles, bookings..."
        className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      />
      {/* Search Icon */}
      <button
        onClick={handleSearch}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
      >
        <Search size={20} />
      </button>
    </div>
  );
}
