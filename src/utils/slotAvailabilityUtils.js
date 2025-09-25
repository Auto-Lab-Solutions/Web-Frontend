/**
 * Slot Availability Utility Functions
 * 
 * This module handles the filtering and availability logic for appointment time slots
 * based on mechanics count, existing appointments, and manually set unavailable slots.
 */

import { format } from 'date-fns';
import { getDeploymentConfig } from '../config/deployment';
import { isSlotTooSoonPerth } from './timezoneUtils';
import { isSlotTooSoon } from './appointmentUtils';

/**
 * Gets the number of available mechanics from environment configuration
 * @returns {number} Number of mechanics available
 */
export const getMechanicsCount = () => {
  const config = getDeploymentConfig();
  return config.mechanicsCount;
};

/**
 * Parses time string to minutes since midnight for easy comparison
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {number} Minutes since midnight
 */
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

/**
 * Checks if two time ranges overlap
 * @param {string} start1 - Start time of first range (HH:MM)
 * @param {string} end1 - End time of first range (HH:MM)
 * @param {string} start2 - Start time of second range (HH:MM)
 * @param {string} end2 - End time of second range (HH:MM)
 * @returns {boolean} True if the ranges overlap
 */
const timesOverlap = (start1, end1, start2, end2) => {
  // Validate all time strings before processing
  if (!start1 || !end1 || !start2 || !end2) {
    console.error('Missing time values in timesOverlap:', { start1, end1, start2, end2 });
    return false;
  }
  
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);
  
  // If any conversion failed, don't assume overlap
  if (start1Min === 0 && start1 !== '00:00' && start1 !== '0:00') return false;
  if (end1Min === 0 && end1 !== '00:00' && end1 !== '0:00') return false;
  if (start2Min === 0 && start2 !== '00:00' && start2 !== '0:00') return false;
  if (end2Min === 0 && end2 !== '00:00' && end2 !== '0:00') return false;
  
  // Two ranges overlap if one starts before the other ends
  return start1Min < end2Min && start2Min < end1Min;
};

/**
 * Counts how many appointments are scheduled during a specific time slot
 * @param {Object} slot - Time slot object with start and end times
 * @param {Array} existingAppointments - Array of existing appointments for the date
 * @returns {number} Number of appointments overlapping with this slot
 */
const countOverlappingAppointments = (slot, existingAppointments) => {
  if (!existingAppointments || existingAppointments.length === 0) {
    return 0;
  }
  
  // Validate slot structure
  if (!slot || !slot.start || !slot.end) {
    console.error('Invalid slot structure in countOverlappingAppointments:', slot);
    return 0;
  }
  
  let count = 0;
  
  for (const appointment of existingAppointments) {
    // Validate appointment structure
    if (!appointment) {
      console.warn('Invalid appointment object (null/undefined)');
      continue;
    }
    
    // Check if appointment has a scheduled time slot
    if (appointment.scheduledTimeSlot) {
      const appointmentStart = appointment.scheduledTimeSlot.start;
      const appointmentEnd = appointment.scheduledTimeSlot.end;
      
      // Validate appointment time format
      if (!appointmentStart || !appointmentEnd) {
        console.warn('Invalid appointment time slot:', appointment.scheduledTimeSlot);
        continue;
      }
      
      if (timesOverlap(slot.start, slot.end, appointmentStart, appointmentEnd)) {
        count++;
      }
    }
    
    // Also check if any of the appointment's selected slots overlap
    if (appointment.selectedSlots && Array.isArray(appointment.selectedSlots)) {
      for (const selectedSlot of appointment.selectedSlots) {
        // Validate selected slot structure
        if (!selectedSlot || !selectedSlot.start || !selectedSlot.end) {
          console.warn('Invalid selected slot structure:', selectedSlot);
          continue;
        }
        
        if (timesOverlap(slot.start, slot.end, selectedSlot.start, selectedSlot.end)) {
          count++;
          break; // Only count each appointment once
        }
      }
    }
  }
  
  return count;
};

/**
 * Checks if a time slot is manually set as unavailable
 * @param {Object} slot - Time slot object with start and end times
 * @param {Array} manuallyUnavailableSlots - Array of manually unavailable slot strings
 * @returns {boolean} True if slot is manually unavailable
 */
const isSlotManuallyUnavailable = (slot, manuallyUnavailableSlots) => {
  if (!slot || !manuallyUnavailableSlots || manuallyUnavailableSlots.length === 0) {
    return false;
  }
  
  // Check if the slot overlaps with any manually unavailable slot
  for (const unavailableSlot of manuallyUnavailableSlots) {
    const [unavailableStart, unavailableEnd] = unavailableSlot.split('-');
    
    if (timesOverlap(slot.start, slot.end, unavailableStart, unavailableEnd)) {
      console.log(`Slot ${slot.start}-${slot.end} overlaps with manually unavailable slot ${unavailableSlot}`);
      return true;
    }
  }
  
  return false;
};

