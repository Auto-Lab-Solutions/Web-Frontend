/**
 * Slot Recommendation Utility Functions
 * 
 * This module implements algorithms to find optimal slot combinations that maximize
 * the number of appointments that can be scheduled in a day, considering:
 * - Available time periods
 * - User's already selected slots
 * - Service duration requirements
 * - Mechanics availability
 * - Existing appointments and unavailable periods
 */

import { checkSlotAvailability, getMechanicsCount } from './slotAvailabilityUtils';

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
 * @param {Object} slot1 - First slot with start and end times
 * @param {Object} slot2 - Second slot with start and end times
 * @returns {boolean} True if the ranges overlap
 */
const slotsOverlap = (slot1, slot2) => {
  const start1Min = timeToMinutes(slot1.start);
  const end1Min = timeToMinutes(slot1.end);
  const start2Min = timeToMinutes(slot2.start);
  const end2Min = timeToMinutes(slot2.end);
  
  return start1Min < end2Min && start2Min < end1Min;
};

/**
 * Gets the capacity (number of mechanics) that would be available for a slot
 * considering existing appointments and manual unavailability
 * @param {Object} slot - Time slot object
 * @param {Array} existingAppointments - Existing appointments for the date
 * @param {Array} manuallyUnavailableSlots - Manually unavailable slots
 * @param {Date|string} date - The date for the slot
 * @returns {number} Available capacity (0 if unavailable, >0 if available)
 */
const getSlotCapacity = (slot, existingAppointments, manuallyUnavailableSlots, date) => {
  const availability = checkSlotAvailability(slot, existingAppointments, manuallyUnavailableSlots, date);
  
  if (!availability.isAvailable) {
    return 0;
  }
  
  return availability.totalCapacity - availability.occupiedBy;
};

/**
 * Calculates the maximum number of appointments that can be scheduled in a day
 * using a greedy algorithm approach. This considers slot capacity and overlapping constraints.
 * @param {Array} availableSlots - All slots that are potentially available
 * @param {Array} selectedSlots - Already selected slots by the user
 * @param {Array} existingAppointments - Existing appointments for the date
 * @param {Array} manuallyUnavailableSlots - Manually unavailable slots
 * @param {Date|string} date - The date for the slots
 * @returns {Object} Result with maximumAppointments count and details
 */
const calculateMaximumAppointments = (availableSlots, selectedSlots, existingAppointments, manuallyUnavailableSlots, date) => {
  const mechanicsCount = getMechanicsCount();
  
  // Create a time-based capacity tracking system
  const timeCapacityMap = new Map();
  
  // Initialize capacity map with all available slots
  availableSlots.forEach(slot => {
    const capacity = getSlotCapacity(slot, existingAppointments, manuallyUnavailableSlots, date);
    if (capacity > 0) {
      const key = `${slot.start}-${slot.end}`;
      timeCapacityMap.set(key, {
        slot,
        capacity,
        used: 0
      });
    }
  });
  
  // Account for already selected slots
  selectedSlots.forEach(selectedSlot => {
    const key = `${selectedSlot.start}-${selectedSlot.end}`;
    const entry = timeCapacityMap.get(key);
    if (entry) {
      entry.used += 1;
    }
  });
  
  // Calculate total appointments that can be scheduled
  let totalAppointments = selectedSlots.length;
  
  // Add potential appointments from remaining capacity
  timeCapacityMap.forEach((entry) => {
    const remainingCapacity = Math.max(0, entry.capacity - entry.used);
    totalAppointments += remainingCapacity;
  });
  
  return {
    maximumAppointments: totalAppointments,
    details: {
      currentSelected: selectedSlots.length,
      availableCapacity: totalAppointments - selectedSlots.length,
      timeSlotBreakdown: Array.from(timeCapacityMap.entries()).map(([key, entry]) => ({
        timeSlot: key,
        totalCapacity: entry.capacity,
        used: entry.used,
        remaining: Math.max(0, entry.capacity - entry.used)
      }))
    }
  };
};

