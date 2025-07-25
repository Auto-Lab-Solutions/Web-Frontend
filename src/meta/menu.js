import { se } from "date-fns/locale/se";
import { ShoppingCart } from "lucide-react";
import { Settings } from "lucide-react";
import { Book } from "lucide-react";
import { BatteryCharging } from "lucide-react";
import { Droplet } from "lucide-react";
import { Brush } from "lucide-react";
import { Phone } from "lucide-react";
import { Package } from "lucide-react";

export const categories = [
  {
    id: 1,
    name: "Parts & Components",
    desc: "Auto parts and replacement components",
    imgLocation: "/categories/parts-components",
    items: [
      {
        id: 1,
        name: "Car Battery",
        imgLocation: "/items/battery/car-battery.jpg",
        price: 150,
        desc: "12V automotive battery with warranty",
      },
      {
        id: 2,
        name: "Oil Filter",
        imgLocation: "/items/filters/oil-filter.jpg",
        price: 25,
        desc: "High-quality oil filter for various makes",
      },
      {
        id: 3,
        name: "Air Filter",
        imgLocation: "/items/filters/air-filter.jpg",
        price: 35,
        desc: "Engine air filter replacement",
      },
      {
        id: 4,
        name: "Brake Pads",
        imgLocation: "/items/brakes/brake-pads.jpg",
        price: 80,
        desc: "Front/rear brake pad set",
      }
    ]
  },
  {
    id: 2,
    name: "Fluids & Lubricants",
    desc: "Engine oils, coolants, and other fluids",
    imgLocation: "/categories/fluids-lubricants",
    items: [
      {
        id: 5,
        name: "Engine Oil (5W-30)",
        imgLocation: "/items/fluids/engine-oil.jpg",
        price: 45,
        desc: "Premium synthetic engine oil",
      },
      {
        id: 6,
        name: "Coolant",
        imgLocation: "/items/fluids/coolant.jpg",
        price: 25,
        desc: "Antifreeze coolant for radiator",
      },
      {
        id: 7,
        name: "Brake Fluid",
        imgLocation: "/items/fluids/brake-fluid.jpg",
        price: 20,
        desc: "DOT 4 brake fluid",
      }
    ]
  },
  {
    id: 3,
    name: "Detailing Supplies",
    desc: "Car care and detailing products",
    imgLocation: "/categories/detailing-supplies",
    items: [
      {
        id: 8,
        name: "Car Wax",
        imgLocation: "/items/detailing/car-wax.jpg",
        price: 35,
        desc: "Premium carnauba wax for protection",
      },
      {
        id: 9,
        name: "Tire Shine",
        imgLocation: "/items/detailing/tire-shine.jpg",
        price: 15,
        desc: "Long-lasting tire shine spray",
      },
      {
        id: 10,
        name: "Glass Cleaner",
        imgLocation: "/items/detailing/glass-cleaner.jpg",
        price: 12,
        desc: "Streak-free automotive glass cleaner",
      }
    ]
  },
  {
    id: 4,
    name: "Service Packages",
    desc: "Complete service and maintenance packages",
    imgLocation: "/categories/service-packages",
    items: [
      {
        id: 11,
        name: "Basic Service Package",
        imgLocation: "/items/services/basic-service.jpg",
        price: 120,
        desc: "Oil change, filter replacement, basic check",
      },
      {
        id: 12,
        name: "Premium Service Package",
        imgLocation: "/items/services/premium-service.jpg",
        price: 250,
        desc: "Comprehensive service with inspection",
      },
      {
        id: 13,
        name: "Brake Service",
        imgLocation: "/items/services/brake-service.jpg",
        price: 180,
        desc: "Complete brake system service",
      }
    ]
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
  },
  {
    id: 7,
    name: "Accessories",
    subpath: "/accessories",
    desc: "Order automotive parts & accessories",
    icon: Package,
    imgLocation: "/services/accessories",
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

export const getCategoryById = (id) => {
  return categories.find((category) => category.id === id);
};

export const getItemById = (categoryId, itemId) => {
  const category = getCategoryById(categoryId);
  return category?.items?.find((item) => item.id === itemId);
};