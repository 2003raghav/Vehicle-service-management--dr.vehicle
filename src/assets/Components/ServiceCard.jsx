import { Link } from 'react-router-dom';

export default function ServiceCard({ service }) {
  return (
    <div className="border p-4 rounded-lg hover:shadow-md transition">
      <div className="flex justify-between">
        <h3 className="font-bold">{service.name}</h3>
        
      </div>
      <p className="text-gray-600 my-2">{service.distance}</p>
      <div className="my-2">
        <p className="font-semibold">{service.service}</p>
        <p>Rs {service.price} • {service.duration}</p>
      </div>
      
    </div>
  );
}