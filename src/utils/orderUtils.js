/**
 * Order Management Utilities
 * 
 * This module provides utility functions for handling order data in the Auto-Lab Solutions
 * web application. It includes functions for formatting, validation, status management,
 * and error handling specifically designed to work with the backend order APIs.
 * 
 * Key Features:
 * - Order data formatting for backend submission
 * - Form validation with detailed error reporting  
 * - Status display and styling helpers
 * - Error message formatting and display
 * - Reference number generation and formatting
 * 
 * @author Auto-Lab Solutions
 * @version 1.0.0
 */

/**
 * Utility functions for order handling and management
 */

import { getPerthCurrentDateTime } from './timezoneUtils';

/**
 * Removes empty fields from an object
 * @param {Object} obj - The object to clean
 * @returns {Object} Object with empty fields removed
 */
const removeEmptyFields = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip empty strings, null, undefined
    if (value === '' || value === null || value === undefined) {
      continue;
    }
    
    // For arrays, keep only non-empty arrays
    if (Array.isArray(value)) {
      if (value.length > 0) {
        cleaned[key] = value;
      }
      continue;
    }
    
    // For objects, recursively clean and keep only non-empty objects
    if (typeof value === 'object') {
      const cleanedNestedObj = removeEmptyFields(value);
      if (Object.keys(cleanedNestedObj).length > 0) {
        cleaned[key] = cleanedNestedObj;
      }
      continue;
    }
    
    // For all other values (strings, numbers, booleans), keep them
    cleaned[key] = value;
  }
  
  return cleaned;
};

/**
 * Formats order data for backend submission - Updated for multi-item support
 * @param {Object} orderFormData - The form data from the global context
 * @param {string} userId - The authenticated user ID
 * @returns {Object} Formatted order data for backend
 */
export const formatOrderForSubmission = (orderFormData, userId) => {
  const { items, customerData, carData, deliveryLocation, notes } = orderFormData;
  
  return {
    userId,
    orderData: {
      items: items.map(item => ({
        categoryId: item.categoryId,
        itemId: item.itemId,
        quantity: item.quantity
      })),
      customerData: removeEmptyFields(customerData || {}),
      carData: removeEmptyFields(carData || {}),
      deliveryLocation: deliveryLocation || '',
      notes: notes || ''
    }
  };
};

/**
 * Validates order data before submission - Updated for multi-item support
 * @param {Object} orderData - The order data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateOrderData = (orderData) => {
  const errors = [];

  // Check items
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.push('No items selected');
  } else {
    if (orderData.items.length > 10) {
      errors.push('Maximum 10 items allowed per order');
    }
    
    orderData.items.forEach((item, index) => {
      if (!item.categoryId || item.categoryId <= 0) {
        errors.push(`Item ${index + 1}: Invalid category`);
      }
      if (!item.itemId || item.itemId <= 0) {
        errors.push(`Item ${index + 1}: Invalid item`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Invalid quantity`);
      }
      if (item.quantity > 30) {
        errors.push(`Item ${index + 1}: Maximum quantity per item is 30`);
      }
    });
  }

  // Check customer data
  const customerData = orderData.customerData || {};
  if (!customerData.name) {
    errors.push('Customer name is required');
  }
  if (!customerData.email) {
    errors.push('Customer email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
    errors.push('Invalid email format');
  }
  if (!customerData.phoneNumber) {
    errors.push('Customer phone number is required');
  }

  // Check car data
  const carData = orderData.carData || {};
  if (!carData.make) {
    errors.push('Car make is required');
  }
  if (!carData.model) {
    errors.push('Car model is required');
  }
  if (!carData.year) {
    errors.push('Car year is required');
  } else {
    const year = parseInt(carData.year);
    const currentYear = getPerthCurrentDateTime().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      errors.push(`Car year must be between 1900 and ${currentYear + 1}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Handles API errors and returns user-friendly error messages
 * @param {Error} error - The error object from the API call
 * @returns {string} User-friendly error message
 */
export const handleOrderError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.status === 401) {
    return 'You are not authorized to create orders. Please log in and try again.';
  }

  if (error.response?.status === 403) {
    return 'You do not have permission to create orders.';
  }

  if (error.response?.status === 429) {
    return 'You have reached the daily order limit. Please try again tomorrow.';
  }

  if (error.response?.status >= 500) {
    return 'Server error occurred. Please try again later.';
  }

  if (error.message === 'Network Error') {
    return 'Network connection problem. Please check your internet connection and try again.';
  }

  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Calculates the total price for an order
 * @param {number} basePrice - Base price of the item
 * @param {number} quantity - Quantity ordered
 * @returns {number} Total price
 */
export const calculateOrderTotal = (basePrice, quantity) => {
  return (basePrice || 0) * (quantity || 1);
};

/**
 * Calculates total price for multiple items
 * @param {Array} items - Array of items with quantity and itemPrice
 * @returns {number} Total price
 */
export const calculateMultiItemTotal = (items) => {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    return total + (item.quantity * item.itemPrice);
  }, 0);
};

/**
 * Formats order status for display
 * @param {string} status - Order status from backend (PENDING, SCHEDULED, DELIVERED, CANCELLED)
 * @returns {Object} Formatted status info
 */
export const getOrderStatusInfo = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return {
        text: 'Pending',
        textColor: 'text-black',
        bg: 'bg-yellow-500'
      };
    case 'SCHEDULED':
      return {
        text: 'Scheduled',
        textColor: 'text-black',
        bg: 'bg-blue-500'
      };
    case 'DELIVERED':
      return {
        text: 'Delivered',
        textColor: 'text-black',
        bg: 'bg-green-500'
      };
    case 'CANCELLED':
      return {
        text: 'Cancelled',
        textColor: 'text-black',
        bg: 'bg-red-500'
      };
    default:
      return {
        text: status || 'Unknown',
        textColor: 'text-black',
        bg: 'bg-gray-500'
      };
  }
};
