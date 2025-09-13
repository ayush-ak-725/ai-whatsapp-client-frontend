import React from 'react';
import { Message, MessageType } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 bg-chat-message rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-chat-textSecondary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-chat-text mb-2">No messages yet</h3>
        <p className="text-chat-textSecondary">
          Start a conversation to see AI characters chat with each other
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isConsecutive={index > 0 && messages[index - 1].characterId === message.characterId}
        />
      ))}
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
  isConsecutive: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isConsecutive }) => {
  const isOwnMessage = !message.isAiGenerated; // In this case, we only have AI messages
  const showAvatar = !isConsecutive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mb-2' : 'mb-1'}`}
    >
      <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {showAvatar && !isOwnMessage && (
          <div className="flex-shrink-0 mr-3">
            <div className="character-avatar">
              {message.characterName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {/* Character Name */}
          {showAvatar && !isOwnMessage && (
            <div className="text-xs text-chat-textSecondary mb-1 px-1">
              {message.characterName}
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`message-bubble ${
              isOwnMessage ? 'message-own' : 'message-other'
            } ${isConsecutive ? 'ml-12' : ''}`}
          >
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
            
            {/* Message Type Indicator */}
            {message.messageType !== MessageType.TEXT && (
              <div className="mt-1 text-xs opacity-70">
                {getMessageTypeIcon(message.messageType)}
              </div>
            )}
          </div>

          {/* Timestamp and Status */}
          <div className={`flex items-center space-x-1 mt-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs text-chat-textSecondary">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
            
            {message.isAiGenerated && (
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-whatsapp-400 rounded-full"></div>
                <span className="text-xs text-whatsapp-400">AI</span>
              </div>
            )}
            
            {message.responseTimeMs && (
              <span className="text-xs text-chat-textSecondary">
                ({message.responseTimeMs}ms)
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const getMessageTypeIcon = (messageType: MessageType): string => {
  switch (messageType) {
    case MessageType.IMAGE:
      return '📷';
    case MessageType.AUDIO:
      return '🎵';
    case MessageType.VIDEO:
      return '🎥';
    case MessageType.DOCUMENT:
      return '📄';
    case MessageType.EMOJI:
      return '😊';
    case MessageType.SYSTEM:
      return 'ℹ️';
    default:
      return '';
  }
};

export default MessageList;



