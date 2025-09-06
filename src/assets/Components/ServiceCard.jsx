import { Link } from 'react-router-dom';

export default function ServiceCard({ service }) {
  return (
    <div className="border p-4 rounded-lg hover:shadow-md transition">
      <div className="flex justify-between">
        <h3 className="font-bold">{service.name}</h3>
        <span className="text-yellow-500">⭐ {service.rating}</span>
      </div>
      <p className="text-gray-600 my-2">{service.distance}</p>
      <div className="my-2">
        <p className="font-semibold">{service.service}</p>
        <p>${service.price} • {service.duration}</p>
      </div>
      <Link
        to={`/book-service/${service.id}`}
        className="inline-block mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
      >
        Book Now
      </Link>
    </div>
  );
}