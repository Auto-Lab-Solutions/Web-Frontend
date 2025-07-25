/**
 * Order Categories and Items Metadata
 * 
 * This module defines the available order categories and items for the Auto-Lab Solutions
 * order management system. It provides structured data for the order form components
 * and maintains consistency across the application.
 * 
 * Structure:
 * - Each category contains an id, name, description, and array of items
 * - Each item has id, name, description, estimated price, and unit
 * - Categories are organized by automotive domain (parts, services, etc.)
 * 
 * Usage:
 * - Import orderCategories for form dropdowns and selection
 * - Use helper functions to find categories and items by ID
 * - Prices are estimates and may be updated by staff during order processing
 * 
 * @author Auto-Lab Solutions
 * @version 1.0.0
 */

import { 
  Wrench, 
  BatteryCharging, 
  Droplet, 
  Brush, 
  Settings,
  ShoppingCart 
} from "lucide-react";

export const orderCategories = [
  {
    id: 1,
    name: "Parts & Components",
    description: "Auto parts and replacement components",
    icon: Wrench,
    items: [
      {
        id: 1,
        name: "Car Battery",
        description: "12V automotive battery with warranty",
        basePrice: 150,
        unit: "piece"
      },
      {
        id: 2,
        name: "Oil Filter",
        description: "High-quality oil filter for various makes",
        basePrice: 25,
        unit: "piece"
      },
      {
        id: 3,
        name: "Air Filter",
        description: "Engine air filter replacement",
        basePrice: 35,
        unit: "piece"
      },
      {
        id: 4,
        name: "Brake Pads",
        description: "Front/rear brake pad set",
        basePrice: 80,
        unit: "set"
      },
      {
        id: 5,
        name: "Spark Plugs",
        description: "Set of 4 spark plugs",
        basePrice: 60,
        unit: "set"
      }
    ]
  },
  {
    id: 2,
    name: "Fluids & Lubricants",
    description: "Engine oils, coolants, and other fluids",
    icon: Droplet,
    items: [
      {
        id: 6,
        name: "Engine Oil (5W-30)",
        description: "Premium synthetic engine oil",
        basePrice: 45,
        unit: "liter"
      },
      {
        id: 7,
        name: "Coolant",
        description: "Antifreeze coolant for radiator",
        basePrice: 25,
        unit: "liter"
      },
      {
        id: 8,
        name: "Brake Fluid",
        description: "DOT 4 brake fluid",
        basePrice: 20,
        unit: "liter"
      },
      {
        id: 9,
        name: "Power Steering Fluid",
        description: "Power steering hydraulic fluid",
        basePrice: 18,
        unit: "liter"
      }
    ]
  },
  {
    id: 3,
    name: "Detailing Supplies",
    description: "Car care and detailing products",
    icon: Brush,
    items: [
      {
        id: 10,
        name: "Car Wax",
        description: "Premium carnauba wax for protection",
        basePrice: 35,
        unit: "bottle"
      },
      {
        id: 11,
        name: "Tire Shine",
        description: "Long-lasting tire shine spray",
        basePrice: 15,
        unit: "bottle"
      },
      {
        id: 12,
        name: "Glass Cleaner",
        description: "Streak-free automotive glass cleaner",
        basePrice: 12,
        unit: "bottle"
      },
      {
        id: 13,
        name: "Leather Conditioner",
        description: "Premium leather care conditioner",
        basePrice: 28,
        unit: "bottle"
      }
    ]
  },
  {
    id: 4,
    name: "Service Packages",
    description: "Complete service and maintenance packages",
    icon: Settings,
    items: [
      {
        id: 14,
        name: "Basic Service Package",
        description: "Oil change, filter replacement, basic check",
        basePrice: 120,
        unit: "service"
      },
      {
        id: 15,
        name: "Premium Service Package",
        description: "Comprehensive service with inspection",
        basePrice: 250,
        unit: "service"
      },
      {
        id: 16,
        name: "Brake Service",
        description: "Complete brake system service",
        basePrice: 180,
        unit: "service"
      },
      {
        id: 17,
        name: "Battery Installation",
        description: "Battery replacement and installation service",
        basePrice: 50,
        unit: "service"
      }
    ]
  }
];

export const getCategoryById = (id) => {
  return orderCategories.find((category) => category.id === id);
};

export const getItemById = (categoryId, itemId) => {
  const category = getCategoryById(categoryId);
  return category?.items?.find((item) => item.id === itemId);
};

export const getAllItems = () => {
  return orderCategories.flatMap(category => 
    category.items.map(item => ({
      ...item,
      categoryId: category.id,
      categoryName: category.name
    }))
  );
};

export const getItemsByCategoryId = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category?.items || [];
};
