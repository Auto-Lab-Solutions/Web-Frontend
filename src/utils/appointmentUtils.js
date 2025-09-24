/**
 * Utility functions for appointment handling
 */

import { format } from 'date-fns';
import { 
  convertToPerthTime, 
  formatPerthDateToISO, 
  isSlotTooSoonPerth,
  getPerthCurrentDateTime,
  newPerthDate
} from './timezoneUtils';

/**
 * Generates time slots with custom duration using Perth timezone
 * @param {number} durationHours - Duration of each slot in hours
 * @returns {Array} Array of time slot objects with start and end times
 */
export const generateTimeSlots = (durationHours = 2) => {
  const slots = [];
  let hour = 8;
  let minute = 0;

  // Continue until we can't create any more valid slots
  // Changed condition to ensure we consider all possible slots until closing
  while (hour < 20) { // Allow checking until 20:00 to see if slot fits
    // Use Perth timezone for creating time slots
    const start = newPerthDate();
    start.setHours(hour);
    start.setMinutes(minute);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    // Only add slot if it ends by or before 20:00 (8 PM)
    if (end.getHours() < 20 || (end.getHours() === 20 && end.getMinutes() === 0)) {
      slots.push({
        start: start.toTimeString().slice(0, 5),
        end: end.toTimeString().slice(0, 5),
      });
    } else {
      // If this slot would go past 20:00, we're done
      break;
    }

    minute += 30;
    if (minute === 60) {
      hour++;
      minute = 0;
    }
  }

  return slots;
};

/**
 * Fetches unavailable slots for a specific date using the correct API endpoint
 * @param {Object} restClient - The REST client instance
 * @param {Date|string} date - The date to fetch unavailable slots for
 * @returns {Promise<{unavailableSlots: string[], error: string|null}>}
 */
export const fetchUnavailableSlots = async (restClient, date) => {
  if (!restClient) {
    return { unavailableSlots: [], error: 'REST client not available' };
  }

  try {
    const dateStr = typeof date === 'string' ? date : formatPerthDateToISO(convertToPerthTime(date));
    console.log('Fetching unavailable slots for date:', dateStr);
    
    // Use the correct /unavailable-slots endpoint according to API documentation
    const response = await restClient.get('/unavailable-slots', { date: dateStr });
    
    console.log('Unavailable slots API response:', response);
    
    if (response.data && response.data.success !== false) {
      // Handle the documented response format
      const responseData = response.data;
      
      // Extract manually unavailable slots (these are simple string array)
      const manuallyUnavailableSlots = responseData.manuallyUnavailableSlots || [];
      
      // Extract time slots from the unavailableSlots array (which includes merged slots)
      const mergedUnavailableSlots = (responseData.unavailableSlots || []).map(slot => 
        typeof slot === 'string' ? slot : slot.timeSlot
      );
      
      console.log('Processed unavailable slots:', {
        manually: manuallyUnavailableSlots,
        merged: mergedUnavailableSlots,
        scheduled: responseData.scheduledSlots || []
      });
      
      return { 
        unavailableSlots: mergedUnavailableSlots, 
        error: null,
        // Additional data for advanced use cases
        manuallyUnavailableSlots,
        scheduledSlots: responseData.scheduledSlots || [],
        fullResponse: responseData
      };
    } else {
      const errorMessage = response.data?.message || 'Failed to fetch unavailable slots';
      console.error('API returned error:', errorMessage);
      return { unavailableSlots: [], error: errorMessage };
    }
  } catch (error) {
    console.error('Error fetching unavailable slots:', error);
    
    let errorMessage = 'Failed to load available slots. Please try again.';
    
    if (error.response?.status === 429) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Network connection problem. Please check your internet connection.';
    }
    
    return { unavailableSlots: [], error: errorMessage };
  }
};

