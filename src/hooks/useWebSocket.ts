import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore.ts';
import { WebSocketMessage, Message, MessageType } from '../types/index.ts';
import toast from 'react-hot-toast';

// Try different WebSocket endpoints
const WS_URLS = [
  process.env.REACT_APP_WS_URL || 'wss://ai-whatsapp-client-backend-1.onrender.com/ws', 
  'ws://localhost:8080/ws',
  'ws://localhost:8080',
  'ws://localhost:8080/websocket',
  'ws://localhost:8080/socket.io/?EIO=4&transport=websocket',
];

let currentUrlIndex = 0;

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { addMessage, addTypingUser, setConversationStatus } = useStore();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const currentUrl = WS_URLS[currentUrlIndex];
    console.log('Attempting to connect to WebSocket:', currentUrl);
    const ws = new WebSocket(currentUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      toast.success('Connected to chat');
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);

      if (event.code === 403) {
        console.log('403 error - trying next URL...');
        currentUrlIndex = (currentUrlIndex + 1) % WS_URLS.length;
        console.log('Trying URL:', WS_URLS[currentUrlIndex]);
        toast.error(`WebSocket rejected (403) - Trying alternative endpoint...`);

        reconnectTimeoutRef.current = setTimeout(connect, 1000);
      } else if (event.code === 1006) {
        toast.error('WebSocket connection failed - Server may be down');
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      } else {
        toast.error('Disconnected from chat');
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      console.error('WebSocket readyState:', ws.readyState);
      toast.error('WebSocket connection error');
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log("WS event received:", data); 

        switch (data.type) {
          case 'message':
            if (
              data.id &&
              data.groupId &&
              data.characterId &&
              data.characterName &&
              data.content
            ) {
              const message: Message = {
                id: data.id,
                groupId: data.groupId,
                characterId: data.characterId,
                characterName: data.characterName,
                content: data.content,
                messageType:
                  (data.messageType as MessageType) || MessageType.TEXT,
                timestamp: data.timestamp || new Date().toISOString(),
                isAiGenerated: data.isAiGenerated || false,
                nextTurn: data.nextTurn,
              };
              addMessage(message);

              // ✅ force update conversationStatus.nextTurn
              useStore.setState((state) => ({
                conversationStatus: {
                  ...state.conversationStatus,
                  nextTurn: data.nextTurn || null,
                },
              }));

              console.log('Updated nextTurn in conversationStatus:', data.nextTurn);
            }
            break;

          case 'conversation_status':
            if (data.groupId !== undefined) {
              setConversationStatus({
                isActive: data.isActive || false,
                groupId: data.isActive ? data.groupId : null,
                nextTurn: data.nextTurn || null,
              });
            }
            break;

          case 'typing':
            if (data.users) {
              data.users.forEach((user) => {
                if (user) addTypingUser(user);
              });
            }
            break;

          case 'welcome':
            if (data.message) toast.success(data.message);
            break;

          case 'error':
            if (data.message) toast.error(data.message);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  };

  const send = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  const joinGroup = (groupId: string) =>
    send({ action: 'join_group', groupId });
  const leaveGroup = (groupId: string) =>
    send({ action: 'leave_group', groupId });
  const sendTyping = (groupId: string, isTyping: boolean) =>
    send({ action: 'typing', groupId, isTyping });
  const ping = () => send({ action: 'ping' });

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      disconnect();
    };
  }, []);

  // Keep connection alive
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => ping(), 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return {
    isConnected,
    ws: wsRef.current,
    connect,
    disconnect,
    joinGroup,
    leaveGroup,
    sendTyping,
    ping,
  };
};
