
import React, { useState, useEffect } from 'react';

interface ToastProps {
    id: number;
    name: string;
    icon: string;
    colorClass: {
        text: string;
        bg: string;
    };
    onDismiss: (id: number) => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ id, name, icon, colorClass, onDismiss, duration = 5000 }) => {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);
    
    useEffect(() => {
        if (exiting) {
            const timer = setTimeout(() => {
                onDismiss(id);
            }, 500); // Corresponds to the fadeOut animation duration
            return () => clearTimeout(timer);
        }
    }, [exiting, onDismiss, id]);

    return (
        <div
            className={`flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse text-gray-500 bg-white/80 dark:bg-ocs-dark-input/80 backdrop-blur-xl rounded-2xl shadow-2xl dark:text-gray-400 border border-gray-200/50 dark:border-ocs-dark-hover/50 ${exiting ? 'toast-exit' : 'toast-enter'}`}
            role="alert"
        >
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-10 h-10 ${colorClass.bg} rounded-lg`}>
                <span className="text-xl" role="img" aria-label={name}>{icon}</span>
            </div>
            <div className="ms-3 text-sm font-normal">
                <span className="mb-1 text-xs font-semibold text-gray-900 dark:text-white">Badge Unlocked!</span>
                <div className="text-sm font-normal text-gray-600 dark:text-gray-300">{name}</div>
            </div>
        </div>
    );
};

export default Toast;
