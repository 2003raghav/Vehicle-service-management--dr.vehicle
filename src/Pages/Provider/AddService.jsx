import { useState } from "react";

export default function AddService() {
  const [service, setService] = useState({
    name: "",
    price: "",
    duration: "30 mins",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Service added:", service);
    alert("Service published successfully!");
    setService({ name: "", price: "", duration: "30 mins", description: "" });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">ADD NEW SERVICE</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Service Name"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={service.name}
          onChange={(e) => setService({ ...service, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price ($)"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={service.price}
          onChange={(e) => setService({ ...service, price: e.target.value })}
          required
        />
        <select
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={service.duration}
          onChange={(e) => setService({ ...service, duration: e.target.value })}
        >
          <option>30 mins</option>
          <option>1 hour</option>
          <option>2 hours</option>
        </select>
        <textarea
          placeholder="Description"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={service.description}
          onChange={(e) => setService({ ...service, description: e.target.value })}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition"
        >
          Publish Service
        </button>
      </form>
    </div>
  );
}