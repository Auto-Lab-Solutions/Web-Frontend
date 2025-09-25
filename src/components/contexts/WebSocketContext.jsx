import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRestClient } from './RestContext';
import { useGlobalData } from './GlobalDataContext';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { v4 as uuidv4 } from 'uuid';
import { 
  formatMessage, 
  syncMessagesOnReconnection, 
  validateAndUpdateMessageStatuses 
} from '../../utils/messagingUtils';

// Temporary local implementation to avoid import issues
const sortMessagesByTimestamp = (messages) => {
  return [...messages].sort((a, b) => {
    const timestampA = parseInt(a.createdAt, 10) || 0;
    const timestampB = parseInt(b.createdAt, 10) || 0;
    return timestampA - timestampB;
  });
};

const WS_ENDPOINT = import.meta.env.VITE_WEB_SOCKET_BASE_URL;

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { restClient } = useRestClient();
  const { userId, userData, messages, staffUserTyping, updateUserId,
    updateMessages, updateStaffUserTyping,
    clearUserData, clearMessages, clearStaffUserTyping } = useGlobalData();
  const [wsClient, setWsClient] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [wasOffline, setWasOffline] = useState(false); // Track if we were previously offline
  const [isInitialized, setIsInitialized] = useState(false); // Track if init process is complete
  const pingIntervalRef = useRef(null);
  const initializationRef = useRef(false);
  const chatboxOpenRef = useRef(false); // Track if chatbox is currently open
  const lastSyncTimestamp = useRef(0); // Track last sync to prevent duplicate syncs


  // Refs to maintain current values in closures
  const refs = useRef({
    restClient,
    wsClient,
    userId,
    userData,
    messages,
    staffUserTyping,
    isConnecting,
  });

  // Update refs when values change
  useEffect(() => {
    refs.current = {
      restClient,
      wsClient,
      userId,
      userData,
      messages,
      staffUserTyping,
      isConnecting,
    };
  }, [restClient, wsClient, userId, userData, messages, staffUserTyping, isConnecting]);

  // Function to update chatbox open status
  const setChatboxOpen = useCallback((isOpen) => {
    console.log('📱 Chatbox status changed:', isOpen ? 'OPENED' : 'CLOSED');
    chatboxOpenRef.current = isOpen;
  }, []);

  // Perform message synchronization after WebSocket reconnection
  const performMessageSync = useCallback(async () => {
    const { restClient, userId, messages } = refs.current;
    
    if (!restClient || !userId) {
      console.log('❌ Cannot perform message sync - missing restClient or userId');
      return;
    }

    // Prevent duplicate syncs within 5 seconds
    const now = Date.now();
    if (now - lastSyncTimestamp.current < 5000) {
      console.log('⏭️ Skipping message sync - too recent (within 5 seconds)');
      return;
    }
    
    lastSyncTimestamp.current = now;
    console.log('🔄 Performing message synchronization after WebSocket reconnection...');
    
    try {
      const { syncMessagesOnReconnection } = await import('../../utils/messagingUtils');
      
      const syncResult = await syncMessagesOnReconnection(
        restClient,
        userId,
        messages,
        updateMessages
      );
      
      if (syncResult.success) {
        console.log('✅ Message synchronization completed:', {
          totalMessages: syncResult.finalMessageCount,
          newMessages: syncResult.newFromBackendCount,
          removedMessages: syncResult.removedLocalCount,
          statusUpdates: syncResult.statusUpdates
        });
        
        // If chatbox is open, also validate and update any remaining message statuses
        if (chatboxOpenRef.current) {
          console.log('📱 Chatbox is open, validating message statuses...');
          setTimeout(async () => {
            const { validateAndUpdateMessageStatuses } = await import('../../utils/messagingUtils');
            await validateAndUpdateMessageStatuses(
              restClient,
              userId,
              refs.current.messages,
              updateMessages,
              true
            );
          }, 1000); // Small delay to let the sync complete
        }
      } else {
        console.error('❌ Message synchronization failed:', syncResult.error);
      }
    } catch (error) {
      console.error('❌ Error during message synchronization:', error);
    }
  }, [updateMessages]);

  // Handle notification events
  const handleNotification = useCallback((eventData) => {
    console.log('📬 WebSocket Notification Received:', {
      type: eventData.type,
      subtype: eventData.subtype,
      status: eventData.status,
      messageId: eventData.messageId,
      success: eventData.success,
      timestamp: new Date().toISOString(),
      fullData: eventData
    });

    const { messages } = refs.current;

    switch (eventData.subtype) {
      case 'status':
        if (eventData.status === 'MESSAGE_EDITED' && eventData.success) {
            console.log('✏️ Message Edit Notification:', {
              messageId: eventData.messageId,
              newMessage: eventData.newMessage,
              existsInMessages: messages.some(msg => msg.messageId === eventData.messageId)
            });
            if (messages.some(msg => msg.messageId === eventData.messageId)) {
                const updatedMessages = messages.map((msg) => 
                    msg.messageId === eventData.messageId
                        ? { ...msg, message: eventData.newMessage }
                        : msg
                );
                const sortedMessages = sortMessagesByTimestamp(updatedMessages);
                updateMessages(sortedMessages);
                console.log('✅ Message updated in local state');
            }
        } else if (eventData.status === 'MESSAGE_DELETED' && eventData.success) {
            console.log('🗑️ Message Delete Notification:', {
              messageId: eventData.messageId,
              existsInMessages: messages.some(msg => msg.messageId === eventData.messageId)
            });
        if (messages.some(msg => msg.messageId === eventData.messageId)) {
          const updatedMessages = messages.filter(msg => msg.messageId !== eventData.messageId);
          const sortedMessages = sortMessagesByTimestamp(updatedMessages);
          updateMessages(sortedMessages);
          console.log('✅ Message removed from local state');
        }
        } else if (eventData.status === 'TYPING' && eventData.success) {
          console.log('⌨️ Typing Notification:', {
            currentTypingStatus: staffUserTyping,
            willShowTyping: !staffUserTyping
          });
          if (!staffUserTyping) {
            updateStaffUserTyping(true);
            const typingMessages = sortMessagesByTimestamp([
                ...messages,
                {
                    type: 'typing',
                    messageId: uuidv4(),
                    message: 'Typing...',
                    createdAt: Math.floor(Date.now() / 1000),
                    sent: true,
                    received: true,
                    viewed: true,
                },
            ]);
            updateMessages(typingMessages);
            console.log('✅ Typing indicator added');
            setTimeout(() => {
              updateStaffUserTyping(false);
              // Use fresh refs to get current messages, not stale closure
              const currentMessages = refs.current.messages;
              const filteredMessages = sortMessagesByTimestamp(currentMessages.filter(msg => msg.type !== 'typing'));
              updateMessages(filteredMessages);
              console.log('⏰ Typing indicator removed after timeout');
            }, 3000);
          }
        } else if (eventData.status === 'MESSAGE_RECEIVED' && eventData.success) {
          console.log('👀 Message Received Notification:', {
            messageId: eventData.messageId,
            existsInMessages: messages.some(msg => msg.messageId === eventData.messageId)
          });
          const messageId = eventData.messageId;
          if (messages.some(msg => msg.messageId === messageId)) {
            const updatedMessages = messages.map((msg) => 
                msg.messageId === messageId
                ? { ...msg, received: true }
                : msg
            );
            const sortedMessages = sortMessagesByTimestamp(updatedMessages);
            updateMessages(sortedMessages);
            console.log('✅ Message marked as received in local state');
          }
        } else if (eventData.status === 'MESSAGE_VIEWED' && eventData.success) {
          console.log('👁️ Message Viewed Notification:', {
            messageId: eventData.messageId,
            existsInMessages: messages.some(msg => msg.messageId === eventData.messageId)
          });
          const messageId = eventData.messageId;
          if (messages.some(msg => msg.messageId === messageId)) {
            const updatedMessages = messages.map((msg) => 
                msg.messageId === messageId
                ? { ...msg, viewed: true }
                : msg
            );
            const sortedMessages = sortMessagesByTimestamp(updatedMessages);
            updateMessages(sortedMessages);
            console.log('✅ Message marked as viewed in local state');
          }
        } else {
          console.error('❗ Unknown notification subtype:', eventData);
        }
        break;
      default:
        console.error('❗ Unknown notification type:', eventData.type);
        break;
    }
  }, [updateMessages, updateStaffUserTyping]);

  // Handle message events
  const handleMessage = useCallback(async (eventData) => {
    console.log('💬 WebSocket Message Received:', {
      type: eventData.type,
      subtype: eventData.subtype,
      messageId: eventData.messageId,
      senderId: eventData.senderId,
      messageType: eventData.messageType,
      timestamp: eventData.timestamp,
      success: eventData.success,
      receivedAt: new Date().toISOString(),
      fullData: eventData
    });
    
    const { restClient } = refs.current;
    
    switch (eventData.subtype) {
      case 'new':
        console.log('🆕 New message from staff received:', {
          messageId: eventData.messageId,
          senderId: eventData.senderId,
          messageType: eventData.messageType,
          timestamp: eventData.timestamp,
          existsInMessages: refs.current.messages.some(msg => msg.messageId === eventData.messageId)
        });
        
        // Check if message already exists to prevent duplicates - use fresh refs
        if (refs.current.messages.some(msg => msg.messageId === eventData.messageId)) {
          console.log('⚠️ Message already exists in local state, skipping:', eventData.messageId);
          return;
        }
        
        console.log('🔍 Current messages before adding new message:', {
          messageCount: refs.current.messages.length,
          messageIds: refs.current.messages.map(m => m.messageId),
          newMessageId: eventData.messageId
        });        // Send received notification for new message
        try {
          console.log('📤 Sending received notification for new message:', eventData.messageId);
          await restClient.post('messages/notify', {
            userId: refs.current.userId,
            status: 'MESSAGE_RECEIVED',
            messageId: eventData.messageId,
          });
          console.log('✅ Received notification sent successfully');
        } catch (error) {
          console.error('❌ Failed to send received notification:', error);
        }
        
        // Handle message content - check if it's already in the notification or refresh all messages
        let messageContent = null;
        let senderName = 'Support Agent';
        
        if (eventData.message || eventData.content) {
          // Message content is included in the notification
          console.log('📨 Message content included in notification');
          messageContent = eventData.message || eventData.content;
          senderName = eventData.senderName || eventData.sender || 'Support Agent';
          
          // Add message to local state
          const newMessage = {
            type: 'received',
            messageId: eventData.messageId,
            senderId: eventData.senderId,
            receiverId: refs.current.userId,
            message: messageContent,
            createdAt: eventData.timestamp.toString(),
            timestamp: eventData.timestamp,
            status: 'DELIVERED',
            senderName: senderName,
            sent: true,
            received: true, // Mark as received since we're processing it
            viewed: chatboxOpenRef.current, // Only mark as viewed if chatbox is currently open
            notificationSent: false // Ensure notification will be sent for new real-time messages
          };
          
          const updatedMessages = sortMessagesByTimestamp([...refs.current.messages, newMessage]);
          updateMessages(updatedMessages);
          console.log('✅ New message added to local state:', {
            messageId: eventData.messageId,
            contentPreview: messageContent?.substring(0, 50) + '...',
            sender: senderName,
            markedViewed: chatboxOpenRef.current,
            totalMessages: updatedMessages.length,
            messageTypes: updatedMessages.map(m => m.type)
          });

          // Send viewed notification only if chatbox is currently open
          if (chatboxOpenRef.current) {
            console.log('📱 Chatbox is open, sending viewed notification for message:', eventData.messageId);
            try {
              const notificationPayload = {
                userId: refs.current.userId,
                status: 'MESSAGE_VIEWED',
                messageId: eventData.messageId,
              };
              console.log('📤 Sending viewed notification with payload:', notificationPayload);
              
              await restClient.post('messages/notify', notificationPayload);
              console.log('✅ Viewed notification sent for message:', eventData.messageId);
              
              // Update the message to mark it as viewed
              newMessage.viewed = true;
            } catch (error) {
              console.error('❌ Failed to send viewed notification for new message:', error);
              console.error('❌ Error details:', error.response?.data || error.message);
            }
          } else {
            console.log('📱 Chatbox is closed, message will be marked as unviewed for later notification');
          }
        } else {
          // Message content not included - refresh all messages to get the latest state
          console.log('🔄 Message content not included, refreshing all messages...');
          try {
            const response = await restClient.get('messages', { clientId: refs.current.userId });
            
            if (response.status === 200 && response.data?.messages) {
              const messagesData = response.data.messages || [];
              const formattedMessages = messagesData.map(msg => {
                const formatted = formatMessage(msg, refs.current.userId);
                // Preserve existing message states to prevent overwriting real-time updates
                const existingMessage = refs.current.messages.find(m => m.messageId === formatted.messageId);
                if (existingMessage) {
                  // Keep the existing message's notification states to avoid overwrites
                  formatted.notificationSent = existingMessage.notificationSent;
                  formatted.received = existingMessage.received;
                  formatted.viewed = existingMessage.viewed;
                } else if (formatted.type === 'received' && formatted.messageId === eventData.messageId) {
                  // This is the new message we just received
                  formatted.received = true;
                  formatted.notificationSent = false;
                  formatted.viewed = chatboxOpenRef.current; // Only mark as viewed if chatbox is open
                } else if (formatted.type === 'received') {
                  // Other existing received messages - preserve their states or set defaults
                  formatted.notificationSent = false;
                  formatted.received = false;
                  formatted.viewed = false;
                }
                return formatted;
              });
              
              const sortedMessages = sortMessagesByTimestamp(formattedMessages);
              updateMessages(sortedMessages);
              console.log('✅ All messages refreshed, new message should be included');

              // Send viewed notification only if chatbox is currently open
              if (chatboxOpenRef.current) {
                console.log('📱 Chatbox is open, sending viewed notification for refreshed message:', eventData.messageId);
                try {
                  await restClient.post('messages/notify', {
                    userId: refs.current.userId,
                    status: 'MESSAGE_VIEWED',
                    messageId: eventData.messageId,
                  });
                  console.log('✅ Viewed notification sent for refreshed message:', eventData.messageId);
                } catch (error) {
                  console.error('❌ Failed to send viewed notification for refreshed message:', error);
                }
              } else {
                console.log('📱 Chatbox is closed, refreshed message will be marked as unviewed for later notification');
              }
            } else {
              throw new Error('No messages data in API response');
            }
          } catch (error) {
            console.error('❌ Failed to refresh messages from API:', error);
            // Fallback: create a placeholder message
            const fallbackMessage = {
              type: 'received',
              messageId: eventData.messageId,
              senderId: eventData.senderId,
              receiverId: refs.current.userId,
              message: 'New message received (please refresh to see content)',
              createdAt: eventData.timestamp.toString(),
              timestamp: eventData.timestamp,
              status: 'DELIVERED',
              senderName: 'Support Agent',
              sent: true,
              received: true,
              viewed: chatboxOpenRef.current, // Only mark as viewed if chatbox is open
              notificationSent: false
            };
            
            const updatedMessages = sortMessagesByTimestamp([...refs.current.messages, fallbackMessage]);
            updateMessages(updatedMessages);

            // Send viewed notification only if chatbox is currently open
            if (chatboxOpenRef.current) {
              console.log('📱 Chatbox is open, sending viewed notification for fallback message:', eventData.messageId);
              try {
                await restClient.post('messages/notify', {
                  userId: refs.current.userId,
                  status: 'MESSAGE_VIEWED',
                  messageId: eventData.messageId,
                });
                console.log('✅ Viewed notification sent for fallback message:', eventData.messageId);
              } catch (error) {
                console.error('❌ Failed to send viewed notification for fallback message:', error);
              }
            } else {
              console.log('📱 Chatbox is closed, fallback message will be marked as unviewed for later notification');
            }
          }
        }
        break;
        
      default:
        console.error('❗ Unknown message subtype:', eventData.subtype);
        console.log('📋 Available subtypes: "new" (for staff messages)');
        console.log('🔍 Full event data:', eventData);
        break;
    }
  }, [restClient, messages, updateMessages]);

  // Setup WebSocket ping
  const setupWebSocketPing = useCallback(() => {
    const { wsClient } = refs.current;
    if (!wsClient) return;
    
    // Clear existing ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    // Send ping every 25 seconds (before 30-second timeout)
    pingIntervalRef.current = setInterval(() => {
      if (wsClient.readyState === WebSocket.OPEN) {
        const pingMessage = {
          action: 'ping',
          timestamp: Date.now()
        };
        try {
          wsClient.send(JSON.stringify(pingMessage));
          console.log('🏓 Ping sent:', pingMessage);
        } catch (error) {
          console.error('❌ Failed to send ping:', error);
          // If ping fails, the connection might be dead
          clearInterval(pingIntervalRef.current);
        }
      } else {
        console.warn('⚠️ Cannot send ping - WebSocket not in OPEN state:', wsClient.readyState);
        clearInterval(pingIntervalRef.current);
      }
    }, 25000); // Changed from 30000 to 25000
  }, []);

  // Handle connection events
  const handleConnection = useCallback((eventData) => {
    console.log('🔗 WebSocket Connection Event:', {
      type: eventData.type,
      subtype: eventData.subtype,
      success: eventData.success,
      userId: eventData.userId,
      timestamp: new Date().toISOString(),
      fullData: eventData
    });

    switch (eventData.subtype) {
      case 'init':
        if (eventData.success !== true) {
          console.error('❗ Connection initialization failed:', eventData);
          return;
        }
        console.log('✅ Connection initialized successfully:', {
          serverAssignedUserId: eventData.userId,
          existingUserId: refs.current.userId,
          isNewUser: !refs.current.userId
        });
        
        // CRITICAL: Only accept server-assigned userId for NEW users
        // For existing users (with userId in localStorage), always keep the existing userId
        // This prevents creating new user sessions when opening the app in new tabs
        if (!refs.current.userId && eventData.userId) {
          console.log('🆔 New user detected - accepting server-assigned userId:', eventData.userId);
          updateUserId(eventData.userId);
        } else if (refs.current.userId) {
          console.log('🆔 Existing user detected - keeping localStorage userId:', refs.current.userId);
          
          // Verify that server acknowledged our existing userId
          if (eventData.userId && eventData.userId !== refs.current.userId) {
            console.warn('⚠️ Server assigned different userId than our existing one:', {
              serverUserId: eventData.userId,
              ourUserId: refs.current.userId,
              action: 'keeping our existing userId'
            });
          }
        } else {
          console.warn('⚠️ No userId from server and no existing userId - this might cause issues');
        }
        
        setTimeout(() => {
          console.log('🏓 Setting up WebSocket ping...');
          setupWebSocketPing();
        }, 2000);
        
        // Perform message synchronization if we were previously offline
        if (wasOffline) {
          console.log('🔄 Was offline, triggering message synchronization...');
          setWasOffline(false);
          setTimeout(() => {
            performMessageSync();
          }, 3000); // Wait 3 seconds after connection to ensure stability
        }
        break;
      default:
        console.warn('⚠️ Unknown connection subtype:', eventData.subtype);
        break;
    }
  }, [updateUserId, setupWebSocketPing]);

  const createWebSocket = useCallback((userData) => {
    const { wsClient } = refs.current;
    
    // Prevent multiple simultaneous connections
    if (isConnecting || (wsClient && wsClient.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket connection already in progress, skipping...');
      return;
    }
    
    if (wsClient) {
      wsClient.close();
      refs.current.wsClient = null;
      setWsClient(null);
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');
    console.log('🔄 Creating new WebSocket connection to:', WS_ENDPOINT);
    
    // Add debugging for the endpoint
    if (!WS_ENDPOINT) {
      console.error('❌ WebSocket endpoint is not defined! Check VITE_WEB_SOCKET_BASE_URL');
      setIsConnecting(false);
      setConnectionStatus('error');
      return;
    }
    
    const newWsClient = new ReconnectingWebSocket(WS_ENDPOINT, [], {
      connectionTimeout: 10000, // Increased to 10 seconds
      maxReconnectionDelay: 10000, // Increased max delay
      minReconnectionDelay: 2000, // Increased min delay
      reconnectionDelayGrowFactor: 1.5, // Slower growth
      maxRetries: 5, // Reduced retries to prevent spam
      startClosed: false, // Ensure it starts connecting
    });

    newWsClient.onopen = () => {
      const { userId, userData } = refs.current;
      console.log('✅ WebSocket connection established successfully!');
      console.log('🔗 Connection details:', {
        readyState: newWsClient.readyState,
        url: newWsClient.url,
        protocol: newWsClient.protocol,
        timestamp: new Date().toISOString(),
        wasOffline: wasOffline
      });
      
      setIsConnecting(false);
      setConnectionStatus('connected');
      
      // Send initialization message according to API spec
      const initMessage = {
        action: 'init',
        userId: userId || null, // Explicitly send null if no userId exists
        userEmail: userData.userEmail || '',
        userName: userData.userName || '',
        userDevice: userData.userDevice || 'Web Browser',
        userLocation: userData.userLocation || 'Unknown',
        contactNumber: userData.contactNumber || ''
      };
      
      try {
        newWsClient.send(JSON.stringify(initMessage));
        setIsInitialized(true); // Mark as initialized after sending init message
      } catch (error) {
        console.error('❌ Failed to send init message:', error);
        setIsInitialized(false);
      }
      
      // Setup ping interval
      setupWebSocketPing();

      // If we were offline and now have a userId, trigger message sync
      if (wasOffline && userId) {
        console.log('🔄 Was offline and now connected, will trigger message sync after init...');
        // Wait for init response to complete, then sync
        setTimeout(() => {
          console.log('🔄 Triggering message sync after connection restoration...');
          performMessageSync();
        }, 5000); // Wait 5 seconds for init to complete
      }
    };

    newWsClient.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      console.error('❌ WebSocket state:', newWsClient.readyState);
      console.error('❌ WebSocket URL:', newWsClient.url);
      setIsConnecting(false);
      setConnectionStatus('error');
      setIsInitialized(false); // Reset initialization state on error
    };

    newWsClient.onclose = (event) => {
      console.log('🔌 WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        timestamp: new Date().toISOString()
      });
      
      // Log specific close codes for debugging
      const closeReasons = {
        1000: 'Normal closure',
        1001: 'Going away',
        1002: 'Protocol error',
        1003: 'Unsupported data',
        1005: 'No status received',
        1006: 'Abnormal closure',
        1007: 'Invalid frame payload data',
        1008: 'Policy violation',
        1009: 'Message too big',
        1010: 'Missing extension',
        1011: 'Internal error',
        1015: 'TLS handshake failure'
      };
      
      console.log('🔍 Close reason:', closeReasons[event.code] || `Unknown (${event.code})`);
      
      setIsConnecting(false);
      setConnectionStatus('disconnected');
      setIsInitialized(false); // Reset initialization state on disconnect
      
      // Mark as offline if connection was lost unexpectedly (not normal closure)
      if (event.code !== 1000) {
        console.log('📡 Connection lost unexpectedly, marking as offline for future sync');
        setWasOffline(true);
        initializationRef.current = false;
      }
    };

    newWsClient.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      
      // Handle incoming WebSocket messages
      
      switch (eventData.type) {
        case 'notification':
            console.log('📬 Processing notification event...');
            handleNotification(eventData);
            break;
        case 'message':
            console.log('💬 Processing message event...');
            handleMessage(eventData);
            break;
        case 'connection':
            console.log('🔗 Processing connection event...');
            handleConnection(eventData);
            break;
        default:
            console.error('❗ Unknown WebSocket message: ', eventData);
            console.error('❗ Unknown message type:', eventData.type);
            break;
      }
    };

    refs.current.wsClient = newWsClient;
    setWsClient(newWsClient);
    console.log('WebSocket client created:', newWsClient);
  }, [handleNotification, handleMessage, handleConnection, performMessageSync]);

  // Close WebSocket connection
  const closeWebSocket = useCallback(() => {
    console.log("closing web sockets");
    
    // Reset initialization flag
    initializationRef.current = false;
    
    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    const wsClient = refs.current.wsClient;
    if (wsClient) {
      try {
        wsClient.close(1000, 'Normal closure'); // Use normal closure code
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      } finally {
        refs.current.wsClient = null;
        setWsClient(null);
        setIsConnecting(false);
      }
    }
  }, []);

  // Reconnect WebSocket
  const reconnectWebSocket = useCallback(() => {
    console.log('🔄 Reconnect WebSocket called');
    const { wsClient, userData } = refs.current;
    
    // Always close existing connection first
    if (wsClient) {
      console.log('🔌 Closing existing WebSocket connection for reconnection');
      closeWebSocket();
    }
    
    // Reset initialization flag to allow new connection
    initializationRef.current = false;
    
    // Wait a bit before creating new connection
    setTimeout(() => {
      console.log('🔄 Creating new WebSocket connection after reconnection delay');
      createWebSocket(userData);
    }, 2000);
  }, [createWebSocket, closeWebSocket]);

  // --- WebSocket creation/cleanup ---
  useEffect(() => {
    const { wsClient, userData } = refs.current;
    
    // Register WebSocket reconnection callback with RestClient
    if (restClient && typeof restClient.setWebSocketReconnectCallback === 'function') {
      console.log('🔗 Registering WebSocket reconnection callback with RestClient');
      restClient.setWebSocketReconnectCallback((errorData) => {
        console.log('🔄 RestClient triggered WebSocket reconnection:', errorData);
        reconnectWebSocket();
      });
    }
    
    // Only create WebSocket if restClient exists, userId is available, and no active connection
    if (restClient && userId && !wsClient && !isConnecting && !initializationRef.current) {
      console.log('Creating WebSocket connection with userId:', userId);
      initializationRef.current = true;
      createWebSocket(userData);
    } else if (restClient && userId && wsClient && wsClient.readyState === WebSocket.OPEN) {
      // If WebSocket is already connected but with potentially different userId, reconnect
      console.log('WebSocket already connected, checking if reconnection needed for userId:', userId);
      // We could add logic here to check if the current connection is using the correct userId
      // For now, we'll trust that the existing connection is correct
    } else if (restClient && !userId) {
      console.log('WebSocket creation delayed - waiting for userId to be loaded from localStorage');
    }
    
    // Cleanup function for StrictMode
    return () => {
      if (process.env.NODE_ENV === 'development') {
        // In development, StrictMode might cause this cleanup to run
        // We'll handle actual cleanup in the unmount effect
        console.log('Development cleanup called, skipping...');
      }
    };
  }, [restClient, reconnectWebSocket, userId]); // Added userId to dependencies
  
  // Separate effect for cleanup when restClient is removed
  useEffect(() => {
    const { wsClient, restClient } = refs.current;
    if (!restClient && wsClient) {
      console.log('Closing WebSocket connection due to missing restClient...');
      initializationRef.current = false;
      closeWebSocket();
    }
  }, [restClient, wsClient]);
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up WebSocket...');
      initializationRef.current = false;
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      const currentWsClient = refs.current.wsClient;
      if (currentWsClient) {
        currentWsClient.close();
      }
    };
  }, []); // Only run on mount/unmount

  return (
    <WebSocketContext.Provider value={{ 
      reconnectWebSocket, 
      connectionStatus,
      isConnected: connectionStatus === 'connected' && isInitialized,
      isInitialized,
      setChatboxOpen,
      performMessageSync,
      wasOffline
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === null) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
