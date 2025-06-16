import ReconnectingWebSocket from 'reconnecting-websocket';

const webSocketEndpoint = 'wss://ayk691kl90.execute-api.ap-southeast-2.amazonaws.com/production/';

class WsClient {
  constructor(userData, messages, setMessages, restClient, setShowTyping) {
    this.ws = new ReconnectingWebSocket(webSocketEndpoint, [], {
      WebSocket: window.WebSocket,
      connectionTimeout: 1000,
      maxReconnectionDelay: 5000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      maxRetries: 10,
    });

    this.ws.onopen = () => {
      console.log('WebSocket connection established');
      this.ws.send(JSON.stringify({ action: 'init' , ...userData }));
    };

    this.ws.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      if (eventData.type) {
        switch (eventData.type) {
          case 'notification':
            if (eventData.subtype === "status" && eventData.status === 'MESSAGE_EDITED' && eventData.success === true) {
              setMessages(prevMessages => {
                const updatedMessages = prevMessages.map(msg => {
                  if (msg.messageId === eventData.messageId) {
                    return {
                      ...msg,
                      message: eventData.newMessage,
                    };
                  }
                  return msg;
                });
                return updatedMessages;
              });
            } else if (eventData.subtype === "status" && eventData.status === 'MESSAGE_DELETED' && eventData.success === true) {
              setMessages(prevMessages => prevMessages.filter(msg => msg.messageId !== eventData.messageId));
            } else if (eventData.subtype === "status" && eventData.status === 'TYPING' && eventData.success === true) {
              if (setShowTyping) {
                setShowTyping(true);
                setTimeout(() => {
                  setShowTyping(false);
                }, 3000);
              }
            }
            else {
              console.error('❗ Unknown notification subtype:', eventData);
            }
            return;
          case 'message':
            if (eventData.subtype === 'send' && eventData.success === true) {
              const updatedMessages = messages.filter(msg => msg.type !== 'card' && msg.type !== 'bot');
              updatedMessages.push({
                messageId: eventData.messageId,
                type: 'received',
                message: eventData.message,
                createdAt: Math.floor(Date.now() / 1000).toString()
              });
              setMessages(updatedMessages);
              const notificationData = { userId: userData.userId, status: 'MESSAGE_RECEIVED', messageId: eventData.messageId }
              restClient.post('notify', notificationData)
                .then((res) => {
                  if (res.status === 200) {
                    console.log('✅ Notification sent successfully:', res.data);
                  }
                })
                .catch((error) => {
                  console.error('❗ Error sending notification:', error);
                });
            }
            return;
          case 'connection':
            if (eventData.subtype === 'init') {
              if (eventData.success !== true) {
                // if (eventData.cause == 'INVALID_USER_ID') {
                //   console.error('❗ Invalid user ID:', eventData);
                //   localStorage.removeItem('userId');
                //   return;
                // }
                console.error('❗ Connection initialization failed:', eventData);
                return;
              }
              console.log('📬 Connection initialized:', eventData);
              localStorage.setItem('userId', eventData.userId);
            }
            return;
          default:
            console.error('❗ Unknown message type:', eventData.type);
            return;
        }
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

}

const getWsClient = (setWsInitialized, currentWsClient, userData, messages, setMessages, restClient, setShowTyping) => {
  if (currentWsClient && currentWsClient instanceof WsClient) {
    currentWsClient.ws.close();
  }
  setWsInitialized(false);
  const wsclient = new WsClient(userData, messages, setMessages, restClient, setShowTyping);
  setWsInitialized(true);
  return wsclient;
}


export { getWsClient };
