import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Group } from '../types';
import { 
  PlusIcon, 
  PlayIcon, 
  StopIcon,
  UserGroupIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface GroupListProps {
  showManagement?: boolean;
}

const GroupList: React.FC<GroupListProps> = ({ showManagement = false }) => {
  const { 
    groups, 
    activeGroup, 
    setActiveGroup, 
    conversationStatus,
    createGroup,
    startConversation,
    stopConversation,
    deleteGroup,
    loadGroups
  } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

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

  const isConversationActive = (groupId: string) => {
    return conversationStatus.isActive && conversationStatus.groupId === groupId;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-chat-border">
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
          <div className="p-2 space-y-1">
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
    </div>
  );
};

export default GroupList;



