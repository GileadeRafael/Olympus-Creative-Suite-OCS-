


import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { BADGES, GamificationEvent, Badge } from '../constants/badges';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';
import type { Notification } from '../types';

export interface UserProgress {
    [badgeId: string]: {
        current: number;
        unlocked: boolean;
        uniqueData?: (string | number)[] | Record<string, number>; 
    };
}

interface GamificationContextType {
    userProgress: UserProgress;
    badges: Badge[];
    trackAction: (event: GamificationEvent, value?: Record<string, any>) => void;
    resetSessionCounters: () => void;
    setNotificationCallback: (callback: (notification: Notification) => void) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { t, language } = useLanguage();
    const [userProgress, setUserProgress] = useState<UserProgress>({});
    const notificationCallbackRef = useRef<((notification: Notification) => void) | null>(null);
    
    // Using refs for counters that don't need to trigger re-renders
    const sessionCounters = useRef({ marathon: 0, fileShooter: 0 }).current;
    const dailyCounters = useRef({ 
        chameleon: { count: 0, date: new Date().toDateString() },
        addict: { count: 0, date: new Date().toDateString() } 
    }).current;
    const chatSpecificTrackers = useRef({ lastChatId: null as string | 'new' | null, languagesUsed: new Set<string>() }).current;
    const [crossoverState, setCrossoverState] = useState<{ text: string; assistantId: string } | null>(null);

    const resetSessionCounters = useCallback(() => {
        sessionCounters.marathon = 0;
    }, [sessionCounters]);
    
    const setNotificationCallback = useCallback((callback: (notification: Notification) => void) => {
        notificationCallbackRef.current = callback;
    }, []);

