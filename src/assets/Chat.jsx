import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm your vehicle service assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef(null);

  // Responses
  const serviceResponses = {
    greeting: [
      "Hello! How can I assist with your vehicle today?",
      "Hi there! What can I help you with?",
      "Welcome! How may I assist with your automotive needs?",
    ],
    oil: [
      "For an oil change, we recommend every 5,000 miles or 6 months.",
      "Most vehicles need an oil change every 5,000–7,500 miles. What's your vehicle make?",
      "Regular oil changes help extend engine life. Specials start at $39.99!",
    ],
    brake: [
      "Brake service is crucial for safety. Squeaking means inspection is due.",
      "Most brakes need service every 25,000–50,000 miles.",
      "We offer free brake inspections. Want to book one?",
    ],
    tire: [
      "Rotate tires every 6,000–8,000 miles for even wear.",
      "Proper tire pressure improves fuel efficiency. Check your owner's manual.",
      "We carry all major tire brands. What type of vehicle do you have?",
    ],
    appointment: [
      "I can help you schedule. What day works best?",
      "We have openings this week. What service do you need?",
      "Let me check availability. What's your preferred date and time?",
    ],
    pricing: [
      "Prices vary by service and vehicle. Could you specify?",
      "We offer competitive pricing. Many services start under $50.",
      "Give me your vehicle details and service type, I'll estimate it.",
    ],
    default: [
      "I'm not sure I understand. Could you provide more details?",
      "I specialize in vehicle services. How can I help with your car, truck, or SUV?",
      "Let me connect you with a human specialist who can assist better.",
    ],
  };

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Bot response
  const simulateBotResponse = (userMessage) => {
    setIsTyping(true);
    let responseType = "default";
    const lower = userMessage.toLowerCase();

    if (["hello", "hi", "hey"].some((w) => lower.includes(w)))
      responseType = "greeting";
    else if (lower.includes("oil") || lower.includes("lube"))
      responseType = "oil";
    else if (lower.includes("brake")) responseType = "brake";
    else if (lower.includes("tire") || lower.includes("wheel"))
      responseType = "tire";
    else if (
      lower.includes("appointment") ||
      lower.includes("schedule") ||
      lower.includes("book")
    )
      responseType = "appointment";
    else if (
      lower.includes("price") ||
      lower.includes("cost") ||
      lower.includes("how much")
    )
      responseType = "pricing";

    setTimeout(() => {
      const responses = serviceResponses[responseType];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: randomResponse,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  // Send message
  const handleSend = (text = input) => {
    if (!text.trim()) return;
    const userMessage = {
      id: messages.length + 1,
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    simulateBotResponse(text);
  };

  const quickReplies = [
    "Oil change",
    "Brake service",
    "Tire rotation",
    "Schedule appointment",
    "Pricing info",
  ];

  const handleQuickReply = (text) => handleSend(text);

  return (
    <>
{/* Floating Button */}
{!isOpen && (
  <button
    onClick={() => setIsOpen(true)}
    className="fixed bottom-4 right-4 bg-gradient-to-br from-cyan-400 to-blue-600 text-white p-3 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 z-50 flex items-center justify-center group"
    style={{
      clipPath:
        "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)",
    }}
    aria-label="Open chat"
  >
    {/* Modern chat bubble icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-white group-hover:text-cyan-100 transition-colors duration-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.958 9.958 0 01-4.91-1.32L3 21l1.32-4.91A9.958 9.958 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>

    {/* Pulsing ring effect */}
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></span>
    </span>
  </button>
)}

      {/* Chat Window */}
      {isOpen && (
  <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] flex flex-col border-0 rounded-3xl shadow-2xl bg-white z-50 overflow-hidden transform transition-transform duration-300 scale-100">
          {/* Header with gradient */}
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center">
  <div className="flex items-center">
    <div className="bg-white p-1 rounded-full mr-2">
      <Bot size={16} className="text-blue-600" />
    </div>
    <div>
      <h5 className="font-semibold text-sm">Assistant</h5>
      <p className="text-xs text-blue-100">Online • Ready to help</p>
    </div>
  </div>
  <button 
    onClick={() => setIsOpen(false)}
    className="text-white hover:text-blue-200 transition-colors"
  >
    <X size={18} />
  </button>
</div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`mb-4 flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl flex items-start ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                      : "bg-white text-gray-800 shadow-sm rounded-bl-none"
                  }`}
                >
                  {m.sender === "bot" && (
                    <Bot size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                  )}
                  {m.sender === "user" && (
                    <User size={16} className="text-blue-200 mt-1 mr-2 flex-shrink-0" />
                  )}
                  <div>
                    <p>{m.text}</p>
                    <div
                      className={`text-xs mt-2 ${
                        m.sender === "user" ? "text-blue-200" : "text-gray-500"
                      }`}
                    >
                      {m.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center">
                  <Bot size={16} className="text-blue-500 mr-2" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
         <div className="px-2 py-1 bg-gray-100 border-t border-gray-200 flex flex-wrap gap-1">
  {quickReplies.map((reply, i) => (
    <button
      key={i}
      onClick={() => handleQuickReply(reply)}
      className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-50 transition-colors shadow-sm hover:shadow"
    >
      {reply}
    </button>
  ))}
</div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-gray-200 flex items-center bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-r-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}