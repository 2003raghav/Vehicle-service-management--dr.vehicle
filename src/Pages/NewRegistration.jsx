import { useState } from "react";
import { Link } from "react-router-dom";
import vehicleImg from "../assets/Components/Vehicleimg.jpg";

export default function NewRegistration() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [vehicleImage, setVehicleImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match");
      return;
    }
    setError("");

    const formData = new FormData();
    formData.append("name", e.target.name.value);
    formData.append("username", e.target.username.value);
    formData.append("password", password);
    formData.append("email", e.target.email.value);
    formData.append("phone", e.target.phone.value);
    formData.append("address", e.target.address.value);
    formData.append("vehicletype", e.target.vehicletype.value);
    formData.append("vehiclemodel", e.target.vehiclemodel.value);
    formData.append("yearofmanufacture", e.target.yearofmanufacture.value);
    formData.append("regno", e.target.regno.value);
    formData.append("dateofbirth", e.target.dateofbirth.value);

    if (e.target.vehicleImage.files[0]) {
      formData.append("image", e.target.vehicleImage.files[0]);
    }

    try {
      const res = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("✅ Registration successful!");
        e.target.reset();
        setPassword("");
        setConfirmPassword("");
        setVehicleImage(null);
      } else {
        const msg = await res.text();
        alert("❌ Registration failed! " + msg);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Server error!");
    }
  };

  const handleVehicleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setVehicleImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 p-6">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-3xl overflow-hidden border border-gray-200">
        
        {/* Header Banner */}
        <div className="relative">
          <img src={vehicleImg} alt="Register" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <h2 className="text-3xl font-bold text-white p-6 w-full drop-shadow-lg">
              Create Your Account
            </h2>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <form className="space-y-8" onSubmit={handleSubmit}>

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="section-heading">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Full Name" className="input-stylish" required />
                <input type="text" name="username" placeholder="Username" className="input-stylish" required />
              </div>
              <input type="date" name="dateofbirth" className="input-stylish w-full" required />
            </div>

            {/* Account Security */}
            <div className="space-y-4">
              <h3 className="section-heading">Account Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-stylish" required />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-stylish" required />
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="section-heading">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="email" name="email" placeholder="Email" className="input-stylish" required />
                <input type="tel" name="phone" placeholder="Phone Number" className="input-stylish" required />
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="space-y-4">
              <h3 className="section-heading">Vehicle Information</h3>
              <input type="text" name="address" placeholder="Address" className="input-stylish w-full" required />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="vehicletype" placeholder="Vehicle Type (Car, Bike, Truck...)" className="input-stylish" />
                <input type="text" name="vehiclemodel" placeholder="Vehicle Make & Model" className="input-stylish" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="number" name="yearofmanufacture" placeholder="Year of Manufacture" className="input-stylish" />
                <input type="text" name="regno" placeholder="Registration Number" className="input-stylish" />
              </div>

              {/* Vehicle Image Upload */}
              <div className="mt-8 flex flex-col items-center text-center">
                <label className="text-gray-800 font-semibold mb-3 text-base">
                  Upload Vehicle Image
                </label>

                <input
                  type="file"
                  name="vehicleImage"
                  accept="image/*"
                  onChange={handleVehicleImage}
                  className="hidden"
                  id="vehicle-upload"
                />

                <label
                  htmlFor="vehicle-upload"
                  className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl w-64 h-64 bg-gray-50 hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  {vehicleImage ? (
                    <img
                      src={vehicleImage}
                      alt="Vehicle Preview"
                      className="w-full h-full object-cover rounded-xl shadow-md"
                    />
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mb-3 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium">Click to upload or drag & drop</span>
                      <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-3">
              <input id="terms" type="checkbox" className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" required />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                <Link to="/terms" className="text-purple-600 hover:text-purple-500 underline">
                  terms and conditions
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 rounded-lg font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Register Now
            </button>
          </form>
        </div>
      </div>

      {/* Styles */}
      <style>
        {`
          .input-stylish {
            width: 100%;
            padding: 0.8rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.75rem;
            background: #f9fafb;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
          }
          .input-stylish:focus {
            outline: none;
            border-color: #a855f7;
            box-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
            background: #fff;
          }
          .section-heading {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
          }
        `}
      </style>
    </div>
  );
}
