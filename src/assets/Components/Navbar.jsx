import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { 
  Menu, X, Search, Home, Wrench, User, LogIn, Info, 
  HelpCircle, Phone, Settings, LogOut, FilePen 
} from "lucide-react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userImage, setUserImage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [imageError, setImageError] = useState(false);

  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Check login status and fetch user data
  useEffect(() => {
    const checkLoginStatus = () => {
      const username = localStorage.getItem("username");
      const name = localStorage.getItem("name");
      
      if (username) {
        setIsLoggedIn(true);
        fetchUserData(username, name);
      } else {
        setIsLoggedIn(false);
        setUserImage(null);
        setUserData(null);
      }
    };

    // Check initially
    checkLoginStatus();

    // Listen for storage changes and custom events
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    const handleLoginEvent = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleLoginEvent);
    window.addEventListener('userLoggedOut', handleLoginEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
      window.removeEventListener('userLoggedOut', handleLoginEvent);
    };
  }, []);

  // Handle click outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUserData = async (username, name) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${username}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        
        // Try to get user image
        if (data.id) {
          // Try user image from database endpoint
          setUserImage(`http://localhost:8080/api/user-images/${data.id}`);
        } else if (data.imageName) {
          // Try image from file system
          setUserImage(`http://localhost:8080/api/images/${encodeURIComponent(data.imageName)}`);
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMobileSearchOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserImage(null);
    setUserData(null);
    setImageError(false);
    setIsProfileOpen(false);
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('userLoggedOut'));
    navigate("/signin");
  };

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/services", label: "Services", icon: Wrench },
    { to: "/provider/dashboard", label: "Providers", icon: User },
  ];

  const sidebarLinks = [
    { to: "/aboutus", label: "About Us", icon: Info },
    { to: "/contactus", label: "Contact Support", icon: Phone },
    { to: "/faq", label: "FAQ", icon: HelpCircle },
    { to: "/feedback", label: "Feedback", icon: FilePen },
  ];

  const cleanLink = "link-clean no-underline hover:no-underline focus:no-underline active:no-underline visited:no-underline";

  // Get user initials for fallback avatar
  const getUserInitials = () => {
    if (userData?.name) {
      return userData.name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    const username = localStorage.getItem("username");
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  // Get user display name
  const getUserDisplayName = () => {
    return userData?.name || localStorage.getItem("name") || "User";
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <style>{`
        .link-clean, .link-clean:hover, .link-clean:focus, .link-clean:active, .link-clean:visited { 
          text-decoration: none !important; 
        }
        .avatar-fallback {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Left: Logo & Menu */}
            <div className="flex items-center">
              <button
                className="text-gray-700 mr-3 hover:text-blue-600 transition p-2 rounded-lg hover:bg-blue-50"
                onClick={toggleSidebar}
              >
                <Menu size={28} />
              </button>
              <Link
                to="/"
                className={`${cleanLink} text-2xl font-bold text-blue-600 hover:text-blue-700 transition hover:scale-105`}
              >
                QuickFix
              </Link>
            </div>

            {/* Middle: Search bar */}
            <div className="hidden md:flex flex-1 mx-6 max-w-xl">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
              />
            </div>

            {/* Right: Desktop links & profile */}
            <div className="hidden md:flex space-x-4 items-center">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`${cleanLink} text-gray-700 hover:text-blue-600 font-medium transition px-4 py-2 rounded-lg hover:bg-blue-50 hover:shadow-sm`}
                >
                  {label}
                </Link>
              ))}

              {/* Profile dropdown - Only show when logged in */}
              {isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    {userImage && !imageError ? (
                      <img
                        src={userImage}
                        alt={`Profile picture of ${getUserDisplayName()}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                        onError={handleImageError}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full avatar-fallback">
                        {getUserInitials()}
                      </div>
                    )}
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white shadow-xl rounded-xl py-3 border border-gray-100 animate-fadeIn">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800 truncate">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {userData?.email || localStorage.getItem("username")}
                        </p>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className={`${cleanLink} flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-md mx-2`}
                        >
                          <User size={18} />
                          <span>My Profile</span>
                        </Link>
                        
                        <Link
                          to="/bookappointment"
                          onClick={() => setIsProfileOpen(false)}
                          className={`${cleanLink} flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-md mx-2`}
                        >
                          <Wrench size={18} />
                          <span>Book Service</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all rounded-md mx-2 cursor-pointer"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Show login button when not logged in
                <Link
                  to="/signin"
                  className={`${cleanLink} bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm hover:shadow-md flex items-center space-x-2`}
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile search */}
            <div className="md:hidden flex items-center space-x-3">
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition"
              >
                <Search size={22} />
              </button>
            </div>
          </div>
        </div>

        {isMobileSearchOpen && (
          <div className="md:hidden bg-white px-4 py-3 shadow-inner">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
            />
          </div>
        )}
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl rounded-r-2xl border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-blue-50 rounded-tr-2xl">
          <h2 className="text-lg font-bold text-blue-600 tracking-wide">QuickFix Menu</h2>
          <button
            onClick={closeSidebar}
            className="text-gray-600 hover:text-red-500 transition p-1 rounded-full hover:bg-red-50"
          >
            <X size={26} />
          </button>
        </div>

        {/* User info in sidebar when logged in */}
        {isLoggedIn && (
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden">
                {userImage && !imageError ? (
                  <img
                    src={userImage}
                    alt={`Profile picture of ${getUserDisplayName()}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full avatar-fallback">
                    {getUserInitials()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate text-sm">
                  {getUserDisplayName()}
                </p>
                <p className="text-gray-600 truncate text-xs">
                  {userData?.email || localStorage.getItem("username")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-2">
          {sidebarLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={closeSidebar}
              className={`${cleanLink} flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md hover:translate-x-1`}
            >
              <Icon size={20} /> <span className="font-medium">{label}</span>
            </Link>
          ))}

          {isLoggedIn ? (
            <button
              onClick={() => {
                handleLogout();
                closeSidebar();
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md hover:translate-x-1 cursor-pointer"
            >
              <LogOut size={20} /> <span className="font-medium">Logout</span>
            </button>
          ) : (
            <Link
              to="/signin"
              onClick={closeSidebar}
              className={`${cleanLink} flex items-center space-x-3 px-4 py-3 rounded-xl text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700 transition-all duration-200 shadow-sm hover:shadow-md hover:translate-x-1`}
            >
              <LogIn size={20} /> <span className="font-medium">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm"
        ></div>
      )}

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t flex justify-around items-center py-3 md:hidden z-50">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`${cleanLink} flex flex-col items-center text-gray-700 hover:text-blue-600 transition p-2 rounded-lg hover:bg-blue-50`}
          >
            <Icon size={22} />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
        
        {/* Mobile profile link when logged in */}
        {isLoggedIn && (
          <Link
            to="/profile"
            className={`${cleanLink} flex flex-col items-center text-gray-700 hover:text-blue-600 transition p-2 rounded-lg hover:bg-blue-50`}
          >
            <User size={22} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        )}
      </div>
    </>
  );
}