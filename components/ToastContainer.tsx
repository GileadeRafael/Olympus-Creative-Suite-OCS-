import React from 'react';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-6 right-6 z-50 flex flex-col space-y-3">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    name={toast.name}
                    icon={toast.icon}
                    colorClass={toast.colorClass}
                    onDismiss={removeToast}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
