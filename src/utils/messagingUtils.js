import { v4 as uuidv4 } from 'uuid';
import { createPerthTimestamp } from './timezoneUtils';

/**
 * Generate a unique message ID following the API specification
 * @returns {string} Unique message ID with timestamp and random component
 */
export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a unique user ID
 * @returns {string} Unique user ID
 */
export const generateUserId = () => {
  return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Message status constants as per API specification
 */
export const MESSAGE_STATUS = {
  TYPING: 'TYPING',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  MESSAGE_VIEWED: 'MESSAGE_VIEWED',
  MESSAGE_DELETED: 'MESSAGE_DELETED',
  MESSAGE_EDITED: 'MESSAGE_EDITED'
};

/**
 * Format message for display and API compatibility
 * @param {Object} rawMessage - Raw message from API
 * @param {string} currentUserId - Current user ID to determine message direction
 * @returns {Object} Formatted message object
 */
export const formatMessage = (rawMessage, currentUserId) => {
  // Use the original timestamp from the message, or createdAt if timestamp is not available
  const originalTimestamp = rawMessage.timestamp || rawMessage.createdAt || Math.floor(Date.now() / 1000);
  
  return {
    messageId: rawMessage.messageId,
    senderId: rawMessage.senderId,
    receiverId: rawMessage.receiverId,
    message: rawMessage.message,
    timestamp: originalTimestamp,
    createdAt: originalTimestamp.toString(),
    status: rawMessage.viewed ? MESSAGE_STATUS.MESSAGE_VIEWED : MESSAGE_STATUS.MESSAGE_RECEIVED,
    type: (rawMessage.senderId === currentUserId) ? 'sent' : 'received',
    sent: true,
    received: rawMessage.received === true,
    viewed: rawMessage.viewed === true,
    notificationSent: rawMessage.notificationSent === true, // Preserve notification status
  };
};

/**
 * Create a message object for sending
 * @param {string} clientId - Customer user ID
 * @param {string} messageText - Message content
 * @returns {Object} Message object ready for API
 */
export const createSendMessagePayload = (clientId, messageText) => {
  return {
    clientId,
    messageId: generateMessageId(),
    message: messageText
  };
};

/**
 * Create a notification payload
 * @param {string} userId - User ID
 * @param {string} status - Status type
 * @param {string} messageId - Message ID (optional, required for message-specific statuses)
 * @param {string} newMessage - New message content (for edits)
 * @returns {Object} Notification payload
 */
export const createNotificationPayload = (userId, status, messageId = null, newMessage = null) => {
  const payload = {
    userId,
    status
  };
  
  if (messageId) {
    payload.messageId = messageId;
  }
  
  if (newMessage) {
    payload.newMessage = newMessage;
  }
  
  return payload;
};

/**
 * Validate message content
 * @param {string} message - Message content
 * @returns {boolean} True if valid
 */
export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return false;
  }
  
  // Trim whitespace and check if empty
  return message.trim().length > 0;
};

/**
 * Create WebSocket initialization message
 * @param {string} userId - User ID
 * @param {Object} userData - User data object
 * @returns {Object} WebSocket init message
 */
export const createWebSocketInitMessage = (userId, userData) => {
  return {
    action: 'init',
    userId,
    userEmail: userData.userEmail || '',
    userName: userData.userName || '',
    userDevice: userData.userDevice || 'Web Browser',
    userLocation: userData.userLocation || 'Unknown',
    contactNumber: userData.contactNumber || ''
  };
};

/**
 * Create WebSocket ping message
 * @returns {Object} WebSocket ping message
 */
export const createWebSocketPingMessage = () => {
  return {
    action: 'ping',
    timestamp: Date.now()
  };
};

/**
 * Handle API errors gracefully
 * @param {Error} error - Error object
 * @param {string} operation - Operation being performed
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, operation = 'operation') => {
  console.error(`Error in ${operation}:`, error);
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return data.error || 'Invalid request. Please check your input.';
      case 401:
      case 403:
        return 'Authentication failed. Please try again.';
      case 404:
        return data.error || 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.error || 'An unexpected error occurred.';
    }
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};

/**
 * Check if a message needs a "received" notification
 * @param {Object} message - Message object
 * @returns {boolean} True if notification needed
 */
export const needsReceivedNotification = (message) => {
  return message.type === 'received' && 
         message.received === false && 
         message.messageId && 
         !message.notificationSent && // Avoid duplicate notifications
         message.senderId !== message.receiverId; // Don't notify for own messages
};

/**
 * Debounce function for typing indicators
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Format timestamp for display
 * @param {number|string} timestamp - Unix timestamp (in seconds) or ISO string
 * @returns {string} Formatted time string
 */
