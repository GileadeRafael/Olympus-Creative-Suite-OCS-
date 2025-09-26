
import { GoogleGenAI, Chat } from "@google/genai";

// Ensure you have the API key in your environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

export function startChatSession(systemInstruction: string): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
  return chat;
}

export async function sendMessageStream(chat: Chat, message: string) {
  return chat.sendMessageStream({ message });
}
