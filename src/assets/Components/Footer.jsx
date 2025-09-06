import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-10 text-decoration-none">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Column 1 - Logo + About */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">QuickFix</h2>
          <p className="text-sm">
            Your trusted partner for vehicle services and auto care.  
            Book, track, and manage all your services in one place.
          </p>
        </div>

        {/* Column 2 - Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 ">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-blue-400 text-decoration-none">Home</a></li>
            <li><a href="/services" className="hover:text-blue-400 text-decoration-none">Services</a></li>
            <li><a href="/signin" className="hover:text-blue-400 text-decoration-none">Provider Signup</a></li>
            <li><a href="/contact" className="hover:text-blue-400 text-decoration-none">Contact Us</a></li>
          </ul>
        </div>

        {/* Column 3 - Support */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 text-decoration-none">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/faq" className="hover:text-blue-400 text-decoration-none">FAQ</a></li>
            <li><a href="/signin" className="hover:text-blue-400 text-decoration-none">Sign In</a></li>
            <li><a href="/new-registration" className="hover:text-blue-400 text-decoration-none">Register</a></li>
            <li><a href="/forgot-password" className="hover:text-blue-400 text-decoration-none">Forgot Password</a></li>
          </ul>
        </div>

        {/* Column 4 - Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://www.facebook.com/" className="hover:text-blue-400"><Facebook /></a>
            <a href="https://x.com/i/flow/login" className="hover:text-blue-400"><Twitter /></a>
            <a href="https://www.instagram.com/___________p___k__/" className="hover:text-blue-400"><Instagram /></a>
            <a href="www.linkedin.com/in/pavan-kumar-s-n" className="hover:text-blue-400"><Linkedin /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 text-center py-4 text-sm">
        © {new Date().getFullYear()} QnA Auto. All Rights Reserved.
      </div>
    </footer>
  );
}
