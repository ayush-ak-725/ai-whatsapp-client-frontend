import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Character } from '../types';
import { 
  PlusIcon, 
  UserIcon,
  TrashIcon,
  PencilIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const CharacterList: React.FC = () => {
  const { 
    characters, 
    createCharacter,
    deleteCharacter,
    createPredefinedCharacters,
    isLoading 
  } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPredefinedForm, setShowPredefinedForm] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    personalityTraits: '',
    systemPrompt: '',
    speakingStyle: '',
    background: '',
    avatarUrl: ''
  });

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharacter.name.trim()) return;

    setIsCreating(true);
    try {
      await createCharacter(newCharacter);
      setNewCharacter({
        name: '',
        personalityTraits: '',
        systemPrompt: '',
        speakingStyle: '',
        background: '',
        avatarUrl: ''
      });
      setShowCreateForm(false);
      toast.success('Character created successfully');
    } catch (error) {
      toast.error('Failed to create character');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreatePredefined = async () => {
    try {
      await createPredefinedCharacters();
      toast.success('Predefined characters created successfully');
    } catch (error) {
      toast.error('Failed to create predefined characters');
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      try {
        await deleteCharacter(characterId);
        toast.success('Character deleted');
      } catch (error) {
        toast.error('Failed to delete character');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-chat-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-chat-text">Characters</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPredefinedForm(!showPredefinedForm)}
              className="p-2 text-whatsapp-400 hover:bg-whatsapp-400/10 rounded-lg transition-colors duration-200"
              title="Create predefined characters"
            >
              <SparklesIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="p-2 text-whatsapp-400 hover:bg-whatsapp-400/10 rounded-lg transition-colors duration-200"
              title="Create new character"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Predefined Characters Button */}
        {showPredefinedForm && (
          <div className="mb-4 p-3 bg-whatsapp-400/10 border border-whatsapp-400/20 rounded-lg">
            <p className="text-sm text-chat-text mb-3">
              Create popular celebrity characters with pre-configured personalities
            </p>
            <button
              onClick={handleCreatePredefined}
              className="button-primary w-full"
            >
              Create Predefined Characters
            </button>
          </div>
        )}

        {/* Create Character Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateCharacter} className="space-y-3">
            <input
              type="text"
              placeholder="Character name"
              value={newCharacter.name}
              onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
              className="input-field w-full"
              required
            />
            <textarea
              placeholder="Personality traits (e.g., funny, sarcastic, wise)"
              value={newCharacter.personalityTraits}
              onChange={(e) => setNewCharacter({ ...newCharacter, personalityTraits: e.target.value })}
              className="input-field w-full h-20 resize-none"
            />
            <textarea
              placeholder="System prompt (how the character should behave)"
              value={newCharacter.systemPrompt}
              onChange={(e) => setNewCharacter({ ...newCharacter, systemPrompt: e.target.value })}
              className="input-field w-full h-20 resize-none"
            />
            <input
              type="text"
              placeholder="Speaking style (e.g., casual, formal, uses slang)"
              value={newCharacter.speakingStyle}
              onChange={(e) => setNewCharacter({ ...newCharacter, speakingStyle: e.target.value })}
              className="input-field w-full"
            />
            <textarea
              placeholder="Background story"
              value={newCharacter.background}
              onChange={(e) => setNewCharacter({ ...newCharacter, background: e.target.value })}
              className="input-field w-full h-16 resize-none"
            />
            <input
              type="url"
              placeholder="Avatar URL (optional)"
              value={newCharacter.avatarUrl}
              onChange={(e) => setNewCharacter({ ...newCharacter, avatarUrl: e.target.value })}
              className="input-field w-full"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isCreating}
                className="button-primary flex-1 flex items-center justify-center"
              >
                {isCreating ? <LoadingSpinner size="sm" /> : 'Create Character'}
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

      {/* Characters List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <UserIcon className="w-12 h-12 text-chat-textSecondary mb-4" />
            <p className="text-chat-textSecondary mb-2">No characters yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-whatsapp-400 hover:text-whatsapp-300 text-sm"
            >
              Create your first character
            </button>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onDelete={handleDeleteCharacter}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface CharacterCardProps {
  character: Character;
  onDelete: (id: string) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onDelete }) => {
  return (
    <div className="card hover:bg-chat-message transition-colors duration-200">
      <div className="flex items-start space-x-3">
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
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-chat-text truncate">
                {character.name}
              </h3>
              
              {character.personalityTraits && (
                <p className="text-sm text-chat-textSecondary mt-1 line-clamp-2">
                  {character.personalityTraits}
                </p>
              )}
              
              {character.speakingStyle && (
                <p className="text-xs text-whatsapp-400 mt-1">
                  Style: {character.speakingStyle}
                </p>
              )}
              
              <p className="text-xs text-chat-textSecondary mt-2">
                Created {formatDistanceToNow(new Date(character.createdAt), { addSuffix: true })}
              </p>
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={() => {
                  // TODO: Implement edit character
                }}
                className="p-1 text-chat-textSecondary hover:bg-chat-border rounded transition-colors duration-200"
                title="Edit character"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onDelete(character.id)}
                className="p-1 text-red-400 hover:bg-red-400/10 rounded transition-colors duration-200"
                title="Delete character"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterList;



