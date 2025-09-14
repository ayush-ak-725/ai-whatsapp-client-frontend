// WebSocket connection test utility
export const testWebSocketEndpoints = () => {
  const endpoints = [
    'ws://localhost:8080/ws',
    'ws://localhost:8080',
    'ws://localhost:8080/websocket',
    'ws://localhost:8080/socket.io/?EIO=4&transport=websocket'
  ];

  console.log('Testing WebSocket endpoints...');
  
  endpoints.forEach((endpoint, index) => {
    console.log(`Testing endpoint ${index + 1}: ${endpoint}`);
    
    const ws = new WebSocket(endpoint);
    
    ws.onopen = () => {
      console.log(`✅ SUCCESS: ${endpoint} - Connection opened`);
      ws.close();
    };
    
    ws.onerror = (error) => {
      console.log(`❌ ERROR: ${endpoint} - Connection failed:`, error);
    };
    
    ws.onclose = (event) => {
      console.log(`🔒 CLOSED: ${endpoint} - Code: ${event.code}, Reason: ${event.reason}`);
    };
  });
};

// Call this function to test all endpoints
// testWebSocketEndpoints();
