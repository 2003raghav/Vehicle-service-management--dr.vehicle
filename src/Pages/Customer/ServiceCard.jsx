export default function ServiceCard({ service }) {
  // Format price as ₹ with commas (e.g., ₹2,500 instead of ₹2500)
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(service.price);

  return (
    <div className="border p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition">
      <div>
        <h2 className="text-xl font-bold">{service.name}</h2>
        <p className="text-gray-600">{service.service}</p>
        <p className="text-sm text-gray-500">{service.distance} • {service.duration}</p>
        <p className="text-sm text-yellow-600">⭐ {service.rating}</p>
      </div>
      <div>
        {/* Display formatted Indian Rupee price */}
        <p className="text-lg font-semibold text-green-600">{formattedPrice}</p>
      </div>
    </div>
  );
}
