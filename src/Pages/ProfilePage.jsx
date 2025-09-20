import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) return;

    // Fetch user details from backend
    fetch(`http://localhost:8080/api/users/${username}`, {
      headers: {
        "Authorization": `Bearer ${token}`, // if backend uses JWT
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-3xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 -mt-10 mx-2 shadow-lg">
          <div className="flex items-center space-x-6 text-white">
            <img
              src={
                user.imageName
                  ? `http://localhost:8080/api/images/${user.imageName}`
                  : "https://via.placeholder.com/150"
              }
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-blue-100">{user.email}</p>
              <div className="flex flex-wrap mt-2 gap-2">
                <span className="bg-blue-800 bg-opacity-50 text-xs px-3 py-1 rounded-full">
                  {user.membership || "Regular Member"}
                </span>
                <span className="text-blue-200 text-sm">
                  Customer since {user.customerSince || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[ 
            { value: user.servicesDone || "0", label: "Services Done", color: "blue" },
            { value: user.avgRating || "0", label: "Avg. Rating", color: "green" },
            { value: user.vehicles?.length || "0", label: "Vehicles", color: "purple" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-${stat.color}-50 p-4 rounded-lg text-center cursor-pointer transition transform hover:-translate-y-1 hover:shadow-md`}
            >
              <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
              <p className={`text-sm text-${stat.color}-600`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Personal Info */}
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-lg text-gray-800">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg border">
              <label className="text-sm text-gray-600">Phone Number</label>
              <p className="font-medium">{user.phone}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <label className="text-sm text-gray-600">Date of Birth</label>
              <p className="font-medium">
                {new Date(user.dateofbirth).toLocaleDateString()}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <label className="text-sm text-gray-600">Address</label>
              <p className="font-medium">{user.address}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <label className="text-sm text-gray-600">Username</label>
              <p className="font-medium">{user.username}</p>
            </div>
          </div>
        </div>

        {/* Vehicles */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg text-gray-800">My Vehicles</h3>
          <div className="mt-4 space-y-4">
            {user.vehicles?.map((vehicle, idx) => (
              <div
                key={idx}
                className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer transition hover:shadow-md hover:bg-gray-100"
              >
                <div className={`bg-blue-100 p-3 rounded-lg mr-4`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-blue-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{vehicle.vehiclemodel}</h4>
                  <p className="text-sm text-gray-600">{vehicle.regno}</p>
                  <p className="text-xs text-blue-600 mt-1">Next service due in {vehicle.nextService || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-md">
            Edit Profile
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/signin";
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
