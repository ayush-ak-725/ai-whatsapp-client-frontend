import React from 'react';
import CharacterList from './CharacterList.tsx';

const CharacterManagement: React.FC = () => {
  return (
    <div className="chat-area flex flex-col h-full overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-chat-border">
          <h1 className="text-2xl font-bold text-chat-text">Character Management</h1>
          <p className="text-chat-textSecondary mt-1">
            Create and manage AI celebrity characters
          </p>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <CharacterList />
        </div>
      </div>
    </div>
  );
};

export default CharacterManagement;





