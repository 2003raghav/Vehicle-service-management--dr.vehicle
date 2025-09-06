import vehicleImg from "../assets/Components/Vehicleimg.jpg";
import { useState } from "react";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match");
      setMessage("");
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/forgot-password?username=${username}&newPassword=${password}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        const data = await response.text();
        setMessage(data);
        setUsername("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const errorText = await response.text();
        setError(errorText);
        setMessage("");
      }
    } catch (err) {
      setError("⚠️ Server error. Please try again later.");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-sm overflow-hidden">
        <img
          src={vehicleImg}
          alt="Reset Password"
          className="w-full h-40 object-cover"
        />

        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            Reset Password
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
              required
            />

            {/* New Password */}
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
              required
            />

            {/* Confirm Password */}
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
              required
            />

            {/* Error Message */}
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

            {/* Success Message */}
            {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
