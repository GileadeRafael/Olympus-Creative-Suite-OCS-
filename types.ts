
import type React from 'react';

export interface AssistantDemo {
  prompt: string;
  responseKey: string;
}

export interface Assistant {
  id: string;
  name: string;
  iconUrl: string;
  ringUrl?: string; // Optional specifically for UI ring
  ringColor: string;
  descriptionKey: string;
  longDescriptionKey?: string;
  systemInstruction: string;
  price: number;
  purchaseUrl: string;
  examplePrompts: string[];
  demoExamples?: AssistantDemo[];
  excludeFromSidebar?: boolean;
}

export interface Message {
  id:string;
  role: 'user' | 'model';
  content: string;
  images?: { mimeType: string; data: string }[];
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  assistant_id: string;
  created_at: string;
}

export interface ChatRecord extends ChatHistoryItem {
  messages: Message[];
}

export interface Notification {
  key: string;
  date: string; // ISO string for consistent storage
  params?: Record<string, string | number>;
}
