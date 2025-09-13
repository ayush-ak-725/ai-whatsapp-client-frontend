import React from 'react';
import { useStore } from '../store/useStore';

const TypingIndicator: React.FC = () => {
  const { typingUsers } = useStore();

  if (typingUsers.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2">
      <div className="flex items-center space-x-2 text-chat-textSecondary">
        <div className="typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
        <span className="text-sm">
          {typingUsers.length === 1 
            ? `${typingUsers[0]} is typing...`
            : `${typingUsers.length} people are typing...`
          }
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;



