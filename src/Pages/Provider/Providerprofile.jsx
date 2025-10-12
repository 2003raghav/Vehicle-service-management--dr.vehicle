import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProviderProfile() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("providerLoggedIn");
    if (!isLoggedIn) {
      navigate("/providerLogin");
      return;
    }

    const fetchProvider = async () => {
      try {
        const ownername = localStorage.getItem("providerOwnername");
        if (!ownername) {
          navigate("/providerLogin");
          return;
        }

        const response = await axios.get(`http://localhost:8080/provider/providerList`);
        const loggedInProvider = response.data.find(
          (p) => p.ownername === ownername
        );

        if (loggedInProvider) {
          setProvider(loggedInProvider);
          
          if (loggedInProvider.id) {
            try {
              const imageResponse = await axios.get(
                `http://localhost:8080/provider/images/${loggedInProvider.id}`,
                { responseType: 'blob' }
              );
              const imageBlob = new Blob([imageResponse.data], { type: imageResponse.headers['content-type'] });
              const imageObjectUrl = URL.createObjectURL(imageBlob);
              setImageUrl(imageObjectUrl);
            } catch (imageError) {
              console.warn("No image found for provider:", imageError);
              setImageUrl(null);
            }
          }
        } else {
          alert("Provider not found");
          navigate("/providerLogin");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching provider info");
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
      </div>
    </div>
  );

  if (!provider) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Enhanced Header Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-100">
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), 
                                radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
                backgroundSize: '100px 100px'
              }}></div>
            </div>
            
            <div className="relative flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-8">
              
              {/* Profile Image with Enhanced Design */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={provider.garagename}
                    className="relative w-36 h-36 rounded-full border-4 border-white/80 shadow-2xl object-cover transform group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="relative w-36 h-36 rounded-full border-4 border-white/80 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-2xl">
                    <span className="text-5xl text-white font-bold">
                      {provider.garagename?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  </div>
                )}
                {/* Online Status Indicator */}
                <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-400 border-3 border-white rounded-full shadow-lg"></div>
              </div>
              
              {/* Profile Info */}
              <div className="text-center lg:text-left flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">{provider.garagename}</h1>
                  <p className="text-blue-100 text-xl font-medium">Owner: {provider.ownername}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2">
                    <svg className="w-6 h-6 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span className="text-white font-medium">{provider.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2">
                    <svg className="w-6 h-6 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    <span className="text-white font-medium">{provider.phoneno}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Details Section */}
          <div className="p-8 lg:p-12">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              
              {/* Contact Information Card */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">Contact Information</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-2">Garage Address</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{provider.garageaddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-2">Specializations</h3>
                      <p className="text-gray-600 text-lg">{provider.specializations || "General Automotive Services"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Section Card */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">Available Services</h2>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                  {provider.availableservices ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {provider.availableservices.split(',').map((service, index) => (
                        <div key={index} className="flex items-center space-x-3 group">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transform group-hover:scale-125 transition-transform duration-200"></div>
                          <span className="text-gray-700 text-lg font-medium group-hover:text-gray-900 transition-colors duration-200">
                            {service.trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-lg">No specific services listed</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mt-12 pt-8 border-t border-gray-200">
              <button
                onClick={() => navigate("/provider/Dashboard")}
                className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-10 py-4 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 min-w-[200px]"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Dashboard</span>
                </span>
              </button>
              
              <button
                onClick={() => navigate("/provider/edit-profile")}
                className="group relative border-2 border-gray-300 text-gray-700 px-10 py-4 rounded-2xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 font-bold text-lg shadow-sm hover:shadow-md transform hover:-translate-y-1 min-w-[200px]"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Profile</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Additional Stats Card (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
            <div className="text-gray-600 font-medium">Rating</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
            <div className="text-gray-600 font-medium">Services Done</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <div className="text-gray-600 font-medium">Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
}