import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { Video, Play, Pause, RefreshCw, CheckCircle, Clock, XCircle, CreditCard, DollarSign, Calendar, Car } from "lucide-react";

export default function CustomerBooking() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ownername, setOwnername] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [liveVideoStreams, setLiveVideoStreams] = useState({});
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  const navigate = useNavigate();

  // Fetch appointments from Spring Boot
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      if (!ownername) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `http://localhost:8080/appointment/owner/${ownername}`
      );

      let appointmentsData = [];
      if (Array.isArray(res.data)) {
        appointmentsData = res.data;
      } else {
        appointmentsData = res.data ? [res.data] : [];
      }

      setAppointments(appointmentsData);
      
      // Fetch payment status for each appointment
      await fetchPaymentStatuses(appointmentsData);
      // Fetch payment history
      await fetchPaymentHistory();
    } catch (err) {
      console.error("API Error:", err);
      setError("Unable to load booking data from backend.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment status for each appointment
  const fetchPaymentStatuses = async (appointmentsData) => {
    const paymentStatusPromises = appointmentsData.map(async (appointment) => {
      try {
        const billingRes = await axios.get(
          `http://localhost:8080/api/billing/appointment/${appointment.id}`
        );
        
        console.log(`Billing response for appointment ${appointment.id}:`, billingRes.data);
        
        if (billingRes.data && billingRes.data.length > 0) {
          const billing = billingRes.data[0];
          return {
            appointmentId: appointment.id,
            paymentStatus: billing.paymentStatus || 'pending'
          };
        }
        
        return {
          appointmentId: appointment.id,
          paymentStatus: 'pending'
        };
      } catch (error) {
        console.error(`Error fetching payment status for appointment ${appointment.id}:`, error);
        return {
          appointmentId: appointment.id,
          paymentStatus: 'pending'
        };
      }
    });

    try {
      const paymentStatusResults = await Promise.all(paymentStatusPromises);
      const paymentStatusMap = {};
      
      paymentStatusResults.forEach(result => {
        paymentStatusMap[result.appointmentId] = result.paymentStatus;
      });
      
      console.log("Final payment statuses:", paymentStatusMap);
      setPaymentStatuses(paymentStatusMap);
    } catch (error) {
      console.error("Error fetching payment statuses:", error);
    }
  };

  // Fetch payment history
  const fetchPaymentHistory = async () => {
    try {
      // Try to fetch from backend endpoint first
      const response = await axios.get(
        `http://localhost:8080/api/billing/provider/${ownername}`
      );
      
      if (response.data && Array.isArray(response.data)) {
        const paidBills = response.data.filter(bill => bill.paymentStatus === 'paid');
        console.log("Fetched paid bills:", paidBills);
        setPaymentHistory(paidBills);
      }
    } catch (error) {
      console.error("Error fetching payment history from endpoint, using fallback:", error);
      // Fallback: get paid appointments from current data
      const paidAppointments = appointments.filter(apt => 
        paymentStatuses[apt.id] === 'paid'
      );
      const paidBills = paidAppointments.map(apt => ({
        id: apt.id,
        vehicleName: apt.vehicleName,
        vehicleNumber: apt.vehicleNumber,
        totalAmount: calculateServiceAmount(apt.serviceType),
        paymentDate: new Date().toISOString(),
        serviceType: apt.serviceType,
        paymentStatus: 'paid'
      }));
      console.log("Fallback paid bills:", paidBills);
      setPaymentHistory(paidBills);
    }
  };

  useEffect(() => {
    const storedOwnername = localStorage.getItem("providerOwnername");
    if (storedOwnername) setOwnername(storedOwnername);
  }, []);

  useEffect(() => {
    if (ownername) fetchAppointments();
  }, [ownername]);

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: true }));
      
      const response = await axios.patch(
        `http://localhost:8080/appointment/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus }
              : apt
          )
        );
        
        if (newStatus === "in-progress") {
          startVideoStream(appointmentId);
        }
        
        // Create billing record when status is set to completed
        if (newStatus === "completed") {
          await createBillingRecord(appointmentId);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  // Create billing records
  const createBillingRecord = async (appointmentId) => {
    try {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) return;

      const billingData = {
        appointmentId: appointment.id,
        userId: appointment.userId || 1,
        vehicleName: appointment.vehicleName,
        vehicleNumber: appointment.vehicleNumber,
        date: appointment.date,
        time: appointment.time,
        totalAmount: calculateServiceAmount(appointment.serviceType),
        paymentStatus: 'pending',
        providerName: ownername
      };

      const response = await axios.post(
        'http://localhost:8080/api/billing/create',
        billingData
      );

      console.log('Billing record created:', response.data);
      
      // Refresh payment status after creating billing record
      refreshPaymentStatus(appointmentId);
      
    } catch (error) {
      console.error('Error creating billing record:', error);
    }
  };

  // Helper function to calculate service amount
  const calculateServiceAmount = (serviceType) => {
    const servicePrices = {
      'oil change': 50.00,
      'tire rotation': 40.00,
      'brake service': 120.00,
      'engine diagnostic': 80.00,
      'general maintenance': 60.00
    };
    
    return servicePrices[serviceType?.toLowerCase()] || 75.00;
  };

  const handleBilling = (appointment) => {
    // Check if payment is already paid
    if (paymentStatuses[appointment.id] === 'paid') {
      alert('This appointment has already been paid.');
      return;
    }
    
    // Navigate to billing page with appointment details only (no callbacks)
    navigate(`/billing/${appointment.id}`, { 
      state: { 
        appointment
      } 
    });
  };

  // Refresh payment status for a specific appointment
  const refreshPaymentStatus = async (appointmentId) => {
    try {
      const billingRes = await axios.get(
        `http://localhost:8080/api/billing/appointment/${appointmentId}`
      );
      
      if (billingRes.data && billingRes.data.length > 0) {
        const billing = billingRes.data[0];
        const newPaymentStatus = billing.paymentStatus || 'pending';
        
        setPaymentStatuses(prev => ({
          ...prev,
          [appointmentId]: newPaymentStatus
        }));
        
        // If payment status changed to paid, refresh history
        if (newPaymentStatus === 'paid') {
          console.log(`Payment status changed to paid for appointment ${appointmentId}, refreshing history`);
          await fetchPaymentHistory();
        }
      }
    } catch (error) {
      console.error(`Error refreshing payment status for appointment ${appointmentId}:`, error);
    }
  };

  // Manual refresh for payment status and history
  const refreshPaymentData = async () => {
    await fetchPaymentStatuses(appointments);
    await fetchPaymentHistory();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Calculate total revenue from payment history
  const calculateTotalRevenue = () => {
    return paymentHistory.reduce((total, payment) => total + (payment.totalAmount || 0), 0);
  };

  // Add this function for testing payment status
  const updatePaymentStatusTest = async (appointmentId, status) => {
    try {
      // First get the billing record
      const billingRes = await axios.get(
        `http://localhost:8080/api/billing/appointment/${appointmentId}`
      );
      
      if (billingRes.data && billingRes.data.length > 0) {
        const billing = billingRes.data[0];
        
        // Update the payment status
        const updateRes = await axios.put(
          `http://localhost:8080/api/billing/${billing.id}/status`,
          { paymentStatus: status }
        );
        
        console.log('Payment status updated:', updateRes.data);
        
        // Refresh the payment status and history
        await refreshPaymentStatus(appointmentId);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  // Simulate video stream functionality
  const startVideoStream = (appointmentId) => {
    setLiveVideoStreams(prev => ({
      ...prev,
      [appointmentId]: {
        isActive: true,
        isPlaying: true,
        url: `https://example.com/live-stream/${appointmentId}`,
        timestamp: new Date().toLocaleTimeString()
      }
    }));

    setTimeout(() => {
      setLiveVideoStreams(prev => ({
        ...prev,
        [appointmentId]: {
          ...prev[appointmentId],
          isActive: false,
          isPlaying: false
        }
      }));
    }, 30 * 60 * 1000);
  };

  const toggleVideoStream = (appointmentId) => {
    setLiveVideoStreams(prev => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        isPlaying: !prev[appointmentId]?.isPlaying
      }
    }));
  };

  const stopVideoStream = (appointmentId) => {
    setLiveVideoStreams(prev => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        isActive: false,
        isPlaying: false
      }
    }));
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
          <p className="text-gray-600 mt-2">Manage customer appointments and live service streams</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPaymentHistory(!showPaymentHistory)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <DollarSign className="w-4 h-4" />
            <span>{showPaymentHistory ? 'Hide Payments' : 'Show Payments'}</span>
          </button>
          <button
            onClick={fetchAppointments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh All</span>
          </button>
          <button
            onClick={refreshPaymentData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Payments</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Payment History Section */}
      {showPaymentHistory && (
        <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Payment History
            </h2>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Total: {paymentHistory.length} paid {paymentHistory.length === 1 ? 'service' : 'services'}
              </div>
              <div className="text-lg font-bold text-green-700">
                Total Revenue: {formatCurrency(calculateTotalRevenue())}
              </div>
            </div>
          </div>

          {paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No payment history found</p>
              <p className="text-sm">Completed and paid services will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentHistory.map((payment, index) => (
                <div key={payment.id || index} className="border border-green-200 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <Car className="w-4 h-4 mr-2 text-green-600" />
                      <span className="font-semibold text-gray-800">
                        {payment.vehicleName || 'Vehicle'}
                      </span>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      Paid
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(payment.totalAmount)}
                      </span>
                    </div>
                    
                    {payment.vehicleNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plate:</span>
                        <span className="font-mono text-gray-700">{payment.vehicleNumber}</span>
                      </div>
                    )}
                    
                    {payment.serviceType && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span className="text-gray-700 capitalize">{payment.serviceType}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t border-green-200">
                      <span className="text-gray-600 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Paid on:
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(payment.paymentDate)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Debug info - you can remove this in production */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <strong>Debug Info:</strong> 
        <div>Appointments: {appointments.length}</div>
        <div>Payment Statuses: {JSON.stringify(paymentStatuses)}</div>
        <div>Payment History: {paymentHistory.length} records</div>
        <div>Completed Appointments: {appointments.filter(apt => apt.status === 'completed').length}</div>
      </div>

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
                    "Live Video",
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
                  const showBillingButton = appointment.status === 'completed';
                  
                  return (
                    <tr
                      key={appointment.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {/* ID */}
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        #{appointment.id}
                      </td>

                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.name}</div>
                        <div className="text-sm text-gray-500">{appointment.phone}</div>
                        {appointment.userUsername && (
                          <div className="text-xs text-gray-400 mt-1">
                            User: {appointment.userUsername}
                          </div>
                        )}
                      </td>

                      {/* Vehicle Info */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.vehicleName}</div>
                        <div className="text-sm text-gray-500">{appointment.vehicleNumber}</div>
                      </td>

                      {/* Service Type */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {appointment.serviceType}
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{appointment.date}</div>
                        <div className="text-gray-500">{appointment.time}</div>
                      </td>

                      {/* Current Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(appointment.status)}
                      </td>

                      {/* Payment Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          paymentStatuses[appointment.id] === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : appointment.status === 'completed'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {paymentStatuses[appointment.id] === 'paid' 
                            ? 'Paid' 
                            : appointment.status === 'completed'
                            ? 'Pending Payment'
                            : 'N/A'
                          }
                        </span>
                      </td>

                      {/* Update Status */}
                      <td className="px-6 py-4">
                        <select
                          value=""
                          onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value)}
                          disabled={updatingStatus[appointment.id]}
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

                      {/* Live Video */}
                      <td className="px-6 py-4">
                        {liveVideoStreams[appointment.id]?.isActive ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => toggleVideoStream(appointment.id)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {liveVideoStreams[appointment.id].isPlaying ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </button>
                              <span className="text-xs text-green-600 font-medium">
                                ● LIVE
                              </span>
                            </div>
                            <button
                              onClick={() => stopVideoStream(appointment.id)}
                              className="text-xs text-red-600 hover:text-red-800 transition-colors"
                            >
                              Stop
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startVideoStream(appointment.id)}
                            disabled={appointment.status !== 'in-progress'}
                            className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                              appointment.status === 'in-progress'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Video className="w-3 h-3" />
                            <span>Start Video</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'in-progress')}
                              disabled={appointment.status === 'in-progress' || updatingStatus[appointment.id]}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                appointment.status === 'in-progress'
                                  ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              Start Service
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              disabled={appointment.status === 'completed' || updatingStatus[appointment.id]}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                appointment.status === 'completed'
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              Complete
                            </button>
                          </div>
                          
                          {/* Billing Button - Only show for completed appointments and disable when paid */}
                          {showBillingButton && (
                            <button
                              onClick={() => handleBilling(appointment)}
                              disabled={isPaid}
                              className={`flex items-center space-x-1 px-3 py-1 text-xs rounded transition-colors ${
                                isPaid
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>{isPaid ? 'Paid' : 'Billing'}</span>
                            </button>
                          )}

                          {/* Test buttons - remove in production */}
                          {process.env.NODE_ENV === 'development' && showBillingButton && (
                            <div className="flex space-x-1 text-xs">
                              <button
                                onClick={() => updatePaymentStatusTest(appointment.id, 'pending')}
                                className="px-2 py-1 bg-yellow-500 text-white rounded"
                              >
                                Set Pending
                              </button>
                              <button
                                onClick={() => updatePaymentStatusTest(appointment.id, 'paid')}
                                className="px-2 py-1 bg-green-500 text-white rounded"
                              >
                                Set Paid
                              </button>
                            </div>
                          )}
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

      {/* Video Stream Modal */}
      {Object.entries(liveVideoStreams).map(([appointmentId, stream]) => 
        stream.isActive && (
          <div key={appointmentId} className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">
                  Live Service Stream - Appointment #{appointmentId}
                </h3>
                <button
                  onClick={() => stopVideoStream(appointmentId)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                  {stream.isPlaying ? (
                    <div className="text-center text-white">
                      <div className="animate-pulse bg-red-500 rounded-full w-4 h-4 mx-auto mb-2"></div>
                      <p>Live Service Feed - {stream.timestamp}</p>
                      <p className="text-sm text-gray-400 mt-2">Customer can view this stream</p>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Stream Paused</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={() => toggleVideoStream(appointmentId)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    {stream.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{stream.isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <button
                    onClick={() => stopVideoStream(appointmentId)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Stop Stream
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Summary */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {appointments.length} booking(s) for {ownername}
        </div>
        <div className="text-sm text-gray-500">
          Live streams available for "In Progress" services
        </div>
      </div>
    </div>
  );
}