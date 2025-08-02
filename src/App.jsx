import { Menus, getMenuByName, services } from "./meta/menu";
import Logo from "./assets/logo.webp";
import DesktopMenu from "./components/common/DesktopMenu";
import MobMenu from "./components/common/MobMenu";
import Footer from './components/common/Footer';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import InspectionsPage from "./pages/InspectionsPage";
import PricingPage from "./pages/PricingPage";
import NewsFeedPage from "./pages/NewsFeedPage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage";
import SlotsSelectionPage from "./pages/SlotsSelectionPage";
import BookingFormPage from "./pages/BookingFormPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import AppointmentPage from "./pages/AppointmentPage";
import OrderFormPage from "./pages/OrderFormPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderPage from "./pages/OrderPage";
import StatusPage from "./pages/StatusPage";
import CategorySelectionPage from "./pages/CategorySelectionPage";
import ItemSelectionPage from "./pages/ItemSelectionPage";
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import { GlobalDataProvider, useGlobalData } from "./components/contexts/GlobalDataContext";
import { RestProvider } from "./components/contexts/RestContext";
import { WebSocketProvider } from "./components/contexts/WebSocketContext";
import { useEffect, useState } from "react";
import { companyName } from "./meta/companyData";
// import ChatBox from "./components/ChatBox";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path={getMenuByName("Home").path} element={<HomePage />} />
      <Route path={getMenuByName("Inspections").path} element={<InspectionsPage />} />
      {
        services.map(service => (
          <Route
            key={service.name}
            path={`${getMenuByName("Plans & Pricing").path}${service.subpath}`}
            element={
              service.name === "Accessories" 
                ? <CategorySelectionPage />
                : <PricingPage serviceId={service.id} />
            }
          />
          ))
        }
        <Route path={getMenuByName("NewsFeed").path} element={<NewsFeedPage />} />
        <Route path={getMenuByName("About Us").path} element={<AboutUsPage />} />
        {
          getMenuByName("More").subMenu.map(subMenu => (
            <Route
              key={subMenu.name}
              path={`${getMenuByName("More").path}${subMenu.subpath}`}
              element={subMenu.name === "Contact Us" ? <ContactUsPage /> : <div>{subMenu.name} Page</div>}
            />
          ))
        }
        <Route path="booking-form" element={<BookingFormPage />} />
        <Route path="slot-selection" element={<SlotsSelectionPage />} />
        <Route path="booking-confirmation" element={<BookingConfirmationPage />} />
        <Route path="appointment/:referenceNumber" element={<AppointmentPage />} />
        <Route path="order-form" element={<OrderFormPage />} />
        <Route path="order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="order/:referenceNumber" element={<OrderPage />} />
        <Route path="status" element={<StatusPage />} />
        <Route path="accessories/categories" element={<CategorySelectionPage />} />
        <Route path="accessories/items" element={<ItemSelectionPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="payment/:type/:referenceNumber" element={<PaymentPage />} />
        <Route path="payment/success" element={<PaymentSuccessPage />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
  );
}

function AppContent() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { orderFormData } = useGlobalData();
  const [cartItemCount, setCartItemCount] = useState(0);
  
  useEffect(() => {
    if (orderFormData && orderFormData.items && orderFormData.items.length > 0) {
      setCartItemCount(orderFormData.items.length);
    } else {
      setCartItemCount(0);
    }
  }, [orderFormData]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10); // adjust sensitivity if needed
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
        <header
          className={`h-15 text-[15px] fixed top-0 left-0 right-0 z-[999] transition-all duration-300 pt-3 ${
            scrolled
              ? "bg-zinc-900/40 backdrop-blur-md shadow-md text-white"
              : "bg-transparent text-white"
          }`}
        >
          <nav className="px-3.5 flex-center-between w-full max-w-7xl mx-auto">
            <div className="flex-center gap-x-3 z-[10] relative" onClick={() => window.location.href = '/'}>
              <img src={Logo} alt="" className="size-8" />
              {cartItemCount === 0 ? (
                <>
                  <h3 className="text-lg font-semibold block md:hidden">{ companyName.split(" ").slice(0,2).join(" ") }</h3>
                  <h3 className="text-lg font-semibold hidden md:block">{ companyName }</h3>
                </>
              ) : null}
            </div>

            <ul className="gap-x-1 hidden lg:flex lg:items-center">
              {Menus.map((menu) => (
                <DesktopMenu menu={menu} key={menu.name} />
              ))}
            </ul>
            <div className="flex-center gap-x-5">
              {cartItemCount > 0 && (
                <button
                  aria-label="cart"
                  onClick={() => window.location.href = '/cart'}
                  className="bg-white/5 relative px-3 py-1.5 shadow rounded-xl flex-center font-semibold hover:bg-highlight-primary hover:text-text-tertiary transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                  Cart
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-highlight-primary text-white rounded-full flex items-center justify-center text-xs">
                    {cartItemCount}
                  </span>
                </button>
              )}
              <button
                aria-label="inspection-progress"
                onClick={() => window.location.href = '/status'}
                className="bg-white/5 relative px-3 py-1.5 shadow rounded-xl flex-center font-semibold hover:bg-highlight-primary hover:text-text-tertiary transition"
              >
                Check Status
              </button>
              <div className="lg:hidden">
                <MobMenu Menus={Menus} />
              </div>
            </div>
          </nav>
        </header>
        
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        
        <Footer />
    </div>
  );
}

export default function App() {
  return (
    <GlobalDataProvider>
      <RestProvider>
        <WebSocketProvider>
          <AppContent />
        </WebSocketProvider>
      </RestProvider>
    </GlobalDataProvider>
  );
}
