import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import garageImg from "../../assets/Components/Vehicleimg.jpg";

export default function ProviderSignup() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [garageImage, setGarageImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleGarageImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGarageImage(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match");
      return;
    }
    setError("");

    const formElements = e.target.elements;
    const providerData = {
      garagename: formElements.garagename.value,
      ownername: formElements.ownername.value,
      garageaddress: formElements.garageaddress.value,
      password: password,
      email: formElements.email.value,
      phoneno: formElements.phoneno.value,
      specializations: formElements.specializations.value,
      availableservices: formElements.availableservices.value,
    };

    const formData = new FormData();
    formData.append(
      "provider",
      new Blob([JSON.stringify(providerData)], { type: "application/json" })
    );

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/provider/register",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 201 || response.status === 200) {
        alert("✅ Provider registered successfully!");
        e.target.reset();
        setPassword("");
        setConfirmPassword("");
        setGarageImage(null);
        setSelectedFile(null);
      } else {
        setError("❌ Unexpected response from server");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Failed to register provider");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-3xl overflow-hidden border border-gray-200">

        {/* Top Banner */}
        <div className="relative">
          <img src={garageImg} alt="Garage Register" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <h2 className="text-3xl font-bold text-white p-6 drop-shadow-lg w-full">
              Register Your Garage
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 md:p-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Garage Info */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Garage Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="garagename" placeholder="Garage Name" className="input-stylish" required />
                <input type="text" name="ownername" placeholder="Owner Name" className="input-stylish" required />
              </div>
              <input type="text" name="garageaddress" placeholder="Garage Address" className="input-stylish w-full" required />
            </div>

            {/* Account Security */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Account Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="password" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-stylish" required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-stylish" required />
              </div>
              {error && <p className="text-red-600 text-sm mt-2 flex items-center">{error}</p>}
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="email" name="email" placeholder="Email" className="input-stylish" required />
                <input type="tel" name="phoneno" placeholder="Phone Number" className="input-stylish" required />
              </div>
            </div>

            {/* Services Offered */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Services Offered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="specializations" placeholder="Specializations (Cars, Bikes…)" className="input-stylish" />
                <input type="text" name="availableservices" placeholder="Available Services (Repairs, Oil…)" className="input-stylish" />
              </div>
            </div>

            {/* Garage Image */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 flex flex-col items-center space-y-4">
              <label className="text-gray-700 font-medium mb-2">Upload Garage Image</label>
              <input type="file" accept="image/*" onChange={handleGarageImage} className="hidden" id="garage-upload" />
              <label htmlFor="garage-upload" className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl w-64 h-64 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all">
                {garageImage ? (
                  <img src={garageImage} alt="Garage Preview" className="w-full h-full object-cover rounded-xl shadow-md" />
                ) : (
                  <span className="text-gray-400 text-center">Click to upload or drag & drop</span>
                )}
              </label>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-3">
              <input type="checkbox" id="terms" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded mt-1" required />
              <label htmlFor="terms" className="text-sm text-gray-700">I agree to the <Link to="/terms" className="text-blue-600 hover:text-blue-500 underline">terms and conditions</Link></label>
            </div>

            {/* Submit */}
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
              Register Garage
            </button>
          </form>
        </div>
      </div>

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
          box-shadow: 0 0 8px rgba(59,130,246,0.4);
          background: #fff;
        }
      `}</style>
    </div>
  );
}
