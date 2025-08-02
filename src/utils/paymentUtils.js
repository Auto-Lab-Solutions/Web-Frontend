/**
 * Payment utility functions for handling payment operations, formatting, and validation
 */

/**
 * Formats payment amount for display
 * @param {number} amount - The amount in cents or dollars
 * @param {boolean} inCents - Whether the amount is in cents (default: false)
 * @returns {string} Formatted amount string
 */
export const formatPaymentAmount = (amount, inCents = false) => {
  if (!amount && amount !== 0) return '$0.00';
  
  const dollars = inCents ? amount / 100 : amount;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
};

/**
 * Converts amount to cents for Stripe
 * @param {number} amount - Amount in dollars
 * @returns {number} Amount in cents
 */
export const convertToCents = (amount) => {
  return Math.round((amount || 0) * 100);
};

/**
 * Converts amount from cents to dollars
 * @param {number} cents - Amount in cents
 * @returns {number} Amount in dollars
 */
export const convertToDollars = (cents) => {
  return (cents || 0) / 100;
};

/**
 * Validates payment amount
 * @param {number} amount - Amount to validate
 * @returns {Object} Validation result
 */
export const validatePaymentAmount = (amount) => {
  const errors = [];
  
  if (!amount && amount !== 0) {
    errors.push('Payment amount is required');
  }
  
  if (amount < 0) {
    errors.push('Payment amount cannot be negative');
  }
  
  if (amount < 0.50) {
    errors.push('Minimum payment amount is $0.50');
  }
  
  if (amount > 999999.99) {
    errors.push('Maximum payment amount is $999,999.99');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Gets payment status display information
 * @param {string} paymentStatus - Payment status from backend
 * @returns {Object} Status display information
 */
export const getPaymentStatusInfo = (paymentStatus) => {
  switch (paymentStatus?.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'succeeded':
      return {
        text: 'Paid',
        color: 'text-green-500',
        bg: 'bg-green-500/10 border border-green-500/20',
        textColor: 'text-green-500'
      };
    case 'pending':
    case 'processing':
      return {
        text: 'Pending',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10 border border-yellow-500/20',
        textColor: 'text-yellow-500'
      };
    case 'failed':
    case 'declined':
    case 'canceled':
      return {
        text: 'Failed',
        color: 'text-red-500',
        bg: 'bg-red-500/10 border border-red-500/20',
        textColor: 'text-red-500'
      };
    case 'refunded':
      return {
        text: 'Refunded',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10 border border-blue-500/20',
        textColor: 'text-blue-500'
      };
    case 'requires_payment_method':
      return {
        text: 'Required',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10 border border-orange-500/20',
        textColor: 'text-orange-500'
      };
    default:
      return {
        text: 'Payment Required',
        color: 'text-gray-500',
        bg: 'bg-gray-500/10 border border-gray-500/20',
        textColor: 'text-gray-500'
      };
  }
};

/**
 * Formats payment data for backend submission
 * @param {Object} paymentData - Payment data to format
 * @param {string} userId - User ID
 * @returns {Object} Formatted payment data
 */
export const formatPaymentForSubmission = (paymentData, userId) => {
  return {
    userId: userId || 'guest',
    amount: convertToCents(paymentData.amount),
    currency: paymentData.currency || 'aud',
    referenceNumber: paymentData.referenceNumber,
    type: paymentData.type,
    metadata: {
      userId: userId || 'guest',
      referenceNumber: paymentData.referenceNumber,
      type: paymentData.type,
      customerName: paymentData.customerInfo?.name,
      customerEmail: paymentData.customerInfo?.email,
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Handles payment errors and returns user-friendly messages
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const handlePaymentError = (error) => {
  // Stripe-specific errors
  if (error.type) {
    switch (error.type) {
      case 'card_error':
        return error.message || 'Your card was declined. Please try a different payment method.';
      case 'validation_error':
        return error.message || 'Please check your payment information and try again.';
      case 'api_connection_error':
        return 'Network error. Please check your connection and try again.';
      case 'api_error':
        return 'Payment service temporarily unavailable. Please try again later.';
      case 'authentication_error':
        return 'Payment authentication failed. Please try again.';
      case 'idempotency_error':
        return 'Duplicate payment detected. Please refresh and try again.';
      case 'rate_limit_error':
        return 'Too many payment attempts. Please wait a moment and try again.';
      default:
        return error.message || 'Payment failed. Please try again.';
    }
  }

  // API response errors
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // HTTP status errors
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Invalid payment information. Please check your details and try again.';
      case 401:
        return 'Payment authorization failed. Please log in and try again.';
      case 403:
        return 'Payment not allowed. Please contact support.';
      case 404:
        return 'Payment information not found. Please try again.';
      case 429:
        return 'Too many payment attempts. Please wait and try again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Payment service temporarily unavailable. Please try again later.';
      default:
        return 'Payment failed. Please try again.';
    }
  }

  // Network errors
  if (error.message === 'Network Error') {
    return 'Network connection problem. Please check your internet connection and try again.';
  }

  return error.message || 'Payment failed. Please try again.';
};

/**
 * Creates payment metadata for tracking
 * @param {Object} data - Data to include in metadata
 * @returns {Object} Payment metadata
 */
export const createPaymentMetadata = (data) => {
  return {
    userId: data.userId || 'guest',
    referenceNumber: data.referenceNumber,
    type: data.type,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    timestamp: new Date().toISOString(),
    source: 'web-frontend',
    version: '1.0'
  };
};

/**
 * Validates payment form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result
 */
export const validatePaymentForm = (formData) => {
  const errors = [];

  if (!formData.referenceNumber) {
    errors.push('Reference number is required');
  }

  if (!formData.type || !['appointment', 'order'].includes(formData.type)) {
    errors.push('Valid payment type is required');
  }

  if (!formData.amount || formData.amount <= 0) {
    errors.push('Valid payment amount is required');
  }

  if (!formData.customerInfo?.email) {
    errors.push('Customer email is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generates payment receipt data
 * @param {Object} paymentData - Payment data
 * @param {Object} paymentIntent - Stripe payment intent
 * @returns {Object} Receipt data
 */
export const generatePaymentReceipt = (paymentData, paymentIntent) => {
  return {
    receiptId: paymentIntent.id,
    referenceNumber: paymentData.referenceNumber,
    type: paymentData.type,
    amount: convertToDollars(paymentIntent.amount),
    currency: paymentIntent.currency.toUpperCase(),
    status: paymentIntent.status,
    paymentMethod: paymentIntent.charges?.data?.[0]?.payment_method_details?.type || 'card',
    lastFour: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4,
    brand: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.brand,
    customerInfo: paymentData.customerInfo,
    paidAt: new Date(paymentIntent.created * 1000).toISOString(),
    description: paymentData.description
  };
};

/**
 * Checks if payment is required for given status
 * @param {string} paymentStatus - Current payment status
 * @returns {boolean} Whether payment is required
 */
export const isPaymentRequired = (paymentStatus) => {
  const nonPaymentRequiredStatuses = ['paid', 'completed', 'succeeded', 'refunded'];
  return !nonPaymentRequiredStatuses.includes(paymentStatus?.toLowerCase());
};

/**
 * Gets payment button text based on status
 * @param {string} paymentStatus - Current payment status
 * @param {number} amount - Payment amount
 * @returns {string} Button text
 */
export const getPaymentButtonText = (paymentStatus, amount) => {
  if (!isPaymentRequired(paymentStatus)) {
    return 'Payment Completed';
  }
  
  return `Pay ${formatPaymentAmount(amount)}`;
};

/**
 * Formats payment date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatPaymentDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return date.toString();
  }
};
