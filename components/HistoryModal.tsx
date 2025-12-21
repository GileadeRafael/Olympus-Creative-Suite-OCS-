import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Assistant, ChatHistoryItem } from '../types';
import { TrashIcon, PlusIcon, PencilIcon, SearchIcon, ChevronDoubleRightIcon } from './icons/CoreIcons';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamification } from '../contexts/GamificationContext';
import { GamificationEvent } from '../constants/badges';

interface HistoryModalProps {
    assistant: Assistant;
    history: ChatHistoryItem[];
    activeChatId: string | 'new' | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    onDeleteChat: (chatId: string) => void;
    onUpdateChatTitle: (chatId: string, newTitle: string) => void;
    isLoading: boolean;
    isOpen: boolean;
    onClose: () => void;
    isPanelVisible: boolean;
    onToggleHistoryPanel: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ assistant, history, activeChatId, onSelectChat, onNewChat, onDeleteChat, onUpdateChatTitle, isLoading, isOpen, onClose, isPanelVisible, onToggleHistoryPanel }) => {
    const { t } = useLanguage();
    const { trackAction } = useGamification();
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredHistory = useMemo(() => {
        if (!searchTerm) {
            return history;
        }
        return history.filter(chat =>
            chat.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [history, searchTerm]);

    useEffect(() => {
        if (editingChatId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingChatId]);

    const handleDelete = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        if (window.confirm(t('delete_chat_confirm'))) {
            trackAction(GamificationEvent.CHAT_DELETED);
            onDeleteChat(chatId);
        }
    };

    const handleStartEdit = (e: React.MouseEvent, chat: ChatHistoryItem) => {
        e.stopPropagation();
        setEditingChatId(chat.id);
        setEditingTitle(chat.title);
    };

    const handleCancelEdit = () => {
        setEditingChatId(null);
        setEditingTitle('');
    };

    const handleSaveTitle = () => {
        if (!editingChatId || !editingTitle.trim()) {
            handleCancelEdit();
            return;
        }
        const originalChat = history.find(c => c.id === editingChatId);
        if (originalChat && originalChat.title !== editingTitle.trim()) {
            trackAction(GamificationEvent.CHAT_RENAMED);
            onUpdateChatTitle(editingChatId, editingTitle.trim());
        }
        handleCancelEdit();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSaveTitle();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    return (
         <div
            // Wrapper: High Z-index on mobile to stay above sidebar. Sliding panel on desktop.
            className={`
                ${isOpen ? 'fixed inset-0 z-[80]' : 'hidden'} md:block
                md:fixed md:top-1/2 md:right-6 md:-translate-y-1/2 md:z-20 md:w-72 md:h-[70vh] md:inset-auto
                transition-transform duration-300 ease-in-out
                ${isPanelVisible ? 'md:translate-x-0' : 'md:translate-x-full'}
            `}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            {/* Mobile-only overlay */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md md:hidden" aria-hidden="true" />
            
            {/* The Panel itself */}
            <div
                className="relative mx-auto mt-[5vh] w-[92%] max-w-sm h-[85vh] flex flex-col bg-[#111111] backdrop-blur-2xl rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden
                           md:mx-0 md:mt-0 md:w-full md:h-full md:max-w-none md:bg-white/60 md:dark:bg-ocs-dark-input/60"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-bold text-2xl text-white md:text-gray-800 md:dark:text-white">{t('chats')}</h2>
                    <button
                        onClick={onToggleHistoryPanel}
                        aria-label={t('collapse_history')}
                        className="hidden md:block p-1.5 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-500/10 hover:text-gray-800 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                    >
                        <ChevronDoubleRightIcon className="w-5 h-5" />
                    </button>
                </header>
                
                <div className="px-6 py-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder={t('search_chats_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 md:bg-gray-100 md:dark:bg-ocs-dark-hover/50 rounded-xl pl-11 pr-4 py-3 text-sm text-white md:text-gray-800 md:dark:text-gray-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-ocs-accent"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-1">
                    {isLoading && (
                        <div className="flex justify-center items-center h-32">
                            <div className="w-6 h-6 border-2 border-ocs-accent border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {!isLoading && history.length === 0 && (
                        <div className="flex justify-center items-center h-32 px-6">
                            <p className="text-center text-sm text-zinc-500">{t('no_chats_yet', { assistantName: assistant.name })}</p>
                        </div>
                    )}
                    {!isLoading && history.length > 0 && filteredHistory.length === 0 && (
                        <div className="flex justify-center items-center h-32 px-6">
                            <p className="text-center text-sm text-zinc-500">{t('no_search_results')}</p>
                        </div>
                    )}
                    {!isLoading && filteredHistory.map(chat => (
                        <div 
                            key={chat.id} 
                            className={`group relative w-full text-left p-4 rounded-2xl cursor-pointer transition-all ${activeChatId === chat.id ? 'bg-white/10 md:bg-gray-900/10 md:dark:bg-white/10' : 'hover:bg-white/5 md:hover:bg-gray-900/5 md:dark:hover:bg-white/5'}`}
                            onClick={() => editingChatId !== chat.id && onSelectChat(chat.id)}
                        >
                            {editingChatId === chat.id ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleSaveTitle}
                                    className="w-full bg-transparent text-sm font-medium text-white md:text-gray-800 md:dark:text-gray-200 outline-none border-b border-ocs-accent"
                                />
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-white/90 md:text-gray-800 md:dark:text-gray-200 truncate pr-16">{chat.title}</p>
                                    <div className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleStartEdit(e, chat)}
                                            className="p-2 text-zinc-500 hover:text-white md:hover:text-gray-800 md:dark:hover:text-white transition-colors"
                                            aria-label={t('edit_chat_title')}
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, chat.id)}
                                            className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                                            aria-label={t('delete_chat_label')}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <footer className="p-6 border-t border-white/5">
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center justify-center space-x-3 text-sm font-bold p-4 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all active:scale-[0.98]"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        <span>{t('new_chat')}</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default HistoryModal;