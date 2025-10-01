import React, { useState } from 'react';
import type { Assistant, Message } from '../types';
import { generatePdf } from '../services/pdfService';
import { XIcon, DownloadIcon } from './icons/CoreIcons';

interface ExportPdfModalProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    assistant: Assistant;
}

const ExportPdfModal: React.FC<ExportPdfModalProps> = ({ isOpen, onClose, messages, assistant }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            await generatePdf(messages, assistant);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('An error occurred while generating the PDF. Please try again.');
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-sm bg-white dark:bg-ocs-dark-sidebar rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-zinc-700/80 flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Export Chat</h2>
                <p className="text-sm text-center text-gray-500 dark:text-ocs-text-muted mb-6">
                    Download your conversation with {assistant.name} as a PDF document.
                </p>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-24">
                        <div className="w-8 h-8 border-4 border-ocs-accent border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Generating PDF...
                        </p>
                    </div>
                ) : (
                   <div className="w-full mt-2">
                        <button
                            onClick={handleExport}
                            className="w-full flex items-center justify-center space-x-2 bg-ocs-accent text-white font-semibold px-4 py-3 rounded-lg shadow-lg hover:bg-purple-700 dark:hover:bg-purple-500 transition-all transform hover:-translate-y-0.5"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            <span>Download as PDF</span>
                        </button>
                    </div>
                )}
                 <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-ocs-dark-hover transition-colors"
                    aria-label="Close modal"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default ExportPdfModal;
