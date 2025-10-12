import { useState } from "react";
import { User, Mail, MessageSquare, ChevronDown, CheckCircle2 } from "lucide-react";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Example Spring Boot endpoint
      const response = await fetch("http://localhost:8080/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", feedback: "", category: "General" });
      } else {
        console.error("Failed to submit feedback");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-xl border border-gray-200 transition-all hover:shadow-blue-200/60 hover:scale-[1.01]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 rounded-t-2xl shadow-inner">
          <h2 className="text-3xl font-bold text-white text-center tracking-wide">
            Share Your Feedback 💬
          </h2>
          <p className="text-blue-100 text-center mt-1 text-sm">
            We value your input to make QuickFix better.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <ChevronDown className="w-5 h-5 mr-2 text-blue-600" />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
            >
              <option>General</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>Provider Service</option>
              <option>Other</option>
            </select>
          </div>

          {/* Feedback */}
          <div>
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Feedback
            </label>
            <textarea
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Write your feedback here..."
              required
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-blue-300/50"
          >
            Submit Feedback
          </button>
        </form>

        {/* Success Message */}
        {submitted && (
          <div className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-600 font-medium border-t border-green-200">
            <CheckCircle2 className="w-5 h-5" />
            Feedback submitted successfully! 🎉
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        .input-field {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          background: #f9fafb;
          transition: all 0.3s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 8px rgba(37, 99, 235, 0.3);
          background: #fff;
        }
      `}</style>
    </div>
  );
}
