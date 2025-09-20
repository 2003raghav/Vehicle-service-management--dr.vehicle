import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How do I book a service?",
    answer:
      "Simply search for a nearby garage, choose the service you need, and confirm your booking in just a few clicks.",
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer:
      "Yes, you can cancel or reschedule your booking from your profile under 'My Bookings' at least 24 hours before the scheduled time.",
  },
  {
    question: "Is payment secure?",
    answer:
      "Absolutely! All payments are encrypted and processed securely through trusted payment gateways.",
  },
  {
    question: "Do I need an account to book a service?",
    answer:
      "Yes, having an account ensures that your bookings, preferences, and history are safely stored.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <HelpCircle className="mx-auto text-blue-600 mb-4" size={40} />
        <h1 className="text-4xl font-bold text-blue-600 mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 text-lg">
          Find quick answers to common questions.
        </p>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center text-left"
            >
              <span className="font-medium text-gray-800 text-lg">
                {faq.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className="text-blue-600" size={22} />
              ) : (
                <ChevronDown className="text-gray-500" size={22} />
              )}
            </button>
            {openIndex === index && (
              <p className="mt-4 text-gray-600 border-t pt-4">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
