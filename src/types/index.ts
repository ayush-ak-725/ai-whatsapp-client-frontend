export interface Group {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  members?: Character[];
}

export interface Character {
  id: string;
  name: string;
  personalityTraits?: string;
  systemPrompt?: string;
  avatarUrl?: string;
  speakingStyle?: string;
  background?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  groupId: string;
  characterId: string;
  characterName: string;
  content: string;
  messageType: MessageType;
  timestamp: string;
  isAiGenerated: boolean;
  responseTimeMs?: number;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  EMOJI = 'EMOJI',
  SYSTEM = 'SYSTEM'
}

export interface ConversationStatus {
  isActive: boolean;
  groupId: string | null;
}

export interface WebSocketMessage {
  type: 'message' | 'conversation_status' | 'typing' | 'welcome' | 'error';
  id?: string;
  groupId?: string;
  characterId?: string;
  characterName?: string;
  content?: string;
  messageType?: MessageType;
  timestamp?: string;
  isAiGenerated?: boolean;
  isActive?: boolean;
  message?: string;
  users?: string[];
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface CreateCharacterRequest {
  name: string;
  personalityTraits?: string;
  systemPrompt?: string;
  speakingStyle?: string;
  background?: string;
  avatarUrl?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}



