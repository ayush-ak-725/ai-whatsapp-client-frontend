import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore.ts';
import { WebSocketMessage, Message, MessageType } from '../types/index.ts';
import toast from 'react-hot-toast';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { addMessage, setConversationStatus, addTypingUser, removeTypingUser } = useStore();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    if (socket?.connected) return;

    const newSocket = io(WS_URL, {
      transports: ['websocket'],
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      toast.success('Connected to chat');
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      toast.error('Disconnected from chat');
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      toast.error('Connection failed');
    });

    newSocket.on('message', (data: WebSocketMessage) => {
      console.log('Received message:', data);
      
      if (data.type === 'message' && data.id && data.groupId && data.characterId && data.characterName && data.content) {
        const message: Message = {
          id: data.id,
          groupId: data.groupId,
          characterId: data.characterId,
          characterName: data.characterName,
          content: data.content,
          messageType: (data.messageType as MessageType) || MessageType.TEXT,
          timestamp: data.timestamp || new Date().toISOString(),
          isAiGenerated: data.isAiGenerated || false,
        };
        
        addMessage(message);
      }
    });

    newSocket.on('conversation_status', (data: WebSocketMessage) => {
      console.log('Conversation status update:', data);
      
      if (data.type === 'conversation_status' && data.groupId !== undefined) {
        setConversationStatus({
          isActive: data.isActive || false,
          groupId: data.isActive ? data.groupId : null,
        });
      }
    });

    newSocket.on('typing', (data: WebSocketMessage) => {
      console.log('Typing update:', data);
      
      if (data.type === 'typing' && data.users) {
        data.users.forEach(user => {
          if (user) {
            addTypingUser(user);
          }
        });
      }
    });

    newSocket.on('welcome', (data: WebSocketMessage) => {
      console.log('Welcome message:', data);
      if (data.message) {
        toast.success(data.message);
      }
    });

    newSocket.on('error', (data: WebSocketMessage) => {
      console.error('WebSocket error:', data);
      if (data.message) {
        toast.error(data.message);
      }
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const joinGroup = (groupId: string) => {
    if (socket?.connected) {
      socket.emit('join_group', { groupId });
    }
  };

  const leaveGroup = (groupId: string) => {
    if (socket?.connected) {
      socket.emit('leave_group', { groupId });
    }
  };

  const sendTyping = (groupId: string, isTyping: boolean) => {
    if (socket?.connected) {
      socket.emit('typing', { groupId, isTyping });
    }
  };

  const ping = () => {
    if (socket?.connected) {
      socket.emit('ping');
    }
  };

  // Auto-reconnect logic
  useEffect(() => {
    if (!isConnected && !socket) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isConnected, socket]);

  // Ping to keep connection alive
  useEffect(() => {
    if (isConnected && socket) {
      const pingInterval = setInterval(() => {
        ping();
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [isConnected, socket]);

  return {
    isConnected,
    socket,
    connect,
    disconnect,
    joinGroup,
    leaveGroup,
    sendTyping,
    ping,
  };
};



