import React, { useState } from 'react';
import { useStore } from '../store/useStore.ts';
import { Group } from '../types/index.ts';
import { 
  PlusIcon, 
  PlayIcon, 
  StopIcon,
  UserGroupIcon,
  TrashIcon,
  PencilIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner.tsx';

interface GroupListProps {
  showManagement?: boolean;
}

const GroupList: React.FC<GroupListProps> = ({ showManagement = false }) => {
  const { 
    groups, 
    characters,
    activeGroup, 
    setActiveGroup, 
    conversationStatus,
    createGroup,
    startConversation,
    stopConversation,
    deleteGroup,
    loadGroups,
    addCharacterToGroup
  } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsCreating(true);
    try {
      await createGroup(newGroupName.trim(), newGroupDescription.trim() || undefined);
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateForm(false);
      toast.success('Group created successfully');
    } catch (error) {
      toast.error('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartConversation = async (groupId: string) => {
    try {
      await startConversation(groupId);
      toast.success('Conversation started');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleStopConversation = async (groupId: string) => {
    try {
      await stopConversation(groupId);
      toast.success('Conversation stopped');
    } catch (error) {
      toast.error('Failed to stop conversation');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(groupId);
        toast.success('Group deleted');
      } catch (error) {
        toast.error('Failed to delete group');
      }
    }
  };

  const handleAddCharacterToGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowCharacterModal(true);
  };

  const handleSelectCharacter = async (characterId: string) => {
    if (!selectedGroupId) return;
    
    try {
      await addCharacterToGroup(selectedGroupId, characterId);
      toast.success('Character added to group');
      setShowCharacterModal(false);
      setSelectedGroupId(null);
    } catch (error) {
      toast.error('Failed to add character to group');
    }
  };

  const isConversationActive = (groupId: string) => {
    return conversationStatus.isActive && conversationStatus.groupId === groupId;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-chat-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-chat-text">
            {showManagement ? 'Manage Groups' : 'Groups'}
          </h2>
          {showManagement && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="p-2 text-whatsapp-400 hover:bg-whatsapp-400/10 rounded-lg transition-colors duration-200"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Create Group Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateGroup} className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="input-field w-full"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              className="input-field w-full h-20 resize-none"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isCreating}
                className="button-primary flex-1 flex items-center justify-center"
              >
                {isCreating ? <LoadingSpinner size="sm" /> : 'Create Group'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="button-secondary px-4"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <UserGroupIcon className="w-12 h-12 text-chat-textSecondary mb-4" />
            <p className="text-chat-textSecondary mb-2">No groups yet</p>
            {showManagement && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-whatsapp-400 hover:text-whatsapp-300 text-sm"
              >
                Create your first group
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`group-item p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeGroup?.id === group.id
                    ? 'bg-whatsapp-400/20 border border-whatsapp-400/30'
                    : 'hover:bg-chat-message border border-transparent'
                }`}
                onClick={() => setActiveGroup(group)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="group-avatar">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-chat-text truncate">
                          {group.name}
                        </h3>
                        <p className="text-xs text-chat-textSecondary">
                          {group.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                    
                    {group.description && (
                      <p className="text-sm text-chat-textSecondary truncate mb-2">
                        {group.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-chat-textSecondary">
                        {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
                      </span>
                      
                      {isConversationActive(group.id) && (
                        <div className="flex items-center space-x-1 text-green-400">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs">Live</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {showManagement && (
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddCharacterToGroup(group.id);
                        }}
                        className="p-1 text-whatsapp-400 hover:bg-whatsapp-400/10 rounded transition-colors duration-200"
                        title="Add character to group"
                      >
                        <UserPlusIcon className="w-4 h-4" />
                      </button>

                      {isConversationActive(group.id) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStopConversation(group.id);
                          }}
                          className="p-1 text-red-400 hover:bg-red-400/10 rounded transition-colors duration-200"
                          title="Stop conversation"
                        >
                          <StopIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartConversation(group.id);
                          }}
                          className="p-1 text-green-400 hover:bg-green-400/10 rounded transition-colors duration-200"
                          title="Start conversation"
                        >
                          <PlayIcon className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement edit group
                        }}
                        className="p-1 text-chat-textSecondary hover:bg-chat-border rounded transition-colors duration-200"
                        title="Edit group"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id);
                        }}
                        className="p-1 text-red-400 hover:bg-red-400/10 rounded transition-colors duration-200"
                        title="Delete group"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Character Selection Modal */}
      {showCharacterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-chat-sidebar border border-chat-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-chat-text">Add Character to Group</h3>
              <button
                onClick={() => {
                  setShowCharacterModal(false);
                  setSelectedGroupId(null);
                }}
                className="text-chat-textSecondary hover:text-chat-text"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {characters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-chat-textSecondary mb-4">No characters available</p>
                  <p className="text-sm text-chat-textSecondary">Create some characters first</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {characters.map((character) => (
                    <div
                      key={character.id}
                      onClick={() => handleSelectCharacter(character.id)}
                      className="p-3 bg-chat-message hover:bg-chat-border rounded-lg cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="character-avatar">
                          {character.avatarUrl ? (
                            <img
                              src={character.avatarUrl}
                              alt={character.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            character.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-chat-text truncate">
                            {character.name}
                          </h4>
                          {character.personalityTraits && (
                            <p className="text-sm text-chat-textSecondary truncate">
                              {character.personalityTraits}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupList;





