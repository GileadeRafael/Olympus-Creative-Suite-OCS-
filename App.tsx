
import React, { useState, useEffect } from 'react';
import type { Assistant, Message, ChatHistoryItem } from './types';
import { ASSISTANTS } from './constants';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import AuthPage from './components/AuthPage';
import PurchaseModal from './components/PurchaseModal';
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
  
  // State for chat history management
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | 'new' | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // State for assistant purchase/unlocking
  const [unlockedAssistants, setUnlockedAssistants] = useState<Set<string>>(new Set());
  const [isUnlockStatusLoading, setIsUnlockStatusLoading] = useState(true);
  const [assistantToPurchase, setAssistantToPurchase] = useState<Assistant | null>(null);

  // Fetch unlocked assistants when the user is available and listen for real-time changes
  useEffect(() => {
    // If there's no user, reset the state and do nothing further.
    if (!user) {
        setUnlockedAssistants(new Set());
        setIsUnlockStatusLoading(false);
        return;
    }

    const fetchUnlocked = async () => {
        setIsUnlockStatusLoading(true);
        const { data, error } = await supabase
            .from('user_assistants')
            .select('assistant_id')
            .eq('user_id', user.id);

        if (error) {
            console.error("Error fetching unlocked assistants:", error.message);
            setUnlockedAssistants(new Set());
        } else {
            const unlockedIds = new Set(data.map(item => item.assistant_id));
            setUnlockedAssistants(unlockedIds);
        }
        setIsUnlockStatusLoading(false);
    };

    fetchUnlocked();

    // Set up a real-time subscription to the user_assistants table.
    // This will automatically update the UI when a user's permissions change.
    const channel = supabase
        .channel(`user_assistants_changes_for_${user.id}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'user_assistants',
                filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
                console.log('Permission change detected, refetching unlocked assistants.', payload);
                // Refetch all data to ensure the UI is perfectly in sync.
                fetchUnlocked();
            }
        )
        .subscribe();

    // Clean up the subscription when the component unmounts or the user changes.
    return () => {
        supabase.removeChannel(channel);
    };
  }, [user]);

  // Recreate chat session when assistant or the active chat changes
  useEffect(() => {
    if (activeAssistant) {
      const newSession = startChatSession(activeAssistant.systemInstruction, currentMessages);
      setChatSession(newSession);
    }
  }, [activeAssistant, activeChatId]);

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

  const handleSelectUnlockedAssistant = async (assistant: Assistant) => {
    if (activeAssistant?.id === assistant.id) return;
    
    setActiveAssistant(assistant);
    setCurrentMessages([]); 
    setActiveChatId(null); 

    const history = await fetchChatHistory(assistant.id);

    if (history && history.length > 0) {
      handleSelectChat(history[0].id);
    } else {
      handleNewChat(); 
    }
  };

  const handleAssistantClick = (assistant: Assistant) => {
    if (unlockedAssistants.has(assistant.id)) {
        handleSelectUnlockedAssistant(assistant);
    } else {
        setAssistantToPurchase(assistant);
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
    const originalHistory = chatHistory;
    setChatHistory(prev => prev.filter(c => c.id !== chatId));

    if (activeChatId === chatId) {
        handleNewChat();
    }

    supabase.from('chats').delete().eq('id', chatId)
      .then(({ error }) => {
        if (error) {
            console.error("Error deleting chat:", error.message);
            setChatHistory(originalHistory);
        }
      });
  };

  const handleUpdateChatTitle = async (chatId: string, newTitle: string) => {
    const originalHistory = [...chatHistory];
    setChatHistory(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));

    const { error } = await supabase
        .from('chats')
        .update({ title: newTitle })
        .eq('id', chatId);

    if (error) {
        console.error("Error updating chat title:", error.message);
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
          onAssistantClick={handleAssistantClick} 
          activeAssistantId={activeAssistant?.id}
          onResetToHome={handleResetToHome}
          unlockedAssistants={unlockedAssistants}
          isLoading={isUnlockStatusLoading}
        />
        <main className="flex-1 flex flex-col h-full relative">
          <header className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
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
        <PurchaseModal 
          assistant={assistantToPurchase} 
          onClose={() => setAssistantToPurchase(null)}
          user={user}
        />
      </div>
    </LanguageProvider>
  );
};

export default App;
