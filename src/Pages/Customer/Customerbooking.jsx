import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { 
  Video, Play, Pause, RefreshCw, CheckCircle, Clock, XCircle, 
  CreditCard, Calendar, Car, IndianRupee, Plus, 
  Minus, FileText, ShoppingCart, AlertCircle, X, Bug,
  Youtube
} from "lucide-react";

export default function CustomerBooking() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ownername, setOwnername] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [videoStreams, setVideoStreams] = useState({});
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [billingServices, setBillingServices] = useState([]);
  const [streamStatus, setStreamStatus] = useState({});
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const [youtubeLinks, setYoutubeLinks] = useState({});
  const [billingInfo, setBillingInfo] = useState({}); // Store billing details

  const syncTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const availableServices = [
    { id: 1, name: "Oil Change", price: 1500, category: "Maintenance" },
    { id: 2, name: "Tire Rotation", price: 1200, category: "Maintenance" },
    { id: 3, name: "Brake Service", price: 3500, category: "Repair" },
    { id: 4, name: "Engine Diagnostic", price: 2500, category: "Diagnostic" },
    { id: 5, name: "General Maintenance", price: 1800, category: "Maintenance" },
    { id: 6, name: "AC Service", price: 2000, category: "Comfort" },
    { id: 7, name: "Battery Replacement", price: 4000, category: "Electrical" },
    { id: 8, name: "Wheel Alignment", price: 2200, category: "Suspension" }
  ];

  // Debug logging function
  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = { timestamp, message, data };
    setDebugLogs(prev => [log, ...prev.slice(0, 49)]);
    console.log(`🔧 [Provider - ${timestamp}] ${message}`, data);
  };

  // Enhanced API call with error handling
  const apiCall = async (url, options = {}) => {
    try {
      addDebugLog(`API Call: ${url}`, options);
      const response = await axios({
        url,
        timeout: 10000,
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

  // Get billing details for an appointment
  const getBillingDetails = async (appointmentId) => {
    try {
      const { data } = await apiCall(`http://localhost:8080/api/billing/appointment/${appointmentId}`);
      if (data && data.length > 0) {
        // Sort by ID to get latest
        const sortedBills = data.sort((a, b) => b.id - a.id);
        const latestBill = sortedBills[0];
        
        return {
          exists: true,
          billingId: latestBill.id,
          totalAmount: latestBill.totalAmount,
          servicesTotal: latestBill.servicesTotal,
          serviceCharge: latestBill.serviceCharge,
          isPaid: latestBill.paymentStatus === 'paid',
          paymentMethod: latestBill.paymentMethod,
          billingDate: latestBill.date || latestBill.createdAt
        };
      }
      return { exists: false };
    } catch (error) {
      console.error('Error fetching billing details:', error);
      return { exists: false };
    }
  };

  // YouTube Video Functions
  const startVideoService = async (appointmentId) => {
    try {
      addDebugLog(`Starting video service for appointment ${appointmentId}`);
      
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) {
        addDebugLog(`Appointment ${appointmentId} not found`);
        return;
      }

      const youtubeLink = `https://www.youtube.com/embed/o-_bW1lGafM?autoplay=1`;
      
      setVideoStreams(prev => ({
        ...prev,
        [appointmentId]: {
          isActive: true,
          isPlaying: true,
          youtubeLink: youtubeLink,
          timestamp: new Date().toLocaleTimeString(),
          showModal: true
        }
      }));

      setStreamStatus(prev => ({
        ...prev,
        [appointmentId]: 'active'
      }));

      setActiveVideoModal(appointmentId);

      setYoutubeLinks(prev => ({
        ...prev,
        [appointmentId]: youtubeLink
      }));

      await apiCall(`http://localhost:8080/api/video/start/${appointmentId}`, {
        method: 'POST',
        data: {
          providerName: ownername,
          customerName: appointment.name,
          appointmentId: appointmentId,
          youtubeLink: youtubeLink,
          type: 'youtube'
        }
      });

      addDebugLog(`YouTube video service started for ${appointmentId}`, { youtubeLink });

    } catch (error) {
      console.error('Error starting video service:', error);
      addDebugLog(`Error starting video service for ${appointmentId}`, error);
      alert(`Failed to start video service: ${error.message}`);
    }
  };

  const stopVideoService = async (appointmentId) => {
    try {
      addDebugLog(`Stopping video service for ${appointmentId}`);
      
      await apiCall(`http://localhost:8080/api/video/stop/${appointmentId}`, {
        method: 'POST'
      });

      setVideoStreams(prev => ({
        ...prev,
        [appointmentId]: {
          ...prev[appointmentId],
          isActive: false,
          isPlaying: false,
          showModal: false
        }
      }));

      setStreamStatus(prev => ({
        ...prev,
        [appointmentId]: 'inactive'
      }));

      setActiveVideoModal(null);
      
      addDebugLog(`Video service stopped for ${appointmentId}`);
    } catch (error) {
      console.error('Error stopping video service:', error);
      addDebugLog(`Error stopping video service for ${appointmentId}`, error);
    }
  };

  const toggleVideoPlayback = async (appointmentId) => {
    const currentStream = videoStreams[appointmentId];
    
    try {
      if (currentStream?.isPlaying) {
        setVideoStreams(prev => ({
          ...prev,
          [appointmentId]: {
            ...prev[appointmentId],
            isPlaying: false
          }
        }));
        setStreamStatus(prev => ({
          ...prev,
          [appointmentId]: 'paused'
        }));
        addDebugLog(`Video paused for ${appointmentId}`);
      } else {
        setVideoStreams(prev => ({
          ...prev,
          [appointmentId]: {
            ...prev[appointmentId],
            isPlaying: true
          }
        }));
        setStreamStatus(prev => ({
          ...prev,
          [appointmentId]: 'active'
        }));
        addDebugLog(`Video played for ${appointmentId}`);
      }
    } catch (error) {
      console.error('Error toggling video playback:', error);
      addDebugLog(`Error toggling video for ${appointmentId}`, error);
    }
  };

  const checkVideoStatus = async (appointmentId) => {
    const { data, error } = await apiCall(`http://localhost:8080/api/video/stream/${appointmentId}`);
    
    if (!error && data?.success && data.stream) {
      const stream = data.stream;
      setStreamStatus(prev => ({
        ...prev,
        [appointmentId]: stream.status
      }));

      if (stream.status === 'active' || stream.status === 'paused') {
        setVideoStreams(prev => ({
          ...prev,
          [appointmentId]: {
            isActive: true,
            isPlaying: stream.status === 'active',
            youtubeLink: stream.youtubeLink,
            timestamp: new Date(stream.startedAt).toLocaleTimeString()
          }
        }));
        
        if (stream.youtubeLink) {
          setYoutubeLinks(prev => ({
            ...prev,
            [appointmentId]: stream.youtubeLink
          }));
        }
      }
      addDebugLog(`Video status checked for ${appointmentId}`, stream.status);
    } else {
      setStreamStatus(prev => ({
        ...prev,
        [appointmentId]: 'inactive'
      }));
      addDebugLog(`No active video found for ${appointmentId}`);
    }
  };

  // Fetch and update payment statuses
  const syncPaymentStatuses = async (appointmentsData) => {
    if (syncInProgress) return;
    
    try {
      setSyncInProgress(true);
      addDebugLog("Starting payment status synchronization...");
      
      const paymentStatusMap = {};
      const billingInfoMap = {};

      for (const appointment of appointmentsData) {
        try {
          const billingDetails = await getBillingDetails(appointment.id);
          
          if (billingDetails.exists) {
            billingInfoMap[appointment.id] = billingDetails;
            
            if (billingDetails.isPaid) {
              paymentStatusMap[appointment.id] = 'paid';
            } else {
              paymentStatusMap[appointment.id] = 'pending';
            }
          } else {
            paymentStatusMap[appointment.id] = 'no-billing';
          }

        } catch (error) {
          console.warn(`Error checking payment for appointment ${appointment.id}:`, error.message);
          paymentStatusMap[appointment.id] = 'no-billing';
        }
      }

      addDebugLog("Payment status mapping:", paymentStatusMap);
      addDebugLog("Billing info mapping:", billingInfoMap);
      
      setPaymentStatuses(paymentStatusMap);
      setBillingInfo(billingInfoMap);

    } catch (error) {
      console.error("Error in payment sync:", error);
      addDebugLog("Error in payment sync:", error);
      const paymentStatusMap = {};
      appointmentsData.forEach(appointment => {
        paymentStatusMap[appointment.id] = 'no-billing';
      });
      setPaymentStatuses(paymentStatusMap);
    } finally {
      setSyncInProgress(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      if (!ownername) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      addDebugLog("Fetching appointments for:", ownername);
      const { data, error: fetchError } = await apiCall(
        `http://localhost:8080/appointment/owner/${ownername}`
      );

      if (fetchError) {
        throw new Error("Unable to load booking data from backend.");
      }

      let appointmentsData = Array.isArray(data) ? data : (data ? [data] : []);
      addDebugLog("Appointments data received:", appointmentsData);
      setAppointments(appointmentsData);
      
      await syncPaymentStatuses(appointmentsData);
      
      const inProgressAppointments = appointmentsData.filter(apt => apt.status === 'in-progress');
      for (const appointment of inProgressAppointments) {
        await checkVideoStatus(appointment.id);
      }
      
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Unable to load booking data from backend.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedOwnername = localStorage.getItem("providerOwnername");
    if (storedOwnername) {
      setOwnername(storedOwnername);
      addDebugLog("Provider name set from localStorage:", storedOwnername);
    }
  }, []);

  useEffect(() => {
    if (ownername) {
      addDebugLog("Initial data fetch for:", ownername);
      fetchAppointments();
      
      const interval = setInterval(() => {
        if (appointments.length > 0 && !syncInProgress) {
          addDebugLog("Periodic payment sync running...");
          syncPaymentStatuses(appointments);
        }
      }, 30000);
      
      return () => {
        clearInterval(interval);
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
      };
    }
  }, [ownername, appointments.length]);

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: true }));
      
      addDebugLog(`Updating appointment ${appointmentId} to status: ${newStatus}`);
      const { data, error: updateError } = await apiCall(
        `http://localhost:8080/appointment/${appointmentId}/status`,
        {
          method: 'PATCH',
          data: { status: newStatus },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!updateError) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus }
              : apt
          )
        );
        
        if (newStatus === "in-progress") {
          setTimeout(() => {
            startVideoService(appointmentId);
          }, 2000);
        }
        
        if (newStatus === "completed") {
          setTimeout(() => {
            stopVideoService(appointmentId);
          }, 1000);
          
          addDebugLog(`Appointment ${appointmentId} completed. Billing must be created manually.`);
        }

      } else {
        throw new Error("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  const openBillingModal = async (appointment) => {
    setSelectedAppointment(appointment);
    setBillingServices([]);
    
    // Check if billing already exists
    const existingBilling = billingInfo[appointment.id];
    
    if (existingBilling && existingBilling.exists) {
      if (existingBilling.isPaid) {
        alert(`This appointment already has a paid bill of ${formatCurrency(existingBilling.totalAmount)}.`);
        return;
      }
      
      if (existingBilling.totalAmount > 0) {
        const shouldEdit = window.confirm(
          `A billing record exists with amount ${formatCurrency(existingBilling.totalAmount)}.\nDo you want to edit it?`
        );
        
        if (shouldEdit) {
          navigateToBillingPage(appointment.id, existingBilling.billingId);
          return;
        } else {
          return;
        }
      }
    }
    
    setShowBillingModal(true);
  };

  const closeBillingModal = () => {
    setShowBillingModal(false);
    setSelectedAppointment(null);
    setBillingServices([]);
  };

  const addServiceToBilling = (service) => {
    const existingService = billingServices.find(s => s.id === service.id);
    
    if (existingService) {
      setBillingServices(prev => prev.map(s => 
        s.id === service.id 
          ? { ...s, quantity: s.quantity + 1, total: s.price * (s.quantity + 1) }
          : s
      ));
    } else {
      setBillingServices(prev => [...prev, {
        ...service,
        quantity: 1,
        total: service.price
      }]);
    }
  };

  const removeServiceFromBilling = (serviceId) => {
    setBillingServices(prev => prev.filter(service => service.id !== serviceId));
  };

  const updateServiceQuantity = (serviceId, newQuantity) => {
    if (newQuantity < 1) {
      removeServiceFromBilling(serviceId);
      return;
    }
    
    setBillingServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { 
            ...service, 
            quantity: newQuantity, 
            total: service.price * newQuantity 
          }
        : service
    ));
  };

  const calculateTotalAmount = () => {
    const servicesTotal = billingServices.reduce((total, service) => total + service.total, 0);
    const serviceCharge = servicesTotal > 0 ? 500 : 0;
    return servicesTotal + serviceCharge;
  };

  const navigateToBillingPage = (appointmentId, existingBillingId = null) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      navigate(`/provider/bookings`, { 
        state: { 
          appointment,
          existingBillingId: existingBillingId || billingInfo[appointmentId]?.billingId
        } 
      });
    }
  };

  const navigateToCustomerPayment = (appointmentId) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      navigate(`/payment`, { 
        state: { 
          appointmentId,
          vehicleName: appointment.vehicleName,
          vehicleNumber: appointment.vehicleNumber
        } 
      });
    }
  };

  const generateInvoiceSummary = () => {
    const servicesTotal = billingServices.reduce((total, service) => total + service.total, 0);
    const serviceCharge = 500;
    const total = servicesTotal + serviceCharge;
    
    let summary = "📋 INVOICE SUMMARY\n\n";
    summary += "Services:\n";
    
    billingServices.forEach(service => {
      summary += `• ${service.name} - ${service.quantity} × ${formatCurrency(service.price)} = ${formatCurrency(service.total)}\n`;
    });
    
    summary += "\n────────────────────\n";
    summary += `Services Total: ${formatCurrency(servicesTotal)}\n`;
    summary += `Service Charge: ${formatCurrency(serviceCharge)}\n`;
    summary += `Total Amount: ${formatCurrency(total)}\n`;
    
    return summary;
  };

  const createManualBilling = async () => {
    if (!selectedAppointment || billingServices.length === 0) {
      alert("Please add at least one service to create billing.");
      return;
    }

    try {
      const servicesTotal = billingServices.reduce((total, service) => total + service.total, 0);
      const serviceCharge = 500; // Fixed service charge
      const totalAmount = servicesTotal + serviceCharge;
      
      const billingData = {
        appointmentId: selectedAppointment.id,
        userId: selectedAppointment.userId || 1,
        vehicleName: selectedAppointment.vehicleName,
        vehicleNumber: selectedAppointment.vehicleNumber,
        date: selectedAppointment.date,
        time: selectedAppointment.time,
        servicesTotal: servicesTotal,
        serviceCharge: serviceCharge,
        totalAmount: totalAmount,
        paymentStatus: 'pending',
        providerName: ownername,
        providerId: selectedAppointment.providerId || 1,
        services: billingServices.map(service => ({
          serviceName: service.name,
          providerName: ownername,
          price: service.price,
          quantity: service.quantity,
          subtotal: service.total
        }))
      };

      const { data, error: billingError } = await apiCall(
        'http://localhost:8080/api/billing/create',
        {
          method: 'POST',
          data: billingData,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!billingError) {
        closeBillingModal();
        
        // Update billing info locally
        setBillingInfo(prev => ({
          ...prev,
          [selectedAppointment.id]: {
            exists: true,
            billingId: data.id,
            totalAmount: totalAmount,
            servicesTotal: servicesTotal,
            serviceCharge: serviceCharge,
            isPaid: false,
            paymentMethod: null,
            billingDate: new Date().toISOString()
          }
        }));
        
        // Update payment status
        setPaymentStatuses(prev => ({
          ...prev,
          [selectedAppointment.id]: 'pending'
        }));
        
        alert(`✅ Billing created successfully!\n\n${generateInvoiceSummary()}`);
        
        // Navigate to billing page for editing
        navigateToBillingPage(selectedAppointment.id, data.id);
      } else {
        throw new Error('Failed to create billing');
      }
      
    } catch (error) {
      console.error('Error creating manual billing:', error);
      alert('❌ Error creating billing. Please try again.');
    }
  };

  const handleBillingAction = (appointment) => {
    const paymentStatus = paymentStatuses[appointment.id];
    const billingDetails = billingInfo[appointment.id];
    
    if (paymentStatus === 'paid') {
      // View paid bill
      navigateToCustomerPayment(appointment.id);
    } else if (paymentStatus === 'pending') {
      // View/Edit existing bill
      navigateToBillingPage(appointment.id, billingDetails?.billingId);
    } else {
      // Create new bill
      openBillingModal(appointment);
    }
  };

  const refreshAllData = async () => {
    addDebugLog("Manual refresh triggered");
    await fetchAppointments();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Debug Panel Component
  const DebugPanel = () => {
    if (!showDebug) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg max-w-md max-h-64 overflow-y-auto text-xs z-50">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold">Provider Debug Logs</h4>
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
      
  
     
    >
      
     
    </button>
  );

  // YouTube Video Modal Component
  const YouTubeVideoModal = ({ appointmentId, onClose }) => {
    const stream = videoStreams[appointmentId];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              Service Video - Appointment #{appointmentId}
            </h3>
            <div className="flex items-center space-x-2">
              <DebugButton />
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative">
              {stream?.isPlaying && stream?.youtubeLink ? (
                <iframe
                  src={stream.youtubeLink}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Service Video - Appointment ${appointmentId}`}
                />
              ) : (
                <div className="text-center text-white">
                  <Youtube className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Video Paused</p>
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  stream?.isPlaying ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                }`}></div>
                <span className="text-white text-sm font-medium">
                  {stream?.isPlaying ? 'PLAYING' : 'PAUSED'}
                </span>
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button
                  onClick={() => toggleVideoPlayback(appointmentId)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  {stream?.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{stream?.isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  onClick={() => stopVideoService(appointmentId)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Stop Video
                </button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-2 bg-gray-100 rounded">
                <p className="font-medium">Platform</p>
                <p className="text-gray-600">YouTube</p>
              </div>
              <div className="text-center p-2 bg-gray-100 rounded">
                <p className="font-medium">Started At</p>
                <p className="text-gray-600">{stream?.timestamp}</p>
              </div>
              <div className="text-center p-2 bg-gray-100 rounded">
                <p className="font-medium">Status</p>
                <p className="text-gray-600 capitalize">{streamStatus[appointmentId] || 'inactive'}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Youtube className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">YouTube Video Service</p>
                  <p className="text-sm text-blue-600">
                    This service uses YouTube for video streaming. The customer can watch the service process through the shared YouTube link.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVideoControls = (appointment) => {
    const stream = videoStreams[appointment.id];
    const status = streamStatus[appointment.id];

    if (stream?.isActive) {
      return (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => toggleVideoPlayback(appointment.id)}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              {stream.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <span className={`text-xs font-medium ${
              stream.isPlaying ? 'text-green-600' : 'text-yellow-600'
            }`}>
              ● {stream.isPlaying ? 'PLAYING' : 'PAUSED'}
            </span>
          </div>
          <button
            onClick={() => stopVideoService(appointment.id)}
            className="text-xs text-red-600 hover:text-red-800 transition-colors"
          >
            Stop
          </button>
          <button
            onClick={() => setActiveVideoModal(appointment.id)}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            View
          </button>
        </div>
      );
    } else {
      return (
        <button
          onClick={() => startVideoService(appointment.id)}
          disabled={appointment.status !== 'in-progress' || paymentStatuses[appointment.id] === 'paid'}
          className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
            appointment.status === 'in-progress' && paymentStatuses[appointment.id] !== 'paid'
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Video className="w-3 h-3" />
          <span>Start Video</span>
        </button>
      );
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'in-progress': { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      'confirmed': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'scheduled': { color: 'bg-orange-100 text-orange-800', icon: Clock },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status?.replace('-', ' ') || "Pending"}
      </span>
    );
  };

  const getPaymentStatusBadge = (appointmentId) => {
    const status = paymentStatuses[appointmentId];
    const billingDetails = billingInfo[appointmentId];
    
    const statusConfig = {
      'paid': { 
        color: 'bg-green-100 text-green-800', 
        text: billingDetails ? `Paid ${formatCurrency(billingDetails.totalAmount)}` : 'Paid', 
        icon: CheckCircle 
      },
      'pending': { 
        color: 'bg-yellow-100 text-yellow-800', 
        text: billingDetails ? `Unpaid ${formatCurrency(billingDetails.totalAmount)}` : 'Pending Payment', 
        icon: Clock 
      },
      'no-billing': { 
        color: 'bg-gray-100 text-gray-500', 
        text: 'No Bill Created', 
        icon: AlertCircle 
      }
    };

    const config = statusConfig[status] || { 
      color: 'bg-gray-100 text-gray-500', 
      text: 'No Bill', 
      icon: AlertCircle 
    };
    
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getBillingButtonText = (appointmentId) => {
    const status = paymentStatuses[appointmentId];
    
    if (status === 'paid') {
      return "View Paid Bill";
    }
    
    if (status === 'pending') {
      return "Billing Done";
    }
    
    return "Create Bill";
  };

  const renderBillingButton = (appointment) => {
    const isCompleted = appointment.status === 'completed';
    const paymentStatus = paymentStatuses[appointment.id];
    
    if (!isCompleted) return null;
    
    if (paymentStatus === 'paid') {
      return (
        <button
         
          className="flex items-center space-x-1 px-3 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
        >
          <CheckCircle className="w-3 h-3" />
          <span>Billing Done</span>
        </button>
      );
    }
    
    return (
      <button
        onClick={() => handleBillingAction(appointment)}
        className="flex items-center space-x-1 px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors"
      >
        <CreditCard className="w-3 h-3" />
        <span>{getBillingButtonText(appointment.id)}</span>
      </button>
    );
  };

  const getStatusOptions = (currentStatus) => {
    const baseOptions = [
      { value: 'pending', label: 'Pending', color: 'yellow' },
      { value: 'confirmed', label: 'Confirmed', color: 'blue' },
      { value: 'in-progress', label: 'In Progress', color: 'blue' },
      { value: 'completed', label: 'Completed', color: 'green' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' }
    ];

    return baseOptions.filter(option => option.value !== currentStatus);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-600">Loading bookings...</p>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Bookings for {ownername || "your garage"}
          </h1>
          <p className="text-gray-600 mt-2">Manage customer appointments and service videos</p>
        </div>
        <div className="flex space-x-3">
          <DebugButton />
          <button
            onClick={refreshAllData}
            disabled={syncInProgress}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncInProgress ? 'animate-spin' : ''}`} />
            <span>Refresh All</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {syncInProgress && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6 flex items-center">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          Synchronizing payment data...
        </div>
      )}

      <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium">Paid:</span>
            <span className="font-bold">{Object.values(paymentStatuses).filter(status => status === 'paid').length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="font-medium">Pending:</span>
            <span className="font-bold">{Object.values(paymentStatuses).filter(status => status === 'pending').length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            <span className="font-medium">No Bill:</span>
            <span className="font-bold">{Object.values(paymentStatuses).filter(status => status === 'no-billing').length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Video className="w-4 h-4 text-purple-600" />
            <span className="font-medium">Active Videos:</span>
            <span className="font-bold">{Object.values(videoStreams).filter(stream => stream.isActive).length}</span>
          </div>
        </div>
      </div>

      {showBillingModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Create Billing Invoice</h3>
                <button
                  onClick={closeBillingModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Appointment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Vehicle:</span>
                    <p className="font-medium">{selectedAppointment.vehicleName} ({selectedAppointment.vehicleNumber})</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <p className="font-medium">{selectedAppointment.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">{selectedAppointment.date}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <p className="font-medium">{selectedAppointment.time}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Available Services
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {availableServices.map(service => (
                      <div key={service.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-gray-500">{service.category}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-green-600">{formatCurrency(service.price)}</span>
                            <button
                              onClick={() => addServiceToBilling(service)}
                              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Selected Services ({billingServices.length})
                  </h4>
                  
                  {billingServices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No services selected</p>
                      <p className="text-sm">Add services from the left panel</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {billingServices.map(service => (
                        <div key={service.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-gray-500">{service.category}</p>
                            </div>
                            <button
                              onClick={() => removeServiceFromBilling(service.id)}
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateServiceQuantity(service.id, service.quantity - 1)}
                                className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                disabled={service.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-medium w-8 text-center">{service.quantity}</span>
                              <button
                                onClick={() => updateServiceQuantity(service.id, service.quantity + 1)}
                                className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-bold text-green-600">
                              {formatCurrency(service.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-2">Billing Summary</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Services:</span>
                            <span>{formatCurrency(billingServices.reduce((total, service) => total + service.total, 0))}</span>
                          </div>
                          {billingServices.map((service, index) => (
                            <div key={index} className="flex justify-between text-xs text-gray-600 ml-2">
                              <span>• {service.name} (x{service.quantity})</span>
                              <span>{formatCurrency(service.total)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-medium">
                            <span>Service Charge:</span>
                            <span>₹500.00</span>
                          </div>
                          <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-blue-200">
                            <span>Total Amount:</span>
                            <span className="text-green-700">{formatCurrency(calculateTotalAmount())}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={closeBillingModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createManualBilling}
                  disabled={billingServices.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Create Billing Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
          <p className="text-gray-500">When customers book appointments, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "ID",
                    "Customer",
                    "Vehicle",
                    "Service",
                    "Date & Time",
                    "Status",
                    "Payment Status",
                    "Update Status",
                    "Service Video",
                    "Actions"
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => {
                  const isPaid = paymentStatuses[appointment.id] === 'paid';
                  
                  return (
                    <tr
                      key={appointment.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        #{appointment.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.name}</div>
                        <div className="text-sm text-gray-500">{appointment.phone}</div>
                        {appointment.userUsername && (
                          <div className="text-xs text-gray-400 mt-1">
                            User: {appointment.userUsername}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.vehicleName}</div>
                        <div className="text-sm text-gray-500">{appointment.vehicleNumber}</div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {appointment.serviceType}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{appointment.date}</div>
                        <div className="text-gray-500">{appointment.time}</div>
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(appointment.status)}
                      </td>

                      <td className="px-6 py-4">
                        {getPaymentStatusBadge(appointment.id)}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value=""
                          onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value)}
                          disabled={updatingStatus[appointment.id] || isPaid}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Update Status</option>
                          {getStatusOptions(appointment.status).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {updatingStatus[appointment.id] && (
                          <div className="mt-1">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {renderVideoControls(appointment)}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'in-progress')}
                              disabled={appointment.status === 'in-progress' || updatingStatus[appointment.id] || isPaid}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                appointment.status === 'in-progress' || isPaid
                                  ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              Start Service
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              disabled={appointment.status === 'completed' || updatingStatus[appointment.id] || isPaid}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                appointment.status === 'completed' || isPaid
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              Complete
                            </button>
                          </div>
                          
                          {renderBillingButton(appointment)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* YouTube Video Modal */}
      {activeVideoModal && (
        <YouTubeVideoModal 
          appointmentId={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
        />
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {appointments.length} booking(s) for {ownername}
        </div>
        <div className="text-sm text-gray-500">
          Paid Services: {Object.values(paymentStatuses).filter(status => status === 'paid').length} | 
          Active Videos: {Object.values(videoStreams).filter(stream => stream.isActive).length}
        </div>
      </div>

    
    </div>
  );
}