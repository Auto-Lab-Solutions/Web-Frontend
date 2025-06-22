import { Menus, getMenuByName, services } from "./utils/menu";
import Logo from "./assets/logo.webp";
import DesktopMenu from "./components/DesktopMenu";
import MobMenu from "./components/MobMenu";
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import ServicePage from "./pages/ServicePage";
import PricingPage from "./pages/PricingPage";
import DiscoverPage from "./pages/DiscoverPage";
import AboutUsPage from "./pages/AboutUsPage";
// import ChatBox from "./components/ChatBox";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        <Route path={getMenuByName("Home").path} element={<HomePage />} />
        {services.map(service => (
            <Route
              key={service.name}
              path={`${getMenuByName("Services").path}${service.subpath}`}
              element={<ServicePage subMenu={service.name} />}
            />
        ))}
        {
          services.map(service => (
            <Route
              key={service.name}
              path={`${getMenuByName("Plans & Pricing").path}${service.subpath}`}
              element={<PricingPage subMenu={service.name} />}
            />
          ))
        }
        {
          getMenuByName("Discover").subMenu.map(subMenu => (
            <Route
              key={subMenu.name}
              path={`${getMenuByName("Discover").path}${subMenu.subpath}`}
              element={<DiscoverPage subMenu={subMenu.name} />}
            />
          ))
        }
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <div>
      <header className="h-16 text-[15px] fixed inset-0 flex-center bg-white-50">
        <nav className=" px-3.5 flex-center-between w-full max-w-7xl mx-auto">
          <div className="flex-center gap-x-3 z-[999] relative">
            <img src={Logo} alt="" className="size-8" />
            <h3 className="text-lg font-semibold">Framer</h3>
          </div>

          <ul className="gap-x-1 hidden lg:flex lg:items-center">
            {Menus.map((menu) => (
              <DesktopMenu menu={menu} key={menu.name} />
            ))}
          </ul>
          <div className="flex-center gap-x-5">
            <button
              aria-label="inspection-progress"
              className="bg-white/5 z-[999] relative px-3 py-1.5 shadow rounded-xl flex-center"
            >
              Inspection Status
            </button>
            <div className="lg:hidden">
              <MobMenu Menus={Menus} />
            </div>
          </div>
        </nav>
      </header>
      <AnimatedRoutes />
      {/* <ChatBox /> */}
    </div>
  );
}
