import { Link } from "react-router-dom";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
            Your Vehicle's Health is Our Priority
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Connect with trusted service providers for all your vehicle
            maintenance and repair needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/services"
              className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-lg transition font-medium shadow-md hover:shadow-lg"
            >
              Find Services
            </Link>
            <Link
              to="/providerSignup"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition font-medium shadow-md hover:shadow-lg"
            >
              List Your Garage
            </Link>
          </div>
        </div>
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <img
            src="/car-pattern.svg"
            alt="car pattern"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Trusted Professionals",
                text: "All service providers are verified and rated by customers",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                ),
              },
              {
                title: "Quick Service",
                text: "Get your vehicle serviced quickly with minimal downtime",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ),
              },
              {
                title: "Fair Pricing",
                text: "Transparent pricing with no hidden costs",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                ),
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="text-center p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition bg-gray-50"
              >
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "1",
                title: "Search Services",
                text: "Find the service you need by location, vehicle type, or service type",
              },
              {
                step: "2",
                title: "Book Appointment",
                text: "Select a convenient time slot and provide vehicle details",
              },
              {
                step: "3",
                title: "Get Your Vehicle Serviced",
                text: "A professional technician will service your vehicle at the chosen time",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center p-8 rounded-xl bg-white shadow-md hover:shadow-xl hover:-translate-y-2 transition"
              >
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              {
                text: `"Found a great mechanic nearby who fixed my brake issue same day. The pricing was fair and the service was excellent!"`,
                name: "Sarah Johnson",
              },
              {
                text: `"As a garage owner, this platform has helped me connect with so many new customers. The booking system is easy to use and manage."`,
                name: "Mike's Auto Repair",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {[...Array(5)].map((_, j) => (
                      <svg
                        key={j}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{t.text}</p>
                <p className="font-medium">- {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join thousands of satisfied customers and service providers today.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/services"
              className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-lg transition font-medium shadow-md hover:shadow-lg"
            >
              Find Services
            </Link>
            <Link
              to="/providerSignup"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition font-medium shadow-md hover:shadow-lg"
            >
              List Your Garage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}