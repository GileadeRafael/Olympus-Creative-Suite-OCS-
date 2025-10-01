import React from 'react';

interface LogoutAnimationProps {
    username: string;
}

const LogoutAnimation: React.FC<LogoutAnimationProps> = ({ username }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative mb-6 animate-pulse">
                <img src="https://i.imgur.com/QAy8ULl.png" alt="Olympus Logo" className="h-20 w-auto block dark:hidden" />
                <img src="https://i.imgur.com/0vBQm1M.png" alt="Olympus Logo" className="h-20 w-auto hidden dark:block" />
            </div>
            <p className="text-white text-lg">
                Até breve, {username}!
            </p>
            <p className="text-white/60 text-sm mt-1">
                Encerrando sua sessão...
            </p>
        </div>
    );
};

export default LogoutAnimation;

// Add a simple fade-in keyframe to tailwind config if not already present
// For the purpose of this component, we can assume it's available or add it.
// In a real project, this would go into tailwind.config.js
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .animate-fade-in {
        animation: fadeIn 0.5s ease-in-out forwards;
    }
`;
document.head.appendChild(style);