/**
 * Determines if a time slot is available based on mechanics count and existing appointments
 * @param {Object} slot - Time slot object with start and end times
 * @param {Array} existingAppointments - Array of existing appointments for the date
 * @param {Array} manuallyUnavailableSlots - Array of manually unavailable slot strings
 * @param {Date|string} date - The date for the slot (for checking if too soon)
 * @returns {Object} Availability info with status and details
 */
export const checkSlotAvailability = (slot, existingAppointments = [], manuallyUnavailableSlots = [], date = null) => {
  const mechanicsCount = getMechanicsCount();
  
  // Check if slot is too soon using Perth timezone
  if (date && isSlotTooSoonPerth(slot, date, 2)) {
    return {
      isAvailable: false,
      reason: 'too_soon',
      message: 'This slot is too soon (must be at least 2 hours from now in Perth time)',
      occupiedBy: 0,
      totalCapacity: mechanicsCount
    };
  }
  
  // Check if slot is manually unavailable
  if (isSlotManuallyUnavailable(slot, manuallyUnavailableSlots)) {
    return {
      isAvailable: false,
      reason: 'manually_unavailable',
      message: 'This slot has been manually marked as unavailable',
      occupiedBy: mechanicsCount, // Consider it fully occupied
      totalCapacity: mechanicsCount
    };
  }
  
  // Count overlapping appointments
  const overlappingCount = countOverlappingAppointments(slot, existingAppointments);
  
  // Slot is available if overlapping appointments < number of mechanics
  const isAvailable = overlappingCount < mechanicsCount;
  
  return {
    isAvailable,
    reason: isAvailable ? 'available' : 'fully_booked',
    message: isAvailable 
      ? `Available (${mechanicsCount - overlappingCount} of ${mechanicsCount} mechanics free)`
      : `Fully booked (${overlappingCount} of ${mechanicsCount} mechanics occupied)`,
    occupiedBy: overlappingCount,
    totalCapacity: mechanicsCount
  };
};

/**
 * Filters an array of time slots to return only available ones
 * @param {Array} allTimeSlots - Array of all possible time slots
 * @param {Array} existingAppointments - Array of existing appointments for the date
 * @param {Array} manuallyUnavailableSlots - Array of manually unavailable slot strings
 * @param {Date|string} date - The date for the slots
 * @returns {Array} Array of available time slots with availability info
 */
export const filterAvailableSlots = (allTimeSlots, existingAppointments = [], manuallyUnavailableSlots = [], date = null) => {
  if (!allTimeSlots || allTimeSlots.length === 0) {
    return [];
  }
  
  return allTimeSlots
    .map(slot => ({
      ...slot,
      availability: checkSlotAvailability(slot, existingAppointments, manuallyUnavailableSlots, date)
    }))
    .filter(slot => slot.availability.isAvailable);
};

/**
 * Gets detailed availability information for all time slots
 * @param {Array} allTimeSlots - Array of all possible time slots
 * @param {Array} existingAppointments - Array of existing appointments for the date
 * @param {Array} manuallyUnavailableSlots - Array of manually unavailable slot strings
 * @param {Date|string} date - The date for the slots
 * @returns {Array} Array of all time slots with detailed availability info
 */
export const getDetailedSlotAvailability = (allTimeSlots, existingAppointments = [], manuallyUnavailableSlots = [], date = null) => {
  if (!allTimeSlots || allTimeSlots.length === 0) {
    return [];
  }
  
  return allTimeSlots.map(slot => ({
    ...slot,
    availability: checkSlotAvailability(slot, existingAppointments, manuallyUnavailableSlots, date)
  }));
};

/**
 * Gets availability statistics for a given date
 * @param {Array} allTimeSlots - Array of all possible time slots
 * @param {Array} existingAppointments - Array of existing appointments for the date
 * @param {Array} manuallyUnavailableSlots - Array of manually unavailable slot strings
 * @param {Date|string} date - The date for the slots
 * @returns {Object} Statistics about slot availability
 */
/**
 * Calculate the maximum theoretical capacity considering overlapping appointments
 * @param {Array} allTimeSlots - Array of all possible time slots
 * @param {Array} existingAppointments - Array of existing appointments
 * @param {number} mechanicsCount - Number of available mechanics
 * @returns {number} Maximum number of appointments that can be scheduled
 */
