import { GoogleGenAI, Chat, Part } from "@google/genai";
import type { Message } from '../types';
import { API_KEY } from '../secrets';

// This logic allows the app to work both locally (using secrets.ts)
// and in production on Vercel (using Environment Variables).
const geminiApiKey = import.meta.env?.VITE_API_KEY || API_KEY;

if (!geminiApiKey) {
    throw new Error("A chave da API Gemini não foi configurada. Verifique suas variáveis de ambiente Vercel (VITE_API_KEY) ou o arquivo secrets.ts.");
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

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