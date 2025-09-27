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
// Importa as chaves do arquivo local 'secrets.ts', que está ignorado pelo Git.
import { API_KEY } from "../secrets";

// Esta lógica permite que o app funcione tanto localmente (usando secrets.ts)
// quanto em produção na Vercel (usando as Environment Variables).
const apiKey = import.meta.env?.VITE_API_KEY || API_KEY;

if (!apiKey || apiKey.startsWith("SUA_CHAVE_GEMINI_AQUI")) {
    // Mensagem de erro atualizada para o novo método.
    throw new Error("A chave de API do Gemini não foi encontrada. Por favor, renomeie o arquivo 'secrets.template.ts' para 'secrets.ts' e adicione sua chave de API.");
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