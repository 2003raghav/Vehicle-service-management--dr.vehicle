// src/pages/SearchPage.jsx
import { useLocation } from "react-router-dom";

export default function SearchPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 text-center">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Search Results</h1>
      {query ? (
        <p className="text-gray-700 text-lg">
          Showing results for: <span className="font-semibold text-blue-500">"{query}"</span>
        </p>
      ) : (
        <p className="text-gray-500">No search query entered.</p>
      )}

      {/* You can add fake data or filter from a dummy array here */}
      <div className="mt-6 text-sm text-gray-500">
        <p>This is just a placeholder search page (no backend).</p>
      </div>
    </div>
  );
}
