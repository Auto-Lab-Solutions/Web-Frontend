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

const webSocketEndpoint = 'wss://fnqp7nhpf1.execute-api.ap-southeast-2.amazonaws.com/production/';

const WebSocketContext = createContext(undefined);

export const WebSocketProvider = ({ children }) => {
  const { restClient } = useRestClient();
  const { userId, userData, messages, staffUserTyping, updateUserId,
    updateMessages, updateStaffUserTyping,
    clearUserData, clearMessages, clearStaffUserTyping } = useGlobalData();
  const [wsClient, setWsClient] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const pingIntervalRef = useRef(null);
  const initializationRef = useRef(false);


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

  // Handle notification events
  const handleNotification = useCallback((eventData) => {
    const { messages } = refs.current;

    switch (eventData.subtype) {
      case 'status':
        if (eventData.status === 'MESSAGE_EDITED' && eventData.success) {
            if (messages.some(msg => msg.messageId === eventData.messageId)) {
                const updatedMessages = messages.map((msg) => 
                    msg.messageId === eventData.messageId
                        ? { ...msg, message: eventData.newMessage }
                        : msg
                );
                updateMessages(updatedMessages);
            }
        } else if (eventData.status === 'MESSAGE_DELETED' && eventData.success) {
        if (messages.some(msg => msg.messageId === eventData.messageId)) {
          const updatedMessages = messages.filter(msg => msg.messageId !== eventData.messageId);
          updateMessages(updatedMessages);
        }
        } else if (eventData.status === 'TYPING' && eventData.success) {
          if (!staffUserTyping) {
            updateStaffUserTyping(true);
            updateMessages([
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
            setTimeout(() => {
              updateStaffUserTyping(false);
              updateMessages(messages.filter(msg => msg.type !== 'typing'));
            }, 3000);
          }
        } else if (eventData.status === 'MESSAGE_RECEIVED' && eventData.success) {
          const messageId = eventData.messageId;
          if (messages.some(msg => msg.messageId === messageId)) {
            const updatedMessages = messages.map((msg) => 
                msg.messageId === messageId
                ? { ...msg, received: true }
                : msg
            );
            updateMessages(updatedMessages);
          }
        } else if (eventData.status === 'MESSAGE_VIEWED' && eventData.success) {
          const messageId = eventData.messageId;
          if (messages.some(msg => msg.messageId === messageId)) {
            const updatedMessages = messages.map((msg) => 
                msg.messageId === messageId
                ? { ...msg, viewed: true }
                : msg
            );
            updateMessages(updatedMessages);
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
    const { restClient, messages } = refs.current;
    switch (eventData.subtype) {
      case 'send':
        if (eventData.success === true) {
            await restClient.post('notify', {
            status: 'MESSAGE_RECEIVED',
            messageId: eventData.messageId,
            });
        }
        if (!messages.some(msg => msg.messageId === eventData.messageId)) {
            const updatedMessages = [
            ...messages,
            {
                type: 'received',
                messageId: eventData.messageId,
                message: eventData.message,
                createdAt: Math.floor(Date.now() / 1000).toString(),
                sent: true,
                received: true,
                viewed: false,
            },
            ];
            updateMessages(updatedMessages);
        }
        break;
      default:
        console.error('❗ Unknown message subtype:', eventData);
        break;
    }
  }, [restClient, messages, updateMessages]);

  // Setup WebSocket ping
  const setupWebSocketPing = useCallback(() => {
    const { wsClient, userId, restClient } = refs.current;
    if (!wsClient) return;
    
    // Clear existing ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    pingIntervalRef.current = setInterval(() => {
      if (
        wsClient.readyState === WebSocket.OPEN &&
        userId &&
        restClient
      ) {
        wsClient.send(JSON.stringify({ action: 'ping', userId }));
        console.log('📬 Ping sent');
      }
    }, 30000);
  }, []);

  // Handle connection events
  const handleConnection = useCallback((eventData) => {
    switch (eventData.subtype) {
      case 'init':
        if (eventData.success !== true) {
          console.error('❗ Connection initialization failed:', eventData);
          return;
        }
        console.log('📬 Connection initialized:', eventData);
        updateUserId(eventData.userId);
        setTimeout(setupWebSocketPing, 2000);
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
    
    const newWsClient = new ReconnectingWebSocket(webSocketEndpoint, [], {
      connectionTimeout: 1000,
      maxReconnectionDelay: 5000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      maxRetries: 10,
    });

    newWsClient.onopen = () => {
      const { userId, userData } = refs.current;
      console.log('WebSocket connection established');
      setIsConnecting(false);
      newWsClient.send(JSON.stringify({ action: 'init', userId: userId, userData }));
      console.log('📬 Connection initialized:', { userId: userId, userData });
    };

    newWsClient.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnecting(false);
    };

    newWsClient.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      setIsConnecting(false);
      // Reset initialization flag if connection was closed unexpectedly
      if (event.code !== 1000) { // 1000 is normal closure
        initializationRef.current = false;
      }
    };

    newWsClient.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      switch (eventData.type) {
        case 'notification':
            handleNotification(eventData);
            break;
        case 'message':
            handleMessage(eventData);
            break;
        case 'connection':
            handleConnection(eventData);
            break;
        default:
            console.error('❗ Unknown message type:', eventData.type);
            break;
      }
    };

    refs.current.wsClient = newWsClient;
    setWsClient(newWsClient);
    console.log('WebSocket client created:', newWsClient);
  }, [handleNotification, handleMessage, handleConnection]);

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
        wsClient.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      } finally {
        refs.current.wsClient = null;
        setWsClient(null);
        setIsConnecting(false);
      }
    }
  }, []);

  // --- WebSocket creation/cleanup ---
  useEffect(() => {
    const { wsClient, userData } = refs.current;
    // Only create WebSocket if restClient exists and no active connection
    if (restClient && !wsClient && !isConnecting && !initializationRef.current) {
      console.log('Creating WebSocket connection...');
      initializationRef.current = true;
      createWebSocket(userData);
    }
    
    // Cleanup function for StrictMode
    return () => {
      if (process.env.NODE_ENV === 'development') {
        // In development, StrictMode might cause this cleanup to run
        // We'll handle actual cleanup in the unmount effect
        console.log('Development cleanup called, skipping...');
      }
    };
  }, [restClient]); // Only depend on restClient to minimize re-renders
  
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

  // Reconnect WebSocket
  const reconnectWebSocket = useCallback(() => {
    const { wsClient, userData } = refs.current;
    if (!wsClient || wsClient.readyState === WebSocket.CLOSED) {
      createWebSocket(userData);
    } else {
      closeWebSocket();
      setTimeout(() => createWebSocket(userData), 1000);
    }
  }, [createWebSocket, closeWebSocket]);

  return (
    <WebSocketContext.Provider value={{ reconnectWebSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
