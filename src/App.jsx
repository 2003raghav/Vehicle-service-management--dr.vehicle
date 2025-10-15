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
import AboutUs from './assets/AboutUs';
import ContactUs from './assets/ContactUs';
import SettingsPage from './assets/SettingsPage';
import FAQPage from './assets/FAQPage';
import Chat from './assets/Chat';
import ProviderSignup from './Pages/Provider/ProviderSignup';
import ProviderLogin from './Pages/Provider/ProviderLogin';
import FeedbackForm from './assets/FeedbackForm';
import VehicleStatusDashboard from './Pages/Customer/VehicleStatusDashboard';
import ListGarage from './assets/Components/ListGarage';
import Bookappointment from './Pages/Customer/Bookappointment';
import ProviderForgotPassword from './Pages/Provider/ProviderForgotPassword';
import Providerprofile from './Pages/Provider/Providerprofile';
import Customerbooking from './Pages/Customer/Customerbooking';
import Editprofile from './Pages/Customer/Editprofile';
import ProviderEditProfile from './Pages/Provider/ProviderEditProfile';
import SearchResults from './assets/SearchResults';
import BillingPage from './Pages/BillingPage';
import Payment from './Pages/Provider/Payment';

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
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/providerSignup" element={<ProviderSignup />} />
          <Route path="/providerLogin" element={<ProviderLogin />} />
          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/serviceStatus" element={<VehicleStatusDashboard />} />
          <Route path="/listgarage" element={<ListGarage />} />
          <Route path="/bookappointment" element={<Bookappointment />} />
          <Route path='provider/forget-password' element={<ProviderForgotPassword />} />
          <Route path='/provider/profile' element={<Providerprofile />} />
          <Route path='provider/bookings' element={<Customerbooking/>}/>
          <Route path='/edit-profile' element={<Editprofile  />} />
          <Route path='provider/edit-profile' element={<ProviderEditProfile />} />
          <Route path="/search" element={<SearchResults/>} />
          <Route path="/billing/:id" element={<BillingPage />} />
          <Route path='/payment-methods'element={<Payment />} />
        
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />      
        </Routes>
        <Chat />
      </main>
      <Footer />
    </div>
  );
}