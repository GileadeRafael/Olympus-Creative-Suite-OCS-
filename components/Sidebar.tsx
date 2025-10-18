import React from 'react';
import type { Assistant } from '../types';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { DiamondIcon, HistoryIcon, BellIcon } from './icons/CoreIcons';
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

  return (
    <aside className="bg-gray-100 dark:bg-ocs-dark-sidebar w-20 flex flex-col items-center py-6">
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
      <nav className="flex-1 flex flex-col items-center justify-center space-y-3" data-tour-id="assistants-list">
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
              <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                {assistant.name}{lockedText}
              </span>
            </div>
          );
        })}
      </nav>
      <div className="flex flex-col items-center space-y-2">
        {activeAssistantId && (
            <button
                onClick={onToggleHistory}
                className="md:hidden w-12 h-12 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-ocs-dark-hover transition-colors duration-200 ease-in-out focus:outline-none"
                aria-label="Toggle chat history"
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