/**
 * Finds the optimal slot combinations that would maximize appointments for the day.
 * Uses a dynamic programming approach to find combinations that don't overlap
 * and maximize total appointment capacity.
 * @param {Array} allTimeSlots - All time slots for the day
 * @param {Array} currentSelectedSlots - Currently selected slots by user
 * @param {Array} existingAppointments - Existing appointments for the date
 * @param {Array} manuallyUnavailableSlots - Manually unavailable slots
 * @param {Date|string} date - The date for the slots
 * @param {number} maxSlotsToSelect - Maximum slots user can select (default 4)
 * @returns {Object} Recommendation result with optimal slots and statistics
 */
export const findOptimalSlotCombinations = (
  allTimeSlots, 
  currentSelectedSlots = [], 
  existingAppointments = [], 
  manuallyUnavailableSlots = [], 
  date = null,
  maxSlotsToSelect = 4
) => {
  // Filter to get only available slots
  const availableSlots = allTimeSlots.filter(slot => {
    const capacity = getSlotCapacity(slot, existingAppointments, manuallyUnavailableSlots, date);
    return capacity > 0;
  });

  if (availableSlots.length === 0) {
    return {
      recommendedSlots: [],
      currentMaxAppointments: 0,
      potentialMaxAppointments: 0,
      improvementPossible: false,
      statistics: {
        totalAvailableSlots: 0,
        currentUtilization: 0,
        optimalUtilization: 0
      }
    };
  }

  // Calculate current state
  const currentState = calculateMaximumAppointments(
    availableSlots, 
    currentSelectedSlots, 
    existingAppointments, 
    manuallyUnavailableSlots, 
    date
  );

  // Find the best combination using a greedy approach
  // Sort slots by their capacity (higher capacity first), then by time (earlier first)
  // This ensures that when capacities are equal, we consider slots in chronological order
  const slotsWithCapacity = availableSlots.map(slot => ({
    ...slot,
    capacity: getSlotCapacity(slot, existingAppointments, manuallyUnavailableSlots, date),
    isCurrentlySelected: currentSelectedSlots.some(selected => 
      selected.start === slot.start && selected.end === slot.end
    ),
    startMinutes: timeToMinutes(slot.start) // Add start time in minutes for sorting
  })).sort((a, b) => {
    // Primary sort: by capacity (higher first)
    if (a.capacity !== b.capacity) {
      return b.capacity - a.capacity;
    }
    // Secondary sort: by start time (earlier first) when capacities are equal
    return a.startMinutes - b.startMinutes;
  });

  // Use dynamic programming to find optimal non-overlapping combination
  const findOptimalCombination = (slots, maxSlots) => {
    const n = slots.length;
    if (n === 0 || maxSlots === 0) return [];

    // DP table: dp[i][j] = maximum appointments using first i slots with at most j selections
    const dp = Array(n + 1).fill(null).map(() => Array(maxSlots + 1).fill(0));
    const selections = Array(n + 1).fill(null).map(() => Array(maxSlots + 1).fill(null).map(() => []));

    for (let i = 1; i <= n; i++) {
      const currentSlot = slots[i - 1];
      
      for (let j = 1; j <= maxSlots; j++) {
        // Option 1: Don't select current slot
        dp[i][j] = dp[i - 1][j];
        selections[i][j] = [...selections[i - 1][j]];

        // Option 2: Select current slot if it doesn't overlap with previous selections
        const canSelect = selections[i - 1][j - 1].every(selectedSlot => 
          !slotsOverlap(currentSlot, selectedSlot)
        );

        if (canSelect) {
          const valueWithCurrent = dp[i - 1][j - 1] + currentSlot.capacity;
          if (valueWithCurrent > dp[i][j]) {
            dp[i][j] = valueWithCurrent;
            selections[i][j] = [...selections[i - 1][j - 1], currentSlot];
          }
        }
      }
    }

    // Return the best combination found
    return selections[n][maxSlots];
  };

  // Also create an alternative greedy approach to ensure we don't miss good slots
  const findGreedyNonOverlappingSlots = (slots, maxSlots) => {
    const selectedSlots = [];
    const sortedSlots = [...slots].sort((a, b) => {
      // Sort by capacity first, then by start time
      if (a.capacity !== b.capacity) {
        return b.capacity - a.capacity;
      }
      return timeToMinutes(a.start) - timeToMinutes(b.start);
    });

    for (const slot of sortedSlots) {
      if (selectedSlots.length >= maxSlots) break;
      
      // Check if this slot overlaps with any already selected
      const hasOverlap = selectedSlots.some(selected => slotsOverlap(slot, selected));
      
      if (!hasOverlap) {
        selectedSlots.push(slot);
      }
    }

    return selectedSlots;
  };

  // Find optimal combination considering current selections
  let optimalSlots = [];

  // If user has already selected slots, we need to find the best additional slots
  if (currentSelectedSlots.length > 0) {
    const remainingSlotCount = maxSlotsToSelect - currentSelectedSlots.length;
    if (remainingSlotCount > 0) {
      // Filter out slots that overlap with current selections
      const nonOverlappingSlots = slotsWithCapacity.filter(slot => {
        return !slot.isCurrentlySelected && 
               currentSelectedSlots.every(selected => !slotsOverlap(slot, selected));
      });

      // Try both approaches and pick the better one
      const dpSlots = findOptimalCombination(nonOverlappingSlots, remainingSlotCount);
      const greedySlots = findGreedyNonOverlappingSlots(nonOverlappingSlots, remainingSlotCount);
      
      // Calculate the total capacity for each approach
      const dpCapacity = dpSlots.reduce((sum, slot) => sum + slot.capacity, 0);
      const greedyCapacity = greedySlots.reduce((sum, slot) => sum + slot.capacity, 0);
      
      // Choose the approach that gives higher total capacity, or more slots if equal
      let additionalOptimalSlots;
      if (dpCapacity > greedyCapacity || (dpCapacity === greedyCapacity && dpSlots.length >= greedySlots.length)) {
        additionalOptimalSlots = dpSlots;
      } else {
        additionalOptimalSlots = greedySlots;
      }
      
      optimalSlots = [...currentSelectedSlots, ...additionalOptimalSlots];
    } else {
      optimalSlots = currentSelectedSlots;
    }
  } else {
    // No current selections, find best combination from scratch
    // Try both approaches and pick the better one
    const dpSlots = findOptimalCombination(slotsWithCapacity, maxSlotsToSelect);
    const greedySlots = findGreedyNonOverlappingSlots(slotsWithCapacity, maxSlotsToSelect);
    
    // Calculate the total capacity for each approach
    const dpCapacity = dpSlots.reduce((sum, slot) => sum + slot.capacity, 0);
    const greedyCapacity = greedySlots.reduce((sum, slot) => sum + slot.capacity, 0);
    
    // Choose the approach that gives higher total capacity, or more slots if equal
    if (dpCapacity > greedyCapacity || (dpCapacity === greedyCapacity && dpSlots.length >= greedySlots.length)) {
      optimalSlots = dpSlots;
    } else {
      optimalSlots = greedySlots;
    }
  }

  // Calculate potential maximum appointments with optimal selection
  const optimalState = calculateMaximumAppointments(
    availableSlots, 
    optimalSlots, 
    existingAppointments, 
    manuallyUnavailableSlots, 
    date
  );

  // Determine which slots to recommend (new slots not currently selected)
  const recommendedSlots = optimalSlots.filter(slot => 
    !currentSelectedSlots.some(selected => 
      selected.start === slot.start && selected.end === slot.end
    )
  );

  // If we have remaining capacity and didn't fill all slots, try to add more recommendations
  // This ensures we recommend all good available slots, not just the optimal subset
  if (recommendedSlots.length < (maxSlotsToSelect - currentSelectedSlots.length)) {
    const allUnselectedAvailableSlots = availableSlots.filter(slot => {
      // Must not be currently selected
      const isCurrentlySelected = currentSelectedSlots.some(selected => 
        selected.start === slot.start && selected.end === slot.end
      );
      
      // Must not be already recommended
      const isAlreadyRecommended = recommendedSlots.some(recommended => 
        recommended.start === slot.start && recommended.end === slot.end
      );
      
      // Must not overlap with current selections or already recommended slots
      const hasOverlapWithSelected = currentSelectedSlots.some(selected => slotsOverlap(slot, selected));
      const hasOverlapWithRecommended = recommendedSlots.some(recommended => slotsOverlap(slot, recommended));
      
      return !isCurrentlySelected && !isAlreadyRecommended && !hasOverlapWithSelected && !hasOverlapWithRecommended;
    });
    
    // Sort these remaining slots by start time to ensure we consider later slots
    const sortedRemainingSlots = allUnselectedAvailableSlots.sort((a, b) => 
      timeToMinutes(a.start) - timeToMinutes(b.start)
    );
    
    // Add additional slots that don't overlap, prioritizing by capacity and time diversity
    for (const slot of sortedRemainingSlots) {
      if (recommendedSlots.length >= (maxSlotsToSelect - currentSelectedSlots.length)) {
        break;
      }
      
      const hasOverlapWithRecommended = recommendedSlots.some(recommended => slotsOverlap(slot, recommended));
      const hasOverlapWithSelected = currentSelectedSlots.some(selected => slotsOverlap(slot, selected));
      
      if (!hasOverlapWithRecommended && !hasOverlapWithSelected) {
        const slotCapacity = getSlotCapacity(slot, existingAppointments, manuallyUnavailableSlots, date);
        if (slotCapacity > 0) {
          recommendedSlots.push({
            ...slot,
            capacity: slotCapacity
          });
        }
      }
    }
  }

  const improvementPossible = optimalState.maximumAppointments > currentState.maximumAppointments;

  return {
    recommendedSlots,
    currentMaxAppointments: currentState.maximumAppointments,
    potentialMaxAppointments: optimalState.maximumAppointments,
    improvementPossible,
    statistics: {
      totalAvailableSlots: availableSlots.length,
      currentUtilization: currentState.maximumAppointments,
      optimalUtilization: optimalState.maximumAppointments,
      slotsAnalyzed: slotsWithCapacity.length,
      currentSelections: currentSelectedSlots.length,
      recommendedAdditional: recommendedSlots.length
    },
    debug: {
      currentState: currentState.details,
      optimalState: optimalState.details,
      availableSlots: slotsWithCapacity.map(s => ({
        time: `${s.start}-${s.end}`,
        capacity: s.capacity,
        selected: s.isCurrentlySelected
      })),
      totalAvailableSlots: availableSlots.length,
      slotsWithCapacity: slotsWithCapacity.length,
      recommendedCount: recommendedSlots.length,
      allRecommendedSlots: recommendedSlots.map(s => `${s.start}-${s.end}`),
      maxSlotsToSelect,
      currentSelectionsCount: currentSelectedSlots.length,
      remainingSlots: maxSlotsToSelect - currentSelectedSlots.length
    }
  };
};

