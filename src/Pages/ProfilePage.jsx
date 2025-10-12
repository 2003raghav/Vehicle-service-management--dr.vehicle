import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format, parse } from 'date-fns';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      navigate("/signin");
      return;
    }

    fetchUserProfile(username);
  }, [navigate]);

  const fetchUserProfile = async (username) => {
    try {
      setLoading(true);
      setError("");

      // Fetch user details
      const userResponse = await fetch(`http://localhost:8080/api/users/${username}`);
      
      if (!userResponse.ok) {
        throw new Error("Failed to load profile");
      }

      const userData = await userResponse.json();
      setUser(userData);

    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getImageUrl = () => {
    if (!user) return null;
    
    // Try different image endpoints
    if (user.id) {
      return `http://localhost:8080/api/user-images/${user.id}`;
    }
    if (user.imageName) {
      return `http://localhost:8080/api/images/${user.imageName}`;
    }
    
    return null;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString) => {
  if (!dateString) return 'Not provided';
  try {
    let date;
    
    // Try parsing dd-MM-yyyy format
    if (typeof dateString === 'string') {
      try {
        // Parse the dd-MM-yyyy format
        date = parse(dateString, 'dd-MM-yyyy', new Date());
      } catch {
        // Fallback to native Date parsing
        date = new Date(dateString);
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      return 'Not provided';
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return format(date, 'MMMM dd, yyyy');
  } catch (e) {
    console.error('Date formatting error:', e);
    return 'Not provided';
  }
};
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    navigate("/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile</p>
          <Link
            to="/signin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-md inline-block"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Image */}
              <div className="relative">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={`Profile of ${user.name || user.username}`}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={handleImageError}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {getInitials(user.name || user.username)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold mb-2">{user.name || "User"}</h1>
                <p className="text-blue-100 text-lg mb-4">{user.email || "No email provided"}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="bg-blue-800 bg-opacity-50 text-sm px-3 py-1 rounded-full">
                    @{user.username}
                  </span>
                  {user.membership && (
                    <span className="bg-green-800 bg-opacity-50 text-sm px-3 py-1 rounded-full">
                      {user.membership}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
              <span className="text-sm text-gray-500">Account Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-lg text-gray-800">{user.name || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Username</label>
                <p className="text-lg text-gray-800">{user.username || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Email Address</label>
                <p className="text-lg text-gray-800">{user.email || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <p className="text-lg text-gray-800">{user.phone || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-lg text-gray-800">
                  {user.dateofbirth ? formatDate(user.dateofbirth) : "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Membership</label>
                <p className="text-lg text-gray-800">{user.membership || "Standard"}</p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p className="text-lg text-gray-800">{user.address || "Not provided"}</p>
              </div>
              {user.vehiclemodel && (
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-gray-600">Registered Vehicle</label>
                  <p className="text-lg text-gray-800">
                    {user.vehiclemodel} 
                    {user.regno && ` (${user.regno})`}
                    {user.vehicletype && ` • ${user.vehicletype}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Account Management */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Account Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Edit Profile Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 hover:bg-blue-100 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 " style={{textDecoration:'none'}}>Edit Profile</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                  Update your personal information, contact details, and preferences.
                </p>
                <Link
                  to="/edit-profile"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition text-center block"
                style={{textDecoration:'none'}}>
                  Edit Profile
                </Link>
              </div>

              {/* Payment Methods Card */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 hover:bg-green-100 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Payment Methods</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                  Manage your payment methods, view billing history, and update preferences.
                </p>
                <Link
                  to="/payment-methods"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition text-center block"
                style={{textDecoration:'none'}}>
                  Manage Payments
                </Link>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}