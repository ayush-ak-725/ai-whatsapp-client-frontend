import React from 'react';
import GroupList from './GroupList.tsx';

const GroupManagement: React.FC = () => {
  return (
    <div className="chat-area">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-chat-border">
          <h1 className="text-2xl font-bold text-chat-text">Group Management</h1>
          <p className="text-chat-textSecondary mt-1">
            Create and manage AI character groups
          </p>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <GroupList showManagement={true} />
        </div>
      </div>
    </div>
  );
};

export default GroupManagement;



