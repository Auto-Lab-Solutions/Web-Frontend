import axios from 'axios';

class RestClient {
  constructor(RestEndpoint) {
    this.client = axios.create({
      baseURL: RestEndpoint,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: false
    });

    // Callback for WebSocket reconnection
    this.onWebSocketReconnectNeeded = null;

    this.client.interceptors.request.use(
      config => {
        // Add authentication token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      response => {
        // Check if the response indicates success according to API spec
        if (response.data && response.data.success === false) {
          console.error('API Error:', response.data);
          
          // Check for WebSocket connection error
          if (this.isWebSocketConnectionError(response.data)) {
            console.warn('🔌 WebSocket connection lost, triggering reconnection...');
            this.triggerWebSocketReconnection(response.data);
          }
          
          throw new Error(response.data.message || response.data.error || 'API request failed');
        }
        return response;
      },
      error => {
        if (error.response) {
          const isNotificationError = error.config?.url?.includes('/notify') && 
                                     error.response.status === 400 &&
                                     error.response.data?.message?.includes('No connection found');
          
          if (isNotificationError) {
            // Log notification errors at debug level since they're not critical
            console.debug('Notification API Error (WebSocket not ready):', error.response.data);
            
            // Check if this is a WebSocket connection error and trigger reconnection
            if (this.isWebSocketConnectionError(error.response.data)) {
              console.log('🔄 Detected WebSocket connection error, triggering reconnection...');
              this.triggerWebSocketReconnection(error.response.data);
            }
          } else {
            console.error('API Error:', error.response.data);
            
            // Also check for WebSocket connection errors in general API errors
            if (error.response.status === 400 && this.isWebSocketConnectionError(error.response.data)) {
              console.log('🔄 Detected WebSocket connection error in API call, triggering reconnection...');
              this.triggerWebSocketReconnection(error.response.data);
            }
          }
          
          // Handle authentication errors
          if (error.response.status === 401 || error.response.status === 403) {
            // Clear invalid token and switch to unauthenticated mode
            localStorage.removeItem('authToken');
            console.log('Authentication failed, continuing without auth');
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // Set callback for WebSocket reconnection
  setWebSocketReconnectCallback(callback) {
    this.onWebSocketReconnectNeeded = callback;
  }

  // Check if the error indicates WebSocket connection is lost
  isWebSocketConnectionError(responseData) {
    if (!responseData || !responseData.message) return false;
    
    const message = responseData.message.toLowerCase();
    const isConnectionError = message.includes('no connection found for userid') || 
                             message.includes('connection not found') ||
                             message.includes('websocket connection') ||
                             message.includes('connection lost');
    
    if (isConnectionError) {
      console.log('🔍 Detected WebSocket connection error:', {
        originalMessage: responseData.message,
        detectedPatterns: {
          noConnectionFound: message.includes('no connection found for userid'),
          connectionNotFound: message.includes('connection not found'),
          websocketConnection: message.includes('websocket connection'),
          connectionLost: message.includes('connection lost')
        }
      });
    }
    
    return isConnectionError;
  }

  // Trigger WebSocket reconnection
  triggerWebSocketReconnection(errorData) {
    console.log('🔄 Triggering WebSocket reconnection due to:', errorData.message);
    
    if (this.onWebSocketReconnectNeeded) {
      // Immediate reconnection for connection lost errors
      console.log('🔄 Calling WebSocket reconnection callback...');
      this.onWebSocketReconnectNeeded(errorData);
    } else {
      console.warn('⚠️ WebSocket reconnection callback not set, cannot reconnect');
    }
  }

  async get(path, params = {}) {
    return this.client.get(path, { params });
  }

  async post(path, data = {}) {
    return this.client.post(path, data);
  }

  async put(path, data = {}) {
    return this.client.put(path, data);
  }

  async delete(path) {
    return this.client.delete(path);
  }
}

export { RestClient };
