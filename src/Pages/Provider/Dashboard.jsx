import { Link } from 'react-router-dom';

export default function ProviderDashboard() {
  // Mock data (replace with API calls later)
  const stats = [
    { title: "Total Bookings", value: "12" },
    { title: "Active Services", value: "5" },
    { title: "Earnings", value: "$1,240" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Link
          to="/provider/add-service"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Service
        </Link>
        <Link
          to="/provider/bookings"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          View Bookings
        </Link>
      </div>

      {/* Recent Bookings Preview */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Customer</th>
              <th className="text-left p-2">Service</th>
              <th className="text-left p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">John Doe</td>
              <td className="p-2">Oil Change</td>
              <td className="p-2">Aug 25, 2024</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}