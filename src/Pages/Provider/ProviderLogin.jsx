import { Link } from "react-router-dom";
import vehicleImg from "../../assets/Components/Vehicleimg.jpg";

export default function Signin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 p-6">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-md overflow-hidden border border-gray-200">
        
        {/* Top Banner */}
        <div className="relative">
          <img src={vehicleImg} alt="Sign In" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <h2 className="text-3xl font-bold text-white p-6 w-full drop-shadow-lg">
              Welcome Back
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6 md:p-8">
          <form className="space-y-6">
            
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="input-stylish"
                placeholder="Enter your username"
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
                required
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 rounded-lg font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>

          {/* Links */}
          <div className="flex justify-between mt-6 text-sm">
            <Link to="/providerSignup" className="text-purple-600 hover:underline">
              New Registration
            </Link>
            <Link to="/forgot-password" className="text-purple-600 hover:underline" style={{textDecoration:"none"}}>
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Input Style */}
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
        `}
      </style>
    </div>
  );
}