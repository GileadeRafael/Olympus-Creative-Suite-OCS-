import React from 'react';
import { XIcon, SparklesIcon, TrashIcon } from './icons/CoreIcons';
import { useLanguage } from '../contexts/LanguageContext';
import type { Notification } from '../types';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onClearAll: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, notifications, onClearAll }) => {
    if (!isOpen) return null;
    const { t, language } = useLanguage();

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-modal-title"
        >
            <div
                className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col overflow-hidden animate-modal-enter"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-ocs-accent/20 rounded-xl">
                            <SparklesIcon className="w-5 h-5 text-ocs-accent" />
                        </div>
                        <h2 id="notifications-modal-title" className="font-bold text-xl text-white tracking-tight">
                            {t('notifications_title')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        aria-label={t('notifications_close')}
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[50vh] custom-scrollbar">
                    {notifications.length > 0 ? (
                        notifications.map((note, index) => {
                            const formattedDate = new Date(note.date).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' });
                            const params = { ...note.params, date: formattedDate };
                            const content = t(note.key, params);

                            return (
                                <div 
                                    key={`${note.key}-${index}`} 
                                    className="group flex items-start space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300"
                                >
                                    <div className="mt-1 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-ocs-accent/10 border border-ocs-accent/20 text-ocs-accent group-hover:scale-110 transition-transform">
                                        <SparklesIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                                            {content}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                            {formattedDate}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-600 border border-white/5">
                                <SparklesIcon className="w-8 h-8 opacity-20" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1">{t('notifications_empty')}</h3>
                                <p className="text-sm text-zinc-500">Stay creative and we'll keep you posted.</p>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                {notifications.length > 0 && (
                    <footer className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
                        <button
                            onClick={onClearAll}
                            className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-red-400 py-3 rounded-xl hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                        >
                            <TrashIcon className="w-4 h-4" />
                            {t('clear_notifications')}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-white text-black text-xs font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-zinc-200 transition-all transform active:scale-95"
                        >
                            {t('notifications_close')}
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default NotificationsModal;