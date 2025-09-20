import { Moon, Sun, Bell, Shield, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";


export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-3">Settings</h1>
        <p className="text-gray-600 text-lg">
          Customize your QuickFix experience.
        </p>
      </div>

      {/* Settings Options */}
      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <User className="text-blue-600" size={22} />
            <span className="font-medium text-gray-800">Profile</span>
          </div>
          <Link to="/profile">
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Edit
          </button>
          </Link>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Bell className="text-blue-600" size={22} />
            <span className="font-medium text-gray-800">Notifications</span>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition ${
              notifications
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {notifications ? "On" : "Off"}
          </button>
        </div>

        {/* Dark Mode */}
        <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {darkMode ? (
              <Moon className="text-blue-600" size={22} />
            ) : (
              <Sun className="text-blue-600" size={22} />
            )}
            <span className="font-medium text-gray-800">Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition ${
              darkMode
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {darkMode ? "On" : "Off"}
          </button>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="text-blue-600" size={22} />
            <span className="font-medium text-gray-800">Privacy & Security</span>
          </div>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Manage
          </button>
        </div>

        {/* Logout */}
        <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <LogOut className="text-red-500" size={22} />
            <span className="font-medium text-gray-800">Logout</span>
          </div>
          <button className="text-red-600 hover:text-red-800 font-medium">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
