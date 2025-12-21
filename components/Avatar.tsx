import React, { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { LogoutIcon, BadgeIcon } from './icons/ProfileIcons';

interface AvatarProps {
  user: User;
  onOpenBadges: () => void;
  onLogout: () => void;
  isSidebar?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ user, onOpenBadges, onLogout, isSidebar = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const username = user.user_metadata?.username || 'User';
  const initial = username.charAt(0).toUpperCase();

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
        className={`group relative flex items-center justify-center transition-all duration-300 focus:outline-none w-10 h-10 md:w-12 md:h-12 rounded-full border shadow-lg ${
          isSidebar 
          ? 'bg-white/5 border-white/10 hover:border-ocs-accent/50 hover:bg-ocs-accent/10' 
          : 'bg-black/40 backdrop-blur-md border-white/10 hover:border-white/30 hover:bg-black/60'
        }`}
      >
        <span className="font-bold text-lg text-white group-hover:text-ocs-accent transition-colors">{initial}</span>
        <div className={`absolute inset-0 rounded-full bg-ocs-accent/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity`} />
      </button>

      {dropdownOpen && (
         <div className={`absolute z-[100] w-64 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-modal-enter ${
           isSidebar 
           ? 'bottom-0 left-full ml-4 origin-bottom-left' 
           : 'top-full right-0 mt-4 origin-top-right'
         }`}>
          <div className="p-6 border-b border-white/5 bg-white/5">
            <p className="text-sm font-bold text-white truncate">{username}</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 truncate mt-1">{user.email}</p>
          </div>
          <div className="p-3 space-y-1">
            <button
              onClick={() => { onOpenBadges(); setDropdownOpen(false); }}
              className="w-full flex items-center space-x-3 text-left px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <BadgeIcon className="w-5 h-5 text-ocs-accent" />
              <span className="font-medium">Badges</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 text-left px-4 py-3 text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
            >
              <LogoutIcon className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;