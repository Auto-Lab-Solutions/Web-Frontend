import { ShoppingCart } from "lucide-react";
import { Settings } from "lucide-react";
import { Book } from "lucide-react";
import { BatteryCharging } from "lucide-react";
import { Droplet } from "lucide-react";
import { Brush } from "lucide-react";
import { Lightbulb } from "lucide-react";
import { HelpCircle } from "lucide-react";

export const services = [
  {
    name: "Pre Purchase Inspection",
    subpath: "/pre-purchase-inspection",
    desc: "Get your car inspected",
    icon: ShoppingCart,
  },
  {
    name: "Engine Tuneup",
    subpath: "/engine-tuneup",
    desc: "Improve your car's performance",
    icon: Settings,
  },
  {
    name: "Services & Logbook",
    subpath: "/services-logbook",
    desc: "Keep track of your car's services",
    icon: Book,
  },
  {
    name: "Mobile Battery Replacement",
    subpath: "/mobile-battery-replacement",
    desc: "Get your car battery replaced",
    icon: BatteryCharging,
  },
  {
    name: "Oil & Filter Replacement",
    subpath: "/oil-filter-replacement",
    desc: "Change your car's oil and filter",
    icon: Droplet,
  },
  {
    name: "Paint Correction",
    subpath: "/paint-correction",
    desc: "Cut & Polish, Detailing",
    icon: Brush,
  }
];


export const Menus = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Services",
    path: "/service",
    subMenu: services,
    gridCols: 1,
  },
  {
    name: "Plans & Pricing",
    path: "/pricing",
    subMenu: services,
    gridCols: 1,
  },
  {
    name: "Discover",
    path: "/discover",
    subMenu: [
      {
        name: "Tips & Tricks",
        subpath: "/tips",
        desc: "Learn how to maintain your car",
        icon: Lightbulb,
      },
      {
        name: "FAQ",
        subpath: "/faq",
        desc: "Frequently Asked Questions",
        icon: HelpCircle,
      }
    ]
  },
  {
    name: "About Us",
    path: "/about",
  }
];

export const getMenuByName = (name) => {
  return Menus.find((menu) => menu.name === name);
};