/**
 * User validation utilities for checking userId validity with the backend
 */

/**
 * Validates a userId with the backend API
 * @param {string} userId - The userId to validate
 * @param {Object} restClient - The REST client instance
 * @returns {Promise<{valid: boolean, error?: string}>} Validation result
 */
export const validateUserId = async (userId, restClient) => {
  if (!userId || !restClient) {
    return { valid: false, error: 'Missing userId or REST client' };
  }

  try {
    console.log('🔍 Validating userId with backend:', userId);
    
    const response = await restClient.get('/users/check', { userId });
    
    if (response.status === 200 && response.data) {
      const { success, valid, message } = response.data;
      
      if (success) {
        // Backend creates user if doesn't exist, so if success=true, the userId is always valid
        console.log('✅ Backend response successful - userId is valid:', message);
        return { valid: true, message };
      } else {
        console.error('❗ User validation API returned error:', message);
        return { valid: false, error: message };
      }
    } else {
      console.error('❗ Unexpected response from user validation API:', response);
      return { valid: false, error: 'Unexpected API response' };
    }
  } catch (error) {
    console.error('❗ Error validating userId:', error);
    
    // If it's a network error or API is down, we'll assume the userId is valid
    // to prevent clearing valid user data due to temporary API issues
    if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR' || 
        (error.response && error.response.status >= 500)) {
      console.warn('⚠️ Network/server error during validation, assuming userId is valid');
      return { valid: true, error: 'Network error - assuming valid' };
    }
    
    // For 4xx errors, the userId is likely invalid
    return { valid: false, error: error.message || 'Validation failed' };
  }
};

/**
 * Performs user validation and clears data if invalid
 * @param {string} userId - The userId to validate
 * @param {Object} restClient - The REST client instance
 * @param {Function} clearAllUserData - Function to clear all user data
 * @returns {Promise<boolean>} True if valid, false if invalid and data was cleared
 */
export const validateAndClearIfInvalid = async (
  userId, 
  restClient, 
  clearAllUserData
) => {
  const validationResult = await validateUserId(userId, restClient);
  
  if (!validationResult.valid) {
    console.warn('🗑️ Clearing invalid user data:', validationResult.error);
    
    // Clear all user-related data from storage
    clearAllUserData();
    
    return false;
  }
  
  return true;
};
