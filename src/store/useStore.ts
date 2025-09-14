import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Group, Character, Message, ConversationStatus } from '../types/index.ts';
import { apiService } from '../services/apiService.ts';

interface AppState {
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  
  // Data
  groups: Group[];
  characters: Character[];
  messages: Message[];
  activeGroup: Group | null;
  
  // UI state
  sidebarOpen: boolean;
  selectedTab: 'chat' | 'groups' | 'characters';
  
  // Conversation state
  conversationStatus: ConversationStatus;
  typingUsers: string[];
  
  // Actions
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setGroups: (groups: Group[]) => void;
  setCharacters: (characters: Character[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setActiveGroup: (group: Group | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedTab: (tab: 'chat' | 'groups' | 'characters') => void;
  setConversationStatus: (status: ConversationStatus) => void;
  setTypingUsers: (users: string[]) => void;
  addTypingUser: (user: string) => void;
  removeTypingUser: (user: string) => void;
  
  // API actions
  initializeApp: () => Promise<void>;
  loadGroups: () => Promise<void>;
  loadCharacters: () => Promise<void>;
  loadMessages: (groupId: string) => Promise<void>;
  createGroup: (name: string, description?: string) => Promise<Group>;
  deleteGroup: (groupId: string) => Promise<void>;
  createCharacter: (characterData: Partial<Character>) => Promise<Character>;
  deleteCharacter: (characterId: string) => Promise<void>;
  createPredefinedCharacters: () => Promise<void>;
  addCharacterToGroup: (groupId: string, characterId: string) => Promise<void>;
  removeCharacterFromGroup: (groupId: string, characterId: string) => Promise<void>;
  startConversation: (groupId: string) => Promise<void>;
  stopConversation: (groupId: string) => Promise<void>;
}

export const useStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isLoading: true,
      isInitialized: false,
      groups: [],
      characters: [],
      messages: [],
      activeGroup: null,
      sidebarOpen: true,
      selectedTab: 'chat',
      conversationStatus: { isActive: false, groupId: null },
      typingUsers: [],
      
      // Basic setters
      setLoading: (loading) => set({ isLoading: loading }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      setGroups: (groups) => set({ groups }),
      setCharacters: (characters) => set({ characters }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      setActiveGroup: (group) => set({ activeGroup: group }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSelectedTab: (tab) => set({ selectedTab: tab }),
      setConversationStatus: (status) => set({ conversationStatus: status }),
      setTypingUsers: (users) => set({ typingUsers: users }),
      addTypingUser: (user) => set((state) => ({
        typingUsers: [...state.typingUsers.filter(u => u !== user), user]
      })),
      removeTypingUser: (user) => set((state) => ({
        typingUsers: state.typingUsers.filter(u => u !== user)
      })),
      
      // API actions
      initializeApp: async () => {
        set({ isLoading: true });
        try {
          await Promise.all([
            get().loadGroups(),
            get().loadCharacters(),
          ]);
          set({ isInitialized: true });
        } catch (error) {
          console.error('Failed to initialize app:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadGroups: async () => {
        try {
          const groups = await apiService.getGroups();
          set({ groups });
        } catch (error) {
          console.error('Failed to load groups:', error);
        }
      },
      
      loadCharacters: async () => {
        try {
          console.log('Loading characters...');
          const characters = await apiService.getCharacters();
          console.log('Characters loaded:', characters);
          set({ characters });
        } catch (error) {
          console.error('Failed to load characters:', error);
        }
      },
      
      loadMessages: async (groupId) => {
        try {
          const messages = await apiService.getGroupMessages(groupId);
          set({ messages });
        } catch (error) {
          console.error('Failed to load messages:', error);
        }
      },
      
      createGroup: async (name, description) => {
        try {
          const group = await apiService.createGroup(name, description);
          set((state) => ({ groups: [...state.groups, group] }));
          return group;
        } catch (error) {
          console.error('Failed to create group:', error);
          throw error;
        }
      },
      
      deleteGroup: async (groupId) => {
        try {
          await apiService.deleteGroup(groupId);
          set((state) => ({ 
            groups: state.groups.filter(g => g.id !== groupId),
            activeGroup: state.activeGroup?.id === groupId ? null : state.activeGroup
          }));
        } catch (error) {
          console.error('Failed to delete group:', error);
          throw error;
        }
      },
      
      createCharacter: async (characterData) => {
        try {
          const character = await apiService.createCharacter(characterData);
          set((state) => ({ characters: [...state.characters, character] }));
          return character;
        } catch (error) {
          console.error('Failed to create character:', error);
          throw error;
        }
      },
      
      deleteCharacter: async (characterId) => {
        try {
          await apiService.deleteCharacter(characterId);
          set((state) => ({ 
            characters: state.characters.filter(c => c.id !== characterId) 
          }));
        } catch (error) {
          console.error('Failed to delete character:', error);
          throw error;
        }
      },
      
      createPredefinedCharacters: async () => {
        try {
          await apiService.createPredefinedCharacters();
          await get().loadCharacters(); // Refresh characters list
        } catch (error) {
          console.error('Failed to create predefined characters:', error);
          throw error;
        }
      },
      
      addCharacterToGroup: async (groupId, characterId) => {
        try {
          await apiService.addCharacterToGroup(groupId, characterId);
          await get().loadGroups(); // Refresh groups
        } catch (error) {
          console.error('Failed to add character to group:', error);
          throw error;
        }
      },
      
      removeCharacterFromGroup: async (groupId, characterId) => {
        try {
          await apiService.removeCharacterFromGroup(groupId, characterId);
          await get().loadGroups(); // Refresh groups
        } catch (error) {
          console.error('Failed to remove character from group:', error);
          throw error;
        }
      },
      
      startConversation: async (groupId) => {
        try {
          await apiService.startConversation(groupId);
          set({ conversationStatus: { isActive: true, groupId } });
        } catch (error) {
          console.error('Failed to start conversation:', error);
          throw error;
        }
      },
      
      stopConversation: async (groupId) => {
        try {
          await apiService.stopConversation(groupId);
          set({ conversationStatus: { isActive: false, groupId: null } });
        } catch (error) {
          console.error('Failed to stop conversation:', error);
          throw error;
        }
      },
    }),
    {
      name: 'bakchod-ai-whatsapp-store',
    }
  )
);



