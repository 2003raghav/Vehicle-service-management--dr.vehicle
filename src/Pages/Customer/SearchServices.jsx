import { useState } from 'react';
import ServiceCard from '../../assets/Components/ServiceCard';

const mockServices = [
  {
    id: 1,
    name: "QuickFix Garage",
    rating: 4.5,
    distance: "1.2 miles",
    service: "Oil Change",
    price: 30,
    duration: "30 mins",
  },
  {
    id: 2,
    name: "ProAuto Care",
    rating: 4.8,
    distance: "0.5 miles",
    service: "Brake Repair",
    price: 80,
    duration: "1 hour",
  },
];

export default function SearchServices() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = mockServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Find Services</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by garage or service..."
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button className="px-3 py-1 bg-gray-200 rounded-full">All</button>
        <button className="px-3 py-1 bg-gray-200 rounded-full">Oil Change</button>
        <button className="px-3 py-1 bg-gray-200 rounded-full">Repairs</button>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}