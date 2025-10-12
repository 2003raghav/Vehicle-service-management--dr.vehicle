import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";

export default function BillingPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const appointment = location.state?.appointment;

  const carServices = [
    { id: 1, name: "QuickFix Garage", service: "Oil Change", price: 800 },
    { id: 2, name: "ProAuto Care", service: "Brake Repair", price: 1500 },
    { id: 3, name: "Speedy Motors", service: "Battery Replacement", price: 2500 },
    { id: 4, name: "Auto Experts", service: "Wheel Alignment", price: 1200 },
    { id: 5, name: "City Car Care", service: "AC Service", price: 2000 },
  ];

  const bikeServices = [
    { id: 101, name: "BikeCare Hub", service: "Oil Change", price: 400 },
    { id: 102, name: "TwoWheelers Pro", service: "Brake Pad Replacement", price: 700 },
    { id: 103, name: "MotorCycle Fix", service: "Battery Replacement", price: 1200 },
    { id: 104, name: "Bike Masters", service: "Chain Lubrication", price: 150 },
    { id: 105, name: "SpeedBike Garage", service: "Tyre Replacement", price: 600 },
  ];

  const [vehicleType, setVehicleType] = useState("car");
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [username, setUsername] = useState(""); // For customer username
  const [customerId, setCustomerId] = useState(null); // Will fetch customer ID from username
  const [providerInfo, setProviderInfo] = useState(null);

  // Check if provider is logged in and get provider info
  useEffect(() => {
    const providerId = localStorage.getItem("providerId");
    const providerName = localStorage.getItem("providerName");
    
    console.log("Provider Debug localStorage:", {
      providerId: providerId,
      providerName: providerName,
      allStorage: { ...localStorage }
    });
    
    if (providerId) {
      setProviderInfo({
        id: parseInt(providerId),
        name: providerName
      });
    } else {
      console.warn("No provider logged in");
    }
  }, []);

  useEffect(() => {
    const sum = selectedServices.reduce((acc, s) => acc + s.price, 0) + (selectedServices.length > 0 ? 500 : 0);
    setTotalAmount(sum);
  }, [selectedServices]);

  // Fetch customer ID by username
  const fetchCustomerId = async (username) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${username}`);
      if (response.data && response.data.id) {
        setCustomerId(response.data.id);
        return response.data.id;
      }
      return null;
    } catch (error) {
      console.error("Error fetching customer:", error);
      return null;
    }
  };

  if (!appointment) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">No appointment data found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">
          Go Back
        </button>
      </div>
    );
  }

  const handleCheckboxChange = (service, checked) => {
    if (checked) {
      setSelectedServices(prev => [...prev, service]);
    } else {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    }
  };

  const generatePDF = (billingData) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Service Billing Invoice", 14, 20);
    doc.setFontSize(12);
    doc.text(`Customer Name: ${appointment.name}`, 14, 40);
    doc.text(`Customer Username: ${username}`, 14, 50);
    doc.text(`Vehicle: ${appointment.vehicleName} (${appointment.vehicleNumber})`, 14, 60);
    doc.text(`Date: ${appointment.date}`, 14, 70);
    doc.text(`Time: ${appointment.time}`, 14, 80);

    doc.text("Services:", 14, 100);
    selectedServices.forEach((s, index) => {
      doc.text(`${index + 1}. ${s.service} by ${s.name} - ₹${s.price}`, 14, 110 + index * 10);
    });

    doc.text(`Service Charge: ₹500`, 14, 110 + selectedServices.length * 10 + 10);
    doc.text(`Total Amount: ₹${totalAmount}`, 14, 110 + selectedServices.length * 10 + 20);

    doc.save(`Invoice_${appointment.name}_${username}.pdf`);
  };

  const saveBillingToBackend = async () => {
    try {
      // Validate provider is logged in
      if (!providerInfo) {
        throw new Error("Provider not logged in. Please login as provider first.");
      }

      // Validate customer username is provided
      if (!username.trim()) {
        throw new Error("Please enter customer username.");
      }

      // Fetch customer ID
      const customerUserId = await fetchCustomerId(username);
      if (!customerUserId) {
        throw new Error(`Customer with username '${username}' not found.`);
      }

      const billingData = {
        userId: customerUserId, // This is the customer's user ID
        vehicleName: appointment.vehicleName,
        vehicleNumber: appointment.vehicleNumber,
        date: appointment.date,
        time: appointment.time,
        totalAmount: totalAmount,
        providerId: providerInfo.id, // Store provider who created the bill
        providerName: providerInfo.name,
        paymentStatus: "pending", // Default status
        services: selectedServices.map(service => ({
          serviceName: service.service,
          providerName: service.name,
          price: service.price
        }))
      };

      console.log("Sending billing data:", billingData);

      const response = await axios.post("http://localhost:8080/api/billing/create", billingData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error("Error saving billing:", error);
      throw error;
    }
  };

  const handleBillingSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedServices.length === 0) {
      alert("Please select at least one service before billing.");
      return;
    }

    // Check if provider is logged in
    if (!providerInfo) {
      const confirmLogin = window.confirm(
        "You need to be logged in as provider to process billing. Would you like to login as provider now?"
      );
      if (confirmLogin) {
        navigate("/provider-login");
      }
      return;
    }

    setProcessing(true);

    try {
      // Save billing data to backend first
      const savedBilling = await saveBillingToBackend();
      
      // Then generate PDF with the saved data
      generatePDF(savedBilling);
      
      alert(`✅ Billing processed for ${appointment.name}. PDF downloaded and data saved!`);
      
      // Optionally navigate to provider dashboard
      navigate("/provider-dashboard");
      
    } catch (error) {
      if (error.message.includes("Provider not logged in")) {
        alert("❌ Please login as provider first to process billing.");
        navigate("/provider-login");
      } else if (error.message.includes("customer username")) {
        alert(`❌ ${error.message}`);
      } else {
        alert("❌ Failed to save billing data. Please try again.");
        console.error("Billing error:", error);
      }
    } finally {
      setProcessing(false);
    }
  };

  const servicesList = vehicleType === "car" ? carServices : bikeServices;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-600 text-center">
        Billing for {appointment.name}
      </h2>

      {/* Provider login status indicator */}
      {!providerInfo ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-700 text-sm">
            <strong>Notice:</strong> You need to be logged in as a provider to process billing.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <p className="text-green-700 text-sm">
            <strong>Provider:</strong> Logged in as {providerInfo.name}
          </p>
        </div>
      )}

      <div className="space-y-3 mb-6">
        <p><strong>Customer Name:</strong> {appointment.name}</p>
        <p><strong>Vehicle:</strong> {appointment.vehicleName} ({appointment.vehicleNumber})</p>
        <p><strong>Date:</strong> {appointment.date}</p>
        <p><strong>Time:</strong> {appointment.time}</p>
      </div>

      <form onSubmit={handleBillingSubmit} className="space-y-5">
        {/* Customer Username Input */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Customer Username *
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter customer's username"
            className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter the username of the customer who owns this vehicle
          </p>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Vehicle Type</label>
          <select
            value={vehicleType}
            onChange={e => { setVehicleType(e.target.value); setSelectedServices([]); }}
            className="w-full border px-4 py-2 rounded-md"
          >
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Select Services</label>
          <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md bg-gray-50">
            {servicesList.map(service => (
              <label key={service.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedServices.some(s => s.id === service.id)}
                  onChange={e => handleCheckboxChange(service, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span>{service.name} - {service.service} (₹{service.price})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> A service charge of ₹500 will be added for processing.
          </p>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Total Amount</label>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Services:</span>
              <span>₹{selectedServices.reduce((acc, s) => acc + s.price, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Charge:</span>
              <span>₹{selectedServices.length > 0 ? 500 : 0}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-1">
              <span>Total:</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={processing || !providerInfo || !username.trim()}
          className={`w-full font-semibold py-2 rounded-md transition ${
            processing || !providerInfo || !username.trim()
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {!providerInfo ? 'Please Login as Provider' : 
           !username.trim() ? 'Enter Customer Username' :
           processing ? 'Processing...' : 'Process Billing & Download PDF'}
        </button>

        {!providerInfo && (
          <button
            type="button"
            onClick={() => navigate("/providerLogin")}
            className="w-full font-semibold py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
          >
            Login as Provider
          </button>
        )}
      </form>
    </div>
  );
}