import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Assistant } from '../types';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { DiamondIcon, HistoryIcon, BellIcon, ChevronUpIcon, ChevronDownIcon } from './icons/CoreIcons';
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
}

const Sidebar: React.FC<SidebarProps> = ({ 
    assistants, 
    onAssistantClick, 
    activeAssistantId, 
    onResetToHome, 
    unlockedAssistants, 
    isLoading, 
    onToggleHistory,
    hasUnreadNotifications,
    onToggleNotifications,
    activeChatId,
}) => {
  const { t } = useLanguage();
  const navRef = useRef<HTMLElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = navRef.current;
    if (el) {
        const hasOverflow = el.scrollHeight > el.clientHeight;
        setCanScrollUp(el.scrollTop > 0);
        // Use a small tolerance for floating point inaccuracies
        setCanScrollDown(hasOverflow && Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) > 1);
    } else {
        setCanScrollUp(false);
        setCanScrollDown(false);
    }
  }, []);

  useEffect(() => {
      const el = navRef.current;
      if (!el) return;

      checkScrollability();

      const resizeObserver = new ResizeObserver(checkScrollability);
      resizeObserver.observe(el);

      return () => {
          resizeObserver.unobserve(el);
      };
  }, [assistants, isLoading, checkScrollability]);

  const scroll = (direction: 'up' | 'down') => {
      navRef.current?.scrollBy({
          top: direction === 'up' ? -80 : 80, // Scroll by approx. one icon height + spacing
          behavior: 'smooth'
      });
  };


  return (
    <aside className="relative z-40 bg-gray-100 dark:bg-ocs-dark-sidebar w-20 flex flex-col items-center py-6">
      <div className="flex flex-col items-center space-y-4 mb-6">
        <button onClick={onResetToHome} className="transition-transform duration-200 hover:scale-110 focus:outline-none" aria-label="Go to homepage">
          <img src="https://i.imgur.com/QAy8ULl.png" alt="Olympus Logo" className="h-10 w-auto block dark:hidden" />
          <img src="https://i.imgur.com/0vBQm1M.png" alt="Olympus Logo" className="h-10 w-auto hidden dark:block" />
        </button>
        <div className="relative" data-tour-id="notifications-bell">
             <button
                onClick={onToggleNotifications}
                className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-ocs-dark-hover transition-colors duration-200 ease-in-out focus:outline-none"
                aria-label="View notifications"
            >
                <BellIcon className="w-6 h-6" />
            </button>
            {hasUnreadNotifications && (
                <span className="absolute top-2 right-2 block h-3 w-3 rounded-full bg-red-500 border-2 border-gray-100 dark:border-ocs-dark-sidebar pointer-events-none" />
            )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
        <button
          onClick={() => scroll('up')}
          aria-label="Scroll assistants up"
          className={`h-8 flex-shrink-0 flex items-center justify-center text-gray-400 dark:text-gray-500 transition-all duration-300 ${canScrollUp ? 'opacity-100 hover:text-gray-600 dark:hover:text-gray-300' : 'opacity-0 pointer-events-none'}`}
        >
          <ChevronUpIcon className="w-5 h-5" />
        </button>

        <div className="relative w-full h-80" data-tour-id="assistants-list">
          <div className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-gray-100 dark:from-ocs-dark-sidebar to-transparent pointer-events-none z-10 transition-opacity ${canScrollUp ? 'opacity-100' : 'opacity-0'}`} />
          
          <nav 
            ref={navRef}
            onScroll={checkScrollability}
            className="h-full overflow-y-auto space-y-3 no-scrollbar py-2 flex flex-col items-center"
          >
            {assistants.map((assistant) => {
              const isLocked = !isLoading && !unlockedAssistants.has(assistant.id);
              const lockedText = isLocked ? ` ${t('locked_tooltip')}` : '';
              return (
                <div key={assistant.id} className="group relative">
                  <button
                    onClick={() => onAssistantClick(assistant)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center p-0.5 transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none relative ${
                      activeAssistantId === assistant.id ? `border-2 ${assistant.ringColor}` : 'border-2 border-transparent'
                    }`}
                    aria-label={`Select ${assistant.name}${lockedText}`}
                  >
                    <img 
                      src={assistant.iconUrl} 
                      alt={assistant.name} 
                      className={`w-full h-full object-cover rounded-full transition-all duration-300 ${isLocked ? 'grayscale opacity-60' : ''}`}
                    />
                    {isLocked && (
                      <div className="absolute -top-1.5 -right-1.5 bg-ocs-accent text-white rounded-full p-1.5 shadow-lg border-2 border-gray-100 dark:border-ocs-dark-sidebar">
                          <DiamondIcon className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                  <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900/80 dark:bg-ocs-dark-input/80 backdrop-blur-md text-white text-sm font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                    {assistant.name}{lockedText}
                  </span>
                </div>
              );
            })}
          </nav>
          
          <div className={`absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-100 dark:from-ocs-dark-sidebar to-transparent pointer-events-none z-10 transition-opacity ${canScrollDown ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        <button
          onClick={() => scroll('down')}
          aria-label="Scroll assistants down"
          className={`h-8 flex-shrink-0 flex items-center justify-center text-gray-400 dark:text-gray-500 transition-all duration-300 ${canScrollDown ? 'opacity-100 hover:text-gray-600 dark:hover:text-gray-300' : 'opacity-0 pointer-events-none'}`}
        >
          <ChevronDownIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center space-y-2">
        {activeAssistantId && (
            <button
                onClick={onToggleHistory}
                className="md:hidden w-12 h-12 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-ocs-dark-hover transition-colors duration-200 ease-in-out focus:outline-none"
                aria-label={t('toggle_chat_history')}
            >
                <HistoryIcon className="w-6 h-6" />
            </button>
        )}
        <div data-tour-id="language-selector">
          <LanguageSelector activeChatId={activeChatId} />
        </div>
        <div data-tour-id="theme-toggle">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;