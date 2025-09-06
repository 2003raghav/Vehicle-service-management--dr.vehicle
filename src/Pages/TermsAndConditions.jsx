export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-3xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Terms & Conditions</h1>
        <div className="space-y-4 text-gray-700">
          <p>1. You agree to provide accurate and valid information.</p>
          <p>2. Customers are responsible for their bookings and payments.</p>
          <p>3. Service providers must list only genuine services.</p>
          <p>4. The platform is not responsible for disputes between customers and providers.</p>
          <p>5. Your data will be handled according to our privacy policy.</p>
          <p>6. Misuse of the platform may result in account suspension.</p>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/new-registration"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Registration
          </a>
        </div>
      </div>
    </div>
  );
}
