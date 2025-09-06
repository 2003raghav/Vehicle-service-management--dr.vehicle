import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react"; // icons

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left - Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 text-decoration-none">
            QuickFix
          </Link>

          {/* Middle - Search Bar (desktop only) */}
          <div className="hidden md:flex flex-1 mx-6">
            <input
              type="text"
              placeholder="Search services, vehicles, bookings..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* Right - Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition text-decoration-none">
              Home
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-blue-600 transition text-decoration-none">
              Services
            </Link>
            <Link to="/provider/dashboard" className="text-gray-700 hover:text-blue-600 transition text-decoration-none">
              Providers
            </Link>
            <Link to="/signin" className="text-gray-700 hover:text-blue-600 transition text-decoration-none">
              Sign In
            </Link>

            {/* Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full border-2 border-gray-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg py-2 border text-decoration-none text-decoration-none">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-decoration-none"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-decoration-none"
                  >
                    Settings
                  </Link>
                  <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-decoration-none">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Buttons */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Search Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <Search size={22} />
            </button>

            {/* Hamburger Menu */}
            <button
              className="text-gray-700"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {isMobileSearchOpen && (
        <div className="md:hidden bg-white px-4 py-3 shadow-md">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      )}

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white shadow-md px-4 pb-4 space-y-3">
          <Link to="/" className="block text-gray-700 hover:text-blue-600 text-decoration-none">
            Home
          </Link>
          <Link to="/searchservices" className="block text-gray-700 hover:text-blue-600 text-decoration-none">
            Services
          </Link>
          <Link to="/provider/dashboard" className="block text-gray-700 hover:text-blue-600 text-decoration-none">
            Providers
          </Link>
          <Link to="/profile" className="block text-gray-700 hover:text-blue-600 text-decoration-none">
            Profile
          </Link>
          <Link to="/signin" className="block text-gray-700 hover:text-blue-600 text-decoration-none">
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
}
