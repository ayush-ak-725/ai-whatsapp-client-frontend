import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useWebSocket } from '../hooks/useWebSocket.ts';

interface MessageInputProps {
  groupId: string;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ groupId, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { sendTyping } = useWebSocket();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    // In this implementation, we don't actually send user messages
    // as this is an AI-only chat. We just clear the input.
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTyping(groupId, true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      sendTyping(groupId, false);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTyping(groupId, false);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Cleanup typing indicator on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        sendTyping(groupId, false);
      }
    };
  }, [groupId, isTyping, sendTyping]);

  return (
    <div className="bg-chat-sidebar border-t border-chat-border p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Start a conversation to enable messaging..." : "Type a message..."}
            disabled={disabled}
            className={`w-full px-4 py-3 pr-12 rounded-lg resize-none transition-colors duration-200 ${
              disabled
                ? 'bg-chat-message/50 text-chat-textSecondary cursor-not-allowed'
                : 'bg-chat-message text-chat-text placeholder-chat-textSecondary focus:outline-none focus:ring-2 focus:ring-whatsapp-500'
            }`}
            style={{ minHeight: '48px', maxHeight: '120px' }}
            rows={1}
          />
          
          {isTyping && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-whatsapp-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-whatsapp-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-whatsapp-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`p-3 rounded-lg transition-colors duration-200 ${
            message.trim() && !disabled
              ? 'bg-whatsapp-600 hover:bg-whatsapp-700 text-white'
              : 'bg-chat-message text-chat-textSecondary cursor-not-allowed'
          }`}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>

      {disabled && (
        <div className="mt-2 text-xs text-chat-textSecondary text-center">
          This is an AI-only chat. Start a conversation to see AI characters interact.
        </div>
      )}
    </div>
  );
};

export default MessageInput;





