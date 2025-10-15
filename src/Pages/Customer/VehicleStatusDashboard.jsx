import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle, Clock, Car, Video, Wrench, MapPin,
  Phone, Calendar, Star, Play, Pause,
  AlertCircle, X, Youtube
} from "lucide-react";
import axios from "axios";

export default function VehicleServiceDashboard() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoError, setVideoError] = useState("");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  // Fixed YouTube car service video - always available
  const carServiceVideo = "https://www.youtube.com/embed/LvR3yC3JffE?autoplay=1";

  // Enhanced API call with error handling
  const apiCall = async (url, options = {}) => {
    try {
      const response = await axios({
        url,
        timeout: 15000,
        ...options
      });
      return { data: response.data, error: null };
    } catch (error) {
      console.warn(`API call failed for ${url}:`, error.message);
      return { data: null, error };
    }
  };

  useEffect(() => {
    if (!username) return;

    const fetchServices = async () => {
      try {
        const { data, error } = await apiCall(`http://localhost:8080/api/services/${username}`);
        
        if (error) throw new Error("No services found");

        setServices(data || []);
        
      } catch (err) {
        console.error(err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [username]);

  // YouTube Video Functions
  const handleWatchVideo = () => {
    try {
      setVideoError("");
      
      const videoData = {
        providerName: "Service Center",
        status: 'active',
        youtubeLink: carServiceVideo,
        serviceType: "Car Service Tutorial"
      };

      setCurrentVideo(videoData);
      setShowVideoModal(true);
      setIsVideoPlaying(true);

      // Auto stop after 30 minutes
      setTimeout(() => {
        handleStopVideo();
      }, 30 * 60 * 1000);
      
    } catch (error) {
      console.error('Error loading video:', error);
      const errorMsg = 'Unable to load video. Please try again later.';
      setVideoError(errorMsg);
    }
  };

  const handleStopVideo = () => {
    setCurrentVideo(null);
    setShowVideoModal(false);
    setIsVideoPlaying(false);
    setVideoError("");
  };

  const toggleVideoPlayback = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

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

  const handleScheduleService = () => {
    navigate("/bookappointment");
  };

  const handleRateService = () => {
    navigate("/feedback");
  };

  // YouTube Video Modal Component
  const YouTubeVideoModal = () => {
    if (!showVideoModal || !currentVideo) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Youtube className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Car Service Educational Video
                </h3>
                <p className="text-sm text-gray-400">
                  Learn about professional car service procedures
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isVideoPlaying ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                <span className="text-sm text-white font-medium">
                  {isVideoPlaying ? 'PLAYING' : 'PAUSED'}
                </span>
              </div>
              <button onClick={handleStopVideo} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-black relative">
              {currentVideo?.youtubeLink ? (
                <iframe
                  src={isVideoPlaying ? currentVideo.youtubeLink : currentVideo.youtubeLink.replace('autoplay=1', 'autoplay=0')}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Car Service Educational Video"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-lg">Loading video...</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Preparing educational video
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button
                  onClick={toggleVideoPlayback}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isVideoPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  onClick={handleStopVideo}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop Watching
                </button>
              </div>

              {isVideoPlaying && (
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                    YOUTUBE
                  </span>
                </div>
              )}
            </div>

            {/* Video Information */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-2 bg-gray-700 rounded">
                  <p className="font-medium text-gray-300">Video Type</p>
                  <p className="text-white">Educational</p>
                </div>
                <div className="text-center p-2 bg-gray-700 rounded">
                  <p className="font-medium text-gray-300">Provider</p>
                  <p className="text-white">Service Center</p>
                </div>
                <div className="text-center p-2 bg-gray-700 rounded">
                  <p className="font-medium text-gray-300">Content</p>
                  <p className="text-white">Car Service</p>
                </div>
                <div className="text-center p-2 bg-gray-700 rounded">
                  <p className="font-medium text-gray-300">Platform</p>
                  <p className="text-white">YouTube</p>
                </div>
              </div>

              {/* YouTube Status Notice */}
              <div className="mt-4 p-3 bg-blue-900 border border-blue-700 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Youtube className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-200 font-medium">Educational Service Video</p>
                    <p className="text-xs text-blue-300">
                      Watch this educational video to learn about professional car service procedures and maintenance tips.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                <p className="text-2xl font-bold text-gray-900">
                  {services.filter(s => s.status === "in-progress").length}
                </p>
              </div>
              <Wrench className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {services.filter(s => s.status === "scheduled").length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {services.filter(s => s.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Service Video</p>
                <p className="text-2xl font-bold text-gray-900">Always Available</p>
              </div>
              <Video className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Video Error Message */}
        {videoError && (
          <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>{videoError}</span>
            </div>
          </div>
        )}

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
              {filteredServices.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab === "ongoing" ? "Ongoing" : "Completed"} Services
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === "ongoing" 
                      ? "You don't have any ongoing services at the moment." 
                      : "You haven't completed any services yet."
                    }
                  </p>
                </div>
              ) : (
                filteredServices.map((service) => (
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
                            {service.vehicleModel || "Vehicle Service"}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {service.licensePlate || "No license plate"}
                          </p>
                          <p className="text-gray-700 mt-1">
                            {service.serviceType || "Vehicle maintenance service"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end mt-3 lg:mt-0 space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                          {service.status?.replace("-", " ").toUpperCase() || "UNKNOWN"}
                        </span>
                        {service.priority && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(service.priority)}`}>
                            {(service.priority || "medium").toUpperCase()} PRIORITY
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Timeline */}
                    {service.updates && service.updates.length > 0 && (
                      <div className="relative mt-4">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        <div className="space-y-3">
                          {service.updates.map((update, index) => (
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
                                    {update.step || "Service Step"}
                                  </p>
                                  {update.timestamp && (
                                    <span className="text-xs text-gray-400">
                                      {new Date(update.timestamp).toLocaleTimeString()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {update.note || "Update in progress"}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  By: {update.technician || "Service Technician"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Video */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Service Video</h2>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700">Educational Video</h3>
                  {currentVideo && (
                    <span className="text-sm text-red-600 font-medium flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                      PLAYING
                    </span>
                  )}
                </div>

                <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[120px] flex items-center justify-center">
                  {currentVideo ? (
                    <div className="text-center w-full">
                      <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg aspect-video flex items-center justify-center mb-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div className="text-white text-center relative z-10">
                          <Youtube className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">YouTube Video Playing</p>
                          <p className="text-xs text-gray-200">Car Service Educational Video</p>
                        </div>
                      </div>
                      <button
                        onClick={handleStopVideo}
                        className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 mx-auto"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Stop Watching</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Youtube className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Watch car service educational video</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Learn about professional car service procedures
                      </p>
                      <button
                        onClick={handleWatchVideo}
                        className="mt-3 flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 mx-auto"
                      >
                        <Play className="w-4 h-4" />
                        <span>Watch Video</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Video Description */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">About This Video</h4>
                  <p className="text-sm text-blue-700">
                    This educational video demonstrates professional car service procedures, 
                    maintenance tips, and best practices for vehicle care.
                  </p>
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

      {/* YouTube Video Modal */}
      <YouTubeVideoModal />
    </div>
  );
}