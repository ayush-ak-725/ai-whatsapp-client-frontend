import React from 'react';
import { Group } from '../types/index.ts';
import { 
  PlayIcon, 
  StopIcon, 
  UserGroupIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore.ts';
import toast from 'react-hot-toast';

interface ChatHeaderProps {
  group: Group;
  isConversationActive: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ group, isConversationActive }) => {
  const { startConversation, stopConversation } = useStore();

  const handleToggleConversation = async () => {
    try {
      if (isConversationActive) {
        await stopConversation(group.id);
        toast.success('Conversation stopped');
      } else {
        await startConversation(group.id);
        toast.success('Conversation started');
      }
    } catch (error) {
      toast.error(`Failed to ${isConversationActive ? 'stop' : 'start'} conversation`);
    }
  };

  return (
    <div className="bg-chat-sidebar border-b border-chat-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="group-avatar">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-chat-text">
              {group.name}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-chat-textSecondary">
              <UserGroupIcon className="w-4 h-4" />
              <span>{group.members?.length || 0} members</span>
              {isConversationActive && (
                <>
                  <div className="w-1 h-1 bg-chat-textSecondary rounded-full"></div>
                  <div className="flex items-center space-x-1 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleConversation}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              isConversationActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-whatsapp-600 hover:bg-whatsapp-700 text-white'
            }`}
          >
            {isConversationActive ? (
              <>
                <StopIcon className="w-4 h-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Start</span>
              </>
            )}
          </button>

          <button className="p-2 text-chat-textSecondary hover:text-chat-text hover:bg-chat-message rounded-lg transition-colors duration-200">
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {group.description && (
        <div className="mt-3 text-sm text-chat-textSecondary">
          {group.description}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;





