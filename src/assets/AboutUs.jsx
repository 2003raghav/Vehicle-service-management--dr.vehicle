import { Users, Target, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-3">About Us</h1>
        <p className="text-gray-600 text-lg">
          Connecting service providers and vehicle owners with ease and trust.
        </p>
      </div>

      {/* Who We Are */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center space-x-2">
          <Briefcase size={22} className="text-blue-600" />
          <span>Who We Are</span>
        </h2>
        <p className="text-gray-600 leading-relaxed">
          QuickFix is a platform built to simplify the way vehicle owners find
          reliable service providers. We aim to create a community where trust,
          quality, and convenience come first.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-blue-600 mb-2 flex items-center space-x-2">
            <Target size={20} />
            <span>Our Mission</span>
          </h3>
          <p className="text-gray-700">
            To provide a seamless and trustworthy way for people to access
            essential services, ensuring peace of mind with every booking.
          </p>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-blue-600 mb-2 flex items-center space-x-2">
            <Users size={20} />
            <span>Our Vision</span>
          </h3>
          <p className="text-gray-700">
            To become the most reliable platform for connecting customers and
            service providers, building long-lasting relationships.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Want to know more or need assistance?
        </p>
      <Link
  to="/contactus"
  className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition"
>
  Contact Support
</Link>
      </div>
    </div>
  );
}
