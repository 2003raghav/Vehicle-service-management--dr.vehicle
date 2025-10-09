import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-3">Contact Us</h1>
        <p className="text-gray-600 text-lg">
          We'd love to hear from you! Get in touch with us anytime.
        </p>
      </div>

      {/* Contact Info */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {[{
          icon: Phone,
          title: "Phone",
          info: "89511 30550 "
        },{
          icon: Mail,
          title: "Email",
          info: "mvjceboys@quickfix.com"
        },{
          icon: MapPin,
          title: "Location",
          info: "MVJCE Bangalore, India"
        }].map(({icon: Icon, title, info}) => (
          <div key={title} className="bg-blue-50 p-8 rounded-xl shadow-md text-center flex flex-col items-center transition hover:shadow-lg">
            <Icon className="text-blue-600 mb-4" size={32} />
            <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600">{info}</p>
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          Send us a Message
        </h2>
        <form className="grid gap-6">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full border border-gray-300 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full border border-gray-300 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          <textarea
            placeholder="Your Message"
            rows="6"
            className="w-full border border-gray-300 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          ></textarea>
          <button
            type="submit"
            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition hover:shadow-lg"
          >
            <Send size={20} /> Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
