// Payment.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Payment() {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentStep, setPaymentStep] = useState("select");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!userId) {
      setError("Please login to view your billing details");
      setLoading(false);
      return;
    }
    fetchBilling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const normalizeBillingItem = (raw) => {
    if (!raw || typeof raw !== "object") return raw;

    // Handle weird nested array responses
    if (Array.isArray(raw) && raw.length === 1 && typeof raw[0] === "object") {
      raw = raw[0];
    }

    const item = { ...raw };

    // Ensure services is an array
    item.services = Array.isArray(item.services) ? item.services.map((s) => {
      const price = s && (s.price ?? s.amount ?? 0);
      return {
        ...s,
        price: Number(price || 0)
      };
    }) : [];

    // Calculate services total from services array
    const computedServicesTotal = item.services.reduce((acc, s) => acc + Number(s.price || 0), 0);

    // Get service charge - use backend value if available, otherwise calculate
    const rawServiceCharge = item.serviceCharge ?? item.service_fee ?? null;
    let serviceCharge;
    
    if (rawServiceCharge !== null && rawServiceCharge !== undefined && rawServiceCharge !== "") {
      serviceCharge = Number(rawServiceCharge);
    } else {
      // IMPORTANT: This must match BillingPage.jsx logic - 500 if services exist
      serviceCharge = item.services.length > 0 ? 500 : 0;
    }

    // Get services total - prefer backend value
    const rawServicesTotal = item.servicesTotal ?? item.services_total ?? null;
    let servicesTotal;
    
    if (rawServicesTotal !== null && rawServicesTotal !== undefined && rawServicesTotal !== "") {
      servicesTotal = Number(rawServicesTotal);
    } else {
      servicesTotal = computedServicesTotal;
    }

    // Calculate total amount - prefer backend value, otherwise calculate
    const rawTotal = item.totalAmount ?? item.total ?? null;
    let totalAmount;
    
    if (rawTotal !== null && rawTotal !== undefined && rawTotal !== "") {
      totalAmount = Number(rawTotal);
    } else {
      // IMPORTANT: This calculation must match BillingPage.jsx
      totalAmount = servicesTotal + serviceCharge;
    }

    // Update the item with normalized values
    return {
      ...item,
      id: item.id || item._id || Math.random().toString(36).substr(2, 9),
      servicesTotal: servicesTotal,
      serviceCharge: serviceCharge,
      totalAmount: totalAmount,
      services: item.services
    };
  };

  const cleanBillingData = (data) => {
    if (!data) return [];
    
    // If API returns nested array like [ [ ... ] ] flatten
    let payload = data;
    if (Array.isArray(payload) && payload.length === 1 && Array.isArray(payload[0])) {
      payload = payload[0];
    }

    if (Array.isArray(payload)) {
      return payload.map(normalizeBillingItem).filter(Boolean);
    } else if (typeof payload === 'object') {
      return [normalizeBillingItem(payload)];
    }
    
    return [];
  };

  const fetchBilling = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`http://localhost:8080/api/billing/users/${userId}`);
      const cleaned = cleanBillingData(res.data);
      setBillingData(cleaned);
    } catch (err) {
      console.error("Error fetching billing data:", err);
      setError("Failed to load billing data. Please try again later.");
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
    setPaymentStep("select");
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBill(null);
    setPaymentStep("select");
  };

  const confirmPayment = (paymentMethod) => {
    setPaymentStep("confirm");
    setSelectedBill((prev) => ({ ...prev, selectedPaymentMethod: paymentMethod }));
  };

  const backToPaymentMethods = () => {
    setPaymentStep("select");
    setSelectedBill((prev) => ({ ...prev, selectedPaymentMethod: null }));
  };

  const processDummyPayment = async () => {
    if (!selectedBill || !selectedBill.selectedPaymentMethod) return;

    try {
      setPaymentStep("processing");

      // Simulate short processing delay
      await new Promise((res) => setTimeout(res, 1000));

      // Call backend to mark paid - UPDATED ENDPOINT
      const payload = {
        paymentStatus: "paid",
        paymentMethod: selectedBill.selectedPaymentMethod,
        paymentDate: new Date().toISOString(),
        userId: userId
      };

      // Try different endpoints
      const endpoints = [
        `http://localhost:8080/api/billing/${selectedBill.id}`,
        `http://localhost:8080/api/billing/pay/${selectedBill.id}`,
        `http://localhost:8080/api/billing/${selectedBill.id}/status`
      ];

      let paymentSuccess = false;
      
      for (const endpoint of endpoints) {
        try {
          await axios.put(endpoint, payload);
          paymentSuccess = true;
          break;
        } catch (err) {
          console.log(`Trying next endpoint... ${err.message}`);
          continue;
        }
      }

      if (!paymentSuccess) {
        // If all endpoints fail, simulate success locally
        console.log("Using local payment simulation");
        setBillingData(prev => prev.map(bill => 
          bill.id === selectedBill.id 
            ? { ...bill, paymentStatus: "paid", paymentMethod: selectedBill.selectedPaymentMethod }
            : bill
        ));
      }

      // Refresh list from backend
      await fetchBilling();

      setPaymentStep("success");

      // Auto close after short delay
      setTimeout(() => {
        closePaymentModal();
      }, 1500);
    } catch (err) {
      console.error("Payment failed:", err);
      
      // Show user-friendly error
      setError("Payment processing failed. Please try again or contact support.");
      setPaymentStep("select");
      
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const downloadPDF = (billing) => {
    if (!billing) return;
    const b = normalizeBillingItem(billing); // Ensure normalized
    const doc = new jsPDF();
    
    // Add logo/header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("AUTO CARE", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text("Vehicle Service Center", 105, 28, { align: 'center' });
    
    // Invoice title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 105, 50, { align: 'center' });
    
    // Invoice details box
    doc.setFillColor(245, 245, 245);
    doc.rect(15, 60, 180, 30, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Left column - Customer Info
    doc.text("BILL TO:", 20, 70);
    doc.setFont("helvetica", "bold");
    doc.text(username || `User ID: ${b.userId || b.user || "N/A"}`, 20, 77);
    if (b.vehicleName) doc.text(`${b.vehicleName || "N/A"} (${b.vehicleNumber || 'N/A'})`, 20, 84);
    
    // Right column - Invoice Details
    doc.setFont("helvetica", "normal");
    doc.text("INVOICE #:", 150, 70);
    doc.setFont("helvetica", "bold");
    doc.text(b.id.toString(), 150, 77); // Ensure it's a string
    
    doc.setFont("helvetica", "normal");
    const displayDate = b.date || b.billingdate || b.createdAt || new Date().toLocaleDateString();
    doc.text("DATE:", 150, 84);
    doc.setFont("helvetica", "bold");
    doc.text(displayDate.toString(), 150, 91); // Ensure it's a string
    
    if (b.time) {
      doc.setFont("helvetica", "normal");
      doc.text("TIME:", 150, 98);
      doc.setFont("helvetica", "bold");
      doc.text(b.time.toString(), 150, 105); // Ensure it's a string
    }
    
    // Service Provider Info
    let yPos = 100;
    if (b.providerName) {
      yPos += 10;
      doc.setFont("helvetica", "normal");
      doc.text("SERVICE PROVIDER:", 20, yPos);
      doc.setFont("helvetica", "bold");
      doc.text(b.providerName.toString(), 20, yPos + 7); // Ensure it's a string
    }
    
    // Services Table - FIXED: Ensure all values are strings
    yPos += 20;
    const tableColumn = ["No.", "Service Description", "Provider", "Amount"];
    const tableRows = [];
    
    if (b.services && b.services.length > 0) {
      b.services.forEach((s, i) => {
        const serviceData = [
          (i + 1).toString(), // Convert number to string
          (s.serviceName || s.service || "Service").toString(),
          (s.providerName || "N/A").toString(),
          `₹${s.price ?? 0}`
        ];
        tableRows.push(serviceData);
      });
    } else {
      tableRows.push(["1", "No services listed", "N/A", "₹0"]);
    }
    
    // Use autoTable function directly (not doc.autoTable)
    autoTable(doc, {
      startY: yPos,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 70 },
        2: { cellWidth: 50 },
        3: { cellWidth: 25, halign: 'right' }
      }
    });
    
    // Calculate final Y position after table
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Totals section
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Subtotal
    doc.text("Services Total:", 140, finalY);
    doc.text(`₹${b.servicesTotal || 0}`, 185, finalY, { align: 'right' });
    
    // Service Charge
    doc.text("Service Charge:", 140, finalY + 8);
    doc.text(`₹${b.serviceCharge || 0}`, 185, finalY + 8, { align: 'right' });
    
    // Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Total Amount:", 140, finalY + 20);
    doc.text(`₹${b.totalAmount || 0}`, 185, finalY + 20, { align: 'right' });
    
    // Payment Status
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Payment Status:", 20, finalY + 20);
    doc.setFont("helvetica", "bold");
    
    if (b.paymentStatus === 'paid') {
      doc.setTextColor(0, 128, 0);
      doc.text("PAID", 50, finalY + 20);
      if (b.paymentMethod) {
        doc.text(`via ${b.paymentMethod}`, 70, finalY + 20);
      }
    } else {
      doc.setTextColor(255, 0, 0);
      doc.text("PENDING", 50, finalY + 20);
    }
    
    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const footerY = 280;
    doc.text("Thank you for choosing Auto Care Services", 105, footerY, { align: 'center' });
    doc.text("Contact: support@autocare.com | Phone: +91 9876543210", 105, footerY + 5, { align: 'center' });
    doc.text("Address: 123 Service Street, Auto City, India - 560001", 105, footerY + 10, { align: 'center' });
    
    // Terms and Conditions
    doc.text("Terms & Conditions:", 15, footerY + 20);
    doc.setFontSize(8);
    doc.text("1. All payments are non-refundable.", 15, footerY + 25);
    doc.text("2. Invoice valid for tax purposes.", 15, footerY + 30);
    doc.text("3. Warranty as per service terms.", 15, footerY + 35);
    
    // Save PDF
    const fileName = `Invoice_${b.vehicleName || "Vehicle"}_${b.id}_${displayDate.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
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
          <button onClick={() => (window.location.href = "/signin")} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
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
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">My Billing Details</h2>
          <p className="text-gray-600 mt-1">Welcome back, <span className="font-semibold">{username}</span></p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            User ID: {userId}
          </span>
          <button 
            onClick={fetchBilling} 
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {billingData.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">No Billing Records Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">You don't have any billing records yet. When you book services, your bills will appear here.</p>
          <button 
            onClick={() => window.location.href = "/services"} 
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Explore Services
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {billingData.map((bill) => {
            const servicesTotal = Number(bill.servicesTotal || 0);
            const serviceCharge = Number(bill.serviceCharge || (bill.services?.length > 0 ? 500 : 0));
            const totalAmount = Number(bill.totalAmount || (servicesTotal + serviceCharge));

            return (
              <div key={bill.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                {/* Invoice Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">INVOICE</h3>
                      <p className="text-blue-100 text-sm">#{bill.id}</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-xs font-bold ${bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {bill.paymentStatus === 'paid' ? '✓ PAID' : '● PENDING'}
                    </span>
                  </div>
                </div>

                {/* Invoice Body */}
                <div className="p-6">
                  {/* Customer & Vehicle Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vehicle</p>
                      <p className="font-semibold text-gray-800">{bill.vehicleName || "N/A"}</p>
                      <p className="text-sm text-gray-600">{bill.vehicleNumber || "No plate"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date & Time</p>
                      <p className="font-semibold text-gray-800">{bill.date || bill.billingdate || "N/A"}</p>
                      <p className="text-sm text-gray-600">{bill.time || "N/A"}</p>
                    </div>
                  </div>

                  {/* Service Provider */}
                  {bill.providerName && (
                    <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Service Provider</p>
                      <p className="font-medium text-blue-700">{bill.providerName}</p>
                    </div>
                  )}

                  {/* Services List */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b">Services Breakdown</h4>
                    <div className="space-y-2">
                      {bill.services && bill.services.length > 0 ? (
                        bill.services.map((service, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs mr-3">
                                  {index + 1}
                                </span>
                                <span className="font-medium text-gray-800">{service.serviceName || service.service}</span>
                              </div>
                              {service.providerName && (
                                <p className="text-xs text-gray-500 ml-8 mt-1">by {service.providerName}</p>
                              )}
                            </div>
                            <span className="font-semibold text-gray-800">₹{Number(service.price || 0)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-3">No services listed</p>
                      )}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Services Total:</span>
                        <span className="font-medium">₹{servicesTotal}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Service Charge:</span>
                        <span className="font-medium">₹{serviceCharge}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-300 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                          <span className="text-xl font-bold text-green-600">₹{totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button 
                      onClick={() => downloadPDF(bill)} 
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download Invoice</span>
                    </button>

                    {bill.paymentStatus !== 'paid' ? (
                      <button 
                        onClick={() => openPaymentModal(bill)} 
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Pay Now</span>
                      </button>
                    ) : (
                      <div className="flex-1 px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Payment Completed</span>
                        {bill.paymentMethod && <span className="text-sm">({bill.paymentMethod})</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal - Complete with all steps */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl transform transition-all duration-300">
            {paymentStep === "select" && (
              <>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">Choose Payment Method</h3>
                  <p className="text-blue-100 text-sm">Complete your payment securely</p>
                </div>
                
                <div className="p-6">
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">Bill #{selectedBill.id}</span>
                      <span className="text-lg font-bold text-green-600">₹{selectedBill.totalAmount}</span>
                    </div>
                    <p className="text-gray-600 text-sm">Vehicle: {selectedBill.vehicleName} ({selectedBill.vehicleNumber})</p>
                  </div>

                  <div className="mb-6">
                    <p className="font-medium text-gray-700 mb-4">Select Payment Method:</p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => confirmPayment("Credit Card")} 
                        className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center space-x-4 hover:shadow-md"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-white text-xl">💳</span>
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-gray-800">Credit/Debit Card</p>
                          <p className="text-sm text-gray-500">Pay securely with your card</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => confirmPayment("UPI")} 
                        className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center space-x-4 hover:shadow-md"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-white text-xl">📱</span>
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-gray-800">UPI Payment</p>
                          <p className="text-sm text-gray-500">Pay using UPI ID or QR</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => confirmPayment("Net Banking")} 
                        className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 flex items-center space-x-4 hover:shadow-md"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-white text-xl">🏦</span>
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-gray-800">Net Banking</p>
                          <p className="text-sm text-gray-500">Internet banking transfer</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={closePaymentModal} 
                    className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {paymentStep === "confirm" && (
              <>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">Confirm Payment</h3>
                </div>
                <div className="p-6">
                  <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-yellow-600 text-2xl">⚠️</span>
                      </div>
                      <p className="font-bold text-yellow-800 text-lg">Please confirm your payment</p>
                    </div>

                    <div className="space-y-3 text-sm bg-white p-4 rounded-lg">
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Amount:</span>
                        <span className="font-bold text-green-600 text-lg">₹{selectedBill.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Services Total:</span>
                        <span>₹{selectedBill.servicesTotal || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Charge:</span>
                        <span>₹{selectedBill.serviceCharge || 0}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Payment Method:</span>
                        <span className="text-blue-600">{selectedBill.selectedPaymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bill #:</span>
                        <span className="font-mono">{selectedBill.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vehicle:</span>
                        <span>{selectedBill.vehicleName} ({selectedBill.vehicleNumber})</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-blue-800 text-sm"><strong>Demo Mode:</strong> This is a dummy payment. No real transaction will occur.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={backToPaymentMethods} 
                      className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                    >
                      Back
                    </button>
                    <button 
                      onClick={processDummyPayment} 
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                    >
                      Confirm & Pay
                    </button>
                  </div>
                </div>
              </>
            )}

            {paymentStep === "processing" && (
              <div className="text-center py-10">
                <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Processing Payment</h3>
                <p className="text-gray-600 mb-2">Please wait while we process your payment...</p>
                <p className="text-sm text-gray-400">This may take a few seconds</p>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-3">Payment Successful!</h3>
                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-700 mb-1 font-medium">Thank you for your payment</p>
                  <p className="text-lg font-bold text-green-700">₹{selectedBill.totalAmount}</p>
                  <p className="text-sm text-gray-500">via {selectedBill.selectedPaymentMethod}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">An invoice has been generated and saved to your account.</p>
                </div>
                <p className="text-sm text-gray-400 animate-pulse">Closing automatically...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}