export const formatTimestamp = (timestamp) => {
  let date;
  
  if (typeof timestamp === 'string') {
    // If it's a string, try to parse it as a number first
    const numTimestamp = parseInt(timestamp, 10);
    if (!isNaN(numTimestamp)) {
      // If it's a valid number, treat it as Unix timestamp in seconds
      date = new Date(numTimestamp * 1000);
    } else {
      // Otherwise, try to parse it as an ISO string
      date = new Date(timestamp);
    }
  } else {
    // If it's already a number, treat it as Unix timestamp in seconds
    date = new Date(timestamp * 1000);
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid time';
  }
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Sort messages by timestamp in chronological order (oldest first)
 * @param {Array} messages - Array of message objects
 * @returns {Array} Sorted array of messages
 */
export const sortMessagesByTimestamp = (messages) => {
  return [...messages].sort((a, b) => {
    const timestampA = parseInt(a.createdAt, 10) || 0;
    const timestampB = parseInt(b.createdAt, 10) || 0;
    return timestampA - timestampB;
  });
};

/**
 * Split long messages into multiple lines for display
 * @param {string} text - Message text
 * @param {number} charLimit - Character limit per line
 * @returns {Array<string>} Array of lines
 */
export const splitMessageText = (text, charLimit = 32) => {
  if (!text) return [];
  if (text.length <= charLimit) return [text];
  
  const words = text.split(' ');
  let lines = [], currentLine = '';
  
  for (let word of words) {
    if ((currentLine + word).length > charLimit) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  
  if (currentLine) lines.push(currentLine.trim());
  return lines;
};

// Format message text for display (wrapper around splitMessageText)
export const formatMessageText = (text, charLimit = 32) => {
  return splitMessageText(text, charLimit);
};

// Check if typing indicator should be shown for a message
export const showTypingIndicatorForMessage = (typingStatus) => {
  return typingStatus?.isTyping && typingStatus?.sender;
};

/**
 * Sync messages from backend with local state during WebSocket reconnection
 * This function ensures all messages are up-to-date and handles message status synchronization
 * @param {Object} restClient - Rest client instance
 * @param {string} userId - Current user ID
 * @param {Array} localMessages - Current local messages array
 * @param {Function} updateMessages - Function to update messages in global state
 * @returns {Promise<Object>} Result object with sync status and message counts
 */
export const syncMessagesOnReconnection = async (restClient, userId, localMessages, updateMessages) => {
  if (!restClient || !userId) {
    console.log('❌ Cannot sync messages - missing restClient or userId');
    return { success: false, error: 'Missing required parameters' };
  }

  console.log('🔄 Starting message synchronization on WebSocket reconnection...', {
    userId,
    localMessageCount: localMessages.length,
    timestamp: createPerthTimestamp(),
    restClientAvailable: !!restClient
  });

  try {
    // 1. Fetch all messages from backend
    console.log('📡 Fetching messages from backend API...');
    const response = await restClient.get('messages', { clientId: userId });
    
    console.log('📡 Backend API response:', {
      status: response.status,
      hasData: !!response.data,
      hasMessages: !!response.data?.messages,
      messageCount: response.data?.messages?.length || 0
    });
    
    if (response.status !== 200 || !response.data?.messages) {
      throw new Error(response.data?.error || 'Failed to fetch messages from backend');
    }

    const backendMessages = response.data.messages || [];
    console.log('📨 Retrieved messages from backend:', {
      count: backendMessages.length,
      messageIds: backendMessages.map(m => m.messageId),
      messagePreviews: backendMessages.map(m => ({
        id: m.messageId,
        message: m.message?.substring(0, 30) + '...',
        senderId: m.senderId,
        received: m.received,
        viewed: m.viewed
      }))
    });

    // 2. Format backend messages and preserve local states where appropriate
    const formattedBackendMessages = backendMessages.map(msg => {
      const formatted = formatMessage(msg, userId);
      
      // Preserve local viewed status if it's more recent (user might have viewed locally)
      const existingLocalMessage = localMessages.find(localMsg => 
        localMsg.messageId === formatted.messageId
      );
      
      if (existingLocalMessage) {
        // Preserve local states that should take precedence
        formatted.viewed = existingLocalMessage.viewed || formatted.viewed;
        formatted.received = existingLocalMessage.received || formatted.received;
        
        console.log(`🔄 Preserved local states for message ${formatted.messageId}:`, {
          viewed: formatted.viewed,
          received: formatted.received
        });
      }
      
      return formatted;
    });

    // 3. Identify messages that need status updates
    const messagesNeedingReceivedUpdate = [];
    const messagesNeedingViewedUpdate = [];

    formattedBackendMessages.forEach(msg => {
      // Only process received messages (not our own sent messages)
      if (msg.type === 'received' && msg.senderId !== userId) {
        // Check if message needs "received" status update
        if (!msg.received) {
          messagesNeedingReceivedUpdate.push(msg);
        }
        
        // Check if message needs "viewed" status update (if it was viewed locally but not on backend)
        const localMsg = localMessages.find(local => local.messageId === msg.messageId);
        if (localMsg && localMsg.viewed && !msg.viewed) {
          messagesNeedingViewedUpdate.push(msg);
        }
      }
    });

    console.log('📋 Message status analysis:', {
      totalBackendMessages: formattedBackendMessages.length,
      needingReceivedUpdate: messagesNeedingReceivedUpdate.length,
      needingViewedUpdate: messagesNeedingViewedUpdate.length,
      receivedUpdateIds: messagesNeedingReceivedUpdate.map(m => m.messageId),
      viewedUpdateIds: messagesNeedingViewedUpdate.map(m => m.messageId)
    });

    // 4. Send status updates to backend for messages that need them
    const statusUpdateResults = {
      received: { success: [], failed: [] },
      viewed: { success: [], failed: [] }
    };

    // Send "received" status updates
    for (const msg of messagesNeedingReceivedUpdate) {
      try {
        const notificationData = createNotificationPayload(userId, MESSAGE_STATUS.MESSAGE_RECEIVED, msg.messageId);
        await restClient.post('messages/notify', notificationData);
        statusUpdateResults.received.success.push(msg.messageId);
        console.log(`✅ Sent MESSAGE_RECEIVED for message: ${msg.messageId}`);
        
        // Update the message locally to mark as received
        msg.received = true;
      } catch (error) {
        console.error(`❌ Failed to send MESSAGE_RECEIVED for ${msg.messageId}:`, error);
        statusUpdateResults.received.failed.push({
          messageId: msg.messageId,
          error: error.message
        });
      }
    }

    // Send "viewed" status updates
    for (const msg of messagesNeedingViewedUpdate) {
      try {
        const notificationData = createNotificationPayload(userId, MESSAGE_STATUS.MESSAGE_VIEWED, msg.messageId);
        await restClient.post('messages/notify', notificationData);
        statusUpdateResults.viewed.success.push(msg.messageId);
        console.log(`✅ Sent MESSAGE_VIEWED for message: ${msg.messageId}`);
        
        // Update the message locally to mark as viewed
        msg.viewed = true;
      } catch (error) {
        console.error(`❌ Failed to send MESSAGE_VIEWED for ${msg.messageId}:`, error);
        statusUpdateResults.viewed.failed.push({
          messageId: msg.messageId,
          error: error.message
        });
      }
    }

    // 5. Merge with local messages and handle sync
    console.log('🔄 Starting smart message merge for sync...', {
      backendMessages: formattedBackendMessages.length,
      localMessages: localMessages.length,
      backendIds: formattedBackendMessages.map(m => m.messageId),
      localIds: localMessages.map(m => m.messageId)
    });
    
    const backendMessageIds = new Set(formattedBackendMessages.map(m => m.messageId));
    const backendTimestamps = new Set(formattedBackendMessages.map(m => m.createdAt || m.timestamp));
    
    // Keep local messages that are client-side only (bot/card) or exist in backend
    const validLocalMessages = localMessages.filter(localMsg => {
      const existsById = backendMessageIds.has(localMsg.messageId);
      const existsByTimestamp = backendTimestamps.has(localMsg.createdAt || localMsg.timestamp);
      const isClientSideMessage = localMsg.type === 'bot' || localMsg.type === 'card';
      
      return existsById || existsByTimestamp || isClientSideMessage;
    });

    // Identify local messages that were removed from backend
    const removedLocalMessages = localMessages.filter(localMsg => {
      const existsById = backendMessageIds.has(localMsg.messageId);
      const existsByTimestamp = backendTimestamps.has(localMsg.createdAt || localMsg.timestamp);
      const isClientSideMessage = localMsg.type === 'bot' || localMsg.type === 'card';
      
      return !existsById && !existsByTimestamp && !isClientSideMessage;
    });

    // Start with all backend messages (they are the authoritative source)
    let finalMessages = [...formattedBackendMessages];
    
    // Add client-side messages that don't exist in backend
    const clientSideMessages = localMessages.filter(localMsg => {
      const isClientSideMessage = localMsg.type === 'bot' || localMsg.type === 'card';
      const existsInBackend = backendMessageIds.has(localMsg.messageId);
      return isClientSideMessage && !existsInBackend;
    });
    
    finalMessages = [...finalMessages, ...clientSideMessages];

    // Find completely new messages from backend
    const existingLocalIds = new Set(localMessages.map(m => m.messageId));
    const newMessagesFromBackend = formattedBackendMessages.filter(msg => 
      !existingLocalIds.has(msg.messageId)
    );

    // 6. Create final merged message list - already done above
    // finalMessages already contains the merged result
    
    // Sort all messages by timestamp
    const sortedMessages = sortMessagesByTimestamp(finalMessages);
    
    // 7. Update global state
    updateMessages(sortedMessages);
    
    const syncResult = {
      success: true,
      totalBackendMessages: backendMessages.length,
      totalLocalMessages: localMessages.length,
      finalMessageCount: sortedMessages.length,
      removedLocalCount: removedLocalMessages.length,
      newFromBackendCount: newMessagesFromBackend.length,
      clientSideMessagesKept: clientSideMessages.length,
      statusUpdates: statusUpdateResults,
      removedMessageIds: removedLocalMessages.map(m => m.messageId),
      newMessageIds: newMessagesFromBackend.map(m => m.messageId)
    };

    console.log('✅ Message synchronization completed successfully:', syncResult);
    return syncResult;
    
  } catch (error) {
    const errorMsg = handleApiError(error, 'message synchronization');
    console.error('❌ Message synchronization failed:', errorMsg);
    return { 
      success: false, 
      error: errorMsg,
      originalError: error
    };
  }
};

/**
 * Check and update message statuses for messages that might need status corrections
 * This is a more targeted function for ongoing status maintenance
 * @param {Object} restClient - Rest client instance
 * @param {string} userId - Current user ID
 * @param {Array} messages - Current messages array
 * @param {Function} updateMessages - Function to update messages in global state
 * @param {boolean} chatboxOpen - Whether chatbox is currently open
 * @returns {Promise<Object>} Result object with update status
 */
export const validateAndUpdateMessageStatuses = async (restClient, userId, messages, updateMessages, chatboxOpen = false) => {
  if (!restClient || !userId || !messages.length) {
    console.log('❌ Cannot validate message statuses - missing required parameters');
    return { success: false, error: 'Missing required parameters' };
  }

  console.log('🔍 Validating message statuses...', {
    messageCount: messages.length,
    chatboxOpen,
    userId
  });

  const statusUpdates = {
    received: { needed: [], success: [], failed: [] },
    viewed: { needed: [], success: [], failed: [] }
  };

  let updatedMessages = [...messages];
  let hasUpdates = false;

  // Check messages for status updates needed
  for (const msg of messages) {
    if (msg.type === 'received' && msg.senderId !== userId) {
      // Check if "received" status needs updating
      if (!msg.received) {
        statusUpdates.received.needed.push(msg.messageId);
        
        try {
          const notificationData = createNotificationPayload(userId, MESSAGE_STATUS.MESSAGE_RECEIVED, msg.messageId);
          await restClient.post('messages/notify', notificationData);
          statusUpdates.received.success.push(msg.messageId);
          
          // Update local message
          const msgIndex = updatedMessages.findIndex(m => m.messageId === msg.messageId);
          if (msgIndex !== -1) {
            updatedMessages[msgIndex] = { ...updatedMessages[msgIndex], received: true };
            hasUpdates = true;
          }
          
          console.log(`✅ Updated MESSAGE_RECEIVED for: ${msg.messageId}`);
        } catch (error) {
          console.error(`❌ Failed to update MESSAGE_RECEIVED for ${msg.messageId}:`, error);
          statusUpdates.received.failed.push({
            messageId: msg.messageId,
            error: error.message
          });
        }
      }

      // Check if "viewed" status needs updating (only if chatbox is open)
      if (chatboxOpen && !msg.viewed) {
        statusUpdates.viewed.needed.push(msg.messageId);
        
        try {
          const notificationData = createNotificationPayload(userId, MESSAGE_STATUS.MESSAGE_VIEWED, msg.messageId);
          await restClient.post('messages/notify', notificationData);
          statusUpdates.viewed.success.push(msg.messageId);
          
          // Update local message
          const msgIndex = updatedMessages.findIndex(m => m.messageId === msg.messageId);
          if (msgIndex !== -1) {
            updatedMessages[msgIndex] = { ...updatedMessages[msgIndex], viewed: true };
            hasUpdates = true;
          }
          
          console.log(`✅ Updated MESSAGE_VIEWED for: ${msg.messageId}`);
        } catch (error) {
          console.error(`❌ Failed to update MESSAGE_VIEWED for ${msg.messageId}:`, error);
          statusUpdates.viewed.failed.push({
            messageId: msg.messageId,
            error: error.message
          });
        }
      }
    }
  }

  // Update global state if there were changes
  if (hasUpdates) {
    const sortedMessages = sortMessagesByTimestamp(updatedMessages);
    updateMessages(sortedMessages);
  }

  const result = {
    success: true,
    hasUpdates,
    statusUpdates,
    summary: {
      receivedUpdated: statusUpdates.received.success.length,
      viewedUpdated: statusUpdates.viewed.success.length,
      totalFailed: statusUpdates.received.failed.length + statusUpdates.viewed.failed.length
    }
  };

  console.log('✅ Message status validation completed:', result);
  return result;
};
