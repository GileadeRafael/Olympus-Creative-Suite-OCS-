
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ToastInfo {
    name: string;
    icon: string;
    colorClass: {
        text: string;
        bg: string;
    };
}

interface Toast extends ToastInfo {
    id: number;
}

interface ToastContextType {
    addToast: (toast: ToastInfo) => void;
    removeToast: (id: number) => void;
    toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toastInfo: ToastInfo) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { ...toastInfo, id }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
