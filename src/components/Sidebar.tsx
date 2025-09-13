import React from 'react';
import { useStore } from '../store/useStore';
import { 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon, 
  UserIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import GroupList from './GroupList';
import CharacterList from './CharacterList';
import LoadingSpinner from './LoadingSpinner';

const Sidebar: React.FC = () => {
  const { 
    selectedTab, 
    setSelectedTab, 
    groups, 
    characters, 
    isLoading 
  } = useStore();

  const tabs = [
    { id: 'chat', name: 'Chat', icon: ChatBubbleLeftRightIcon },
    { id: 'groups', name: 'Groups', icon: UserGroupIcon },
    { id: 'characters', name: 'Characters', icon: UserIcon },
  ];

  if (isLoading) {
    return (
      <div className="sidebar">
        <div className="p-4 border-b border-chat-border">
          <h1 className="text-xl font-bold text-gradient">Bakchod AI</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="p-4 border-b border-chat-border">
        <h1 className="text-xl font-bold text-gradient">Bakchod AI</h1>
        <p className="text-sm text-chat-textSecondary">WhatsApp-style AI Chat</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-chat-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                selectedTab === tab.id
                  ? 'text-whatsapp-400 border-b-2 border-whatsapp-400 bg-whatsapp-400/10'
                  : 'text-chat-textSecondary hover:text-chat-text hover:bg-chat-message'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {selectedTab === 'chat' && <GroupList />}
        {selectedTab === 'groups' && <GroupList showManagement={true} />}
        {selectedTab === 'characters' && <CharacterList />}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-chat-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-chat-textSecondary">Connected</span>
          </div>
          <button className="p-2 text-chat-textSecondary hover:text-chat-text hover:bg-chat-message rounded-lg transition-colors duration-200">
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;



