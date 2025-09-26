import { useState } from "react";
import {
  User,
  Mail,
  MessageSquare,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
    category: "General",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Feedback submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", feedback: "", category: "General" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 p-6">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-pink-600">
          <h2 className="text-2xl font-bold text-white text-center">
            Feedback Form
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-stylish"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <Mail className="w-5 h-5 mr-2 text-purple-600" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-stylish"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <ChevronDown className="w-5 h-5 mr-2 text-purple-600" />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-stylish"
            >
              <option>General</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>Other</option>
            </select>
          </div>

          {/* Feedback */}
          <div>
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
              Feedback
            </label>
            <textarea
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              rows="4"
              className="input-stylish"
              placeholder="Write your feedback..."
              required
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 rounded-lg font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Submit Feedback
          </button>
        </form>

        {submitted && (
          <div className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-600 font-medium border-t border-green-200">
            <CheckCircle2 className="w-5 h-5" />
            Feedback submitted successfully!
          </div>
        )}
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