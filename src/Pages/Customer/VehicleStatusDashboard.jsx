import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle, Clock, Car, Video, Wrench, Shield, MapPin,
  Phone, MessageCircle, Calendar, Star, History, Play, Pause,
  AlertCircle, X, Bug, RefreshCw
} from "lucide-react";
import axios from "axios";

export default function VehicleServiceDashboard() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [loading, setLoading] = useState(true);
  const [activeStreams, setActiveStreams] = useState([]);
  const [currentStream, setCurrentStream] = useState(null);
  const [streamStatus, setStreamStatus] = useState({});
  const [streamError, setStreamError] = useState("");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  
  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  
  // WebRTC Refs
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const iceCandidateIntervalRef = useRef(null);

  // Debug logging function
  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = { timestamp, message, data };
    setDebugLogs(prev => [log, ...prev.slice(0, 49)]);
    console.log(`🔧 [Customer - ${timestamp}] ${message}`, data);
  };

  // Enhanced API call with error handling
  const apiCall = async (url, options = {}) => {
    try {
      addDebugLog(`API Call: ${url}`, options);
      const response = await axios({
        url,
        timeout: 15000,
        ...options
      });
      addDebugLog(`API Success: ${url}`, response.data);
      return { data: response.data, error: null };
    } catch (error) {
      addDebugLog(`API Error: ${url}`, error.message);
      console.warn(`API call failed for ${url}:`, error.message);
      return { data: null, error };
    }
  };

  // Fetch services for customer
  const fetchServices = async () => {
    try {
      if (!username) {
        setLoading(false);
        return;
      }

      addDebugLog(`🚀 Fetching services for customer: ${username}`);
      const { data, error } = await apiCall(`http://localhost:8080/api/services/${username}`);
      
      if (error) {
        throw new Error("No services found");
      }

      const servicesData = Array.isArray(data) ? data : (data ? [data] : []);
      setServices(servicesData);
      addDebugLog(`✅ Found ${servicesData.length} services`, servicesData.map(s => ({ id: s.id, status: s.status })));
      
    } catch (err) {
      console.error(err);
      setServices([]);
      addDebugLog("❌ Error fetching services", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch active streams for customer
  const fetchActiveStreams = async () => {
    try {
      if (!username) return;
      
      addDebugLog(`🔍 Checking for active streams for customer: ${username}`);
      
      const { data, error } = await apiCall(`http://localhost:8080/api/video/customer/${username}/active`);
      
      addDebugLog(`Active streams API response:`, { 
        success: data?.success, 
        count: data?.count,
        streams: data?.streams,
        error: error 
      });
      
      if (!error && data?.success) {
        const streams = data.streams || [];
        setActiveStreams(streams);
        setStreamError("");
        
        // Update stream status for each active stream
        const statusMap = {};
        streams.forEach(stream => {
          statusMap[stream.appointmentId] = stream.status;
        });
        setStreamStatus(statusMap);
        
        addDebugLog("✅ Active streams updated", {
          count: streams.length,
          streams: streams.map(s => ({
            id: s.appointmentId,
            status: s.status,
            provider: s.providerName,
            streamId: s.streamId
          }))
        });

        // If there are active streams but we're not connected, log it
        if (streams.length > 0 && !currentStream) {
          addDebugLog(`🎯 Found ${streams.length} active stream(s) but no current connection`);
          streams.forEach(stream => {
            addDebugLog(`Available stream: Appointment #${stream.appointmentId} - ${stream.providerName} - ${stream.status}`);
          });
        }
      } else {
        setActiveStreams([]);
        if (data?.message) {
          setStreamError(data.message);
          addDebugLog("No active streams found", data.message);
        } else {
          addDebugLog("No active streams available");
        }
      }
    } catch (error) {
      console.error('Error fetching active streams:', error);
      setActiveStreams([]);
      setStreamError("Unable to fetch stream information");
      addDebugLog("❌ Error fetching active streams", error);
    }
  };

  // FIXED: Customer handles WebRTC answer instead of creating offer
  const handleWebRTCAnswer = async (appointmentId) => {
    try {
      addDebugLog(`🎬 Handling WebRTC answer for appointment ${appointmentId}`);
      
      // Check for offer from provider
      const { data: offerData, error: offerError } = await apiCall(
        `http://localhost:8080/api/video/webrtc/offer/${appointmentId}`
      );

      addDebugLog(`📨 Offer response`, { 
        success: offerData?.success, 
        hasOffer: !!offerData?.offer 
      });

      if (offerError || !offerData?.success || !offerData.offer) {
        addDebugLog(`❌ No offer found from provider`);
        return false;
      }

      const offer = JSON.parse(offerData.offer);
      addDebugLog(`✅ Received offer from provider`, { type: offer.type });

      // Create peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      });

      // Set up event handlers
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          addDebugLog(`❄️ Generated ICE candidate`);
          apiCall(`http://localhost:8080/api/video/webrtc/ice-candidate/${appointmentId}`, {
            method: 'POST',
            data: {
              candidate: JSON.stringify(event.candidate),
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              type: 'customer'
            }
          });
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        addDebugLog(`📹 Received remote track from provider`, {
          trackKind: event.track.kind,
          streamId: event.streams[0]?.id
        });
        
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setIsVideoPlaying(true);
          setConnectionStatus("connected");
          addDebugLog(`✅ Video stream attached and playing`);
        }
      };

      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current.connectionState;
        setConnectionStatus(state);
        addDebugLog(`🔗 Connection state: ${state}`);
      };

      peerConnectionRef.current.oniceconnectionstatechange = () => {
        const state = peerConnectionRef.current.iceConnectionState;
        addDebugLog(`❄️ ICE connection state: ${state}`);
        
        if (state === 'connected') {
          addDebugLog("✅ WebRTC connected successfully");
        } else if (state === 'failed') {
          addDebugLog("❌ WebRTC connection failed");
          setStreamError("WebRTC connection failed. Please try again.");
        }
      };

      // Set remote description and create answer
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      addDebugLog(`✅ Remote description set`);

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      addDebugLog(`✅ Created local answer`);

      // Send answer to server
      const { error: answerError } = await apiCall(
        `http://localhost:8080/api/video/webrtc/answer/${appointmentId}`,
        {
          method: 'POST',
          data: { 
            answer: JSON.stringify(answer),
            customerName: username
          }
        }
      );

      if (!answerError) {
        addDebugLog(`✅ Answer sent to provider successfully`);
        
        // Start ICE candidate exchange
        startProviderICECandidateCheck(appointmentId);
        return true;
      } else {
        throw new Error('Failed to send WebRTC answer');
      }

    } catch (error) {
      console.error('Error handling WebRTC answer:', error);
      addDebugLog(`❌ Error handling answer`, error);
      return false;
    }
  };

  const startProviderICECandidateCheck = (appointmentId) => {
    if (iceCandidateIntervalRef.current) {
      clearInterval(iceCandidateIntervalRef.current);
    }

    iceCandidateIntervalRef.current = setInterval(async () => {
      try {
        const { data, error } = await apiCall(
          `http://localhost:8080/api/video/webrtc/ice-candidates/${appointmentId}?type=provider`
        );
        
        if (!error && data?.success) {
          const candidates = data.candidates || [];
          if (candidates.length > 0) {
            addDebugLog(`✅ Found ${candidates.length} provider ICE candidates`);
          }
          
          for (const candidateData of candidates) {
            try {
              const candidate = JSON.parse(candidateData.candidate);
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
              addDebugLog("✅ Added provider ICE candidate");
            } catch (e) {
              console.error('Error adding ICE candidate:', e);
              addDebugLog("❌ Error adding ICE candidate", e);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching ICE candidates:', error);
        addDebugLog("❌ Error fetching ICE candidates", error);
      }
    }, 2000);
  };

  // Enhanced Live View Request Function
  const handleRequestLiveView = async (appointmentId) => {
    try {
      setConnectionStatus("connecting");
      setStreamError("");
      addDebugLog(`🎯 Requesting live view for appointment ${appointmentId}`);

      // Get stream details
      const { data: streamData, error: streamError } = await apiCall(
        `http://localhost:8080/api/video/stream/${appointmentId}`
      );

      addDebugLog("Stream details response", { 
        success: streamData?.success, 
        stream: streamData?.stream,
        error: streamError 
      });

      if (streamError || !streamData?.success) {
        // Try alternative approach - check if stream exists in active streams
        const activeStream = activeStreams.find(stream => stream.appointmentId === appointmentId);
        
        if (activeStream) {
          addDebugLog(`✅ Found stream in active streams list:`, activeStream);
          setCurrentStream(activeStream);
          setShowVideoModal(true);
          
          // FIXED: Customer waits for and handles offer from provider
          await handleWebRTCAnswer(appointmentId);
          return;
        }
        
        // Try one more endpoint for stream information
        addDebugLog(`🔄 Trying alternative stream endpoint for appointment ${appointmentId}`);
        const { data: altStreamData } = await apiCall(`http://localhost:8080/api/video/appointment/${appointmentId}`);
        
        if (altStreamData?.success && altStreamData.stream) {
          addDebugLog(`✅ Found stream via alternative endpoint:`, altStreamData.stream);
          setCurrentStream(altStreamData.stream);
          setShowVideoModal(true);
          
          await handleWebRTCAnswer(appointmentId);
          return;
        }
        
        const errorMsg = "No active stream found for this service. Please ask the provider to start the video stream.";
        setStreamError(errorMsg);
        addDebugLog("❌ " + errorMsg);
        return;
      }

      const stream = streamData.stream;
      addDebugLog("✅ Stream found, setting up WebRTC", {
        appointmentId: stream.appointmentId,
        provider: stream.providerName,
        status: stream.status
      });

      setCurrentStream(stream);
      setShowVideoModal(true);

      // Request minimal media access for the customer (viewer)
      try {
        addDebugLog("🎤 Requesting media access for customer");
        const userStream = await navigator.mediaDevices.getUserMedia({ 
          video: false, // Customer doesn't need to send video
          audio: false  // Customer doesn't need to send audio
        });
        userStream.getTracks().forEach(track => track.stop());
        addDebugLog("✅ Media access handled");
      } catch (mediaError) {
        addDebugLog("ℹ️ Media access not required for viewing", mediaError);
      }

      await handleWebRTCAnswer(appointmentId);

      // Auto stop after 30 minutes
      setTimeout(() => {
        addDebugLog("⏰ Auto-stopping live view after 30 minutes");
        handleStopLiveView();
      }, 30 * 60 * 1000);
      
    } catch (error) {
      console.error('Error joining live stream:', error);
      const errorMsg = 'Unable to connect to live stream. Please try again.';
      setStreamError(errorMsg);
      setConnectionStatus("failed");
      addDebugLog("❌ Error joining live stream", error);
    }
  };

  const handleStopLiveView = () => {
    addDebugLog("🛑 Stopping live view");
    cleanupWebRTC();
    setCurrentStream(null);
    setShowVideoModal(false);
    setIsVideoPlaying(false);
    setConnectionStatus("disconnected");
    setStreamError("");
  };

  const cleanupWebRTC = () => {
    addDebugLog("🧹 Cleaning up WebRTC resources");
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (iceCandidateIntervalRef.current) {
      clearInterval(iceCandidateIntervalRef.current);
      iceCandidateIntervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsVideoPlaying(!isVideoPlaying);
      addDebugLog(`🎥 Video playback ${isVideoPlaying ? 'paused' : 'played'}`);
    }
  };

  useEffect(() => {
    if (!username) return;

    const loadData = async () => {
      await fetchServices();
      await fetchActiveStreams();
      
      // Check if any services are in-progress and might have streams
      const inProgressServices = services.filter(service => service.status === "in-progress");
      if (inProgressServices.length > 0) {
        addDebugLog(`🔍 Found ${inProgressServices.length} in-progress services, checking for streams...`);
        inProgressServices.forEach(service => {
          addDebugLog(`Service ${service.id} (${service.vehicleModel}) is in-progress`);
        });
      }
    };

    loadData();

    // Set up interval to check for active streams - reduced to 5 seconds for faster detection
    streamIntervalRef.current = setInterval(fetchActiveStreams, 5000);
    
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
      if (iceCandidateIntervalRef.current) {
        clearInterval(iceCandidateIntervalRef.current);
      }
      cleanupWebRTC();
    };
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

  const handleScheduleService = () => {
    navigate("/bookappointment");
  };

  const handleRateService = () => {
    navigate("/feedback");
  };

  // Check if service has active stream
  const hasActiveStream = (serviceId) => {
    return activeStreams.some(stream => stream.appointmentId === serviceId);
  };

  const getStreamStatus = (serviceId) => {
    return streamStatus[serviceId] || 'inactive';
  };

  // Debug Panel Component
  const DebugPanel = () => {
    if (!showDebug) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg max-w-md max-h-64 overflow-y-auto text-xs z-50">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold">Customer Debug Logs</h4>
          <button 
            onClick={() => setDebugLogs([])}
            className="text-xs bg-red-600 px-2 py-1 rounded"
          >
            Clear
          </button>
        </div>
        {debugLogs.map((log, index) => (
          <div key={index} className="border-b border-gray-700 py-1">
            <div className="text-green-400">[{log.timestamp}] {log.message}</div>
            {log.data && (
              <div className="text-gray-400 text-xs truncate">
                {JSON.stringify(log.data)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Debug Button Component
  const DebugButton = () => (
    <button
      onClick={() => setShowDebug(!showDebug)}
      className={`px-3 py-2 rounded-lg flex items-center space-x-2 ${
        showDebug ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
      }`}
    >
      <Bug className="w-4 h-4" />
      <span>Debug {showDebug ? 'ON' : 'OFF'}</span>
    </button>
  );

  // Video Modal Component with WebRTC
  const VideoStreamModal = () => {
    if (!showVideoModal || !currentStream) return null;

    const getConnectionStatusColor = () => {
      switch (connectionStatus) {
        case "connected": return "bg-green-500";
        case "connecting": return "bg-yellow-500";
        case "failed": return "bg-red-500";
        default: return "bg-gray-500";
      }
    };

    const getConnectionStatusText = () => {
      switch (connectionStatus) {
        case "connected": return "Connected";
        case "connecting": return "Connecting...";
        case "failed": return "Connection Failed";
        default: return "Disconnected";
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Video className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Live Service Stream - Appointment #{currentStream.appointmentId}
                </h3>
                <p className="text-sm text-gray-400">
                  Provider: {currentStream.providerName} • Vehicle Service
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DebugButton />
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()} animate-pulse`}></div>
                <span className="text-sm text-white font-medium">
                  {getConnectionStatusText()}
                </span>
              </div>
              <button onClick={handleStopLiveView} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-black relative">
              {isVideoPlaying ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg">Establishing connection...</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Connecting to service provider's video feed
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Appointment #{currentStream.appointmentId} • {currentStream.providerName}
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
                  onClick={handleStopLiveView}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop Watching
                </button>
              </div>

              {isVideoPlaying && (
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                    LIVE
                  </span>
                </div>
              )}
            </div>

            {/* Stream Information */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-2 bg-gray-700 rounded">
                  <p className="font-medium text-gray-300">Appointment ID</p>
                  <p className="text-white">#{currentStream.appointmentId}</p>
                </div>
                <div className="text-center p-2 bg-gray-700 rounded">
                  <p className="font-medium text-gray-300">Provider</p>
                  <p className="text-white">{currentStream.providerName}</p>
                </div>
                <div className="text-center p-2 bg-gray-700 rounded">
                  <p className="font-medium text-gray-300">Status</p>
                  <p className="text-white capitalize">{currentStream.status}</p>
                </div>
                <div className="text-center p-2 bg-gray-700 rounded">
                  <p className="font-medium text-gray-300">Connection</p>
                  <p className="text-white capitalize">{connectionStatus}</p>
                </div>
              </div>

              {/* WebRTC Status Notice */}
              <div className="mt-4 p-3 bg-blue-900 border border-blue-700 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Video className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-200 font-medium">WebRTC Live Stream</p>
                    <p className="text-xs text-blue-300">
                      Real-time video feed from your service provider using WebRTC technology
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
            <DebugButton />
            <button
              onClick={fetchActiveStreams}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Streams</span>
            </button>
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
                <p className="text-sm text-gray-600">Live Streams</p>
                <p className="text-2xl font-bold text-gray-900">{activeStreams.length}</p>
              </div>
              <Video className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Stream Error Message */}
        {streamError && (
          <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>{streamError}</span>
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
                            {service.description || "Vehicle maintenance service"}
                          </p>
                          
                          {/* Enhanced Live Stream Indicator */}
                          {hasActiveStream(service.id) && (
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-red-600 font-medium">
                                🔴 LIVE STREAM AVAILABLE • {getStreamStatus(service.id).toUpperCase()}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addDebugLog(`🎯 User clicked Join Live for service ${service.id}`);
                                  handleRequestLiveView(service.id);
                                }}
                                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 ml-2"
                              >
                                Join Now
                              </button>
                            </div>
                          )}
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

                    {/* Live Stream Button for In-Progress Services */}
                    {service.status === "in-progress" && hasActiveStream(service.id) && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addDebugLog(`🎯 User clicked Join Live Service Stream for service ${service.id}`);
                            handleRequestLiveView(service.id);
                          }}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Live Service Stream</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
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
                  {currentStream && (
                    <span className="text-sm text-red-600 font-medium flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                      LIVE
                    </span>
                  )}
                </div>

                <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[120px] flex items-center justify-center">
                  {currentStream ? (
                    <div className="text-center w-full">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg aspect-video flex items-center justify-center mb-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div className="text-white text-center relative z-10">
                          <div className="animate-pulse bg-red-500 rounded-full w-4 h-4 mx-auto mb-2"></div>
                          <p className="text-sm">Connected to Live Feed</p>
                          <p className="text-xs text-gray-200">Watching your vehicle service</p>
                        </div>
                      </div>
                      <button
                        onClick={handleStopLiveView}
                        className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 mx-auto"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Stop Watching</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Live feed will appear here when activated</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Available for in-progress services with active streams
                      </p>
                      {activeStreams.length === 0 && (
                        <button
                          onClick={fetchActiveStreams}
                          className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Check for Streams
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Active Streams List */}
                {activeStreams.length > 0 && !currentStream && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Available Streams:</h4>
                    <div className="space-y-2">
                      {activeStreams.map(stream => (
                        <div key={stream.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div>
                            <p className="text-sm font-medium">Appointment #{stream.appointmentId}</p>
                            <p className="text-xs text-gray-600">{stream.providerName}</p>
                            <p className="text-xs text-gray-500 capitalize">Status: {stream.status}</p>
                          </div>
                          <button
                            onClick={() => {
                              addDebugLog(`🎯 User clicked Watch for stream ${stream.appointmentId}`);
                              handleRequestLiveView(stream.appointmentId);
                            }}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          >
                            Watch
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* Video Stream Modal */}
      <VideoStreamModal />

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
}