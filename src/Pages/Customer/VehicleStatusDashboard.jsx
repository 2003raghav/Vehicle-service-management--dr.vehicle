// VehicleServiceDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { 
  CheckCircle, 
  Clock, 
  Car, 
  Video, 
  Wrench, 
  Shield, 
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Star,
  History
} from "lucide-react";

export default function VehicleServiceDashboard() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [loading, setLoading] = useState(true);
  const [liveViewActive, setLiveViewActive] = useState(false);
  const username = localStorage.getItem("username");
  const navigate = useNavigate(); // ✅ initialize navigation

  useEffect(() => {
    if (!username) return;

    const fetchServices = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/services/${username}`);
        if (!response.ok) throw new Error("No services found");

        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error(err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [username]);

  const filteredServices = services.filter(service => 
    activeTab === "ongoing" 
      ? service.status !== "completed"
      : service.status === "completed"
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50";
      case "in-progress": return "text-blue-600 bg-blue-50";
      case "scheduled": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const handleRequestLiveView = () => {
    setLiveViewActive(true);
    setTimeout(() => setLiveViewActive(false), 5000);
  };

  const handleScheduleService = () => {
    // ✅ Navigate to booking page
    navigate("/bookappointment");
  };

 

  const handleRateService = () => {
    console.log("Open rating interface");
    navigate("/feedback");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Vehicle Service Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Track and manage your vehicle services</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Service Center: Bangalore</span>
              </div>
            </div>
            
                  <Link 
          to="/contactus"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
          style={{textDecoration: 'none'}}
        >
          <Phone className="w-4 h-4" />
          <span>Contact Support</span>
        </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ongoing Services</p>
                <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.status === "in-progress").length}</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.status === "scheduled").length}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.status === "completed").length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Live Support</p>
                <p className="text-2xl font-bold text-gray-900">Online</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Service List */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab("ongoing")}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  activeTab === "ongoing"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Ongoing Services
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  activeTab === "completed"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Completed Services
              </button>
            </div>

            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={`bg-white rounded-xl shadow-lg p-6 border-l-4 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    selectedService?.id === service.id ? "ring-2 ring-blue-500" : ""
                  } ${
                    service.status === "completed" ? "border-green-500" :
                    service.status === "in-progress" ? "border-blue-500" :
                    "border-orange-500"
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <Car className={`w-6 h-6 mt-1 ${
                        service.status === "completed" ? "text-green-500" :
                        service.status === "in-progress" ? "text-blue-500" :
                        "text-orange-500"
                      }`} />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {service.vehicleModel}
                        </h3>
                        <p className="text-gray-500 text-sm">{service.licensePlate}</p>
                        <p className="text-gray-700 mt-1">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end mt-3 lg:mt-0 space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status.replace("-", " ").toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(service.priority)}`}>
                        {service.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-3">
                      {service.updates?.map((update, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            update.completed 
                              ? "bg-green-500 text-white" 
                              : "bg-gray-200 text-gray-400"
                          }`}>
                            {update.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex justify-between items-start">
                              <p className={`font-medium ${
                                update.completed ? "text-gray-900" : "text-gray-500"
                              }`}>
                                {update.step}
                              </p>
                              {update.timestamp && (
                                <span className="text-xs text-gray-400">
                                  {new Date(update.timestamp).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{update.note}</p>
                            <p className="text-xs text-gray-400 mt-1">By: {update.technician}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Service Broadcast */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Live Service Broadcast</h2>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700">Live Service Feed</h3>
                  <span className="text-sm text-gray-500">Country/office</span>
                </div>

                <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[120px] flex items-center justify-center">
                  {liveViewActive ? (
                    <div className="text-center">
                      <div className="animate-pulse bg-red-500 rounded-full w-4 h-4 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Connecting to live feed...</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">Live feed will appear here when activated</p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={handleRequestLiveView}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Request Live View</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>

              <div className="space-y-3">
                <button 
                  onClick={handleScheduleService}
                  className="w-full bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition duration-200 flex items-center space-x-3 text-left"
                >
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Schedule New Service</p>
                    <p className="text-sm text-gray-500">Book appointment for maintenance</p>
                  </div>
                </button>


                <button 
                  onClick={handleRateService}
                  className="w-full bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition duration-200 flex items-center space-x-3 text-left"
                >
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Rate Previous Service</p>
                    <p className="text-sm text-gray-500">Share your feedback</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
