import React from 'react';
import { XIcon, SparklesIcon } from './icons/CoreIcons';
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-modal-title"
        >
            <div
                className="w-full max-w-md bg-white/80 dark:bg-ocs-dark-input/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-ocs-dark-hover/50 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
                    <h2 id="notifications-modal-title" className="font-bold text-lg text-gray-800 dark:text-white">
                        {t('notifications_title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-500/10 dark:hover:bg-white/10"
                        aria-label={t('notifications_close')}
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[60vh]">
                    {notifications.length > 0 ? (
                        notifications.map((note, index) => {
                            const formattedDate = new Date(note.date).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' });
                            const params = { ...note.params, date: formattedDate };
                            const content = t(note.key, params);

                            return (
                                <div key={`${note.key}-${index}`} className="flex items-start space-x-3">
                                    <div className="mt-1 flex-shrink-0 text-ocs-accent">
                                        <SparklesIcon className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {content}
                                    </p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex justify-center items-center h-24">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('notifications_empty')}</p>
                        </div>
                    )}
                </div>
                
                {notifications.length > 0 && (
                    <footer className="p-2 border-t border-black/10 dark:border-white/10">
                        <button
                            onClick={onClearAll}
                            className="w-full text-center text-sm font-semibold text-gray-500 dark:text-gray-400 py-2 rounded-lg hover:bg-gray-500/10 dark:hover:bg-white/10 transition-colors"
                        >
                            {t('clear_notifications')}
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default NotificationsModal;