/**
 * WebSocket Connection Test Utility
 * Use this to test WebSocket connectivity independently
 */

export const testWebSocketConnection = (url, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    console.log('🧪 Testing WebSocket connection to:', url);
    
    const ws = new WebSocket(url);
    const timeoutId = setTimeout(() => {
      ws.close();
      reject(new Error(`Connection timeout after ${timeout}ms`));
    }, timeout);
    
    ws.onopen = (event) => {
      console.log('✅ Test connection opened:', event);
      clearTimeout(timeoutId);
      
      // Send a test message
      ws.send(JSON.stringify({ action: 'test', timestamp: Date.now() }));
      
      setTimeout(() => {
        ws.close();
        resolve({
          success: true,
          message: 'Connection successful',
          readyState: ws.readyState
        });
      }, 1000);
    };
    
    ws.onerror = (error) => {
      console.error('❌ Test connection error:', error);
      clearTimeout(timeoutId);
      reject({
        success: false,
        error: error,
        message: 'Connection failed'
      });
    };
    
    ws.onclose = (event) => {
      console.log('🔌 Test connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      clearTimeout(timeoutId);
    };
    
    ws.onmessage = (event) => {
      console.log('📨 Test message received:', event.data);
    };
  });
};

export const diagnoseWebSocketIssue = async (url) => {
  console.log('🔍 Diagnosing WebSocket issues...');
  
  // Check if WebSocket is supported
  if (typeof WebSocket === 'undefined') {
    return {
      issue: 'WebSocket not supported in this environment',
      suggestion: 'Use a modern browser or add WebSocket polyfill'
    };
  }
  
  // Check URL format
  if (!url) {
    return {
      issue: 'WebSocket URL is undefined',
      suggestion: 'Check VITE_WEB_SOCKET_BASE_URL environment variable'
    };
  }
  
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    return {
      issue: 'Invalid WebSocket URL format',
      suggestion: 'URL must start with ws:// or wss://'
    };
  }
  
  // Test basic connectivity
  try {
    const result = await testWebSocketConnection(url, 5000);
    return {
      issue: null,
      success: true,
      result: result
    };
  } catch (error) {
    let issue = 'Unknown connection error';
    let suggestion = 'Check server logs and network connectivity';
    
    if (error.message?.includes('timeout')) {
      issue = 'Connection timeout';
      suggestion = 'Server may be slow to respond or unreachable';
    } else if (error.message?.includes('403')) {
      issue = 'Forbidden access';
      suggestion = 'Check API authentication or server permissions';
    } else if (error.message?.includes('404')) {
      issue = 'WebSocket endpoint not found';
      suggestion = 'Verify the WebSocket URL and server routing';
    } else if (error.message?.includes('500')) {
      issue = 'Server internal error';
      suggestion = 'Check server logs for issues';
    }
    
    return {
      issue: issue,
      suggestion: suggestion,
      error: error
    };
  }
};

// Browser console helper function
window.testWebSocket = testWebSocketConnection;
window.diagnoseWebSocket = diagnoseWebSocketIssue;