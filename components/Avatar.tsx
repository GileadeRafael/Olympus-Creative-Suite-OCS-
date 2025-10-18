import React, { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { LogoutIcon, BadgeIcon } from './icons/ProfileIcons';

interface AvatarProps {
  user: User;
  onOpenBadges: () => void;
  onLogout: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ user, onOpenBadges, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const username = user.user_metadata?.username || 'User';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef} data-tour-id="user-avatar">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 shadow-lg dark:shadow-black/20 border border-transparent px-6 py-3 rounded-full text-sm text-white dark:text-gray-900 hover:shadow-xl dark:hover:shadow-black/30 transform hover:-translate-y-px transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-ocs-dark-chat focus:ring-ocs-accent"
      >
        <span className="font-semibold text-base">{username}</span>
      </button>
      {dropdownOpen && (
         <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-white/50 dark:bg-ocs-dark-input/50 backdrop-blur-2xl border border-white/30 dark:border-zinc-700/60 rounded-2xl shadow-2xl z-20 overflow-hidden">
          <div className="p-4 border-b border-black/10 dark:border-white/10">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{username}</p>
            <p className="text-xs text-gray-500 dark:text-ocs-text-muted truncate">{user.email}</p>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={() => { onOpenBadges(); setDropdownOpen(false); }}
              className="w-full flex items-center space-x-3 text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-500/5 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <BadgeIcon className="w-5 h-5" />
              <span>Badges</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogoutIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;