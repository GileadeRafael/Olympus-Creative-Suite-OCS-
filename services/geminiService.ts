// FIX: Add global type definitions for import.meta.env for Vite environment variables.
// This is a workaround for environments where tsconfig.json is not correctly configured
// to include 'vite/client' types, which resolves the TypeScript errors.
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
  }
}

import { GoogleGenAI, Chat, Part } from "@google/genai";
import type { Message } from '../types';
import { LOCAL_API_KEY } from "../config";

// This logic makes the app work seamlessly in both local and production (Vercel) environments.
// It prioritizes Vercel's environment variables but falls back to your local config file.
const apiKey = import.meta.env?.VITE_API_KEY || LOCAL_API_KEY;

if (!apiKey || apiKey === "COLE_SUA_CHAVE_GEMINI_AQUI") {
    // Updated error message to point to the new config file for local development.
    throw new Error("A chave de API do Gemini não foi encontrada. Por favor, adicione-a ao arquivo 'config.ts'.");
}

const ai = new GoogleGenAI({ apiKey });

// Helper to convert our Message array to Gemini's history format
const messagesToHistory = (messages: Message[]) => {
    return messages.map(msg => ({
        role: msg.role,
        // For now, we only pass text content to the history.
        // Multimodal history is more complex and not required by the current spec.
        parts: [{ text: msg.content }],
    })).filter(msg => msg.parts[0].text); // Filter out messages with no text content
};


export function startChatSession(systemInstruction: string, history: Message[] = []): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
    history: messagesToHistory(history),
  });
  return chat;
}

export async function sendMessageStream(chat: Chat, message: string, images?: { mimeType: string; data: string }[]) {
  if (!images || images.length === 0) {
    return chat.sendMessageStream({ message });
  }

  const parts: Part[] = images.map(image => ({
    inlineData: {
      mimeType: image.mimeType,
      data: image.data,
    },
  }));
  parts.push({ text: message });

  // The `message` property in `sendMessageStream` can accept an array of Parts for multimodal input.
  return chat.sendMessageStream({ message: parts });
}