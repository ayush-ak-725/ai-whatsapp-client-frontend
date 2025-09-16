import axios from 'axios';
import { Group, Character, Message, CreateGroupRequest, CreateCharacterRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ai-whatsapp-client-backend-1.onrender.com' || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Groups
  async getGroups(): Promise<Group[]> {
    const response = await api.get('/api/v1/groups');
    return response.data;
  },

  async getGroup(groupId: string): Promise<Group> {
    const response = await api.get(`/api/v1/groups/${groupId}`);
    return response.data;
  },

  async createGroup(name: string, description?: string): Promise<Group> {
    const response = await api.post('/api/v1/groups', { name, description });
    return response.data;
  },

  async updateGroup(groupId: string, name?: string, description?: string): Promise<Group> {
    const response = await api.put(`/api/v1/groups/${groupId}`, { name, description });
    return response.data;
  },

  async deleteGroup(groupId: string): Promise<void> {
    await api.delete(`/api/v1/groups/${groupId}`);
  },

  async getGroupMembers(groupId: string): Promise<Character[]> {
    const response = await api.get(`/api/v1/groups/${groupId}/characters`);
    return response.data;
  },

  async getAvailableCharacters(groupId: string): Promise<Character[]> {
    const response = await api.get(`/api/v1/groups/${groupId}/available-characters`);
    return response.data;
  },

  async addCharacterToGroup(groupId: string, characterId: string): Promise<Group> {
    const response = await api.post(`/api/v1/groups/${groupId}/members`, { characterId });
    return response.data;
  },

  async removeCharacterFromGroup(groupId: string, characterId: string): Promise<Group> {
    const response = await api.delete(`/api/v1/groups/${groupId}/members/${characterId}`);
    return response.data;
  },

  // Conversation
  async startConversation(groupId: string): Promise<void> {
    await api.post(`/api/v1/groups/${groupId}/conversation/start`);
  },

  async stopConversation(groupId: string): Promise<void> {
    await api.post(`/api/v1/groups/${groupId}/conversation/stop`);
  },

  async getConversationStatus(groupId: string): Promise<{ active: boolean }> {
    const response = await api.get(`/api/v1/groups/${groupId}/conversation/status`);
    return response.data;
  },

  // Messages
  async getGroupMessages(groupId: string, page = 0, size = 20): Promise<Message[]> {
    const response = await api.get(`/api/v1/groups/${groupId}/messages`, {
      params: { page, size }
    });
    return response.data.content || response.data;
  },

  async getRecentMessages(groupId: string, limit = 10): Promise<Message[]> {
    const response = await api.get(`/api/v1/groups/${groupId}/messages/recent`, {
      params: { limit }
    });
    return response.data;
  },

  // Characters
  async getCharacters(): Promise<Character[]> {
    const response = await api.get('/api/v1/characters');
    return response.data;
  },

  async getCharacter(characterId: string): Promise<Character> {
    const response = await api.get(`/api/v1/characters/${characterId}`);
    return response.data;
  },

  async createCharacter(characterData: CreateCharacterRequest): Promise<Character> {
    const response = await api.post('/api/v1/characters', characterData);
    return response.data;
  },

  async updateCharacter(characterId: string, characterData: Partial<Character>): Promise<Character> {
    const response = await api.put(`/api/v1/characters/${characterId}`, characterData);
    return response.data;
  },

  async deleteCharacter(characterId: string): Promise<void> {
    await api.delete(`/api/v1/characters/${characterId}`);
  },

  async createPredefinedCharacters(): Promise<void> {
    await api.post('/api/v1/characters/predefined');
  },

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await api.get('/health');
    return response.data;
  },
};





