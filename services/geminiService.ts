// Per @google/genai guidelines, we must use process.env for the API key.
// This change also resolves TypeScript errors related to missing Vite client types.

import { GoogleGenAI, Chat, Part } from "@google/genai";
import type { Message } from '../types';

// FIX: Per @google/genai guidelines, the API key MUST be obtained from process.env.API_KEY.
// This also resolves the TypeScript errors related to `import.meta.env`.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    // FIX: Updated error message to reflect the correct environment variable.
    throw new Error("API_KEY environment variable not set. Please ensure it's defined in your Vercel project settings.");
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