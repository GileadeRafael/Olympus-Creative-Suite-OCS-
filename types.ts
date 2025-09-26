import type React from 'react';

export interface Assistant {
  id: string;
  name: string;
  iconUrl: string;
  ringColor: string;
  descriptionKey: string;
  systemInstruction: string;
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
