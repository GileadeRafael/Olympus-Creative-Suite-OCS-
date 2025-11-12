

import React, { useState, useEffect, useCallback } from 'react';
import type { Assistant, Message, ChatHistoryItem, Notification } from './types';
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
import LogoutAnimation from './components/LogoutAnimation';
import InteractiveTour from './components/InteractiveTour';
import { ChevronDoubleLeftIcon } from './components/icons/CoreIcons';

export interface PersonalizedWelcomeItem {
    type: 'last_chat' | 'recent_badge' | 'suggestion';
    assistant?: Assistant;
    timeAgo?: string;
    badgeName?: string;
    badgeIcon?: string;
}


const AppContent: React.FC = () => {
  const { session, user, isPasswordRecovery } = useAuth();
  const { t, language } = useLanguage();
  const { trackAction, resetSessionCounters, setNotificationCallback, userProgress, badges } = useGamification();
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  
  // State for chat history management
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | 'new' | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isHistoryPanelVisible, setIsHistoryPanelVisible] = useState(true);

  // State for assistant purchase/unlocking
  const [unlockedAssistants, setUnlockedAssistants] = useState<Set<string>>(new Set());
  const [isUnlockStatusLoading, setIsUnlockStatusLoading] = useState(true);
  const [assistantToPurchase, setAssistantToPurchase] = useState<Assistant | null>(null);

  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsLoaded, setIsNotificationsLoaded] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  
  // State for Badges Modal
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

  // State for Logout Animation
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // State for transition animation
  const [animationKey, setAnimationKey] = useState(0);

  // State for Interactive Tour
  const [showTour, setShowTour] = useState(false);
  
  // State for personalized welcome screen data
  const [personalizedWelcomeData, setPersonalizedWelcomeData] = useState<PersonalizedWelcomeItem[] | null>(null);


  const timeAgo = (date: string, lang: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

    if (seconds < 60) return rtf.format(-seconds, 'second');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return rtf.format(-hours, 'hour');
    const days = Math.floor(hours / 24);
    if (days < 7) return rtf.format(-days, 'day');
    const weeks = Math.floor(days / 7);
    return rtf.format(-weeks, 'week');
};


    useEffect(() => {
        if (user && !activeAssistant) {
            const fetchActivities = async () => {
                const activities: PersonalizedWelcomeItem[] = [];
                const usedAssistantIds = new Set<string>();

                // 1. Fetch up to 2 recent chats
                const { data: recentChats, error: chatsError } = await supabase
                    .from('chats')
                    .select('assistant_id, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(2);

                if (recentChats) {
                    for (const chat of recentChats) {
                        const assistant = ASSISTANTS.find(a => a.id === chat.assistant_id);
                        if (assistant && !usedAssistantIds.has(assistant.id)) {
                            activities.push({
                                type: 'last_chat',
                                assistant: assistant,
                                timeAgo: timeAgo(chat.created_at, language),
                            });
                            usedAssistantIds.add(assistant.id);
                        }
                    }
                }

                // 2. Fetch up to 2 recent badges, if we still need activities
                if (activities.length < 3) {
                    const { data: recentBadges, error: badgesError } = await supabase
                        .from('user_badge_progress')
                        .select('badge_id, unlocked_at')
                        .eq('user_id', user.id)
                        .not('unlocked_at', 'is', null)
                        .order('unlocked_at', { ascending: false })
                        .limit(2);

                    if (recentBadges) {
                        for (const badgeProgress of recentBadges) {
                            if (activities.length >= 3) break;
                            const badge = badges.find(b => b.id === badgeProgress.badge_id);
                            if (badge && !badge.hidden) {
                                activities.push({
                                    type: 'recent_badge',
                                    badgeName: badge.name,
                                    badgeIcon: badge.icon,
                                    timeAgo: timeAgo(badgeProgress.unlocked_at!, language),
                                });
                            }
                        }
                    }
                }
                
                // 3. Fill with suggestions if we still have space
                while (activities.length < 3) {
                    const availableAssistants = ASSISTANTS.filter(a => !usedAssistantIds.has(a.id));
                    if (availableAssistants.length === 0) break;
                    
                    const randomAssistant = availableAssistants[Math.floor(Math.random() * availableAssistants.length)];
                    activities.push({
                        type: 'suggestion',
                        assistant: randomAssistant,
                    });
                    usedAssistantIds.add(randomAssistant.id);
                }

                setPersonalizedWelcomeData(activities.slice(0, 3));
            };

            fetchActivities();
        } else if (!user) {
            setPersonalizedWelcomeData(null);
        }
    }, [user, activeAssistant, badges, language]);


  // Check if tour should be shown for a new user
  useEffect(() => {
    if (user) {
        const tourKey = `hasCompletedTour_${user.id}`;
        const hasCompleted = localStorage.getItem(tourKey);
        if (!hasCompleted) {
            // Use a small delay to ensure the UI is fully rendered before starting the tour
            setTimeout(() => setShowTour(true), 500);
        }
    }
  }, [user]);

  const handleTourEnd = () => {
    if (user) {
        const tourKey = `hasCompletedTour_${user.id}`;
        localStorage.setItem(tourKey, 'true');
        setShowTour(false);
    }
  };


  // Load notifications from localStorage or set defaults
  useEffect(() => {
    if (!user) {
        setNotifications([]);
        setIsNotificationsLoaded(false); // Reset on logout
        return;
    }

    const storedKey = `notifications_${user.id}`;
    const stored = localStorage.getItem(storedKey);

    if (stored) {
        setNotifications(JSON.parse(stored));
    } else {
        const today = new Date().toISOString();
        const initialNotifications: Notification[] = [
            { key: 'notification_gamification', date: today },
            { key: 'notification_welcome', date: today }
        ];
        setNotifications(initialNotifications);
        localStorage.setItem(storedKey, JSON.stringify(initialNotifications));
    }
    setIsNotificationsLoaded(true);
  }, [user]);
  
  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    if (!user || !isNotificationsLoaded) return;
    
    const storedKey = `notifications_${user.id}`;
    localStorage.setItem(storedKey, JSON.stringify(notifications));
  }, [notifications, user, isNotificationsLoaded]);


    const addNotification = useCallback((notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
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
        // FIX: Explicitly type the new Set to match the state's type `Set<string>`.
        setUnlockedAssistants(new Set<string>());
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
            // FIX: Explicitly type the new Set to match the state's type `Set<string>`.
            setUnlockedAssistants(new Set<string>());
        } else {
            // FIX: Explicitly type the new Set as Set<string> to resolve a TypeScript inference issue
            // where `new Set(any[])` can result in `Set<unknown>`, which is not assignable to `Set<string>`.
            const unlockedIds = new Set<string>(data.map((item: { assistant_id: string }) => item.assistant_id));
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
    // If the user clicks the same assistant icon while already on its "new chat" screen, do nothing.
    // Otherwise, clicking the same assistant icon while in a conversation will reset the view to a "new chat" screen.
    if (activeAssistant?.id === assistant.id && activeChatId === 'new') return;

    // Only track the "switch" event if the assistant is actually different.
    if (activeAssistant?.id !== assistant.id) {
      trackAction(GamificationEvent.ASSISTANT_SWITCHED, { id: assistant.id });
      setAnimationKey(prev => prev + 1); // Trigger animation
    }

    setActiveAssistant(assistant);
    
    // Fetch chat history for the selected assistant so it's available in the history modal.
    // We don't await this, allowing the UI to update immediately while history loads in the background.
    fetchChatHistory(assistant.id);

    // As requested, always start a new chat to show the assistant's presentation screen.
    handleNewChat(); 
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
    if (activeAssistant) {
      setAnimationKey(prev => prev + 1); // Trigger animation on reset
    }
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
    setNotifications([]); // This will trigger the persistence useEffect to save an empty array
    setHasUnreadNotifications(false);
    setIsNotificationsModalOpen(false);
    if (user) {
        // When clearing, reset the seen counter to 0 relative to the new empty list.
        localStorage.setItem(`notificationsSeenCount_${user.id}`, '0');
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      setIsLoggingOut(false);
    }, 1500); // Wait for animation
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
      {showTour && <InteractiveTour onComplete={handleTourEnd} onSkip={handleTourEnd} />}
      <div className="flex h-screen w-screen text-gray-800 dark:text-gray-200 bg-white dark:bg-ocs-dark-chat font-sans">
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
            {user && <Avatar user={user} onOpenBadges={() => setIsBadgesModalOpen(true)} onLogout={handleLogout} />}
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
              isPanelVisible={isHistoryPanelVisible}
              onToggleHistoryPanel={() => setIsHistoryPanelVisible(p => !p)}
            />
          )}
          {activeAssistant && !isHistoryPanelVisible && (
              <button
                  onClick={() => setIsHistoryPanelVisible(true)}
                  aria-label={t('expand_history')}
                  className="hidden md:flex fixed top-1/2 -translate-y-1/2 right-6 z-30 items-center justify-center w-8 h-16 bg-white/80 dark:bg-ocs-dark-input/80 backdrop-blur-lg rounded-l-full shadow-lg border border-r-0 border-gray-200/50 dark:border-ocs-dark-hover/50 hover:bg-white dark:hover:bg-ocs-dark-input transition-all duration-300 ease-in-out animate-slide-in-right"
                  style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}
              >
                  <ChevronDoubleLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
          )}
          <div key={animationKey} className="h-full w-full animate-slide-in-right">
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
                personalizedWelcomeData={personalizedWelcomeData}
                onAssistantClick={handleAssistantClick}
            />
          </div>
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
      {isLoggingOut && <LogoutAnimation username={user?.user_metadata?.username || 'User'} />}
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