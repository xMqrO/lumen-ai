export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
}

export interface Model {
  id: string;
  name: string;
  badge?: string;
}

export interface Conversation {
  id: string;
  title: string;
  group: string;
  preview: string;
  pinned?: boolean;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  emoji: string;
  model: string;
  temperature: number;
  createdAt: number;
}

export interface Settings {
  theme: 'light' | 'dark';
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  webSearch: boolean;
  vision: boolean;
  memory: boolean;
  codeRunner: boolean;
  voice: boolean;
  stream: boolean;
  sendOnEnter: boolean;
  autoTitle: boolean;
  showSuggestions: boolean;
  language: string;
}

export interface Provider {
  id: string;
  name: string;
  icon: string;
  color: string;
  apiKey: string;
  baseUrl: string;
  enabled: boolean;
  builtin: boolean;
}