import { ShoppingCart } from "lucide-react";
import { Settings } from "lucide-react";
import { Book } from "lucide-react";
import { BatteryCharging } from "lucide-react";
import { Droplet } from "lucide-react";
import { Brush } from "lucide-react";
import { Phone } from "lucide-react";
import { Package } from "lucide-react";
import { act } from "react";

export const categories = [
  {
    id: 1,
    name: "Engines & Parts",
    desc: "Engines, engine parts, and components",
    imgLocation: "/categories/engines",
    items: [
      {
        id: 1,
        name: "V8 Engine",
        imgLocation: "/items/engines/v8.jpg",
        price: 150,
        desc: "High-performance V8 engine",
        active: true
      },
      {
        id: 2,
        name: "V10 Engine",
        imgLocation: "/items/engines/v10.jpg",
        price: 120,
        desc: "Powerful V10 engine",
        active: true
      },
    ],
    active: true
  },
  {
    id: 2,
    name: "Tyres & Wheels",
    desc: "Tyres, wheels, and related components",
    imgLocation: "/categories/tyres-wheels",
    items: [
      {
        id: 1,
        name: "Alloy Wheels",
        imgLocation: "/items/tyres-wheels/alloy-wheels.jpg",
        price: 200,
        desc: "Stylish alloy wheels for your car",
        active: true
      },
      {
        id: 2,
        name: "Winter Tyres",
        imgLocation: "/items/tyres-wheels/winter-tyres.jpg",
        price: 100,
        desc: "Durable winter tyres for better grip",
        active: true
      },
    ],
    active: true
  }
]

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
        duration: 2, // Duration in hours
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
        ],
        active: true
      },
      {
        id: 2,
        name: "Comprehensive Pre Purchase Inspection",
        price: 280,
        duration: 3, // Duration in hours
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
        ],
        active: true
      },
      {
        id: 3,
        name: "Advanced Diagnostic Inspection",
        price: 350,
        duration: 4, // Duration in hours
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
        ],
        active: true
      }
    ],
    active: true
  },
  {
    id: 2,
    name: "Mobile Battery Replacement",
    subpath: "/mobile-battery-replacement",
    desc: "Get your car battery replaced",
    icon: BatteryCharging,
    imgLocation: "/services/mobile-battery-replacement",
    plans: [
      {
        id: 1,
        name: "Standard Battery Replacement",
        price: 180,
        duration: 1, // Duration in hours
        features: [
          "Battery testing and diagnosis",
          "Professional battery replacement",
          "Electrical connections check",
          "System functionality test"
        ],
        active: true
      }
    ],
    active: true
  },
  {
    id: 3,
    name: "Logbook & Services",
    subpath: "/logbook-services",
    desc: "Keep track of your car's services",
    icon: Book,
    imgLocation: "/services/logbook-services",
    plans: [
      {
        id: 1,
        name: "Basic Service",
        price: 250,
        duration: 2, // Duration in hours
        features: [
          "Oil and filter change",
          "Basic fluid checks",
          "Visual inspection",
          "Logbook stamping"
        ],
        active: true
      },
      {
        id: 2,
        name: "Major Service",
        price: 450,
        duration: 4, // Duration in hours
        features: [
          "Comprehensive fluid changes",
          "Filter replacements",
          "Detailed inspection",
          "Component testing",
          "Logbook documentation"
        ],
        active: true
      }
    ],
    active: true
  },
  {
    id: 4,
    name: "Engine Tuneup",
    subpath: "/engine-tuneup",
    desc: "Improve your car's performance",
    icon: Settings,
    imgLocation: "/services/engine-tuneup",
    plans: [
      {
        id: 1,
        name: "Basic Tuneup",
        price: 300,
        duration: 2.5, // Duration in hours
        features: [
          "Spark plug replacement",
          "Air filter change",
          "Basic engine diagnostics",
          "Performance check"
        ],
        active: true
      },
      {
        id: 2,
        name: "Performance Tuneup",
        price: 500,
        duration: 3.5, // Duration in hours
        features: [
          "Complete ignition system service",
          "Fuel system cleaning",
          "Advanced diagnostics",
          "ECU optimization",
          "Performance testing"
        ],
        active: true
      }
    ],
    active: true
  },
  {
    id: 5,
    name: "Paint Correction",
    subpath: "/paint-correction",
    desc: "Cut & Polish, Detailing",
    icon: Brush,
    imgLocation: "/services/paint-correction",
    plans: [
      {
        id: 1,
        name: "Basic Paint Correction",
        price: 400,
        duration: 3, // Duration in hours
        features: [
          "Single-stage paint correction",
          "Exterior wash and prep",
          "Basic polishing",
          "Protective wax application"
        ],
        active: true
      },
      {
        id: 2,
        name: "Premium Paint Correction",
        price: 650,
        duration: 5, // Duration in hours
        features: [
          "Multi-stage paint correction",
          "Deep scratch removal",
          "Professional polishing",
          "Ceramic coating application",
          "Interior detailing"
        ],
        active: true
      }
    ],
    active: true
  },
  {
    id: 6,
    name: "Accessories",
    subpath: "/accessories",
    desc: "Order automotive parts & accessories",
    icon: Package,
    imgLocation: "/services/accessories",
    active: false
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

export const getPlanDuration = (serviceId, planId) => {
  const plan = getPlanById(serviceId, planId);
  return plan?.duration || 2; // Default to 2 hours if no duration specified
};

export const isInspectionService = (serviceId) => {
  // Only "Pre Purchase Inspection" (ID: 1) is an inspection service
  return serviceId === 1;
};

export const getMenuByName = (name) => {
  return Menus.find((menu) => menu.name === name);
};

export const getPlansAndPricingUrl = (serviceId) => {
  return `${Menus.find(menu => menu.name === "Plans & Pricing").path}${getServiceById(serviceId).subpath}`;
}

export const getCategoryById = (id) => {
  return categories.find((category) => category.id === id);
};

export const getItemById = (categoryId, itemId) => {
  const category = getCategoryById(categoryId);
  return category?.items?.find((item) => item.id === itemId);
};