import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore.ts';
import { useWebSocket } from '../hooks/useWebSocket.ts';
import MessageList from './MessageList.tsx';
import MessageInput from './MessageInput.tsx';
import ChatHeader from './ChatHeader.tsx';
import TypingIndicator from './TypingIndicator.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';

const ChatArea: React.FC = () => {
  const { 
    activeGroup, 
    messages, 
    loadMessages, 
    conversationStatus,
    isLoading 
  } = useStore();
  
  console.log('ChatArea - activeGroup:', activeGroup);
  console.log('ChatArea - messages:', messages);
  console.log('ChatArea - messages count:', messages.length);
  console.log('ChatArea - conversationStatus:', conversationStatus);
  
  const { joinGroup, leaveGroup } = useWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load messages when active group changes
  useEffect(() => {
    if (activeGroup) {
      loadMessages(activeGroup.id);
      joinGroup(activeGroup.id);
    } else {
      leaveGroup('');
    }

    return () => {
      if (activeGroup) {
        leaveGroup(activeGroup.id);
      }
    };
  }, [activeGroup, loadMessages, joinGroup, leaveGroup]);

  // Scroll to bottom only if user is near bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="chat-area">
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!activeGroup) {
    return (
      <div className="chat-area">
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-24 h-24 bg-chat-message rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-chat-textSecondary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-chat-text mb-2">Welcome to Bakchod AI</h2>
          <p className="text-chat-textSecondary mb-6 max-w-md">
            Select a group from the sidebar to start chatting with AI celebrities, or create a new group to get started.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => useStore.getState().setSelectedTab('groups')}
              className="button-primary"
            >
              Manage Groups
            </button>
            <button
              onClick={() => useStore.getState().setSelectedTab('characters')}
              className="button-secondary"
            >
              View Characters
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isConversationActive = conversationStatus.isActive && conversationStatus.groupId === activeGroup.id;

  return (
    <div className="chat-area flex flex-col h-full overflow-hidden">
      <ChatHeader group={activeGroup} isConversationActive={isConversationActive} />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          <MessageList messages={messages} />
          <TypingIndicator />
          <div ref={messagesEndRef} />
        </div>
        
        {isConversationActive && (
          <div className="p-4 border-t border-chat-border">
            <div className="flex items-center justify-center space-x-2 text-sm text-chat-textSecondary">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>
                {conversationStatus.nextTurn
                  ? `${conversationStatus.nextTurn} is typing...`
                  : 'AI characters are actively chatting...'}
              </span>
            </div>
          </div>
        )}
        
        <MessageInput groupId={activeGroup.id} disabled={!isConversationActive} />
      </div>
    </div>
  );
};

export default ChatArea;
