import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Search, Home, Wrench, User, LogIn, Info, HelpCircle, Phone, Settings, LogOut, } from "lucide-react";
import SearchBar from "./SearchBar";

export default function Navbar() { 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMobileSearchOpen(false);
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/services", label: "Services", icon: Wrench },
    { to: "/provider/dashboard", label: "Providers", icon: User },
    { to: "/signin", label: "Sign In", icon: LogIn },
  ];

  const sidebarLinks = [
    { to: "/aboutus", label: "About Us", icon: Info },
    { to: "/contactus", label: "Contact Support", icon: Phone },
    { to: "/faq", label: "FAQ", icon: HelpCircle },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const cleanLink = "link-clean no-underline hover:no-underline focus:no-underline active:no-underline visited:no-underline";

  return (
    <>
      <style>{`.link-clean, .link-clean:hover, .link-clean:focus, .link-clean:active, .link-clean:visited 
      { text-decoration: none !important; }`}</style>

      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                className="text-gray-700 mr-3 hover:text-blue-600 transition p-2 rounded-lg hover:bg-blue-50"
                onClick={toggleSidebar}
              >
                <Menu size={28} />
              </button>
              &nbsp;&nbsp;&nbsp;
              <Link
                to="/"
                className={`${cleanLink} text-2xl font-bold text-blue-600 hover:text-blue-700 transition hover:scale-105`}
              >
                QuickFix
              </Link>
            </div>

            <div className="hidden md:flex flex-1 mx-6 max-w-xl">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
              />
            </div>

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

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                    alt="Profile"
                    className="w-full h-full object-cover hover:scale-110 transition-transform"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg py-2 border animate-fadeIn border-gray-100">
                    <Link
                      to="/profile"
                      className={`${cleanLink} block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-md mx-2`}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className={`${cleanLink} block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-md mx-2`}
                    >
                      Settings
                    </Link>
                    <button className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all rounded-md mx-2">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

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

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl rounded-r-2xl border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-blue-50 rounded-tr-2xl">
          <h2 className="text-lg font-bold text-blue-600 tracking-wide">
            QuickFix Menu
          </h2>
          <button
            onClick={closeSidebar}
            className="text-gray-600 hover:text-red-500 transition p-1 rounded-full hover:bg-red-50"
          >
            <X size={26} />
          </button>
        </div>

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

          <button className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md hover:translate-x-1">
            <LogOut size={20} /> <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm"
        ></div>
      )}

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
      </div>
    </>
  );
}