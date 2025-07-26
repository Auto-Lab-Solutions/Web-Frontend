/**
 * Utility functions for appointment handling
 */

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
 * Formats appointment data for backend submission
 * @param {Object} appointmentFormData - The form data from the global context
 * @param {string} userId - The authenticated user ID
 * @returns {Object} Formatted appointment data for backend
 */
export const formatAppointmentForSubmission = (appointmentFormData, userId) => {
  const appointmentData = {
    serviceId: appointmentFormData.serviceId,
    planId: appointmentFormData.planId,
    isBuyer: appointmentFormData.isBuyer !== undefined ? appointmentFormData.isBuyer : true,
    buyerData: appointmentFormData.buyerData || {},
    sellerData: appointmentFormData.sellerData || {},
    carData: appointmentFormData.carData || {},
    notes: appointmentFormData.notes || '',
    selectedSlots: appointmentFormData.selectedSlots || []
  };

  // Remove empty fields before submission
  const cleanedAppointmentData = removeEmptyFields(appointmentData);

  return {
    userId: userId,
    appointmentData: cleanedAppointmentData
  };
};

/**
 * Validates appointment data before submission
 * @param {Object} appointmentData - The appointment data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateAppointmentData = (appointmentData) => {
  const errors = [];

  if (!appointmentData.serviceId) {
    errors.push('Service ID is required');
  }

  if (!appointmentData.planId) {
    errors.push('Plan ID is required');
  }

  if (!appointmentData.selectedSlots || appointmentData.selectedSlots.length === 0) {
    errors.push('At least one time slot must be selected');
  }

  if (!appointmentData.carData || !appointmentData.carData.make || !appointmentData.carData.model) {
    errors.push('Vehicle make and model are required');
  }

  // Validate buyer data if it's a buyer appointment
  if (appointmentData.isBuyer && appointmentData.buyerData) {
    if (!appointmentData.buyerData.name && !appointmentData.buyerData.email && !appointmentData.buyerData.phoneNumber) {
      errors.push('At least one contact method (name, email, or phone) is required for buyer');
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
export const handleAppointmentError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.status === 401) {
    return 'You are not authorized to create appointments. Please log in and try again.';
  }

  if (error.response?.status === 403) {
    return 'You do not have permission to create appointments.';
  }

  if (error.response?.status === 429) {
    return 'You have reached the daily appointment limit. Please try again tomorrow.';
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
 * Formats appointment status for display color
 * @param {string} status - Appointment status from backend
 * @returns {string} CSS classes for status color
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'created':
      return 'bg-yellow-500';
    case 'scheduled':
    case 'confirmed':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

/**
 * Formats appointment status for display text
 * @param {string} status - Appointment status from backend
 * @returns {string} Human-readable status text
 */
export const getStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'created':
      return 'Pending';
    case 'scheduled':
      return 'Scheduled';
    case 'confirmed':
      return 'Confirmed';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status || 'Unknown';
  }
};

/**
 * Formats date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return date.toString();
  }
};

/**
 * Formats payment status for display color
 * @param {string} paymentStatus - Payment status from backend
 * @returns {string} CSS classes for payment status color
 */
export const getPaymentStatusColor = (paymentStatus) => {
  switch (paymentStatus?.toLowerCase()) {
    case 'paid':
    case 'completed':
      return 'bg-green-500';
    case 'pending':
    case 'processing':
      return 'bg-yellow-500';
    case 'failed':
    case 'declined':
      return 'bg-red-500';
    case 'refunded':
      return 'bg-blue-500';
    case 'cancelled':
      return 'bg-gray-500';
    default:
      return 'bg-yellow-500'; // Default to pending
  }
};

/**
 * Formats payment status for display text
 * @param {string} paymentStatus - Payment status from backend
 * @returns {string} Human-readable payment status text
 */
export const getPaymentStatusText = (paymentStatus) => {
  switch (paymentStatus?.toLowerCase()) {
    case 'paid':
    case 'completed':
      return 'Paid';
    case 'pending':
      return 'Payment Pending';
    case 'processing':
      return 'Processing';
    case 'failed':
    case 'declined':
      return 'Payment Failed';
    case 'refunded':
      return 'Refunded';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Payment Pending'; // Default to pending
  }
};
