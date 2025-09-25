/**
 * Timezone utility functions for Perth, Australia
 * 
 * Perth operates in AWST (UTC+8) during standard time and AWDT (UTC+9) during daylight saving.
 * Daylight saving typically runs from the first Sunday in October to the first Sunday in April.
 */

// Perth timezone identifier
export const PERTH_TIMEZONE = 'Australia/Perth';

/**
 * Gets the current date and time in Perth timezone
 * @returns {Date} Current date/time in Perth timezone
 */
export const getPerthCurrentDateTime = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: PERTH_TIMEZONE }));
};

/**
 * Converts a date to Perth timezone
 * @param {Date|string|number} date - Date to convert
 * @returns {Date} Date converted to Perth timezone
 */
export const convertToPerthTime = (date) => {
  if (!date) return null;
  
  try {
    let dateObj;
    
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (typeof date === 'number') {
      // Handle both seconds and milliseconds timestamps
      // Use a higher threshold: 100000000000 (March 2973) to distinguish seconds vs milliseconds
      dateObj = date < 100000000000 ? new Date(date * 1000) : new Date(date);
    } else {
      dateObj = new Date(date);
    }
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }

    // Return the date object directly - formatting will handle timezone display
    return dateObj;
  } catch (error) {
    console.error('Error converting to Perth time:', error);
    return null;
  }
};/**
 * Formats a date in Perth timezone for display
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string in Perth timezone
 */
export const formatPerthDate = (date, options = {}) => {
  const perthDate = convertToPerthTime(date);
  if (!perthDate) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: PERTH_TIMEZONE
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return perthDate.toLocaleDateString('en-AU', formatOptions);
  } catch (error) {
    console.error('Error formatting Perth date:', error);
    return 'N/A';
  }
};

/**
 * Formats a date and time in Perth timezone for display
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date and time string in Perth timezone
 */
export const formatPerthDateTime = (date, options = {}) => {
  const perthDate = convertToPerthTime(date);
  if (!perthDate) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: PERTH_TIMEZONE
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return perthDate.toLocaleString('en-AU', formatOptions);
  } catch (error) {
    console.error('Error formatting Perth date time:', error);
    return 'N/A';
  }
};

/**
 * Formats time only in Perth timezone
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string in Perth timezone
 */
export const formatPerthTime = (date, options = {}) => {
  const perthDate = convertToPerthTime(date);
  if (!perthDate) return 'N/A';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: PERTH_TIMEZONE
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return perthDate.toLocaleTimeString('en-AU', formatOptions);
  } catch (error) {
    console.error('Error formatting Perth time:', error);
    return 'N/A';
  }
};

/**
 * Gets the current date in Perth timezone formatted as YYYY-MM-DD
 * @returns {string} Current date in Perth timezone as YYYY-MM-DD
 */
export const getPerthCurrentDateString = () => {
  const perthDate = getPerthCurrentDateTime();
  return formatPerthDateToISO(perthDate);
};

/**
 * Formats a date to ISO string (YYYY-MM-DD) in Perth timezone
 * @param {Date|string|number} date - Date to format
 * @returns {string} Date formatted as YYYY-MM-DD in Perth timezone
 */
export const formatPerthDateToISO = (date) => {
  const perthDate = convertToPerthTime(date);
  if (!perthDate) return '';
  
  try {
    // Get the year, month, and day in Perth timezone
    const year = perthDate.getFullYear();
    const month = String(perthDate.getMonth() + 1).padStart(2, '0');
    const day = String(perthDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting Perth date to ISO:', error);
    return '';
  }
};

/**
 * Parses a date string in Perth timezone
 * @param {string} dateString - Date string to parse (YYYY-MM-DD or similar)
 * @returns {Date} Date object in Perth timezone
 */
export const parsePerthDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Create a date assuming it's in Perth timezone
    const date = new Date(dateString + 'T00:00:00');
    return convertToPerthTime(date);
  } catch (error) {
    console.error('Error parsing Perth date:', error);
    return null;
  }
};

/**
 * Creates a new Date object representing the current time in Perth
 * @returns {Date} Current date and time in Perth timezone
 */
export const newPerthDate = () => {
  return getPerthCurrentDateTime();
};

/**
 * Checks if a time slot is too soon (less than specified hours from current Perth time)
 * @param {Object} slot - Time slot with start and end times
 * @param {Date|string} date - Date of the slot
 * @param {number} minimumHours - Minimum hours required (default: 2)
 * @returns {boolean} True if slot is too soon
 */
export const isSlotTooSoonPerth = (slot, date, minimumHours = 2) => {
  if (!slot || !date) return false;
  
  try {
    const now = getPerthCurrentDateTime();
    const dateStr = typeof date === 'string' ? date : formatPerthDateToISO(date);
    
    // Create the slot datetime in Perth timezone
    const slotDateTime = new Date(`${dateStr}T${slot.start}`);
    const perthSlotDateTime = convertToPerthTime(slotDateTime);
    
    const minimumTime = new Date(now.getTime() + minimumHours * 60 * 60 * 1000);
    
    return perthSlotDateTime < minimumTime;
  } catch (error) {
    console.error('Error checking if slot is too soon (Perth):', error);
    return false;
  }
};

