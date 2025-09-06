import { Link } from "react-router-dom";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">VEHICLE SERVICE CONNECT</h1>
      <div className="flex gap-4">
        <Link
          to="/services"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition text-decoration-none"
        >
          Find Services
        </Link>
        <Link
          to="/provider-signup"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition text-decoration-none"
        >
          List Your Garage
        </Link>
      </div>
    </div>
  );
}