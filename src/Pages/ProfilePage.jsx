export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-3xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 -mt-10 mx-2 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 text-center sm:text-left">
            <div className="relative mb-4 sm:mb-0">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white"></div>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">John Doe</h2>
              <p className="text-blue-100">johndoe@example.com</p>
              <div className="flex flex-wrap justify-center sm:justify-start mt-2 gap-2">
                <span className="bg-blue-800 bg-opacity-50 text-xs px-3 py-1 rounded-full">Premium Member</span>
                <span className="text-blue-200 text-sm">Customer since 2022</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[
            { value: "12", label: "Services Done", color: "blue" },
            { value: "4.8", label: "Avg. Rating", color: "green" },
            { value: "2", label: "Vehicles", color: "purple" },
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

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200 flex justify-around">
          {["Details", "Vehicles", "Bookings"].map((tab, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 font-medium transition relative hover:text-blue-600 ${
                idx === 0 ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Personal Info */}
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-lg text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Phone Number", value: "+91 9876543210" },
              { label: "Date of Birth", value: "12/05/1995" },
              { label: "Address", value: "Bangalore, India" },
              { label: "Emergency Contact", value: "+91 9123456780" },
            ].map((info, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer transition hover:shadow-md hover:bg-gray-100"
              >
                <label className="text-sm text-gray-600">{info.label}</label>
                <p className="font-medium">{info.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicles */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1a1 1 0 011-1h2.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
            </svg>
            My Vehicles
          </h3>

          <div className="mt-4 space-y-4">
            {[
              { name: "Hyundai i20", plate: "KA05 AB 1234", status: "Next service due in 32 days", color: "blue" },
              { name: "Honda Activa", plate: "KA03 XY 9876", status: "Recently serviced", color: "green" },
            ].map((vehicle, idx) => (
              <div
                key={idx}
                className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer transition hover:shadow-md hover:bg-gray-100"
              >
                <div className={`bg-${vehicle.color}-100 p-3 rounded-lg mr-4`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-${vehicle.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{vehicle.name}</h4>
                  <p className="text-sm text-gray-600">{vehicle.plate}</p>
                  <p className={`text-xs text-${vehicle.color}-600 mt-1`}>{vehicle.status}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-md">
            Edit Profile
          </button>
          <button className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