/**
 * Gets user-friendly relative time string for Perth timezone
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string (e.g., "2 hours ago", "Tomorrow")
 */
export const formatPerthRelativeTime = (date) => {
  const perthDate = convertToPerthTime(date);
  const now = getPerthCurrentDateTime();
  
  if (!perthDate) return 'N/A';
  
  const diffMs = perthDate - now;
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  // Past times
  if (diffMs < 0) {
    const absDiffMins = Math.abs(diffMins);
    const absDiffHours = Math.abs(diffHours);
    const absDiffDays = Math.abs(diffDays);
    
    if (absDiffMins < 60) {
      return `${absDiffMins} minute${absDiffMins !== 1 ? 's' : ''} ago`;
    } else if (absDiffHours < 24) {
      return `${absDiffHours} hour${absDiffHours !== 1 ? 's' : ''} ago`;
    } else if (absDiffDays < 7) {
      return `${absDiffDays} day${absDiffDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatPerthDate(perthDate);
    }
  }
  
  // Future times
  if (diffMins < 60) {
    return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays < 7) {
    return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else {
    return formatPerthDate(perthDate);
  }
};

/**
 * Generates business hours in Perth timezone
 * @param {number} startHour - Start hour (default: 8)
 * @param {number} endHour - End hour (default: 18)
 * @returns {Object} Business hours info
 */
export const getPerthBusinessHours = (startHour = 8, endHour = 18) => {
  const now = getPerthCurrentDateTime();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour + currentMinute / 60;
  
  const isBusinessHours = currentTime >= startHour && currentTime < endHour;
  
  return {
    isBusinessHours,
    startHour,
    endHour,
    currentTime: formatPerthTime(now),
    nextBusinessDay: isBusinessHours ? null : getNextBusinessDay()
  };
};

/**
 * Gets the next business day in Perth timezone
 * @returns {Date} Next business day
 */
export const getNextBusinessDay = () => {
  const now = getPerthCurrentDateTime();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // If tomorrow is weekend, move to Monday
  const dayOfWeek = tomorrow.getDay();
  if (dayOfWeek === 0) { // Sunday
    tomorrow.setDate(tomorrow.getDate() + 1);
  } else if (dayOfWeek === 6) { // Saturday
    tomorrow.setDate(tomorrow.getDate() + 2);
  }
  
  return tomorrow;
};

/**
 * Validates if a date is in Perth timezone business days (Monday-Friday)
 * @param {Date|string} date - Date to validate
 * @returns {boolean} True if it's a business day
 */
export const isPerthBusinessDay = (date) => {
  const perthDate = convertToPerthTime(date);
  if (!perthDate) return false;
  
  const dayOfWeek = perthDate.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday = 1, Friday = 5
};

/**
 * Creates a timestamp in Perth timezone for database storage
 * @param {Date} date - Date to convert (optional, defaults to now)
 * @returns {number} Unix timestamp adjusted for Perth timezone
 */
export const createPerthTimestamp = (date = null) => {
  const perthDate = date ? convertToPerthTime(date) : getPerthCurrentDateTime();
  return Math.floor(perthDate.getTime() / 1000);
};

/**
 * Gets timezone offset for Perth
 * @returns {string} Timezone offset string (e.g., "+08:00" or "+09:00")
 */
export const getPerthTimezoneOffset = () => {
  const now = new Date();
  const perthTime = new Date(now.toLocaleString("en-US", { timeZone: PERTH_TIMEZONE }));
  const utcTime = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  
  const offsetMs = perthTime.getTime() - utcTime.getTime();
  const offsetHours = offsetMs / (1000 * 60 * 60);
  
  const sign = offsetHours >= 0 ? '+' : '-';
  const absHours = Math.abs(Math.floor(offsetHours));
  const minutes = Math.abs((offsetHours % 1) * 60);
  
  return `${sign}${String(absHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Debug function to log Perth timezone information
 */
export const logPerthTimezoneInfo = () => {
  const now = new Date();
  const perthTime = getPerthCurrentDateTime();
  const offset = getPerthTimezoneOffset();
  
  console.group('🌏 Perth Timezone Information');
  console.log('Current UTC time:', now.toISOString());
  console.log('Current Perth time:', formatPerthDateTime(perthTime));
  console.log('Perth timezone offset:', offset);
  console.log('Perth date string:', getPerthCurrentDateString());
  console.log('Is business hours:', getPerthBusinessHours().isBusinessHours);
  console.groupEnd();
};

// Export Perth timezone constant for external use
export { PERTH_TIMEZONE as DEFAULT_TIMEZONE };