import { Routes, Route } from 'react-router-dom';
import Navbar from './assets/Components/Navbar';
import Footer from './assets/Components/Footer';

import Homepage from './assets/Components/Homepage';
import Signin from './Pages/Signin';
import ForgotPassword from './Pages/ForgotPassword';
import NewRegistration from './Pages/NewRegistration';
import AddService from './Pages/Provider/AddService';
import ProviderDashboard from './Pages/Provider/Dashboard';
import BookService from './Pages/Customer/BookService';
import SearchServices from './Pages/Customer/SearchServices';
import TermsAndConditions from './Pages/TermsAndConditions';
import ProfilePage from './Pages/ProfilePage';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes> 
          <Route path="/" element={<Homepage />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/new-registration" element={<NewRegistration />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/provider/add-service" element={<AddService />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/book-service/:id" element={<BookService />} />
          <Route path="/services" element={<SearchServices />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
