import { se } from "date-fns/locale/se";
import { ShoppingCart } from "lucide-react";
import { Settings } from "lucide-react";
import { Book } from "lucide-react";
import { BatteryCharging } from "lucide-react";
import { Droplet } from "lucide-react";
import { Brush } from "lucide-react";
import { Phone } from "lucide-react";

export const services = [
  {
    id: 1,
    name: "Pre Purchase Inspection",
    subpath: "/pre-purchase-inspection",
    desc: "Get your car inspected",
    icon: ShoppingCart,
    imgLocation: "/services/pre-purchase-inspection",
    plans: [
      {
        id: 1,
        name: "Standard Pre Purchase Inspection",
        price: 220,
        features: [
          "Engine bay & powertrain visual inspection",
          "Structure & body check",
          "Tyres, wheels & brakes evaluation",
          "Undercarriage & suspension assessment",
          "Fluid leakage detection",
          "Battery & charging check",
          "OBD2 scan & live data",
          "Interior / dashboard tests",
          "Safety systems & electrics",
          "Detailed report & consultation",
          "Test drive on request"
        ]
      },
      {
        id: 2,
        name: "Comprehensive Pre Purchase Inspection",
        price: 280,
        features: [
          "Full chassis / frame structural examination",
          "Advanced suspension / steering / drivetrain assessment",
          "Brake performance analysis",
          "Fuel system evaluation",
          "Ignition system & coil resistance check",
          "Expanded OBD2 diagnostics",
          "Exhaust & catalytic converter test",
          "Deep safety feature testing (SRS, ABS)",
          "Advanced electrical systems check",
          "High-res report with photos",
          "Priority consultation"
        ]
      },
      {
        id: 3,
        name: "Advanced Diagnostic Inspection",
        price: 350,
        features: [
          "Oscilloscope-based cam / crank correlation",
          "Ignition waveform analysis",
          "Compression oscilloscope testing",
          "Fuel injector & rail pressure testing",
          "Alternator ripple & charging diagnostics",
          "Thermal imaging of electrical / cooling systems",
          "Advanced suspension load testing",
          "Exhaust gas & emissions analysis",
          "Undercarriage boroscope exam",
          "Real-time oscilloscope data logging",
          "Diagnostic graphs in report",
          "Extended technical consultation"
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Engine Tuneup",
    subpath: "/engine-tuneup",
    desc: "Improve your car's performance",
    icon: Settings,
    imgLocation: "/services/engine-tuneup",
    plans: []
  },
  {
    id: 3,
    name: "Services & Logbook",
    subpath: "/services-logbook",
    desc: "Keep track of your car's services",
    icon: Book,
    imgLocation: "/services/services-logbook",
    plans: []
  },
  {
    id: 4,
    name: "Mobile Battery Replacement",
    subpath: "/mobile-battery-replacement",
    desc: "Get your car battery replaced",
    icon: BatteryCharging,
    imgLocation: "/services/mobile-battery-replacement",
    plans: []
  },
  {
    id: 5,
    name: "Oil & Filter Replacement",
    subpath: "/oil-filter-replacement",
    desc: "Change your car's oil and filter",
    icon: Droplet,
    imgLocation: "/services/oil-filter-replacement",
    plans: []
  },
  {
    id: 6,
    name: "Paint Correction",
    subpath: "/paint-correction",
    desc: "Cut & Polish, Detailing",
    icon: Brush,
    imgLocation: "/services/paint-correction",
    plans: []
  }
];


export const Menus = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Inspections",
    path: "/inspections",
  },
  {
    name: "Plans & Pricing",
    path: "/pricing",
    subMenu: services,
    gridCols: 1,
  },
  {
    name: "NewsFeed",
    path: "/newsfeed",
  },
  {
    name: "About Us",
    path: "/about",
  },
  {
    name: "More",
    path: "/more",
    subMenu: [
      {
        name: "Contact Us",
        subpath: "/contact",
        desc: "Get in touch with us",
        icon: Phone,
      }
    ],
  }
];

export const getServiceById = (id) => {
  return services.find((service) => service.id === id);
};

export const getPlanById = (serviceId, planId) => {
  const service = getServiceById(serviceId);
  return service?.plans?.find((plan) => plan.id === planId);
};

export const getMenuByName = (name) => {
  return Menus.find((menu) => menu.name === name);
};

export const getPlansAndPricingUrl = (serviceId) => {
  return `${Menus.find(menu => menu.name === "Plans & Pricing").path}${getServiceById(serviceId).subpath}`;
}