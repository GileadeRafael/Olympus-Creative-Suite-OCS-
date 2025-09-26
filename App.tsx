import React, { useState, useEffect } from 'react';
import type { Assistant, Message, ChatHistoryItem } from './types';
import { ASSISTANTS } from './constants';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import AuthPage from './components/AuthPage';
import { startChatSession } from './services/geminiService';
import type { Chat } from '@google/genai';
import { LanguageProvider } from './contexts/LanguageContext';
import { useAuth } from './hooks/useAuth';
import Avatar from './components/Avatar';
import { supabase } from './services/supabaseClient';
import HistoryModal from './components/HistoryModal';

const App: React.FC = () => {
  const { session, user } = useAuth();
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  
  // New state for chat history management
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | 'new' | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Recreate chat session when assistant or the active chat (and its history) changes
  useEffect(() => {
    if (activeAssistant) {
      const newSession = startChatSession(activeAssistant.systemInstruction, currentMessages);
      setChatSession(newSession);
    }
  }, [activeAssistant, activeChatId]); // Reruns when we switch assistants or chats

  const fetchChatHistory = async (assistantId: string) => {
    if (!user) return null;
    setIsHistoryLoading(true);
    const { data, error } = await supabase
      .from('chats')
      .select('id, title, assistant_id, created_at')
      .eq('assistant_id', assistantId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching chat history:", error.message);
      setChatHistory([]);
    } else {
      setChatHistory(data);
    }
    setIsHistoryLoading(false);
    return data;
  };

  const handleSelectAssistant = async (assistant: Assistant) => {
    if (activeAssistant?.id === assistant.id) return;
    
    setActiveAssistant(assistant);
    setCurrentMessages([]); // Clear messages immediately
    setActiveChatId(null); // Reset active chat

    const history = await fetchChatHistory(assistant.id);

    if (history && history.length > 0) {
      handleSelectChat(history[0].id); // Load the most recent chat
    } else {
      handleNewChat(); // Or start a new one if no history exists
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (activeChatId === chatId) return;
    
    const { data, error } = await supabase
      .from('chats')
      .select('messages')
      .eq('id', chatId)
      .single();

    if (error) {
        console.error("Error fetching chat messages:", error.message);
        handleNewChat();
    } else {
        setActiveChatId(chatId);
        setCurrentMessages(data.messages || []);
    }
  };
  
  const handleNewChat = () => {
    setActiveChatId('new');
    setCurrentMessages([]);
  };

  const handleDeleteChat = (chatId: string) => {
    // Optimistically update the UI by removing the chat from the list
    const originalHistory = chatHistory;
    setChatHistory(prev => prev.filter(c => c.id !== chatId));

    // If the deleted chat was the active one, switch to a new chat view
    if (activeChatId === chatId) {
        handleNewChat();
    }

    // Perform the deletion from the database
    supabase.from('chats').delete().eq('id', chatId)
      .then(({ error }) => {
        // If there was an error, log it and revert the optimistic UI update
        if (error) {
            console.error("Error deleting chat:", error.message);
            setChatHistory(originalHistory);
        }
      });
  };

  const handleUpdateChatTitle = async (chatId: string, newTitle: string) => {
    // Optimistically update the UI
    const originalHistory = [...chatHistory];
    setChatHistory(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));

    // Update the database
    const { error } = await supabase
        .from('chats')
        .update({ title: newTitle })
        .eq('id', chatId);

    if (error) {
        console.error("Error updating chat title:", error.message);
        // Revert UI on error
        setChatHistory(originalHistory);
    }
  };

  const generateTitle = (content: string): string => {
    return content.split(' ').slice(0, 5).join(' ') + (content.split(' ').length > 5 ? '...' : '');
  };

  const handleCreateChat = async (firstUserMessage: Message, fullConversation: Message[]) => {
      if (!user || !activeAssistant) return null;

      const title = generateTitle(firstUserMessage.content);
      
      const { data, error } = await supabase
          .from('chats')
          .insert({
              user_id: user.id,
              assistant_id: activeAssistant.id,
              title,
              messages: fullConversation,
          })
          .select('id, title, assistant_id, created_at')
          .single();
      
      if (error) {
          console.error("Error creating chat:", error.message);
          return null;
      }

      setChatHistory(prev => [data, ...prev]);
      setActiveChatId(data.id);
      return data.id;
  };

  const handleUpdateChat = async (chatId: string, fullConversation: Message[]) => {
      if (!user) return;
      const { error } = await supabase
          .from('chats')
          .update({ messages: fullConversation })
          .eq('id', chatId);
      
      if (error) {
          console.error("Error updating chat:", error.message);
      }
  };

  const handleResetToHome = () => {
    setActiveAssistant(null);
    setActiveChatId(null);
    setCurrentMessages([]);
    setChatHistory([]);
    setChatSession(null);
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
          onResetToHome={handleResetToHome}
        />
        <main className="flex-1 flex flex-col h-full relative">
          <header className="absolute top-4 right-6 z-10">
            {user && <Avatar user={user} />}
          </header>
           {activeAssistant && user && (
            <HistoryModal
              assistant={activeAssistant}
              history={chatHistory}
              activeChatId={activeChatId}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
              onDeleteChat={handleDeleteChat}
              onUpdateChatTitle={handleUpdateChatTitle}
              isLoading={isHistoryLoading}
            />
          )}
          <ChatView 
              key={activeAssistant?.id ? `${activeAssistant.id}-${activeChatId}`: 'welcome'}
              assistant={activeAssistant}
              chatSession={chatSession}
              messages={currentMessages}
              setMessages={setCurrentMessages}
              user={user}
              activeChatId={activeChatId}
              onCreateChat={handleCreateChat}
              onUpdateChat={handleUpdateChat}
          />
        </main>
      </div>
    </LanguageProvider>
  );
};

export default App;