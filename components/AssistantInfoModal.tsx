
import React, { useState } from 'react';
import type { Assistant } from '../types';
import { XIcon, SparklesIcon, ChevronDoubleRightIcon, ChevronDoubleLeftIcon, DiamondIcon } from './icons/CoreIcons';
import { useLanguage } from '../contexts/LanguageContext';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true, breaks: true });

interface AssistantInfoModalProps {
    assistant: Assistant;
    onClose: () => void;
    isLocked: boolean;
    onPurchase: (assistant: Assistant) => void;
}

const AssistantInfoModal: React.FC<AssistantInfoModalProps> = ({ assistant, onClose, isLocked, onPurchase }) => {
    const { t } = useLanguage();
    const [activeDemoIndex, setActiveDemoIndex] = useState(0);

    const demos = assistant.demoExamples || [
        { prompt: "Example query...", responseKey: assistant.descriptionKey }
    ];

    const handleNextDemo = () => setActiveDemoIndex((prev) => (prev + 1) % demos.length);
    const handlePrevDemo = () => setActiveDemoIndex((prev) => (prev - 1 + demos.length) % demos.length);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-modal-enter">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
            
            <div className="relative w-full max-w-6xl h-full max-h-[850px] bg-[#050505] border border-white/10 rounded-[40px] shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row">
                
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 z-50 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                {/* Left: Presentation */}
                <div className="flex-[0.8] p-10 md:p-14 flex flex-col justify-between overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-white/5">
                    <div>
                        <div className="flex items-center gap-5 mb-10">
                            <div className={`w-20 h-20 rounded-3xl p-0.5 border-2 ${assistant.ringColor} shadow-2xl shadow-ocs-accent/5`}>
                                <img src={assistant.iconUrl} alt={assistant.name} className="w-full h-full object-cover rounded-[22px]" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-1">{assistant.name}</h2>
                                <p className="text-xs font-bold text-ocs-accent uppercase tracking-[0.3em]">{t('assistant_presentation')}</p>
                            </div>
                        </div>

                        {/* Reduced font size from text-xl to text-base */}
                        <div className="prose prose-invert prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-base mb-12">
                            <p>{t(assistant.longDescriptionKey || assistant.descriptionKey)}</p>
                        </div>
                        
                        <div className="space-y-6">
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-3">
                                <SparklesIcon className="w-5 h-5 text-ocs-accent" />
                                {t('example_prompts_title')}
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                {assistant.examplePrompts.map((ex, i) => (
                                    <div key={i} className="text-sm text-zinc-400 flex items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                        <div className={`w-2 h-2 rounded-full ${assistant.ringColor.replace('border-', 'bg-')}`} />
                                        {t(ex)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        {isLocked ? (
                            <button 
                                onClick={() => onPurchase(assistant)}
                                className="w-full group relative bg-white text-black font-black text-base uppercase tracking-widest py-6 rounded-2xl hover:bg-ocs-accent hover:text-white transition-all duration-500 overflow-hidden shadow-2xl"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <DiamondIcon className="w-5 h-5" />
                                    {t('get_access')} — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(assistant.price)}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-ocs-accent via-purple-500 to-ocs-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-0" />
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-3 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-bold uppercase tracking-widest">
                                <SparklesIcon className="w-5 h-5" />
                                {t('already_unlocked')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Realistic Demo */}
                <div className="flex-1 bg-white/[0.01] p-10 md:p-14 flex flex-col relative overflow-hidden">
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h3 className="text-white font-black text-2xl tracking-tight leading-none mb-2">{t('demo_sneak_peek')}</h3>
                            <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">{assistant.name} // INTERNAL_SYSTEM_LOG</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handlePrevDemo}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5"
                            >
                                <ChevronDoubleLeftIcon className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-mono font-bold text-zinc-700">{activeDemoIndex + 1} / {demos.length}</span>
                            <button 
                                onClick={handleNextDemo}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5"
                            >
                                <ChevronDoubleRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-black rounded-[32px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-slide-in-right" key={activeDemoIndex}>
                        <div className="bg-[#0f0f0f] p-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-mono text-zinc-600 uppercase">Latency: 1.4s</span>
                                <div className="bg-ocs-accent/10 px-3 py-1 rounded-full text-[9px] font-black text-ocs-accent uppercase tracking-widest border border-ocs-accent/20">
                                    Flash 2.5 Native
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-10">
                            {/* Input */}
                            <div className="flex flex-col items-end">
                                <div className="bg-zinc-800/40 border border-white/5 px-5 py-4 rounded-3xl rounded-tr-none max-w-[85%]">
                                    <p className="text-[10px] text-zinc-500 font-black mb-2 uppercase tracking-widest">Input Query</p>
                                    <p className="text-sm text-zinc-100 font-medium">"{demos[activeDemoIndex].prompt}"</p>
                                </div>
                            </div>

                            {/* Output */}
                            <div className="flex flex-col items-start">
                                <div className="bg-white/[0.03] border border-white/10 px-6 py-6 rounded-3xl rounded-tl-none max-w-[95%] shadow-2xl relative">
                                    <div className={`absolute -left-px top-8 w-1 h-12 ${assistant.ringColor.replace('border-', 'bg-')} blur-sm`} />
                                    <p className="text-[10px] text-zinc-600 font-black mb-4 uppercase tracking-widest flex items-center gap-2">
                                        <SparklesIcon className="w-3 h-3" />
                                        {assistant.name} Intelligence Response
                                    </p>
                                    <div 
                                        className="text-sm text-zinc-200 leading-relaxed prose prose-invert prose-sm 
                                                   prose-p:mb-4 prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-xs
                                                   prose-pre:bg-black prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl"
                                        dangerouslySetInnerHTML={{ __html: md.render(t(demos[activeDemoIndex].responseKey)) }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssistantInfoModal;
