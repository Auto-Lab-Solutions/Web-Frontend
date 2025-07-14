import { Menus, getMenuByName, services } from "./utils/menu";
import Logo from "./assets/logo.webp";
import DesktopMenu from "./components/common/DesktopMenu";
import MobMenu from "./components/common/MobMenu";
import Footer from './components/common/Footer';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import InspectionsPage from "./pages/InspectionsPage";
import PricingPage from "./pages/PricingPage";
import NewsFeedPage from "./pages/NewsFeedPage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage";
import SlotsSelectionPage from "./pages/SlotsSelectionPage";
import BookingFormPage from "./pages/BookingFormPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import { FormDataProvider } from "./components/FormDataContext";
import { useEffect, useState } from "react";
// import ChatBox from "./components/ChatBox";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        <Route path={getMenuByName("Home").path} element={<HomePage />} />
        <Route path={getMenuByName("Inspections").path} element={<InspectionsPage />} />
        {
          services.map(service => (
            <Route
              key={service.name}
              path={`${getMenuByName("Plans & Pricing").path}${service.subpath}`}
              element={<PricingPage serviceId={service.id} />}
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
        {/* Catch-all route for 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10); // adjust sensitivity if needed
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  return (
    <div>
      <FormDataProvider>
        <AnimatedRoutes />
        {/* <header className="h-16 text-[15px] fixed inset-0 flex-center bg-white-50"> */}
        <header
          className={`h-15 text-[15px] fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-3 ${
            scrolled
              ? "bg-zinc-900/40 backdrop-blur-md shadow-md text-white"
              : "bg-transparent text-white"
          }`}
        >
          <nav className=" px-3.5 flex-center-between w-full max-w-7xl mx-auto">
            <div className="flex-center gap-x-3 z-[999] relative">
              <img src={Logo} alt="" className="size-8" />
              <h3 className="text-lg font-semibold block md:hidden">Auto Lab</h3>
              <h3 className="text-lg font-semibold hidden md:block">Auto Lab Solutions</h3>
            </div>

            <ul className="gap-x-1 hidden lg:flex lg:items-center">
              {Menus.map((menu) => (
                <DesktopMenu menu={menu} key={menu.name} />
              ))}
            </ul>
            <div className="flex-center gap-x-5">
              <button
                aria-label="inspection-progress"
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
        {/* <ChatBox /> */}
        <Footer />
      </FormDataProvider>
    </div>
  );
}
