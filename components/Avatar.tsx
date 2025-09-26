import React, { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { LogoutIcon } from './icons/ProfileIcons';

interface AvatarProps {
  user: User;
}

const Avatar: React.FC<AvatarProps> = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const username = user.user_metadata?.username || 'User';

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
        className="bg-white dark:bg-white shadow-lg dark:shadow-black/20 border border-gray-200 dark:border-transparent px-6 py-3 rounded-full text-sm text-gray-800 dark:text-gray-900 hover:shadow-xl dark:hover:shadow-black/30 transform hover:-translate-y-px transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-ocs-dark-chat focus:ring-ocs-accent"
      >
        <span className="font-semibold text-base">{username}</span>
      </button>
      {dropdownOpen && (
         <div className="absolute top-full right-0 mt-3 w-64 bg-white/50 dark:bg-ocs-dark-input/50 backdrop-blur-2xl border border-white/30 dark:border-zinc-700/60 rounded-2xl shadow-2xl z-20 overflow-hidden">
          <div className="p-4 border-b border-black/10 dark:border-white/10">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{username}</p>
            <p className="text-xs text-gray-500 dark:text-ocs-text-muted truncate">{user.email}</p>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={handleLogout}
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