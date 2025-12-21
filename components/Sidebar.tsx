import React, { useState } from 'react';
import type { Assistant } from '../types';
import LanguageSelector from './LanguageSelector';
import { HistoryIcon, BellIcon, PlusIcon, XIcon, ChevronDownIcon } from './icons/CoreIcons';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  assistants: Assistant[];
  onAssistantClick: (assistant: Assistant) => void;
  activeAssistantId?: string;
  onResetToHome: () => void;
  unlockedAssistants: Set<string>;
  isLoading: boolean;
  onToggleHistory: () => void;
  hasUnreadNotifications: boolean;
  onToggleNotifications: () => void;
  activeChatId: string | 'new' | null;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    onResetToHome, 
    onToggleHistory,
    hasUnreadNotifications,
    onToggleNotifications,
    activeChatId,
    onNewChat
}) => {
  const { t } = useLanguage();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const toggleMobile = () => setIsMobileExpanded(!isMobileExpanded);

  // Helper to handle clicks on mobile to auto-collapse after action
  const handleMobileAction = (action: () => void) => {
    action();
    setIsMobileExpanded(false);
  };

  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-[60] flex items-center pointer-events-none">
      <div 
        className={`pointer-events-auto bg-black border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden
          ${isMobileExpanded ? 'py-6 space-y-6 h-auto max-h-[80vh]' : 'py-3 space-y-0 h-16 md:h-auto md:py-6 md:space-y-6'}
          w-16`}
      >
        
        {/* Top: Home/Logo Button - Always Visible */}
        <button 
          onClick={() => handleMobileAction(onResetToHome)} 
          className="group relative flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full hover:bg-white/10 transition-all duration-200 focus:outline-none" 
          aria-label="Back to selection"
        >
          <img 
            src="https://i.imgur.com/7P8v6DA.png" 
            alt="Zion Peak Logo" 
            className="w-6 h-6 md:w-7 md:h-7 object-contain filter brightness-0 invert" 
          />
          <span className="hidden md:block absolute left-full ml-4 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest border border-white/10">
            Home
          </span>
        </button>

        {/* Desktop Content & Mobile Expanded Content */}
        <div className={`flex flex-col items-center space-y-6 transition-all duration-500 ${isMobileExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 md:opacity-100 md:translate-y-0 md:flex h-0 md:h-auto pointer-events-none md:pointer-events-auto'}`}>
            
            <div className="w-8 h-px bg-white/10 flex-shrink-0" />

            {/* New Chat Button */}
            <button
            onClick={() => handleMobileAction(onNewChat)}
            className="group relative flex items-center justify-center w-12 h-12 rounded-full hover:bg-white/10 text-white transition-all duration-200 focus:outline-none"
            aria-label="New Chat"
            >
            <PlusIcon className="w-6 h-6" />
            <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest border border-white/10">
                {t('new_chat')}
            </span>
            </button>

            {/* History Toggle (Only visible on mobile as per request) */}
            <button
            onClick={() => handleMobileAction(onToggleHistory)}
            className="md:hidden group relative flex items-center justify-center w-12 h-12 rounded-full hover:bg-white/10 text-white transition-all duration-200 focus:outline-none"
            aria-label="View History"
            >
            <HistoryIcon className="w-6 h-6" />
            </button>

            {/* Notifications */}
            <button
            onClick={() => handleMobileAction(onToggleNotifications)}
            className="group relative flex items-center justify-center w-12 h-12 rounded-full hover:bg-white/10 text-white transition-all duration-200 focus:outline-none"
            aria-label="Notifications"
            >
            <BellIcon className="w-6 h-6" />
            {hasUnreadNotifications && (
                <span className="absolute top-3 right-3 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-black" />
            )}
            <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest border border-white/10">
                Alerts
            </span>
            </button>

            <div className="w-8 h-px bg-white/10 flex-shrink-0" />

            {/* Language Selector */}
            <div className="flex flex-col items-center">
            <LanguageSelector activeChatId={activeChatId} />
            </div>
        </div>

        {/* Mobile Toggle Button - Visible only when collapsed on mobile */}
        <button 
            onClick={toggleMobile}
            className="md:hidden flex items-center justify-center w-12 h-10 text-zinc-500 hover:text-white transition-colors"
            aria-label={isMobileExpanded ? "Collapse Menu" : "Expand Menu"}
        >
            {isMobileExpanded ? (
                <XIcon className="w-5 h-5" />
            ) : (
                <ChevronDownIcon className="w-5 h-5 animate-bounce" />
            )}
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;