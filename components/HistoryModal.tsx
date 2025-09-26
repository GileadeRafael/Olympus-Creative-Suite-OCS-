import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Assistant, ChatHistoryItem } from '../types';
import { TrashIcon, PlusIcon, PencilIcon, SearchIcon } from './icons/CoreIcons';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryModalProps {
    assistant: Assistant;
    history: ChatHistoryItem[];
    activeChatId: string | 'new' | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    onDeleteChat: (chatId: string) => void;
    onUpdateChatTitle: (chatId: string, newTitle: string) => void;
    isLoading: boolean;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ assistant, history, activeChatId, onSelectChat, onNewChat, onDeleteChat, onUpdateChatTitle, isLoading }) => {
    const { t } = useLanguage();
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
        e.stopPropagation(); // Prevent onSelectChat from firing
        if (window.confirm(t('delete_chat_confirm'))) {
            onDeleteChat(chatId);
        }
    };

    const handleStartEdit = (chat: ChatHistoryItem) => {
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
        <div className="fixed top-1/2 right-6 -translate-y-1/2 z-20 w-72 h-[70vh] flex flex-col bg-white/60 dark:bg-ocs-dark-input/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-ocs-dark-hover/50">
            <header className="p-4 border-b border-black/10 dark:border-white/10">
                <h2 className="font-bold text-lg text-gray-800 dark:text-white">{t('chats')}</h2>
            </header>
            
            <div className="p-2 border-b border-black/10 dark:border-white/10">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder={t('search_chats_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-ocs-dark-hover/50 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-ocs-accent"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('loading_history')}</p>
                    </div>
                )}
                {!isLoading && history.length === 0 && (
                     <div className="flex justify-center items-center h-full px-4">
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">{t('no_chats_yet', { assistantName: assistant.name })}</p>
                    </div>
                )}
                {!isLoading && history.length > 0 && filteredHistory.length === 0 && (
                    <div className="flex justify-center items-center h-full px-4">
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">{t('no_search_results')}</p>
                    </div>
                )}
                {!isLoading && filteredHistory.map(chat => (
                    <div 
                        key={chat.id} 
                        className={`group relative w-full text-left p-2.5 rounded-lg cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-gray-900/10 dark:bg-white/10' : 'hover:bg-gray-900/5 dark:hover:bg-white/5'}`}
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
                                className="w-full bg-transparent text-sm font-medium text-gray-800 dark:text-gray-200 outline-none border-b border-ocs-accent"
                            />
                        ) : (
                            <>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate pr-16">{chat.title}</p>
                                <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleStartEdit(chat); }}
                                        className="p-1.5 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-500/10 hover:text-gray-800 dark:hover:text-white dark:hover:bg-white/10"
                                        aria-label={t('edit_chat_title')}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, chat.id)}
                                        className="p-1.5 text-gray-500 dark:text-gray-400 rounded-full hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/10"
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

            <footer className="p-2 border-t border-black/10 dark:border-white/10">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center space-x-2 text-sm font-semibold p-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-900/5 dark:hover:bg-white/5 transition-colors"
                >
                    <PlusIcon className="w-5 h-5"/>
                    <span>{t('new_chat')}</span>
                </button>
            </footer>
        </div>
    );
};

export default HistoryModal;