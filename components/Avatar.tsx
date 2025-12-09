
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 shadow-lg dark:shadow-black/20 border border-transparent px-6 py-3 rounded-full text-sm text-white dark:text-gray-900 hover:shadow-xl dark:hover:shadow-black/30 transform hover:-translate-y-px transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-ocs-dark-chat focus:ring-ocs-accent"
      >
        <span className="font-semibold text-base">{username}</span>
      </button>
      {dropdownOpen && (
         <div className="absolute top-full right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-black backdrop-blur-2xl border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden origin-top-right animate-modal-enter">
          <div className="p-4 border-b border-black/10 dark:border-zinc-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{username}</p>
            <p className="text-xs text-gray-500 dark:text-ocs-text-muted truncate">{user.email}</p>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={() => { onOpenBadges(); setDropdownOpen(false); }}
              className="w-full flex items-center space-x-3 text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <BadgeIcon className="w-5 h-5" />
              <span>Badges</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
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
