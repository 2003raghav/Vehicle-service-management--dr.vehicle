import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";

export default function Payment() {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentStep, setPaymentStep] = useState('select');
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!userId) {
      setError("Please login to view your billing details");
      setLoading(false);
      return;
    }

    fetchBilling();
  }, [userId]);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      console.log("Fetching billing for user ID:", userId);
      
      const res = await axios.get(`http://localhost:8080/api/billing/users/${userId}`);
      console.log("Billing API Response:", res.data);
      
      const cleanedData = cleanBillingData(res.data);
      console.log("Cleaned billing data:", cleanedData);
      
      if (cleanedData && Array.isArray(cleanedData)) {
        setBillingData(cleanedData);
      } else {
        console.warn("Unexpected response format after cleaning:", cleanedData);
        setBillingData([]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching billing data:", err);
      setError("Failed to load billing data. Please try again later.");
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  const cleanBillingData = (data) => {
    if (!data) return data;
    
    if (Array.isArray(data)) {
      return data.map(item => cleanBillingItem(item));
    } else {
      return cleanBillingItem(data);
    }
  };

  const cleanBillingItem = (billingItem) => {
    if (!billingItem || typeof billingItem !== 'object') return billingItem;
    
    const cleanItem = { ...billingItem };
    
    if (cleanItem.services && Array.isArray(cleanItem.services)) {
      cleanItem.services = cleanItem.services.map(service => {
        const cleanService = { ...service };
        delete cleanService.billing;
        return cleanService;
      });
    }
    
    delete cleanItem.billing;
    
    return cleanItem;
  };

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
    setPaymentStep('select');
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBill(null);
    setPaymentStep('select');
  };

  const confirmPayment = (paymentMethod) => {
    setPaymentStep('confirm');
    setSelectedBill(prev => ({ ...prev, selectedPaymentMethod: paymentMethod }));
  };

  const backToPaymentMethods = () => {
    setPaymentStep('select');
    setSelectedBill(prev => ({ ...prev, selectedPaymentMethod: null }));
  };

  const processDummyPayment = async () => {
    if (!selectedBill || !selectedBill.selectedPaymentMethod) return;

    try {
      setPaymentStep('processing');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Updating payment for billing ID:", selectedBill.id);
      console.log("Payment method:", selectedBill.selectedPaymentMethod);
      
      const response = await axios.put(`http://localhost:8080/api/billing/${selectedBill.id}/pay`, {
        paymentStatus: "paid",
        paymentMethod: selectedBill.selectedPaymentMethod,
        paymentDate: new Date().toISOString()
      });

      console.log("Payment response:", response.data);
      
      if (response.data) {
        setPaymentStep('success');
        
        setTimeout(() => {
          closePaymentModal();
          refreshBillingData();
        }, 1500);
      }
    } catch (error) {
      console.error("Payment failed:", error);
      console.error("Error details:", error.response?.data);
      
      let errorMessage = "❌ Payment failed. Please try again.";
      if (error.response?.status === 404) {
        errorMessage = "❌ Billing record not found. Please contact support.";
      } else if (error.response?.status === 500) {
        errorMessage = "❌ Server error. Please try again later.";
      }
      
      alert(errorMessage);
      setPaymentStep('select');
    }
  };

  const downloadPDF = (billing) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Vehicle Service Billing Invoice", 20, 20);
    doc.setFontSize(12);
    
    doc.text(`Customer: ${username || `ID: ${billing.userId}`}`, 20, 35);
    doc.text(`Vehicle: ${billing.vehicleName} (${billing.vehicleNumber})`, 20, 45);
    
    const displayDate = billing.date || billing.billingdate;
    if (displayDate) {
      doc.text(`Date: ${displayDate}`, 20, 55);
    }
    doc.text(`Time: ${billing.time}`, 20, 65);

    if (billing.providerName) {
      doc.text(`Service Provider: ${billing.providerName}`, 20, 75);
    }

    let y = 90;
    doc.text("Services:", 20, y);
    
    if (billing.services && billing.services.length > 0) {
      billing.services.forEach((s, i) => {
        y += 10;
        doc.text(`${i + 1}. ${s.serviceName} - ₹${s.price}`, 25, y);
        if (s.providerName) {
          y += 7;
          doc.text(`   Provided by: ${s.providerName}`, 25, y);
        }
      });
    } else {
      y += 10;
      doc.text("No services listed", 25, y);
    }

    y += 15;
    doc.text(`Service Charge: ₹500`, 20, y);
    y += 10;
    doc.text(`Total Amount: ₹${billing.totalAmount}`, 20, y);
    
    y += 15;
    doc.text(`Payment Status: ${billing.paymentStatus || 'pending'}`, 20, y);

    if (billing.paymentStatus === 'paid' && billing.paymentMethod) {
      y += 10;
      doc.text(`Payment Method: ${billing.paymentMethod}`, 20, y);
    }

    doc.save(`Invoice_${billing.vehicleName}_${billing.date || billing.billingdate}.pdf`);
  };

  const refreshBillingData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/billing/users/${userId}`);
      const cleanedData = cleanBillingData(res.data);
      setBillingData(cleanedData);
      setError(null);
    } catch (err) {
      console.error("Error refreshing billing data:", err);
      setError("Failed to refresh billing data.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="text-center py-8 bg-red-50 rounded-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-700 mb-2">Authentication Required</h3>
          <p className="text-red-600 mb-4">Please login to view your billing details.</p>
          <button 
            onClick={() => window.location.href = "/signin"}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your billing details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Billing Details</h2>
          <p className="text-gray-600">User: {username} (ID: {userId})</p>
        </div>
        <button 
          onClick={refreshBillingData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            
            {paymentStep === 'select' && (
              <>
                <h3 className="text-xl font-bold mb-4">Choose Payment Method</h3>
                
                <div className="mb-4 p-4 bg-gray-50 rounded">
                  <p className="font-semibold">Bill #{selectedBill.id}</p>
                  <p className="text-lg font-bold text-green-600">₹{selectedBill.totalAmount}</p>
                  <p className="text-gray-600">Vehicle: {selectedBill.vehicleName} ({selectedBill.vehicleNumber})</p>
                </div>

                <div className="mb-4">
                  <p className="font-medium mb-3">Select Payment Method:</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => confirmPayment("Credit Card")}
                      className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center space-x-4"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">💳</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">Pay with card</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => confirmPayment("UPI")}
                      className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex items-center space-x-4"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">📱</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">UPI Payment</p>
                        <p className="text-sm text-gray-500">Pay using UPI ID</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => confirmPayment("Net Banking")}
                      className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center space-x-4"
                    >
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">🏦</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Net Banking</p>
                        <p className="text-sm text-gray-500">Internet banking</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {paymentStep === 'confirm' && (
              <>
                <h3 className="text-xl font-bold mb-4">Confirm Payment</h3>
                
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-yellow-600 text-xl">⚠️</span>
                    </div>
                    <p className="font-semibold text-yellow-800">Please confirm your payment</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-bold text-green-600">₹{selectedBill.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-medium">{selectedBill.selectedPaymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bill #:</span>
                      <span>{selectedBill.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vehicle:</span>
                      <span>{selectedBill.vehicleName} ({selectedBill.vehicleNumber})</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Demo Mode:</strong> This is a dummy payment. No real transaction will occur.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={backToPaymentMethods}
                    className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={processDummyPayment}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Confirm & Pay
                  </button>
                </div>
              </>
            )}

            {paymentStep === 'processing' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
                <p className="text-gray-600">Please wait while we process your payment...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-green-600">Payment Successful!</h3>
                <p className="text-gray-600 mb-1">Thank you for your payment</p>
                <p className="text-sm text-gray-500">₹{selectedBill.totalAmount} • {selectedBill.selectedPaymentMethod}</p>
                <p className="text-sm text-gray-400 mt-3">Closing automatically...</p>
              </div>
            )}

            {(paymentStep === 'select' || paymentStep === 'confirm') && (
              <button
                onClick={closePaymentModal}
                className="w-full mt-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {billingData.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Billing Records Found</h3>
          <p className="text-gray-500 mb-4">You don't have any billing records yet.</p>
          <p className="text-gray-400 text-sm">
            Service providers will create billing records for your appointments. 
            Check back later or contact your service provider.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {billingData.map((bill) => (
            <div
              key={bill.id}
              className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Bill #</p>
                  <p className="font-semibold">{bill.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-semibold">{bill.vehicleName} ({bill.vehicleNumber})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold">{(bill.date || bill.billingdate)} at {bill.time}</p>
                </div>
                {bill.providerName && (
                  <div>
                    <p className="text-sm text-gray-600">Service Provider</p>
                    <p className="font-semibold">{bill.providerName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    bill.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bill.paymentStatus || 'pending'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">₹{bill.totalAmount}</p>
                </div>
              </div>

              {bill.services && bill.services.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Services Provided:</p>
                  <div className="space-y-2">
                    {bill.services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="font-medium">{service.serviceName}</span>
                          {service.providerName && (
                            <span className="text-sm text-gray-500 ml-2">by {service.providerName}</span>
                          )}
                        </div>
                        <span className="font-medium">₹{service.price}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-2 border-t border-gray-200 font-medium">
                      <span>Service Charge</span>
                      <span>₹500</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => downloadPDF(bill)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Invoice</span>
                </button>

                {bill.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => openPaymentModal(bill)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Pay Now</span>
                  </button>
                )}

                {bill.paymentStatus === 'paid' && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Payment Completed</span>
                    {bill.paymentMethod && (
                      <span className="text-xs">({bill.paymentMethod})</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}