import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import vehicleImg from "../../assets/Components/Vehicleimg.jpg";

export default function Signin() {
  const navigate = useNavigate();

  const [ownername, setOwnername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await axios.post("http://localhost:8080/provider/login", {
      ownername,
      password
    });

          if (response.status === 200) {
            // ✅ Store login status in localStorage
            localStorage.setItem("providerLoggedIn", "true");
             // ✅ Store ownername for profile fetching
            localStorage.setItem("providerOwnername", ownername);
            localStorage.setItem("providerId", response.data.id.toString());
            localStorage.setItem("providerName", response.data.garageName);
            localStorage.setItem("provider", JSON.stringify(response.data));

            alert("✅ Login successful!");
            navigate("/provider/Dashboard"); // corrected route
          } else {
            setError("❌ Invalid credentials");
          }
        } catch (err) {
          console.error(err);
          if (err.response && err.response.status === 401) {
            setError("❌ Invalid ownername or password");
          } else {
            setError("❌ Server error, try again later");
          }
        }
      };


  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md overflow-hidden border border-gray-200">

        {/* Top Banner */}
        <div className="relative">
          <img src={vehicleImg} alt="Sign In" className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <h2 className="text-3xl font-bold text-white p-6 w-full drop-shadow-lg">
              Welcome Back
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 md:p-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ownername */}
            <div>
              <label htmlFor="ownername" className="block text-sm font-medium text-gray-700 mb-1">
                Ownername
              </label>
              <input
                id="ownername"
                type="text"
                className="input-stylish"
                placeholder="Enter your username"
                value={ownername}
                onChange={(e) => setOwnername(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-stylish"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>

          {/* Links */}
          <div className="flex justify-between mt-6 text-sm">
            <Link to="/providerSignup" className="text-blue-600 hover:text-blue-500 text-success" style={{textDecoration:"none"}}>
              New Registration
            </Link>
            <Link to="/provider/forget-password" className="text-blue-600 hover:text-blue-500 text-danger" style={{textDecoration:"none"}}>
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Input Style */}
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
