// Customerbooking.jsx - FIXED VERSION
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function CustomerBooking() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatusMap, setPaymentStatusMap] = useState({});
  const [processing, setProcessing] = useState({});
  const navigate = useNavigate();

  const providerName = localStorage.getItem("providerName");
  const providerId = localStorage.getItem("providerId");

  const fetchAppointments = useCallback(async () => {
    if (!providerName) {
      setError("Provider not logged in");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`🔧 [Provider] Fetching appointments for: ${providerName}`);
      
      const response = await axios.get(`http://localhost:8080/appointment/owner/${providerName}`);
      console.log(`🔧 [Provider] Appointments received:`, response.data);
      
      setAppointments(response.data || []);
      
      // Fetch payment status only if we have appointments
      if (response.data && response.data.length > 0) {
        await fetchPaymentStatus(response.data);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [providerName]);

  const fetchPaymentStatus = async (appointmentsList) => {
    try {
      console.log(`🔧 [Provider] Fetching payment status for ${appointmentsList.length} appointments`);
      
      // Get all appointment IDs
      const appointmentIds = appointmentsList.map(app => app.id).filter(id => id);
      
      if (appointmentIds.length === 0) return;

      // Fetch billing status for each appointment
      const statusMap = {};
      
      // Use Promise.all for parallel requests
      const billingPromises = appointmentIds.map(async (id) => {
        try {
          const billingResponse = await axios.get(`http://localhost:8080/api/billing/appointment/${id}`);
          if (billingResponse.data && billingResponse.data.length > 0) {
            // Sort by creation date to get the latest billing record
            const bills = billingResponse.data.sort((a, b) => 
              new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
            );
            const bill = bills[0]; // Get the latest bill
            statusMap[id] = {
              paid: bill.paymentStatus === 'paid',
              billingId: bill.id,
              paymentMethod: bill.paymentMethod,
              totalAmount: bill.totalAmount,
              hasValidAmount: bill.totalAmount > 0 // Check if amount is valid
            };
          } else {
            statusMap[id] = { 
              paid: false, 
              billingId: null,
              totalAmount: 0,
              hasValidAmount: false
            };
          }
        } catch (error) {
          console.warn(`Could not fetch billing for appointment ${id}:`, error);
          statusMap[id] = { 
            paid: false, 
            billingId: null,
            totalAmount: 0,
            hasValidAmount: false
          };
        }
      });

      await Promise.all(billingPromises);
      
      console.log(`🔧 [Provider] Payment status map:`, statusMap);
      setPaymentStatusMap(statusMap);
    } catch (err) {
      console.error("Error fetching payment status:", err);
    }
  };

  useEffect(() => {
    if (providerName) {
      fetchAppointments();
    } else {
      setLoading(false);
      setError("Please login as provider to view appointments");
    }
  }, [providerName, fetchAppointments]);

  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      setProcessing(prev => ({ ...prev, [id]: true }));
      console.log(`🔧 [Provider] Updating appointment ${id} to status: ${newStatus}`);

      await axios.put(`http://localhost:8080/appointment/${id}/status`, { status: newStatus });

      // Refresh appointments list
      await fetchAppointments();

      // If status changed to "completed", DO NOT create billing automatically
      // Let the provider create it manually through the billing page
      if (newStatus === "completed") {
        console.log(`🔧 [Provider] Appointment ${id} marked as completed. Billing should be created manually.`);
      }

      alert(`Appointment status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update appointment status");
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  const startVideoCall = (appointment) => {
    // Implement video call logic
    console.log("Starting video call for appointment:", appointment.id);
    alert("Video call feature coming soon!");
  };

  const navigateToBilling = (appointment) => {
  const billingInfo = paymentStatusMap[appointment.id];
  
  if (billingInfo && billingInfo.billingId) {
    if (billingInfo.hasValidAmount && billingInfo.totalAmount > 0) {
      navigate(`/payment`); // View existing paid bill
    } else {
      navigate(`/provider/billing/${appointment.id}`, { 
        state: { 
          appointment,
          existingBillingId: billingInfo.billingId
        } 
      });
    }
  } else {
    // No billing exists, create new one with ₹500 service charge
    navigate(`/provider/billing/${appointment.id}`, { 
      state: { 
        appointment,
        serviceCharge: 500 // Explicitly pass service charge
      } 
    });
  }
};

  const formatDateTime = (date, time) => {
    try {
      if (!date) return "Not scheduled";
      const dateObj = new Date(date);
      const formattedDate = format(dateObj, "MMM dd, yyyy");
      return time ? `${formattedDate} at ${time}` : formattedDate;
    } catch {
      return "Invalid date";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusBadge = (appointmentId) => {
    const status = paymentStatusMap[appointmentId];
    if (!status || !status.billingId) {
      return (
        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
          No Bill
        </span>
      );
    }
    
    if (status.paid) {
      return (
        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          Paid ₹{status.totalAmount} ({status.paymentMethod || "Unknown"})
        </span>
      );
    }
    
    if (status.hasValidAmount && status.totalAmount > 0) {
      return (
        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          Unpaid ₹{status.totalAmount}
        </span>
      );
    }
    
    return (
      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
        Bill Incomplete
      </span>
    );
  };

  const handleDeleteZeroAmountBilling = async (appointmentId, billingId) => {
    if (!window.confirm("This billing record has zero amount. Delete it and create a new one?")) {
      return;
    }

    try {
      // Delete the zero amount billing
      await axios.delete(`http://localhost:8080/api/billing/${billingId}`);
      
      // Refresh payment status
      await fetchPaymentStatus(appointments);
      
      // Navigate to create new billing
      const appointment = appointments.find(app => app.id === appointmentId);
      if (appointment) {
        navigate(`/provider/billing/${appointmentId}`, { state: { appointment } });
      }
    } catch (err) {
      console.error("Error deleting billing:", err);
      alert("Failed to delete billing record");
    }
  };

  const getBillingButtonText = (appointmentId) => {
    const status = paymentStatusMap[appointmentId];
    
    if (!status || !status.billingId) {
      return "Create Bill";
    }
    
    if (status.paid) {
      return "View Paid Bill";
    }
    
    if (status.hasValidAmount && status.totalAmount > 0) {
      return "View/Edit Bill";
    }
    
    return "Complete Bill";
  };

  if (!providerName) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6">
        <div className="text-center py-8 bg-red-50 rounded-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-700 mb-2">Provider Login Required</h3>
          <p className="text-red-600 mb-4">Please login as a service provider to view customer bookings.</p>
          <button 
            onClick={() => navigate("/provider-login")}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Login as Provider
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchAppointments}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Customer Bookings</h2>
          <p className="text-gray-600 mt-1">Provider: {providerName}</p>
        </div>
        <button 
          onClick={fetchAppointments}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Found</h3>
          <p className="text-gray-500 mb-6">You don't have any customer appointments scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {appointments.map((appointment) => {
            const billingInfo = paymentStatusMap[appointment.id];
            
            return (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {appointment.name}
                      {getPaymentStatusBadge(appointment.id)}
                    </h3>
                    <p className="text-gray-600 mt-1">{appointment.vehicleName} ({appointment.vehicleNumber})</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status || "pending"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">{formatDateTime(appointment.date, appointment.time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service Type</p>
                    <p className="font-medium">{appointment.serviceType || "General Service"}</p>
                  </div>
                  {appointment.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{appointment.phone}</p>
                    </div>
                  )}
                  {appointment.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{appointment.email}</p>
                    </div>
                  )}
                </div>

                {appointment.description && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{appointment.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  {/* Status Update Buttons */}
                  {appointment.status !== "completed" && appointment.status !== "cancelled" && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                        disabled={processing[appointment.id] || appointment.status === "confirmed"}
                        className={`px-3 py-1.5 text-sm rounded transition-colors ${
                          appointment.status === "confirmed"
                            ? "bg-blue-100 text-blue-800 cursor-default"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        {processing[appointment.id] ? "Processing..." : "Confirm"}
                      </button>
                      
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                        disabled={processing[appointment.id]}
                        className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                      >
                        {processing[appointment.id] ? "Processing..." : "Mark Completed"}
                      </button>
                    </>
                  )}

                  {appointment.status !== "cancelled" && (
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                      disabled={processing[appointment.id]}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    >
                      {processing[appointment.id] ? "Processing..." : "Cancel"}
                    </button>
                  )}

                  {/* Video Call Button */}
                  {appointment.status === "confirmed" && (
                    <button
                      onClick={() => startVideoCall(appointment)}
                      className="px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                    >
                      Start Video Call
                    </button>
                  )}

                  {/* Billing Button */}
                  {appointment.status === "completed" && (
                    <>
                      <button
                        onClick={() => navigateToBilling(appointment)}
                        className="px-3 py-1.5 text-sm bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors"
                      >
                        {getBillingButtonText(appointment.id)}
                      </button>
                      
                      {/* Show delete option if billing exists with zero amount */}
                      {billingInfo && billingInfo.billingId && !billingInfo.hasValidAmount && (
                        <button
                          onClick={() => handleDeleteZeroAmountBilling(appointment.id, billingInfo.billingId)}
                          className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          Delete Zero Bill
                        </button>
                      )}
                    </>
                  )}

                  {/* Reschedule Button */}
                  {appointment.status !== "completed" && appointment.status !== "cancelled" && (
                    <button
                      onClick={() => navigate(`/reschedule/${appointment.id}`, { state: { appointment } })}
                      className="px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                    >
                      Reschedule
                    </button>
                  )}
                </div>
                
                {/* Debug info - show billing details */}
                {billingInfo && billingInfo.billingId && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    <p>Billing ID: {billingInfo.billingId}</p>
                    <p>Amount: ₹{billingInfo.totalAmount || 0}</p>
                    <p>Status: {billingInfo.paid ? 'Paid' : 'Unpaid'}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Legend:</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-100 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-100 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">Confirmed</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-100 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-100 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
}