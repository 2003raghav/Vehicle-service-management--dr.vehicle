import React, { useEffect, useState } from "react";
import { Wrench, Phone, User, Info } from "lucide-react";

export default function ListGarage() {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const response = await fetch("http://localhost:8080/provider/providerList"); // update backend URL
        if (!response.ok) throw new Error("Failed to fetch garages");
        const data = await response.json();
        setGarages(data);
      } catch (error) {
        console.error(error);
        setGarages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGarages();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading garages...</p>;
  }

  if (garages.length === 0) {
    return <p className="text-center mt-10 text-gray-500">No garages available.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">All Garages</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {garages.map((garage) => (
          <div
            key={garage.id}
            className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl hover:scale-105 transition transform duration-300 flex flex-col space-y-3"
          >
            {/* Garage Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {garage.garagename || "Data not given"}
              </h3>
              <Wrench className="text-blue-500" size={24} />
            </div>

            {/* Owner info */}
            <p className="text-gray-600 flex items-center gap-2">
              <User size={18} /> {garage.ownername || "Data not given"}
            </p>

            {/* Contact info */}
            <p className="text-gray-600 flex items-center gap-2">
              <Phone size={18} /> {garage.phoneno || "Data not given"}
            </p>
            <p className="text-gray-600 flex items-center gap-2">
              <Info size={18} /> {garage.email || "Data not given"}
            </p>

            {/* Garage details */}
            <p className="text-gray-700">
              <span className="font-semibold">Specializations:</span>{" "}
              {garage.specializations || "Data not given"}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Services:</span>{" "}
              {garage.availableservices || "Data not given"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
