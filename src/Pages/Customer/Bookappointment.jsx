import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Car, Wrench, Building2, CheckCircle } from 'lucide-react';

function BookingForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleName: '',
    vehicleNumber: '',
    serviceType: '',
    date: '',
    time: '',
    providerId: ''
  });
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState({}); // Store booking details for confirmation

  // Get current logged-in user from localStorage
  const [currentUser, setCurrentUser] = useState({
    username: '',
    name: '',
    userId: ''
  });

  useEffect(() => {
    const username = localStorage.getItem('username');
    const name = localStorage.getItem('name');
    const userId = localStorage.getItem('userId');

    if (username) {
      setCurrentUser({ username, name, userId });
      setFormData(prev => ({ ...prev, name: name || '' }));
    }

    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get('http://localhost:8080/appointment/providers');
      setProviders(response.data);
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!currentUser.username) {
      setError('Please log in to book an appointment');
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        name: formData.name || currentUser.name,
        phone: formData.phone,
        vehicleName: formData.vehicleName,
        vehicleNumber: formData.vehicleNumber,
        serviceType: formData.serviceType,
        date: formData.date,
        time: formData.time,
        username: currentUser.username,
        providerId: parseInt(formData.providerId)
      };

      // Store booking details for confirmation before resetting form
      setBookingDetails({
        serviceType: formData.serviceType,
        vehicleName: formData.vehicleName,
        vehicleNumber: formData.vehicleNumber,
        date: formData.date,
        time: formData.time,
        provider: providers.find(p => p.id === parseInt(formData.providerId))
      });

      const response = await axios.post(
        'http://localhost:8080/appointment/book/simple',
        bookingData
      );

      setSuccess('Appointment booked successfully!');
      setCurrentStep(4); // Success step
      
      // Reset form but keep user's name
      setFormData({
        name: currentUser.name || '',
        phone: '',
        vehicleName: '',
        vehicleNumber: '',
        serviceType: '',
        date: '',
        time: '',
        providerId: ''
      });
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err.response?.data || 'Booking failed. Please try again.';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
    setError('');
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Progress steps
  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Vehicle Details', icon: Car },
    { number: 3, title: 'Appointment', icon: Calendar },
    { number: 4, title: 'Confirmation', icon: CheckCircle }
  ];

  if (!currentUser.username) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Book Appointment</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-700">Please log in to book an appointment.</p>
          </div>
          <Link 
            to="/signin" 
            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">
            Book Your Service
          </h1>
          <p className="text-gray-600 text-lg">Schedule your vehicle service with ease</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;
              const isSuccessStep = step.number === 4 && currentStep === 4;

              return (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 font-semibold transition-all duration-300 ${
                    isSuccessStep 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCompleted 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : isCurrent 
                      ? 'border-blue-500 bg-white text-blue-500' 
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {isSuccessStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-sm mt-2 font-medium ${
                    isCurrent || isCompleted || isSuccessStep 
                      ? 'text-blue-600' 
                      : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mt-6 ${
                      step.number < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-800">
                {currentUser.username}
                {currentUser.name && ` (${currentUser.name})`}
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && currentStep === 4 && (
            <div className="text-center py-12 px-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">Your appointment has been scheduled successfully.</p>
              
              {/* Booking Details Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 max-w-md mx-auto border border-blue-100">
                <h4 className="font-bold text-xl text-gray-800 mb-6 text-center">Appointment Details</h4>
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-3">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Service Type</p>
                      <p className="font-semibold text-gray-800">{bookingDetails.serviceType || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Car className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-semibold text-gray-800">
                        {bookingDetails.vehicleName || 'Not specified'}
                        {bookingDetails.vehicleNumber && ` (${bookingDetails.vehicleNumber})`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Service Center</p>
                      <p className="font-semibold text-gray-800">
                        {bookingDetails.provider ? 
                          `${bookingDetails.provider.garagename} - ${bookingDetails.provider.ownername}` : 
                          'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-semibold text-gray-800">
                        {bookingDetails.date ? formatDate(bookingDetails.date) : 'Not specified'}
                        {bookingDetails.time && ` at ${formatTime(bookingDetails.time)}`}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Reference Number */}
                <div className="mt-6 p-4 bg-white rounded-xl border border-green-200">
                  <p className="text-sm text-gray-600 text-center">Your booking reference</p>
                  <p className="text-lg font-mono font-bold text-green-600 text-center">
                    #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-blue-500 text-white py-3 px-8 rounded-xl hover:bg-blue-600 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Book Another Service
                </button>
                <Link
                  to="/"
                  className="border border-gray-300 text-gray-700 py-3 px-8 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-semibold text-center"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {currentStep !== 4 && (
            <form onSubmit={handleSubmit} className="p-8">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <User className="w-4 h-4 mr-2" />
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={currentUser.name || "Enter your full name"}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-blue-500 text-white py-3 px-8 rounded-xl hover:bg-blue-600 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Vehicle Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Car className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Vehicle Details</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Car className="w-4 h-4 mr-2" />
                        Vehicle Name
                      </label>
                      <input
                        type="text"
                        name="vehicleName"
                        value={formData.vehicleName}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Toyota Camry"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Car className="w-4 h-4 mr-2" />
                        Vehicle Number
                      </label>
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        required
                        placeholder="e.g., KA-01-AB-1234"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Wrench className="w-4 h-4 mr-2" />
                        Service Type
                      </label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Service Type</option>
                        <option value="Oil Change">🛢️ Oil Change</option>
                        <option value="Engine Check">🔧 Engine Check</option>
                        <option value="Brake Service">🛑 Brake Service</option>
                        <option value="Tire Rotation">🌀 Tire Rotation</option>
                        <option value="General Service">⚙️ General Service</option>
                        <option value="AC Service">❄️ AC Service</option>
                        <option value="Battery Replacement">🔋 Battery Replacement</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-blue-500 text-white py-3 px-8 rounded-xl hover:bg-blue-600 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Appointment Scheduling */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Schedule Appointment</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Building2 className="w-4 h-4 mr-2" />
                        Service Provider
                      </label>
                      <select
                        name="providerId"
                        value={formData.providerId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select a service center</option>
                        {providers.map(provider => (
                          <option key={provider.id} value={provider.id}>
                            🏢 {provider.garagename} - {provider.ownername}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={getTodayDate()}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Clock className="w-4 h-4 mr-2" />
                        Preferred Time
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-8 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Booking...
                        </div>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingForm;