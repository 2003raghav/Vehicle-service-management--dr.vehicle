import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function BookService() {
  const { id } = useParams(); // Get service ID from URL
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Mock data (replace with API fetch later)
  const service = {
    id: 1,
    name: "QuickFix Garage",
    service: "Oil Change",
    price: 30,
    slots: ["10:00 AM", "11:00 AM", "2:00 PM"],
  };

  const handleBooking = () => {
    alert(`Booked ${service.service} at ${selectedSlot}!`);
    // API call would go here
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Book Service</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">{service.name}</h2>
        <p className="my-2">{service.service} - ${service.price}</p>
        
        <div className="my-4">
          <label className="block mb-2 font-medium">Select Time Slot:</label>
          <div className="flex flex-wrap gap-2">
            {service.slots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`px-3 py-1 border rounded ${
                  selectedSlot === slot ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleBooking}
          disabled={!selectedSlot}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded disabled:bg-gray-300"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}