/**
 * Checks if a time slot is unavailable based on the API response
 * @param {Object} slot - Time slot object with start and end times
 * @param {string[]} unavailableSlots - Array of unavailable slot strings from API
 * @returns {boolean} True if slot is unavailable
 */
export const isSlotUnavailable = (slot, unavailableSlots) => {
  if (!slot || !unavailableSlots || unavailableSlots.length === 0) {
    return false;
  }
  
  // Helper function to parse time string to minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') {
      console.error('Invalid timeStr passed to timeToMinutes:', timeStr);
      return 0; // Return 0 as fallback
    }
    
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.error('Invalid time format in timeToMinutes:', timeStr);
        return 0;
      }
      return hours * 60 + minutes;
    } catch (error) {
      console.error('Error parsing time string:', timeStr, error);
      return 0;
    }
  };
  
  // Helper function to check if two time ranges overlap
  const timesOverlap = (start1, end1, start2, end2) => {
    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);
    
    // Two ranges overlap if one starts before the other ends
    return start1Min < end2Min && start2Min < end1Min;
  };
  
  // Check if the slot overlaps with any unavailable slot
  for (const unavailableSlot of unavailableSlots) {
    const [unavailableStart, unavailableEnd] = unavailableSlot.split('-');
    
    if (timesOverlap(slot.start, slot.end, unavailableStart, unavailableEnd)) {
      console.log(`Slot ${slot.start}-${slot.end} overlaps with unavailable slot ${unavailableSlot}`);
      return true;
    }
  }
  
  return false;
};

/**
 * Filters available time slots based on unavailable slots from API
 * @param {Array} allTimeSlots - Array of all possible time slots
 * @param {string[]} unavailableSlots - Array of unavailable slot strings from API
 * @returns {Array} Array of available time slots
 */
export const filterAvailableSlots = (allTimeSlots, unavailableSlots) => {
  if (!unavailableSlots || unavailableSlots.length === 0) {
    return allTimeSlots;
  }
  
  return allTimeSlots.filter(slot => !isSlotUnavailable(slot, unavailableSlots));
};

/**
 * Checks if a time slot is too soon (less than 2 hours from current Perth time)
 * @param {Object} slot - Time slot object with start and end times
 * @param {Date|string} date - The date of the slot
 * @returns {boolean} True if slot is too soon
 */
export const isSlotTooSoon = (slot, date) => {
  return isSlotTooSoonPerth(slot, date, 2);
};

/**
 * Filters time slots to exclude those that are unavailable or too soon
 * @param {Array} allTimeSlots - Array of all possible time slots
 * @param {string[]} unavailableSlots - Array of unavailable slot strings from API
 * @param {Date|string} date - The date for the slots
 * @returns {Array} Array of available and timely slots
 */
export const filterValidSlots = (allTimeSlots, unavailableSlots, date) => {
  if (!allTimeSlots || allTimeSlots.length === 0) {
    return [];
  }
  
  return allTimeSlots.filter(slot => {
    const isUnavailable = isSlotUnavailable(slot, unavailableSlots);
    const isTooSoon = isSlotTooSoon(slot, date);
    return !isUnavailable && !isTooSoon;
  });
};

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
      return 'In Review';
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
 * Formats appointment status for display with light background and dark text
 * @param {string} status - Appointment status from backend
 * @returns {Object} Status display information with light background
 */
export const getAppointmentStatusInfo = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'created':
      return {
        text: 'In Review',
        textColor: 'text-black',
        bg: 'bg-yellow-500'
      };
    case 'scheduled':
      return {
        text: 'Scheduled',
        textColor: 'text-white',
        bg: 'bg-blue-500'
      };
    case 'confirmed':
      return {
        text: 'Confirmed',
        textColor: 'text-white',
        bg: 'bg-blue-500'
      };
    case 'ongoing':
      return {
        text: 'Ongoing',
        textColor: 'text-white',
        bg: 'bg-purple-500'
      };
    case 'completed':
      return {
        text: 'Completed',
        textColor: 'text-black',
        bg: 'bg-green-500'
      };
    case 'cancelled':
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

