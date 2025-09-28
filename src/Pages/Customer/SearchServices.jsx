import { useState } from 'react';
import ServiceCard from '../../assets/Components/ServiceCard';

const carServices = [
  { id: 1, name: "QuickFix Garage", rating: 4.5, distance: "1.2 miles", service: "Oil Change", price: 800, duration: "30 mins" },
  { id: 2, name: "ProAuto Care", rating: 4.8, distance: "0.5 miles", service: "Brake Repair", price: 1500, duration: "1 hour" },
  { id: 3, name: "Speedy Motors", rating: 4.3, distance: "2 miles", service: "Battery Replacement", price: 2500, duration: "45 mins" },
  { id: 4, name: "Auto Experts", rating: 4.6, distance: "1.8 miles", service: "Wheel Alignment", price: 1200, duration: "1 hour" },
  { id: 5, name: "City Car Care", rating: 4.4, distance: "2.5 miles", service: "AC Service", price: 2000, duration: "1.5 hours" },
  { id: 6, name: "DriveWell Garage", rating: 4.7, distance: "3 miles", service: "Tyre Replacement", price: 1800, duration: "1 hour" },
  { id: 7, name: "MotorPro Workshop", rating: 4.5, distance: "2.2 miles", service: "Engine Tune-up", price: 3000, duration: "2 hours" },
  { id: 8, name: "Elite Auto Care", rating: 4.6, distance: "1.9 miles", service: "Clutch Repair", price: 2200, duration: "1.5 hours" },
  { id: 9, name: "AutoZone Garage", rating: 4.3, distance: "2.7 miles", service: "Suspension Repair", price: 2500, duration: "2 hours" },
];

const bikeServices = [
  { id: 101, name: "BikeCare Hub", rating: 4.4, distance: "0.8 miles", service: "Oil Change", price: 400, duration: "20 mins" },
  { id: 102, name: "TwoWheelers Pro", rating: 4.7, distance: "1.5 miles", service: "Brake Pad Replacement", price: 700, duration: "30 mins" },
  { id: 103, name: "MotorCycle Fix", rating: 4.5, distance: "2 miles", service: "Battery Replacement", price: 1200, duration: "40 mins" },
  { id: 104, name: "Bike Masters", rating: 4.2, distance: "1.3 miles", service: "Chain Lubrication", price: 150, duration: "15 mins" },
  { id: 105, name: "SpeedBike Garage", rating: 4.6, distance: "2 miles", service: "Tyre Replacement", price: 600, duration: "30 mins" },
  { id: 106, name: "MotoFix Workshop", rating: 4.5, distance: "1.8 miles", service: "Engine Tune-up", price: 1800, duration: "1 hour" },
  { id: 107, name: "Urban Riders Care", rating: 4.3, distance: "2.3 miles", service: "Suspension Check", price: 500, duration: "40 mins" },
  { id: 108, name: "BikePro Services", rating: 4.7, distance: "1.2 miles", service: "Brake Cable Replacement", price: 350, duration: "20 mins" },
  { id: 109, name: "TwoWheel Garage", rating: 4.4, distance: "2.6 miles", service: "Gear Adjustment", price: 300, duration: "25 mins" },
];

export default function SearchServices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('car'); // "car" or "bike"

  const services = activeTab === 'car' ? carServices : bikeServices;

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Find Services</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-full font-semibold ${activeTab === 'car' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('car')}
        >
          Car Services
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold ${activeTab === 'bike' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('bike')}
        >
          Bike Services
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={`Search ${activeTab} services or garage...`}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button className="px-3 py-1 bg-gray-200 rounded-full">All</button>
        <button className="px-3 py-1 bg-gray-200 rounded-full">Oil Change</button>
        <button className="px-3 py-1 bg-gray-200 rounded-full">Brake Repair</button>
        <button className="px-3 py-1 bg-gray-200 rounded-full">Battery</button>
        <button className="px-3 py-1 bg-gray-200 rounded-full">Tyre</button>
        <button className="px-3 py-1 bg-gray-200 rounded-full">Engine</button>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.length ? (
          filteredServices.map((service) => <ServiceCard key={service.id} service={service} />)
        ) : (
          <p className="text-gray-500 text-center">No services found.</p>
        )}
      </div>
    </div>
  );
}
