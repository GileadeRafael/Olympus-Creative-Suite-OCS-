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
  id: string;
  role: 'user' | 'model';
  content: string;
}