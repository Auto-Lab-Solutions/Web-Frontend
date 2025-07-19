import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRestClient } from './restContext';
import { useGlobalData } from './GlobalDataContext';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { v4 as uuidv4 } from 'uuid';

const webSocketEndpoint = 'wss://fnqp7nhpf1.execute-api.ap-southeast-2.amazonaws.com/production/';

const WebSocketContext = createContext(undefined);

export const WebSocketProvider = ({ children }) => {
  const { restClient } = useRestClient();
  const { userId, userData, messages, staffUserTyping, updateUserId,
      updateUserData, updateMessages, updateStaffUserTyping,
      clearUserData, clearMessages, clearStaffUserTyping } = useGlobalData();
  const [wsClient, setWsClient] = useState(null);
  const [wsInitialized, setWsInitialized] = useState(false);


  // Refs to maintain current values in closures
  const refs = useRef({
      restClient,
      wsClient,
      userId,
      userData,
      messages,
      staffUserTyping,
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
      };
  }, [restClient, wsClient, userId, userData, messages, staffUserTyping]);

  // --- WebSocket creation/cleanup ---
  useEffect(() => {
      const { userId, userData, restClient } = refs.current;
      if (userId && userData && restClient) {
          if (restClient) {
              createWebSocket();
          } else {
              closeWebSocket();
          }
      }
      return () => closeWebSocket();
  }, [restClient]);

  // Handle notification events
  const handleNotification = useCallback((eventData) => {
    const { restClient, userData, messages } = refs.current;

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
                  updateMessages(
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
                  );
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
  }, []);

  // Handle message events
  const handleMessage = useCallback(async (eventData) => {
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
        setWsInitialized(true);
        updateUserId(eventData.userId);
        setTimeout(setupWebSocketPing, 2000);
    }
  }, []);

  const createWebSocket = useCallback((userData) => {
    const wsClient = refs.current.wsClient;
    if (wsClient) {
        wsClient.close();
        refs.current.wsClient = null;
        setWsClient(null);
        setWsInitialized(false);
    }

    const newWsClient = new ReconnectingWebSocket(webSocketEndpoint, [], {
      connectionTimeout: 1000,
      maxReconnectionDelay: 5000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      maxRetries: 10,
    });

    newWsClient.onopen = () => {
        console.log('WebSocket connection established');
        newWsClient.send(JSON.stringify({ action: 'init', userId: userData.userId, userData }));
    };

    newWsClient.onerror = (error) => {
        console.error('WebSocket error:', error);
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
  }, []);

  // Close WebSocket connection
  const closeWebSocket = useCallback(() => {
    const wsClient = refs.current.wsClient;
    if (wsClient) {
      try {
        wsClient.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      } finally {
        refs.current.wsClient = null;
        setWsClient(null);
        setWsInitialized(false);
      }
    }
  }, []);

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

  // Setup WebSocket ping
  function setupWebSocketPing() {
    const { wsClient, userId, restClient } = refs.current;
    if (!wsClient) return;
    const pingInterval = setInterval(() => {
      if (
        wsClient.readyState === WebSocket.OPEN &&
        userId &&
        restClient
      ) {
        wsClient.send(JSON.stringify({ action: 'ping', userId }));
      }
    }, 30000);
    return () => clearInterval(pingInterval);
  }

  return (
    <WebSocketContext.Provider value={{ reconnectWebSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
