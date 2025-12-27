import React from 'react';
import type { Assistant } from '../types';
import { XIcon } from './icons/CoreIcons';
import type { User } from '@supabase/supabase-js';
import { useLanguage } from '../contexts/LanguageContext';

interface PurchaseModalProps {
    assistant: Assistant | null;
    onClose: () => void;
    user: User | null;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ assistant, onClose, user }) => {
    const { t } = useLanguage();
    if (!assistant) return null;

    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(assistant.price);

    // The user ID logic has been removed as it's not needed for the WhatsApp link.
    const purchaseUrlWithUser = assistant.purchaseUrl;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-modal-title"
        >
            <div
                className="w-full max-w-sm bg-ocs-dark-sidebar rounded-2xl shadow-2xl p-8 border border-white/10 flex flex-col items-center text-center relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                <div className={`relative w-24 h-24 mb-6 border-4 ${assistant.ringColor} rounded-full flex items-center justify-center p-1`}>
                    <img src={assistant.iconUrl} alt={assistant.name} className="w-full h-full object-cover rounded-full" />
                </div>

                <h2 id="purchase-modal-title" className="text-3xl font-bold text-white mb-2">
                    {t('unlock_assistant_title', { assistantName: assistant.name })}
                </h2>
                <p className="text-ocs-text-muted max-w-xs mb-6">
                    {t('unlock_assistant_description', { assistantName: assistant.name })}
                </p>

                <a
                    href={purchaseUrlWithUser}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full block text-center font-bold py-4 px-6 rounded-xl ${getButtonColors(assistant.ringColor)}`}
                >
                    {t('buy_now_button', { price: formattedPrice })}
                </a>

                <p className="text-xs text-ocs-text-muted/70 mt-4">
                    {t('redirect_notice')}
                </p>
            </div>
        </div>
    );
};

const getButtonColors = (ringColor: string): string => {
    switch (ringColor) {
        case 'border-orange-500':
            return 'bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/30';
        case 'border-blue-600':
            return 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30';
        case 'border-teal-400':
            return 'bg-teal-400 text-white hover:bg-teal-300 shadow-teal-400/30';
        case 'border-[#d2b48c]':
            return 'bg-[#c19a6b] text-white hover:bg-[#a67c52] shadow-[#d2b48c]/30'; // Darker beige/tan for GRAM
        case 'border-lime-400':
            return 'bg-lime-400 text-black hover:bg-lime-300 shadow-lime-400/30';
        case 'border-pink-500':
            return 'bg-pink-500 text-white hover:bg-pink-400 shadow-pink-500/30';
        case 'border-[#f08080]':
            return 'bg-[#f08080] text-white hover:bg-[#e67676] shadow-[#f08080]/30';
        case 'border-[#800080]':
            return 'bg-[#800080] text-white hover:bg-[#660066] shadow-[#800080]/30';
        default:
            return 'bg-ocs-accent text-white hover:bg-purple-500 shadow-purple-600/30';
    }
};

export default PurchaseModal;