/**
 * Quick function to get slot recommendations for UI highlighting
 * @param {Array} allTimeSlots - All time slots for the day
 * @param {Array} currentSelectedSlots - Currently selected slots by user
 * @param {Array} existingAppointments - Existing appointments for the date
 * @param {Array} manuallyUnavailableSlots - Manually unavailable slots
 * @param {Date|string} date - The date for the slots
 * @returns {Array} Array of slot objects that should be recommended/highlighted
 */
export const getRecommendedSlots = (allTimeSlots, currentSelectedSlots, existingAppointments, manuallyUnavailableSlots, date) => {
  try {
    const result = findOptimalSlotCombinations(
      allTimeSlots, 
      currentSelectedSlots, 
      existingAppointments, 
      manuallyUnavailableSlots, 
      date
    );
    
    return result.recommendedSlots || [];
  } catch (error) {
    console.error('Error getting recommended slots:', error);
    return [];
  }
};

/**
 * Checks if a specific slot is in the recommended optimal combination
 * @param {Object} slot - Slot to check
 * @param {Array} allTimeSlots - All time slots for the day
 * @param {Array} currentSelectedSlots - Currently selected slots by user
 * @param {Array} existingAppointments - Existing appointments for the date
 * @param {Array} manuallyUnavailableSlots - Manually unavailable slots
 * @param {Date|string} date - The date for the slots
 * @returns {boolean} True if slot is recommended
 */
export const isSlotRecommended = (slot, allTimeSlots, currentSelectedSlots, existingAppointments, manuallyUnavailableSlots, date) => {
  try {
    const recommendedSlots = getRecommendedSlots(
      allTimeSlots, 
      currentSelectedSlots, 
      existingAppointments, 
      manuallyUnavailableSlots, 
      date
    );
    
    return recommendedSlots.some(recommended => 
      recommended.start === slot.start && recommended.end === slot.end
    );
  } catch (error) {
    console.error('Error checking if slot is recommended:', error);
    return false;
  }
};

export { calculateMaximumAppointments };