    // Fetch initial progress when user logs in
    useEffect(() => {
        const fetchProgress = async () => {
            if (!user) {
                setUserProgress({}); // Reset on logout
                return;
            }

            const { data, error } = await supabase
                .from('user_badge_progress')
                .select('badge_id, current_progress, unlocked_at')
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching badge progress:', error);
                return;
            }

            const progress: UserProgress = {};
            for (const badge of BADGES) {
                const record = data.find(d => d.badge_id === badge.id);
                progress[badge.id] = {
                    current: record?.current_progress || 0,
                    unlocked: !!record?.unlocked_at,
                    uniqueData: [],
                };
            }
            setUserProgress(progress);
        };

        fetchProgress();
    }, [user]);

    const trackAction = useCallback(async (event: GamificationEvent, value?: Record<string, any>) => {
        if (!user) return;

        setUserProgress(currentProgress => {
            const newProgress = JSON.parse(JSON.stringify(currentProgress));
            let hasChanges = false;
            const newlyUnlockedBadges: Badge[] = [];
            const today = new Date().toDateString();

            const checkMetaBadges = async (progressState: UserProgress) => {
                 const metaBadges = BADGES.filter(b => b.dependentBadges && !progressState[b.id].unlocked);
                for(const metaBadge of metaBadges) {
                    let unlockedDependencies = 0;
                    if (metaBadge.id === 'secret_hidden_collector') {
                        const twentyFourHoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString();
                        const { count, error } = await supabase
                            .from('user_badge_progress')
                            .select('badge_id', { count: 'exact', head: true })
                            .eq('user_id', user.id)
                            .gte('unlocked_at', twentyFourHoursAgo);
                        if (error) console.error("Error checking hidden collector badge", error);
                        unlockedDependencies = count || 0;
                    } else {
                         unlockedDependencies = metaBadge.dependentBadges!.filter(depId => progressState[depId]?.unlocked).length;
                    }
                    
                    if(progressState[metaBadge.id].current !== unlockedDependencies) {
                        progressState[metaBadge.id].current = unlockedDependencies;
                        hasChanges = true;

                        if (!progressState[metaBadge.id].unlocked && unlockedDependencies >= metaBadge.target) {
                            progressState[metaBadge.id].unlocked = true;
                            newlyUnlockedBadges.push(metaBadge);
                        }
                    }
                }
            };
            
            if (event === GamificationEvent.CLIPBOARD_COPY && value) {
                setCrossoverState({ text: value.text, assistantId: value.assistantId });
                return currentProgress; // No state change to userProgress
            }

            const badgesForEvent = BADGES.filter(b => b.event === event);

            for (const badge of badgesForEvent) {
                const progressData = newProgress[badge.id];
                if (!progressData || progressData.unlocked) continue;

                let madeProgress = false;
                const hour = new Date().getHours();

                switch(badge.id) {
                    case 'secret_night_owl':
                        if (hour >= 0 && hour < 5) { progressData.current = 1; madeProgress = true; }
                        break;
                    case 'secret_early_bird':
                        if (hour < 6) { progressData.current = 1; madeProgress = true; }
                        break;
                    case 'secret_addict':
                        if (dailyCounters.addict.date !== today) { dailyCounters.addict = { count: 0, date: today }; }
                        dailyCounters.addict.count++;
                        progressData.current = dailyCounters.addict.count;
                        madeProgress = true;
                        break;
                    case 'secret_marathon_runner':
                        sessionCounters.marathon++;
                        progressData.current = sessionCounters.marathon;
                        madeProgress = true;
                        break;
                    case 'secret_file_shooter':
                        sessionCounters.fileShooter += value?.count || 1;
                        progressData.current = sessionCounters.fileShooter;
                        madeProgress = true;
                        break;
                    case 'secret_crossover':
                         if (crossoverState && value?.text && value?.assistantId !== crossoverState.assistantId && value.text.includes(crossoverState.text)) {
                            progressData.current = 1;
                            madeProgress = true;
                            setCrossoverState(null);
                        }
                        break;
                    case 'secret_record_holder':
                         if (value?.conversationLength && value.conversationLength > progressData.current) {
                            progressData.current = value.conversationLength;
                            madeProgress = true;
                        }
                        break;
                    case 'secret_chameleon':
                        if (dailyCounters.chameleon.date !== today) { dailyCounters.chameleon = { count: 0, date: today }; }
                        dailyCounters.chameleon.count++;
                        progressData.current = dailyCounters.chameleon.count;
                        madeProgress = true;
                        break;
                    case 'secret_ninja_translator':
                         if (value?.chatId) {
                            if (chatSpecificTrackers.lastChatId !== value.chatId) {
                                chatSpecificTrackers.languagesUsed.clear();
                                chatSpecificTrackers.lastChatId = value.chatId;
                            }
                            chatSpecificTrackers.languagesUsed.add(value.code);
                            progressData.current = chatSpecificTrackers.languagesUsed.size;
                            madeProgress = true;
                        }
                        break;
                     case 'secret_infinity_chat': {
                        const storageKey = `infinityChatStreaks_${user.id}`;
                        const streaks = JSON.parse(localStorage.getItem(storageKey) || '{}');
                        const chatStreak = streaks[value?.chatId] || { streak: 0, lastDate: null };
                        
                        const lastDate = chatStreak.lastDate ? new Date(chatStreak.lastDate) : null;
                        const todayDate = new Date();
                        
                        if (!lastDate || lastDate.toDateString() !== todayDate.toDateString()) {
                            const yesterday = new Date();
                            yesterday.setDate(todayDate.getDate() - 1);
                            
                            if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
                                chatStreak.streak++;
                            } else {
                                chatStreak.streak = 1;
                            }
                            chatStreak.lastDate = todayDate.toISOString();
                            streaks[value?.chatId] = chatStreak;
                            localStorage.setItem(storageKey, JSON.stringify(streaks));
                        }
                        progressData.current = chatStreak.streak;
                        madeProgress = true;
                        break;
                    }

                    // --- Standard Logic ---
                    default:
                        if (badge.id.startsWith('hidden_legendary_')) {
                            if (value?.assistantId === badge.id.split('_').pop()) {
                                progressData.current++; madeProgress = true;
                            }
                        } else if (badge.event === GamificationEvent.ASSISTANT_SWITCHED || (badge.event === GamificationEvent.LANGUAGE_CHANGED && badge.id !== 'secret_ninja_translator')) {
                            const uniqueValue = value?.id || value?.code;
                            if (uniqueValue) {
                                const uniqueDataSet = new Set(Array.isArray(progressData.uniqueData) ? progressData.uniqueData : []);
                                if (!uniqueDataSet.has(uniqueValue)) {
                                    uniqueDataSet.add(uniqueValue);
                                    progressData.uniqueData = Array.from(uniqueDataSet);
                                    progressData.current = uniqueDataSet.size;
                                    madeProgress = true;
                                }
                            }
                        } else if (badge.event === GamificationEvent.MESSAGE_SENT && badge.id === 'advanced_journey_creator') {
                             if (value?.conversationLength > progressData.current) {
                                progressData.current = value.conversationLength;
                                madeProgress = true;
                            }
                        }
                        else {
                            const increment = value?.count || 1;
                            progressData.current += increment;
                            madeProgress = true;
                        }
                        break;
                }
                
                if (madeProgress) {
                    progressData.current = Math.min(progressData.current, badge.target);
                    hasChanges = true;

                    if (!progressData.unlocked && progressData.current >= badge.target) {
                        progressData.unlocked = true;
                        newlyUnlockedBadges.push(badge);
                    }
                }
            }
            
            if (newlyUnlockedBadges.length > 0) {
                checkMetaBadges(newProgress);
            }

            if (hasChanges) {
                Promise.resolve().then(async () => {
                    const uniqueUnlocked = [...new Map(newlyUnlockedBadges.map(item => [item.id, item])).values()];
                    uniqueUnlocked.forEach(b => {
                        if (!b.hidden) {
                            addToast({ name: b.name, icon: b.icon, colorClass: b.colorClass });
                            const newNotification: Notification = {
                                key: 'notification_badge_unlocked',
                                date: new Date().toISOString(),
                                params: { badgeName: b.name }
                            };
                            if (notificationCallbackRef.current) {
                                notificationCallbackRef.current(newNotification);
                            }
                        }
                    });
                    
                    const updates = Object.keys(newProgress)
                        .filter(badgeId => JSON.stringify(newProgress[badgeId]) !== JSON.stringify(currentProgress[badgeId]))
                        .map(badgeId => {
                            const badge = BADGES.find(b => b.id === badgeId)!;
                            const progress = newProgress[badgeId];
                            return {
                                user_id: user.id,
                                badge_id: badge.id,
                                current_progress: progress.current,
                                target_progress: badge.target,
                                unlocked_at: progress.unlocked && !currentProgress[badgeId].unlocked ? new Date().toISOString() : null,
                            };
                        });

                    if (updates.length > 0) {
                        const { error } = await supabase.from('user_badge_progress').upsert(updates, { onConflict: 'user_id, badge_id' });
                        if (error) console.error('Error saving badge progress:', error);
                    }
                });
                return newProgress;
            }
            
            return currentProgress;
        });
    }, [user, addToast, sessionCounters, dailyCounters, chatSpecificTrackers, crossoverState, t, language]);

    return (
        <GamificationContext.Provider value={{ userProgress, badges: BADGES, trackAction, resetSessionCounters, setNotificationCallback }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};