/**
 * Formats date for display using Perth timezone
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const perthDate = convertToPerthTime(date);
    if (!perthDate) return '';
    
    return perthDate.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Australia/Perth'
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
      return 'Payment Complete';
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

/**
 * Checks timeslot availability for an appointment before payment
 * @param {Object} restClient - The REST client instance
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} timeslot - The timeslot in HH:MM-HH:MM format
 * @returns {Promise<{isAvailable: boolean, error: string|null, appointmentsCount?: number, blocked?: boolean}>}
 */
export const checkTimeslotAvailability = async (restClient, date, timeslot) => {
  console.log('🟡 checkTimeslotAvailability called with:', { date, timeslot });

  // Adjust timeslot: +1 min to start, -1 min to end
  let adjustedTimeslot = timeslot;
  try {
    const [start, end] = timeslot.split('-');
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    // Create Date objects for manipulation (date part is irrelevant)
    let startDate = new Date(2000, 0, 1, startHour, startMinute);
    let endDate = new Date(2000, 0, 1, endHour, endMinute);
    // Add 1 minute to start, subtract 1 minute from end
    startDate.setMinutes(startDate.getMinutes() + 1);
    endDate.setMinutes(endDate.getMinutes() - 1);
    // Format back to HH:MM
    const pad = n => n.toString().padStart(2, '0');
    const newStart = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
    const newEnd = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
    adjustedTimeslot = `${newStart}-${newEnd}`;
    console.log('🟡 Adjusted timeslot for backend:', adjustedTimeslot);
  } catch (err) {
    console.warn('⚠️ Could not adjust timeslot, using original:', timeslot, err);
  }

  if (!restClient) {
    console.log('🔴 No REST client available');
    return { isAvailable: false, error: 'REST client not available' };
  }

  if (!date || !timeslot) {
    console.log('🔴 Missing date or timeslot:', { date, timeslot });
    return { isAvailable: false, error: 'Date and timeslot are required' };
  }

  try {
    console.log('🟡 Making API call to /unavailable-slots');
    const response = await restClient.get('/unavailable-slots', {
      date: date,
      checkSlot: adjustedTimeslot
    });

    console.log('🟡 API Response:', response);

    if (response?.data?.availabilityCheck) {
      const { appointmentsCount, blocked } = response.data.availabilityCheck;
      console.log('🟡 Availability check data:', { appointmentsCount, blocked });
      
      // Import getMechanicsCount dynamically to avoid circular dependencies
      const { getMechanicsCount } = await import('./slotAvailabilityUtils');
      const mechanicsCount = getMechanicsCount();
      console.log('🟡 Mechanics count:', mechanicsCount);
      
      // If blocked is true, it's definitely unavailable
      if (blocked) {
        console.log('🔴 Slot is blocked');
        return { 
          isAvailable: false, 
          error: null, 
          appointmentsCount, 
          blocked,
          reason: 'blocked'
        };
      }
      
      // If appointmentsCount is less than mechanics count, it's available
      const isAvailable = appointmentsCount < mechanicsCount;
      console.log('🟡 Availability calculation:', { appointmentsCount, mechanicsCount, isAvailable });
      
      return { 
        isAvailable, 
        error: null, 
        appointmentsCount, 
        blocked,
        mechanicsCount,
        reason: isAvailable ? 'available' : 'fully_booked'
      };
    } else {
      console.log('🔴 Invalid response structure:', response?.data);
      return { isAvailable: false, error: 'Invalid response from server' };
    }
  } catch (error) {
    console.error('🔴 Error checking timeslot availability:', error);
    console.log('🔴 Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return { 
      isAvailable: false, 
      error: error.response?.data?.message || error.message || 'Failed to check timeslot availability' 
    };
  }
};
