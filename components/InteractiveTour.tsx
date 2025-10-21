import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { LanguageCode } from '../lib/i18n';

type Placement = 'bottom' | 'top' | 'left' | 'right' | 'center';

interface TourStep {
    selector: string;
    titleKey: string;
    contentKey: string;
    placement: Placement;
}

const TOUR_STEPS: TourStep[] = [
    {
        selector: '',
        titleKey: 'tour_step1_title',
        contentKey: 'tour_step1_content',
        placement: 'center',
    },
    {
        selector: '[data-tour-id="assistants-list"]',
        titleKey: 'tour_step2_title',
        contentKey: 'tour_step2_content',
        placement: 'right',
    },
    {
        selector: '[data-tour-id="chat-view-main"]',
        titleKey: 'tour_step3_title',
        contentKey: 'tour_step3_content',
        placement: 'center',
    },
    {
        selector: '[data-tour-id="notifications-bell"]',
        titleKey: 'tour_step4_title',
        contentKey: 'tour_step4_content',
        placement: 'right',
    },
    {
        selector: '[data-tour-id="user-avatar"]',
        titleKey: 'tour_step5_title',
        contentKey: 'tour_step5_content',
        placement: 'bottom',
    },
    {
        selector: '[data-tour-id="language-selector"]',
        titleKey: 'tour_step_language_title',
        contentKey: 'tour_step_language_content',
        placement: 'right',
    },
    {
        selector: '[data-tour-id="theme-toggle"]',
        titleKey: 'tour_step_theme_title',
        contentKey: 'tour_step_theme_content',
        placement: 'right',
    },
    {
        selector: '',
        titleKey: 'tour_finish_title',
        contentKey: 'tour_finish_content',
        placement: 'center',
    },
];

interface InteractiveTourProps {
    onComplete: () => void;
    onSkip: () => void;
}

const Arrow: React.FC<{ placement: Placement }> = ({ placement }) => {
    let classes = 'absolute w-4 h-4 bg-ocs-dark-sidebar';
    let styles: React.CSSProperties = {};

    switch (placement) {
        case 'top':
            classes += ' bottom-[-8px] left-1/2 -translate-x-1/2';
            styles.clipPath = 'polygon(50% 100%, 0 0, 100% 0)'; // points down
            break;
        case 'bottom':
            classes += ' top-[-8px] left-1/2 -translate-x-1/2';
            styles.clipPath = 'polygon(50% 0%, 0 100%, 100% 100%)'; // points up
            break;
        case 'left':
            classes += ' right-[-8px] top-1/2 -translate-y-1/2';
            styles.clipPath = 'polygon(100% 50%, 0 0, 0 100%)'; // points right
            break;
        case 'right':
            classes += ' left-[-8px] top-1/2 -translate-y-1/2';
            styles.clipPath = 'polygon(0 50%, 100% 0, 100% 100%)'; // points left
            break;
        default:
            return null;
    }

    return <div className={classes} style={styles} />;
};

