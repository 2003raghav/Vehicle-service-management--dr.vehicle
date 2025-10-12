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

        // Debug the date value
        const dateOfBirthValue = e.target.dateofbirth.value;
        console.log("Date of birth value:", dateOfBirthValue);
        console.log("Type of dateofbirth:", typeof dateOfBirthValue);

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
        formData.append("dateofbirth", dateOfBirthValue);

        if (e.target.vehicleImage.files[0]) {
          formData.append("image", e.target.vehicleImage.files[0]);
        }

        // Debug FormData contents
        for (let [key, value] of formData.entries()) {
          console.log(key + ": " + value);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-4xl overflow-hidden border border-gray-200">

        {/* Header Banner */}
        <div className="relative">
          <img src={vehicleImg} alt="Register" className="w-full h-56 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <h2 className="text-3xl font-bold text-white p-6 drop-shadow-lg">
              Create Your Account
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 md:p-10 space-y-10">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Personal Info */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Full Name" className="input-stylish" required />
                <input type="text" name="username" placeholder="Username" className="input-stylish" required />
              </div>
              <input type="date" name="dateofbirth" className="input-stylish w-full" required />
            </div>

            {/* Account Security */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">
                Account Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-stylish"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-stylish"
                  required
                />
              </div>
              {error && <p className="text-red-600 text-sm mt-2 flex items-center">{error}</p>}
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="email" name="email" placeholder="Email" className="input-stylish" required />
                <input type="tel" name="phone" placeholder="Phone Number" className="input-stylish" required />
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">
                Vehicle Information
              </h3>
              <input type="text" name="address" placeholder="Address" className="input-stylish w-full" required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="vehicletype" placeholder="Vehicle Type" className="input-stylish" />
                <input type="text" name="vehiclemodel" placeholder="Vehicle Make & Model" className="input-stylish" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="number" name="yearofmanufacture" placeholder="Year of Manufacture" className="input-stylish" />
                <input type="text" name="regno" placeholder="Registration Number" className="input-stylish" />
              </div>

              {/* Vehicle Image Upload */}
              <div className="mt-4 flex flex-col items-center">
                <label htmlFor="vehicle-upload" className="text-gray-700 font-medium mb-2">Upload Vehicle Image</label>
                <input
                  type="file"
                  id="vehicle-upload"
                  name="vehicleImage"
                  accept="image/*"
                  onChange={handleVehicleImage}
                  className="hidden"
                />
                <label
                  htmlFor="vehicle-upload"
                  className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl w-64 h-64 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  {vehicleImage ? (
                    <img src={vehicleImage} alt="Vehicle Preview" className="w-full h-full object-cover rounded-xl shadow-md" />
                  ) : (
                    <span className="text-gray-400 text-center">Click to upload or drag & drop</span>
                  )}
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-3">
              <input id="terms" type="checkbox" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" required />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500 underline">
                  terms and conditions
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Register Now
            </button>
          </form>
        </div>
      </div>

      {/* Inline Styles */}
      <style>{`
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
          border-color: #3b82f6;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
          background: #fff;
        }
      `}</style>
    </div>
  );
}
