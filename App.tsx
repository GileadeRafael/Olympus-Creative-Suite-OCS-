

import React, { useState, useEffect, useCallback } from 'react';
import type { Assistant, Message, ChatHistoryItem } from './types';
import { ASSISTANTS } from './constants';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import AuthPage from './components/AuthPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import PurchaseModal from './components/PurchaseModal';
import { startChatSession } from './services/geminiService';
import type { Chat } from '@google/genai';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { GamificationProvider, useGamification } from './contexts/GamificationContext';
import { useAuth } from './hooks/useAuth';
import Avatar from './components/Avatar';
import { supabase } from './services/supabaseClient';
import HistoryModal from './components/HistoryModal';
import NotificationsModal from './components/NotificationsModal';
import BadgesModal from './components/BadgesModal';
import { GamificationEvent } from './constants/badges';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';

const AppContent: React.FC = () => {
  const { session, user, isPasswordRecovery } = useAuth();
  const { t } = useLanguage();
  const { trackAction, resetSessionCounters, setNotificationCallback } = useGamification();
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  
  // State for chat history management
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | 'new' | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // State for assistant purchase/unlocking
  const [unlockedAssistants, setUnlockedAssistants] = useState<Set<string>>(new Set());
  const [isUnlockStatusLoading, setIsUnlockStatusLoading] = useState(true);
  const [assistantToPurchase, setAssistantToPurchase] = useState<Assistant | null>(null);

  // State for notifications
  const [notifications, setNotifications] = useState<string[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  
  // State for Badges Modal
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

  // Set initial notification on app load
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const gamificationNotification = t('notification_gamification', { date: formattedDate });
    const welcomeNotification = t('notification_welcome');

    setNotifications([
        gamificationNotification,
        welcomeNotification,
    ]);
  }, [t]);

    const addNotification = useCallback((message: string) => {
        setNotifications(prev => [message, ...prev]);
    }, []);

    useEffect(() => {
        if (setNotificationCallback) {
            setNotificationCallback(addNotification);
        }
        return () => {
            if (setNotificationCallback) {
                // Clean up by setting a no-op function
                setNotificationCallback(() => {});
            }
        };
    }, [addNotification, setNotificationCallback]);

  // Check notification read status from localStorage when user is available
  useEffect(() => {
    if (user && notifications.length > 0) {
        const seenCount = parseInt(localStorage.getItem(`notificationsSeenCount_${user.id}`) || '0', 10);
        if (notifications.length > seenCount) {
            setHasUnreadNotifications(true);
        } else {
            setHasUnreadNotifications(false);
        }
    } else {
        // Reset notification status on logout or if there are no notifications
        setHasUnreadNotifications(false);
    }
  }, [user, notifications]);

  // Logic for the 'Silent One' badge - runs once when the user logs in.
  useEffect(() => {
    if (user) {
      const lastSeenKey = `lastSeen_${user.id}`;
      const lastSeenDate = localStorage.getItem(lastSeenKey);
      const today = new Date();

      if (lastSeenDate) {
        const lastSeen = new Date(lastSeenDate);
        const diffTime = Math.abs(today.getTime() - lastSeen.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 30) {
          trackAction(GamificationEvent.USER_RETURNED);
        }
      }
      
      localStorage.setItem(lastSeenKey, today.toISOString());
    }
  }, [user, trackAction]);


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
        // Reverted to a direct table query to fix the "Failed to send a request to the Edge Function" error.
        // This method was working previously and is more stable for this environment.
        const { data, error } = await supabase
            .from('user_assistants')
            .select('assistant_id')
            .eq('user_id', user.id);

        if (error) {
            console.error("Error fetching unlocked assistants:", error.message);
            setUnlockedAssistants(new Set());
        } else {
            const unlockedIds = new Set(data.map((item: { assistant_id: string }) => item.assistant_id));
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
  }, [activeAssistant, activeChatId, currentMessages]);

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
    
    trackAction(GamificationEvent.ASSISTANT_SWITCHED, { id: assistant.id });
    resetSessionCounters(); // Reset for badges like "Marathon Runner"

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
    
    trackAction(GamificationEvent.HISTORY_VIEWED);
    resetSessionCounters(); // Reset for badges like "Marathon Runner"

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
    setIsHistoryModalOpen(false); // Close modal on selection
  };
  
  const handleNewChat = () => {
    resetSessionCounters(); // Reset for badges like "Marathon Runner"
    setActiveChatId('new');
    setCurrentMessages([]);
    setIsHistoryModalOpen(false); // Close modal on new chat
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

      trackAction(GamificationEvent.CHAT_STARTED, { assistantId: activeAssistant.id });
      
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
      trackAction(GamificationEvent.MESSAGE_SENT, { conversationLength: fullConversation.length, chatId: chatId });
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
  
  const handleCloseNotifications = () => {
    trackAction(GamificationEvent.NOTIFICATION_INTERACTED);
    setIsNotificationsModalOpen(false);
    setHasUnreadNotifications(false); // Mark as read for the UI
    if (user) {
        // Persist the "read" status in localStorage for the specific user by storing the count of notifications they've seen
        localStorage.setItem(`notificationsSeenCount_${user.id}`, notifications.length.toString());
    }
  };
  
  const handleClearNotifications = () => {
    if (user) {
        // When clearing, reset the seen counter to 0 relative to the new empty list.
        localStorage.setItem(`notificationsSeenCount_${user.id}`, '0');
    }
    setNotifications([]);
    setHasUnreadNotifications(false);
    setIsNotificationsModalOpen(false); // Close the modal
  };

  // By checking for isPasswordRecovery before checking for a session,
  // we ensure the user is directed to the password reset page even when
  // Supabase has created a temporary session for them.
  if (isPasswordRecovery) {
    return (
      <LanguageProvider>
        <ResetPasswordPage />
      </LanguageProvider>
    );
  }
  
  if (!session) {
    return (
      <LanguageProvider>
        <AuthPage />
      </LanguageProvider>
    );
  }

  return (
    <>
      <div className="flex h-screen w-screen text-gray-800 dark:text-gray-200 bg-white dark:bg-ocs-dark-chat font-sans overflow-hidden">
        <Sidebar 
          assistants={ASSISTANTS} 
          onAssistantClick={handleAssistantClick} 
          activeAssistantId={activeAssistant?.id}
          onResetToHome={handleResetToHome}
          unlockedAssistants={unlockedAssistants}
          isLoading={isUnlockStatusLoading}
          onToggleHistory={() => setIsHistoryModalOpen(p => !p)}
          hasUnreadNotifications={hasUnreadNotifications}
          onToggleNotifications={() => setIsNotificationsModalOpen(p => !p)}
          activeChatId={activeChatId}
        />
        <main className="flex-1 flex flex-col h-full relative">
          <header className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            {user && <Avatar user={user} onOpenBadges={() => setIsBadgesModalOpen(true)} />}
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
              isOpen={isHistoryModalOpen}
              onClose={() => setIsHistoryModalOpen(false)}
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
        <NotificationsModal
          isOpen={isNotificationsModalOpen}
          onClose={handleCloseNotifications}
          notifications={notifications}
          onClearAll={handleClearNotifications}
        />
        <BadgesModal
            isOpen={isBadgesModalOpen}
            onClose={() => setIsBadgesModalOpen(false)}
        />
        <ToastContainer />
      </div>
    </>
  );
};


const App: React.FC = () => (
  <LanguageProvider>
    <ToastProvider>
      <GamificationProvider>
        <AppContent />
      </GamificationProvider>
    </ToastProvider>
  </LanguageProvider>
);


export default App;