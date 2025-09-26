import React from 'react';
import type { Assistant } from '../types';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { DiamondIcon } from './icons/CoreIcons';

interface SidebarProps {
  assistants: Assistant[];
  onAssistantClick: (assistant: Assistant) => void;
  activeAssistantId?: string;
  onResetToHome: () => void;
  unlockedAssistants: Set<string>;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ assistants, onAssistantClick, activeAssistantId, onResetToHome, unlockedAssistants, isLoading }) => {
  return (
    <aside className="bg-gray-100 dark:bg-ocs-dark-sidebar w-20 flex flex-col items-center py-6">
      <div className="mb-6">
        <button onClick={onResetToHome} className="transition-transform duration-200 hover:scale-110 focus:outline-none" aria-label="Go to homepage">
          <img src="https://i.imgur.com/QAy8ULl.png" alt="Olympus Logo" className="h-10 w-auto block dark:hidden" />
          <img src="https://i.imgur.com/0vBQm1M.png" alt="Olympus Logo" className="h-10 w-auto hidden dark:block" />
        </button>
      </div>
      <nav className="flex-1 flex flex-col items-center justify-center space-y-3">
        {assistants.map((assistant) => {
          const isLocked = !isLoading && !unlockedAssistants.has(assistant.id);
          return (
            <div key={assistant.id} className="group relative">
              <button
                onClick={() => onAssistantClick(assistant)}
                className={`w-16 h-16 rounded-full flex items-center justify-center p-0.5 transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none relative ${
                  activeAssistantId === assistant.id ? `border-2 ${assistant.ringColor}` : 'border-2 border-transparent'
                }`}
                aria-label={`Select ${assistant.name}${isLocked ? ' (Locked)' : ''}`}
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
                {assistant.name} {isLocked && '(Locked)'}
              </span>
            </div>
          );
        })}
      </nav>
      <div className="flex flex-col items-center space-y-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
    </aside>
  );
};

export default Sidebar;