import React, { useState } from 'react';
import type { Assistant, Message } from './types';
import { ASSISTANTS } from './constants';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import AuthPage from './components/AuthPage';
import { startChatSession } from './services/geminiService';
import type { Chat } from '@google/genai';
import { LanguageProvider } from './contexts/LanguageContext';
import { useAuth } from './hooks/useAuth';
import Avatar from './components/Avatar';

const App: React.FC = () => {
  const { session, user } = useAuth();
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  const [chatSessions, setChatSessions] = useState<Record<string, Chat>>({});
  const [messagesByAssistant, setMessagesByAssistant] = useState<Record<string, Message[]>>({});

  const handleSelectAssistant = (assistant: Assistant) => {
    if (activeAssistant?.id !== assistant.id) {
      setActiveAssistant(assistant);
      
      if (!chatSessions[assistant.id]) {
        const newSession = startChatSession(assistant.systemInstruction);
        setChatSessions(prev => ({ ...prev, [assistant.id]: newSession }));
      }
      
      if (!messagesByAssistant[assistant.id]) {
        setMessagesByAssistant(prev => ({...prev, [assistant.id]: []}));
      }
    }
  };
  
  const currentMessages = activeAssistant ? messagesByAssistant[activeAssistant.id] || [] : [];
  const currentChatSession = activeAssistant ? chatSessions[activeAssistant.id] : null;

  const setCurrentMessages = (newMessages: React.SetStateAction<Message[]>) => {
    if (activeAssistant) {
      setMessagesByAssistant(prev => ({
        ...prev,
        [activeAssistant.id]: typeof newMessages === 'function' 
          ? newMessages(prev[activeAssistant.id] || []) 
          : newMessages
      }));
    }
  };

  if (!session) {
    return (
      <LanguageProvider>
        <AuthPage />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className="flex h-screen w-screen text-gray-800 dark:text-gray-200 bg-white dark:bg-ocs-dark-chat font-sans overflow-hidden">
        <Sidebar 
          assistants={ASSISTANTS} 
          onSelectAssistant={handleSelectAssistant} 
          activeAssistantId={activeAssistant?.id}
        />
        <main className="flex-1 flex flex-col h-full relative">
          <header className="absolute top-4 right-6 z-10">
            {user && <Avatar user={user} />}
          </header>
          <ChatView 
              key={activeAssistant?.id}
              assistant={activeAssistant} 
              assistants={ASSISTANTS}
              onSelectAssistant={handleSelectAssistant}
              chatSession={currentChatSession}
              messages={currentMessages}
              setMessages={setCurrentMessages}
              user={user}
          />
        </main>
      </div>
    </LanguageProvider>
  );
};

export default App;