/**
 * API Error Handling Utilities
 * Provides comprehensive error handling and fallback strategies for API calls
 */

/**
 * Check if error is a CORS error
 * @param {Error} error - The error object
 * @returns {boolean} True if it's a CORS error
 */
export const isCORSError = (error) => {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const responseStatus = error.response?.status;
  
  // Check for common CORS error indicators
  return (
    message.includes('cors') ||
    message.includes('access-control-allow-origin') ||
    message.includes('cross-origin') ||
    responseStatus === 0 || // Network error often indicates CORS
    error.code === 'NETWORK_ERROR'
  );
};

/**
 * Check if error is a 404 endpoint not found error
 * @param {Error} error - The error object
 * @returns {boolean} True if it's a 404 error
 */
export const isEndpointNotFound = (error) => {
  return error.response?.status === 404 || error.message?.includes('404');
};

/**
 * Get user-friendly error message for API errors
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if no specific message available
 * @returns {string} User-friendly error message
 */
export const getAPIErrorMessage = (error, defaultMessage = 'An unexpected error occurred') => {
  if (!error) return defaultMessage;
  
  // CORS errors
  if (isCORSError(error)) {
    return 'Unable to connect to the server. Please check your internet connection or try again later.';
  }
  
  // 404 errors
  if (isEndpointNotFound(error)) {
    return 'This feature is currently unavailable. Please try again later.';
  }
  
  // Authentication errors
  if (error.response?.status === 401) {
    return 'Authentication required. Please log in and try again.';
  }
  
  if (error.response?.status === 403) {
    return 'You do not have permission to access this resource.';
  }
  
  // Server errors
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  // Rate limiting
  if (error.response?.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  // Use error message from server if available
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message && !error.message.includes('Network Error')) {
    return error.message;
  }
  
  return defaultMessage;
};

/**
 * Retry an API call with exponential backoff
 * @param {Function} apiCall - The API call function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} The API call result
 */
export const retryAPICall = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry certain errors
      if (
        isEndpointNotFound(error) ||
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.response?.status === 422
      ) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Check if the API endpoint is available
 * @param {Object} restClient - The REST client instance
 * @param {string} endpoint - The endpoint to check
 * @returns {Promise<boolean>} True if endpoint is available
 */
export const checkEndpointAvailability = async (restClient, endpoint) => {
  if (!restClient) return false;
  
  try {
    // Try a HEAD request first (if supported), otherwise GET
    await restClient.client.head(endpoint);
    return true;
  } catch (error) {
    if (error.response?.status === 405) {
      // HEAD not allowed, try GET
      try {
        await restClient.get(endpoint);
        return true;
      } catch (getError) {
        return !isEndpointNotFound(getError);
      }
    }
    return !isEndpointNotFound(error);
  }
};

/**
 * Log detailed API error information for debugging
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 */
export const logAPIError = (error, context = 'API Call') => {
  console.group(`🔴 ${context} Error`);
  console.log('Error Message:', error.message);
  console.log('Error Type:', error.constructor.name);
  
  if (error.response) {
    console.log('Response Status:', error.response.status);
    console.log('Response Headers:', error.response.headers);
    console.log('Response Data:', error.response.data);
  }
  
  if (error.request) {
    console.log('Request Config:', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      headers: error.config?.headers
    });
  }
  
  if (isCORSError(error)) {
    console.log('🔍 CORS Error Detected - Check server CORS configuration');
  }
  
  if (isEndpointNotFound(error)) {
    console.log('🔍 Endpoint Not Found - Check if API endpoint exists');
  }
  
  console.groupEnd();
};

/**
 * Create a fallback strategy for missing endpoints
 * @param {Object} restClient - The REST client instance
 * @param {string} primaryEndpoint - The primary endpoint to try
 * @param {Array} fallbackEndpoints - Array of fallback endpoints to try
 * @param {Object} params - Parameters to pass to the API call
 * @returns {Promise} The API call result
 */
export const callWithFallback = async (restClient, primaryEndpoint, fallbackEndpoints = [], params = {}) => {
  const endpoints = [primaryEndpoint, ...fallbackEndpoints];
  let lastError;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const result = await restClient.get(endpoint, params);
      console.log(`✅ Success with endpoint: ${endpoint}`);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`❌ Failed with endpoint ${endpoint}:`, error.message);
      
      // If it's not a 404, don't try fallbacks
      if (!isEndpointNotFound(error) && !isCORSError(error)) {
        throw error;
      }
    }
  }
  
  // All endpoints failed
  throw lastError;
};

export default {
  isCORSError,
  isEndpointNotFound,
  getAPIErrorMessage,
  retryAPICall,
  checkEndpointAvailability,
  logAPIError,
  callWithFallback
};