const InteractiveTour: React.FC<InteractiveTourProps> = ({ onComplete, onSkip }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const { t, setLanguage } = useLanguage();

    const currentStep = useMemo(() => TOUR_STEPS[stepIndex], [stepIndex]);

    useEffect(() => {
        const updateTargetRect = () => {
            if (currentStep.selector) {
                const element = document.querySelector(currentStep.selector);
                if (element) {
                    setTargetRect(element.getBoundingClientRect());
                    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            } else {
                setTargetRect(null); // For centered steps
            }
        };

        const timer = setTimeout(updateTargetRect, 150);
        window.addEventListener('resize', updateTargetRect);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateTargetRect);
        };
    }, [stepIndex, currentStep.selector]);
    
    const isCentered = currentStep.placement === 'center';

    const getTooltipPosition = () => {
        if (!targetRect || !tooltipRef.current) return { display: 'none' };

        const tooltipHeight = tooltipRef.current.offsetHeight;
        const tooltipWidth = tooltipRef.current.offsetWidth;
        const margin = 16;
        
        let top = 0, left = 0;

        switch (currentStep.placement) {
            case 'bottom':
                top = targetRect.bottom + margin;
                left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
                break;
            case 'top':
                top = targetRect.top - tooltipHeight - margin;
                left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                left = targetRect.left - tooltipWidth - margin;
                break;
            case 'right':
                top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                left = targetRect.right + margin;
                break;
        }

        if (top < margin) top = margin;
        if (left < margin) left = margin;
        if (left + tooltipWidth > window.innerWidth - margin) left = window.innerWidth - tooltipWidth - margin;
        if (top + tooltipHeight > window.innerHeight - margin) top = window.innerHeight - tooltipHeight - margin;

        return { top: `${top}px`, left: `${left}px` };
    };

    const handleNext = () => {
        if (stepIndex < TOUR_STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onComplete();
        }
    };
    
    const handlePrev = () => {
        if (stepIndex > 0) {
            setStepIndex(stepIndex - 1);
        }
    };

    const handleLangSelect = (lang: LanguageCode) => {
        setLanguage(lang);
        handleNext();
    };

    return (
        <div className="fixed inset-0 z-[100]">
            <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isCentered ? 'opacity-100' : 'opacity-0'}`} />
            
            <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ transition: 'all 0.4s ease-in-out' }}>
                <defs>
                    <mask id="tour-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                             <rect
                                x={targetRect.x - 5}
                                y={targetRect.y - 5}
                                width={targetRect.width + 10}
                                height={targetRect.height + 10}
                                rx="12"
                                fill="black"
                                className="transition-all duration-300 ease-in-out"
                            />
                        )}
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#tour-mask)" />
            </svg>
            
            {targetRect && (
                <div
                    className="fixed pointer-events-none tour-highlight-pulse"
                    style={{
                        top: targetRect.y,
                        left: targetRect.x,
                        width: targetRect.width,
                        height: targetRect.height,
                        borderRadius: '12px',
                    }}
                />
            )}
            
             <div
                ref={tooltipRef}
                className={`fixed w-11/12 max-w-sm bg-ocs-dark-sidebar rounded-2xl shadow-2xl border border-white/10 p-4 sm:p-6 text-white tour-tooltip-animate
                            ${isCentered ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
                `}
                style={!isCentered ? getTooltipPosition() : {}}
            >
                {stepIndex === 0 ? (
                    <>
                        <h3 className="text-lg sm:text-xl font-bold mb-2">{t(currentStep.titleKey)}</h3>
                        <p className="text-xs sm:text-sm text-ocs-text-muted mb-6">{t(currentStep.contentKey)}</p>
                        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                            <button onClick={() => handleLangSelect('en')} className="w-full flex items-center justify-center px-4 py-2 text-sm bg-ocs-dark-hover rounded-lg hover:bg-zinc-700 font-semibold">
                                English
                            </button>
                            <button onClick={() => handleLangSelect('pt')} className="w-full flex items-center justify-center px-4 py-2 text-sm bg-ocs-dark-hover rounded-lg hover:bg-zinc-700 font-semibold">
                                Português
                            </button>
                        </div>
                        <div className="text-center mt-4">
                            <button onClick={onSkip} className="text-xs text-ocs-text-muted hover:text-white">{t('tour_skip')}</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-lg sm:text-xl font-bold mb-2">{t(currentStep.titleKey)}</h3>
                        <p className="text-xs sm:text-sm text-ocs-text-muted mb-6">{t(currentStep.contentKey)}</p>

                        <div className="flex justify-between items-center">
                            <button onClick={onSkip} className="text-xs text-ocs-text-muted hover:text-white">{t('tour_skip')}</button>
                            
                            <div className="flex items-center space-x-2">
                                {stepIndex > 0 && stepIndex < TOUR_STEPS.length - 1 && (
                                    <button onClick={handlePrev} className="px-4 py-2 text-sm bg-ocs-dark-hover rounded-lg hover:bg-zinc-700">{t('tour_back')}</button>
                                )}
                                <button onClick={handleNext} className="px-4 py-2 text-sm bg-ocs-accent rounded-lg hover:bg-purple-500 font-semibold">
                                    {stepIndex === TOUR_STEPS.length - 1 ? t('tour_finish') : t('tour_next')}
                                </button>
                            </div>
                        </div>
                    </>
                )}
                
                {!isCentered && <Arrow placement={currentStep.placement} />}
            </div>
        </div>
    );
};

export default InteractiveTour;