const calculateMaximumCapacity = (allTimeSlots, existingAppointments = [], mechanicsCount = 1) => {
  if (!allTimeSlots || allTimeSlots.length === 0) return 0;
  
  // Helper function to convert time to minutes with validation
  const timeToMinutesLocal = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') {
      console.error('Invalid timeStr in calculateMaximumCapacity:', timeStr);
      return 0;
    }
    
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.error('Invalid time format in calculateMaximumCapacity:', timeStr);
        return 0;
      }
      return hours * 60 + minutes;
    } catch (error) {
      console.error('Error parsing time in calculateMaximumCapacity:', timeStr, error);
      return 0;
    }
  };
  
  // Sort slots by end time for greedy algorithm
  const sortedSlots = [...allTimeSlots].sort((a, b) => {
    // Validate slot structure before sorting
    if (!a || !a.end || !b || !b.end) {
      console.warn('Invalid slot structure in sorting:', { a, b });
      return 0;
    }
    return timeToMinutesLocal(a.end) - timeToMinutesLocal(b.end);
  });
  
  // For each mechanic, calculate maximum non-overlapping appointments they can handle
  let totalMaxAppointments = 0;
  
  for (let mechanic = 0; mechanic < mechanicsCount; mechanic++) {
    let mechanicAppointments = 0;
    let lastEndTime = 0;
    
    for (const slot of sortedSlots) {
      // Validate slot structure
      if (!slot || !slot.start || !slot.end) {
        console.warn('Invalid slot in calculateMaximumCapacity:', slot);
        continue;
      }
      
      const slotStartMin = timeToMinutesLocal(slot.start);
      
      // If this slot doesn't overlap with the last scheduled appointment
      if (slotStartMin >= lastEndTime) {
        mechanicAppointments++;
        lastEndTime = timeToMinutesLocal(slot.end);
      }
    }
    
    totalMaxAppointments += mechanicAppointments;
  }
  
  return totalMaxAppointments;
};

export const getAvailabilityStats = (allTimeSlots, existingAppointments = [], manuallyUnavailableSlots = [], date = null) => {
  const detailedSlots = getDetailedSlotAvailability(allTimeSlots, existingAppointments, manuallyUnavailableSlots, date);
  const mechanicsCount = getMechanicsCount();
  
  // Calculate proper maximum capacity considering overlaps
  const maximumCapacity = calculateMaximumCapacity(allTimeSlots, existingAppointments, mechanicsCount);
  
  const stats = {
    totalSlots: detailedSlots.length,
    availableSlots: 0,
    fullyBookedSlots: 0,
    manuallyUnavailableSlots: 0,
    tooSoonSlots: 0,
    mechanicsCount,
    maximumCapacity, // This is the correct theoretical maximum
    totalCapacity: maximumCapacity, // For backward compatibility
    occupiedCapacity: 0,
    currentAppointments: existingAppointments.length
  };
  
  detailedSlots.forEach(slot => {
    const { availability } = slot;
    
    switch (availability.reason) {
      case 'available':
        stats.availableSlots++;
        break;
      case 'fully_booked':
        stats.fullyBookedSlots++;
        break;
      case 'manually_unavailable':
        stats.manuallyUnavailableSlots++;
        break;
      case 'too_soon':
        stats.tooSoonSlots++;
        break;
    }
    
    stats.occupiedCapacity += availability.occupiedBy;
  });
  
  // Calculate utilization and remaining capacity
  stats.utilizationRate = maximumCapacity > 0 ? (stats.currentAppointments / maximumCapacity * 100).toFixed(1) + '%' : '0%';
  stats.availableCapacity = maximumCapacity - stats.currentAppointments;
  
  return stats;
};

/**
 * Legacy compatibility function - maintains backward compatibility with existing code
 * @param {Object} slot - Time slot object with start and end times
 * @param {Array} unavailableSlots - Array of unavailable slot strings (for backward compatibility)
 * @returns {boolean} True if slot is unavailable
 */
export const isSlotUnavailable = (slot, unavailableSlots) => {
  // This maintains backward compatibility with the existing isSlotUnavailable function
  // It treats the unavailableSlots as manually unavailable slots
  const availability = checkSlotAvailability(slot, [], unavailableSlots);
  return !availability.isAvailable;
};

/**
 * Enhanced slot availability check that considers all factors
 * @param {Object} slot - Time slot object with start and end times
 * @param {Object} options - Options object containing all availability factors
 * @param {Array} options.existingAppointments - Existing appointments for the date
 * @param {Array} options.manuallyUnavailableSlots - Manually unavailable slots
 * @param {Date|string} options.date - The date for the slot
 * @returns {Object} Detailed availability information
 */
export const getSlotAvailabilityInfo = (slot, options = {}) => {
  const {
    existingAppointments = [],
    manuallyUnavailableSlots = [],
    date = null
  } = options;
  
  return checkSlotAvailability(slot, existingAppointments, manuallyUnavailableSlots, date);
};

// Export configuration utility
export { getMechanicsCount as getMechanicsConfig };
