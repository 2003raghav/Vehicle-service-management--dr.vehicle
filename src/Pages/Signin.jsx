import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import vehicleImg from "../assets/Components/Vehicleimg.jpg";

export default function Signin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8080/api/login", {
        username,
        password
      });

      if (response.status === 200) {
        alert("✅ Login successful!");
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("userId", response.data.id);
       

        // Dispatch custom event to notify Navbar about login
        window.dispatchEvent(new Event('userLoggedIn'));
        
        navigate("/"); // Redirect to home or dashboard
      } else {
        setError("❌ Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError("❌ Invalid username or password");
      } else {
        setError("❌ Server error, try again later");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-sm overflow-hidden p-6 border border-gray-200">
        
        {/* Top Banner Image */}
        <div className="relative">
          <img src={vehicleImg} alt="Sign In" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <h2 className="text-3xl font-bold text-white p-6 w-full drop-shadow-lg">
              Welcome Back
            </h2>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 font-medium mb-1">Username</label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold shadow transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="flex justify-between mt-4 text-sm">
          <Link to="/new-registration" className="text-success text-blue-600 hover:underline" style={{textDecoration:'none'}}>New Registration</Link>
          <Link to="/forgot-password" className="text-blue-600 hover:underline text-danger"style={{textDecoration:'none'}} >Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
}