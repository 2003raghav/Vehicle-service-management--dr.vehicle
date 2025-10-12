import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Wrench, 
  Car,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { title: "Total Bookings", value: "0", icon: Calendar, color: "blue" },
    { title: "Active Services", value: "0", icon: Users, color: "green" },
    { title: "Pending", value: "0", icon: Clock, color: "orange" },
    { title: "Completed", value: "0", icon: CheckCircle, color: "purple" },
  ]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [providerData, setProviderData] = useState(null);

  useEffect(() => {
    const checkProviderLogin = () => {
      const isLoggedIn = localStorage.getItem("providerLoggedIn");
      const providerName = localStorage.getItem("providerOwnername");
      
      if (!isLoggedIn || !providerName) {
        navigate("/providerLogin");
        return false;
      }
      return providerName;
    };

    const providerName = checkProviderLogin();
    if (providerName) {
      fetchProviderData(providerName);
    }
  }, [navigate]);

  const fetchProviderData = async (providerName) => {
    try {
      setLoading(true);
      
      // Fetch provider's appointments
      const appointmentsResponse = await fetch(`http://localhost:8080/appointment/owner/${providerName}`);
      
      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const appointmentsData = await appointmentsResponse.json();
      
      // Handle both array response and message response
      const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
      
      // Calculate stats
      const totalBookings = appointments.length;
      const activeServices = appointments.filter(apt => 
        apt.status === 'in-progress' || apt.status === 'confirmed'
      ).length;
      const pending = appointments.filter(apt => 
        apt.status === 'pending' || apt.status === 'scheduled'
      ).length;
      const completed = appointments.filter(apt => 
        apt.status === 'completed'
      ).length;

      // Update stats
      setStats([
        { title: "Total Bookings", value: totalBookings.toString(), icon: Calendar, color: "blue" },
        { title: "Active Services", value: activeServices.toString(), icon: Users, color: "green" },
        { title: "Pending", value: pending.toString(), icon: Clock, color: "orange" },
        { title: "Completed", value: completed.toString(), icon: CheckCircle, color: "purple" },
      ]);

      // Get recent bookings (last 5)
      const recent = appointments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      setRecentBookings(recent);

      // Fetch provider details
      const providersResponse = await fetch('http://localhost:8080/provider/providerList');
      if (providersResponse.ok) {
        const providers = await providersResponse.json();
        const currentProvider = providers.find(p => p.ownername === providerName);
        setProviderData(currentProvider);
      }

    } catch (error) {
      console.error('Error fetching provider data:', error);
      // Set empty state on error
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { color: 'bg-green-100 text-green-800', text: 'Completed' },
      'in-progress': { color: 'bg-blue-100 text-blue-800', text: 'In Progress' },
      'confirmed': { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'scheduled': { color: 'bg-orange-100 text-orange-800', text: 'Scheduled' },
      'cancelled': { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("providerLoggedIn");
    localStorage.removeItem("providerOwnername");
    localStorage.removeItem("providerId");
    navigate("/providerLogin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {providerData?.ownername || 'Provider'}
          </p>
          {providerData?.garagename && (
            <p className="text-gray-500 text-sm">
              {providerData.garagename}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <Link
            to="/provider/profile"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
            style={{textDecoration:'none'}}
          >
            <Users className="w-4 h-4" />
            <span>View Profile</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/provider/bookings"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
            style={{textDecoration:'none'}}
          >
            <Calendar className="w-4 h-4" />
            <span>View All Bookings</span>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
          <Link 
            to="/provider/bookings" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            style={{textDecoration:'none'}}
          >
            View All →
          </Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Vehicle</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Service</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.name}</p>
                        <p className="text-sm text-gray-500">{booking.phone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.vehicleName}</p>
                        <p className="text-sm text-gray-500">{booking.vehicleNumber}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{booking.serviceType}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-gray-900">{formatDate(booking.date)}</p>
                        <p className="text-sm text-gray-500">{formatTime(booking.time)}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(booking.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-gray-500 mb-6">Your recent bookings will appear here</p>
            <Link
              to="/provider/schedule"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 inline-flex items-center space-x-2"
              style={{textDecoration:'none'}}
            >
              <Wrench className="w-4 h-4" />
              <span>Set Up Availability</span>
            </Link>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
        >
          <XCircle className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}