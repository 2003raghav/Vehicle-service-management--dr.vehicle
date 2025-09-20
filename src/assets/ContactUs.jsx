import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-3">Contact Us</h1>
        <p className="text-gray-600 text-lg">
          We'd love to hear from you! Get in touch with us anytime.
        </p>
      </div>

      {/* Contact Info */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm text-center">
          <Phone className="mx-auto text-blue-600 mb-3" size={28} />
          <h3 className="font-semibold text-gray-800">Phone</h3>
          <p className="text-gray-600">+1 (555) 123-4567</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm text-center">
          <Mail className="mx-auto text-blue-600 mb-3" size={28} />
          <h3 className="font-semibold text-gray-800">Email</h3>
          <p className="text-gray-600">support@quickfix.com</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm text-center">
          <MapPin className="mx-auto text-blue-600 mb-3" size={28} />
          <h3 className="font-semibold text-gray-800">Location</h3>
          <p className="text-gray-600">123 Main St, Cityville</p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Send us a Message
        </h2>
        <form className="space-y-5">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <textarea
            placeholder="Your Message"
            rows="4"
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          ></textarea>
          <button
            type="submit"
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition"
          >
            <Send size={20} /> <span>Send Message</span>
          </button>
        </form>
      </div>
    </div>
  );
}
