import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Assistant, Message } from '../types';
import { ASSISTANTS } from '../constants';
import { sendMessageStream } from '../services/geminiService';
import type { Chat } from '@google/genai';
import { XIcon, PlusIcon, ChevronDownIcon, ImageIcon, SparklesIcon } from './icons/CoreIcons';
import WelcomeScreen from './WelcomeScreen';
import { useLanguage } from '../contexts/LanguageContext';
import { Remarkable } from 'remarkable';
import type { User } from '@supabase/supabase-js';
import { useGamification } from '../contexts/GamificationContext';
import { GamificationEvent } from '../constants/badges';
import type { PersonalizedWelcomeItem } from '../App';


const md = new Remarkable({
  html: true,
  breaks: true,
  linkify: true,
});

const getCopyButtonColors = (ringColor: string): string => {
  switch (ringColor) {
    case 'border-orange-500':
      return 'bg-orange-500/80 hover:bg-orange-500';
    case 'border-blue-600':
      return 'bg-blue-600/80 hover:bg-blue-600';
    case 'border-teal-400':
      return 'bg-teal-400/80 hover:bg-teal-400';
    case 'border-[#d2b48c]':
      return 'bg-[#d2b48c]/80 hover:bg-[#d2b48c]';
    case 'border-lime-400':
      return 'bg-lime-400/80 hover:bg-lime-400';
    case 'border-pink-500':
      return 'bg-pink-500/80 hover:bg-pink-500';
    case 'border-[#f08080]':
      return 'bg-[#f08080]/80 hover:bg-[#f08080]';
    case 'border-[#800080]':
      return 'bg-[#800080]/80 hover:bg-[#800080]';
    default:
      return 'bg-gray-700/50 hover:bg-gray-700/70';
  }
};

interface ChatViewProps {
  assistant: Assistant | null;
  chatSession: Chat | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  user: User | null;
  activeChatId: string | 'new' | null;
  onCreateChat: (firstUserMessage: Message, fullConversation: Message[]) => Promise<string | null>;
  onUpdateChat: (chatId: string, fullConversation: Message[]) => Promise<void>;
  personalizedWelcomeData: PersonalizedWelcomeItem[] | null;
  onAssistantClick: (assistant: Assistant) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ assistant, chatSession, messages, setMessages, user, activeChatId, onCreateChat, onUpdateChat, personalizedWelcomeData, onAssistantClick }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{ mimeType: string; data: string }[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<{ top: number; left: number; width: number; height: number; key: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef = useRef(true);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(100); // Default height

  const { trackAction } = useGamification();
  const { t } = useLanguage();
  
  const username = user?.user_metadata?.username || 'User';

  // Handles auto-scrolling when new messages arrive
  useEffect(() => {
    if (isAtBottomRef.current) {
      // Use 'auto' for instant scrolling, which is better for rapid updates during streaming
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);
  
  // Update input height for scroll padding
  useEffect(() => {
    if (inputContainerRef.current) {
      setInputHeight(inputContainerRef.current.offsetHeight);
    }
  }, [input, selectedImages]);


  // Sets up a scroll listener to detect if the user has scrolled up
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = container;
      // A threshold of 10px to account for slight variations
      const atBottom = scrollHeight - scrollTop - clientHeight <= 10;
      isAtBottomRef.current = atBottom;
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);


  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160; // Corresponds to max-h-40
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);
  
  const handleContainerClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = (e.target as HTMLElement).closest('.code-block-wrapper');
    if (!wrapper || !chatContainerRef.current) return;

    const pre = wrapper.querySelector('pre');
    if (!pre) return;

    const codeElement = pre.querySelector('code');
    const codeToCopy = codeElement ? codeElement.innerText : pre.innerText;
    if (!codeToCopy) return;

    try {
      await navigator.clipboard.writeText(codeToCopy);
      trackAction(GamificationEvent.CLIPBOARD_COPY, { text: codeToCopy, assistantId: assistant?.id });

      const rect = wrapper.getBoundingClientRect();
      const containerRect = chatContainerRef.current.getBoundingClientRect();

      setCopyFeedback({
        top: rect.top - containerRect.top + chatContainerRef.current.scrollTop,
        left: rect.left - containerRect.left,
        width: rect.width,
        height: rect.height,
        key: Date.now(), // Force re-render and re-animation
      });
      
      setTimeout(() => setCopyFeedback(null), 2000); // Clear state after animation

    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderMessageContent = useCallback((content: string) => {
    if (!assistant) return { __html: md.render(content) };

    const copyButtonText = t('copy_button_text');
    const rawHtml = md.render(content);
    const buttonColorClass = getCopyButtonColors(assistant.ringColor);

    const wrappedHtml = rawHtml.replace(/<pre(.*?)>([\s\S]*?)<\/pre>/g, (_match, preAttributes, innerContent) => {
        return `
            <div class="code-block-wrapper relative group cursor-pointer">
                <pre${preAttributes}>${innerContent}</pre>
                <button class="absolute top-2 right-2 z-10 px-2.5 py-1 text-xs font-semibold ${buttonColorClass} text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" aria-label="${copyButtonText}">
                    ${copyButtonText}
                </button>
            </div>
        `;
    });

    return { __html: wrappedHtml };
  }, [assistant, t]);
  
    const processFiles = (files: FileList) => {
        if (!files) return;
        
        trackAction(GamificationEvent.FILE_UPLOADED, { count: files.length });
        const fileArray = Array.from(files);
        const imagePromises = fileArray.map((file: File) => {
            return new Promise<{ mimeType: string; data: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result !== 'string') {
                return reject('FileReader result is not a string');
                }
                const base64String = reader.result.split(',')[1];
                resolve({ mimeType: file.type, data: base64String });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises).then(newImages => {
            setSelectedImages(prev => [...prev, ...newImages]);
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
            e.target.value = ''; // Allow re-selecting the same file
        }
    };

    const removeSelectedImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSwitchToZoraJson = () => {
        const zoraJson = ASSISTANTS.find(a => a.id === 'zora_json');
        if (zoraJson) {
            onAssistantClick(zoraJson);
        }
    };

    const handleSend = async (promptOverride?: string) => {
        const textToSend = promptOverride ?? input;
        if ((!textToSend.trim() && selectedImages.length === 0) || !chatSession || !assistant) return;

        if (textToSend.trim().toLowerCase() === 'zion') {
            trackAction(GamificationEvent.EASTER_EGG_FOUND);
        }
        
        trackAction(GamificationEvent.MESSAGE_SENT, { text: textToSend, assistantId: assistant.id, chatId: activeChatId });

        const userMessage: Message = { 
          id: `user-${Date.now()}`, 
          role: 'user', 
          content: textToSend, 
          images: selectedImages 
        };
        
        const newMessages: Message[] = [...messages, userMessage];
        setMessages(newMessages);
        
        setInput('');
        setSelectedImages([]);
        setIsLoading(true);

        try {
            const stream = await sendMessageStream(chatSession, textToSend, selectedImages);
            let modelResponse = '';
            const modelMessageId = `model-${Date.now()}`;
            
            let updatedMessages: Message[] = [...newMessages, { id: modelMessageId, role: 'model', content: '' }];
            setMessages(updatedMessages);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                updatedMessages = updatedMessages.map(m => m.id === modelMessageId ? { ...m, content: modelResponse } : m);
                setMessages(updatedMessages);
            }

            if (activeChatId === 'new') {
                await onCreateChat(userMessage, updatedMessages);
            } else if (activeChatId) {
                await onUpdateChat(activeChatId, updatedMessages);
            }

        } catch (error) {
        console.error('Error sending message:', error);
        const errorId = `error-${Date.now()}`;
        setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'model' && lastMessage.content === '') {
            return prev.slice(0, -1).concat({ ...lastMessage, id: errorId, content: t('send_error') });
            }
            const errorMessage: Message = {id: errorId, role: 'model', content: t('send_error') };
            return [...prev, errorMessage];
        });
        } finally {
        setIsLoading(false);
        }
    };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
          setIsDraggingOver(true);
      }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingOver(false);
      }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          processFiles(e.dataTransfer.files);
          e.dataTransfer.clearData();
      }
  };


  if (!assistant) {
    return <WelcomeScreen user={user} personalizedData={personalizedWelcomeData} onAssistantClick={onAssistantClick} assistants={ASSISTANTS} unlockedAssistants={new Set()} onLogout={()=>{}} onOpenBadges={()=>{}} />;
  }
  
  const isSendDisabled = isLoading || (!input.trim() && selectedImages.length === 0);

  return (
    <div
        className="flex flex-col h-full w-full relative"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
            backgroundImage: "url('https://i.imgur.com/jgJOxlU.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
    >
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto custom-scrollbar relative"
        onClick={handleContainerClick}
      >
        <div className={`max-w-4xl mx-auto px-6 ${messages.length === 0 ? 'h-full flex flex-col' : 'pt-6'}`} style={{ paddingBottom: `${inputHeight + 16}px` }}>
          {messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center flex-1 text-center">
                <div className={`relative w-20 h-20 sm:w-24 sm:h-24 mb-6 border-4 ${assistant.ringColor} rounded-full flex items-center justify-center p-1`}>
                  <img src={assistant.iconUrl} alt={assistant.name} className="w-full h-full object-cover rounded-full" />
                  {assistant.id === 'zora_json' && (
                      <div className="absolute bottom-0 right-0 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg border-2 border-white dark:border-ocs-dark-chat transform translate-x-2 translate-y-2 shadow-sm">
                          JSON
                      </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-3 mb-4">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white">
                        {assistant.name}
                    </h1>
                    {assistant.id === 'zora' && (
                        <button
                            onClick={handleSwitchToZoraJson}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all hover:scale-105 shadow-md"
                            title="Switch to Zora JSON Edition"
                        >
                            <span>{`{ }`}</span>
                            <span className="hidden sm:inline">Zora in JSON</span>
                        </button>
                    )}
                </div>
                <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-lg mx-auto">
                    <p className="text-zinc-200 dark:text-zinc-200">
                      {t(assistant.descriptionKey)}
                    </p>
                </div>
                
                <div className="mt-10 w-full max-w-lg">
                    <h3 className="flex items-center justify-center text-sm font-semibold text-gray-200 dark:text-ocs-text-muted mb-4 drop-shadow-md">
                        <SparklesIcon className="w-5 h-5 mr-2 text-ocs-accent" />
                        {t('example_prompts_title')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {assistant.examplePrompts.map(promptKey => (
                            <button
                                key={promptKey}
                                onClick={() => handleSend(t(promptKey))}
                                className="text-left p-3 bg-black/60 dark:bg-black/60 backdrop-blur-md rounded-lg text-sm text-gray-100 dark:text-gray-100 border border-white/10 hover:bg-black/80 transition-colors duration-200"
                            >
                              {t(promptKey)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          ) : (
            <>
              <div>
                {messages.map((msg) => (
                  <div key={msg.id} id={`message-${msg.id}`} className={`my-3 sm:my-4 flex group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="relative max-w-[80%] md:max-w-2xl">
                      <div
                        className={`p-3 sm:p-4 rounded-2xl prose-p:my-2 prose-p:leading-relaxed prose-headings:my-4 prose-pre:bg-black prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-code:text-white transition-colors break-words backdrop-blur-md shadow-lg border border-white/5 ${
                          msg.role === 'user' 
                            ? 'bg-zinc-800/80 dark:bg-zinc-800/80 prose dark:prose-invert text-white'
                            : 'bg-black/70 dark:bg-black/70 text-gray-100 dark:text-gray-100 prose dark:prose-invert border-white/10'
                        }`}
                      >
                        {msg.content ? <div dangerouslySetInnerHTML={renderMessageContent(msg.content)} /> : null}
                        {msg.images && msg.images.length > 0 && (
                          <div className="not-prose mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {msg.images.map((image, index) => (
                              <button key={index} onClick={() => setModalImage(`data:${image.mimeType};base64,${image.data}`)} className="focus:outline-none rounded-lg overflow-hidden">
                                <img
                                  src={`data:${image.mimeType};base64,${image.data}`}
                                  alt={`attachment ${index + 1}`}
                                  className="aspect-square object-cover w-full h-full transition-transform hover:scale-105"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {msg.role === 'model' && (
                        <div className="absolute -bottom-4 -left-5 w-10 h-10">
                            <img src={assistant.iconUrl} alt={assistant.name} className="w-full h-full rounded-full border-4 border-white dark:border-ocs-dark-chat object-cover" />
                            {assistant.id === 'zora_json' && (
                                <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[8px] leading-tight font-bold px-1 py-px rounded border border-white dark:border-ocs-dark-chat">
                                    JSON
                                </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {isLoading && messages.length > 0 && messages[messages.length-1]?.role === 'user' && (
                <div className="my-4 flex justify-start">
                   <div className="relative group">
                    <div className="p-4 rounded-2xl max-w-2xl bg-black/70 dark:bg-black/70 backdrop-blur-md flex items-center border border-white/10 shadow-lg">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2 delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                    <div className="absolute -bottom-4 -left-5 w-10 h-10">
                        <img src={assistant.iconUrl} alt={assistant.name} className="w-full h-full rounded-full border-4 border-white dark:border-ocs-dark-chat object-cover" />
                        {assistant.id === 'zora_json' && (
                            <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[8px] leading-tight font-bold px-1 py-px rounded border border-white dark:border-ocs-dark-chat">
                                JSON
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        {copyFeedback && (
            <div
                key={copyFeedback.key}
                className="absolute bg-black/70 flex items-center justify-center text-white font-bold rounded-lg pointer-events-none animate-fade-in-out"
                style={{
                    top: `${copyFeedback.top}px`,
                    left: `${copyFeedback.left}px`,
                    width: `${copyFeedback.width}px`,
                    height: `${copyFeedback.height}px`,
                }}
            >
                {t('copied_confirmation_text')}
            </div>
        )}
      </div>
      
      <div 
        ref={inputContainerRef}
        className="absolute bottom-0 left-0 right-0 w-full pt-4 bg-gradient-to-t from-black/60 to-transparent"
      >
        <div className="max-w-4xl mx-auto px-4 pb-4">
          {selectedImages.length > 0 && (
            <div className="pb-2 overflow-x-auto">
              <div className="flex space-x-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img src={`data:${image.mimeType};base64,${image.data}`} alt="Selected thumbnail" className="w-16 h-16 rounded-md object-cover" />
                    <button onClick={() => removeSelectedImage(index)} className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5 hover:bg-gray-900 transition-colors">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-black/60 dark:bg-black/60 backdrop-blur-lg rounded-2xl p-3 flex flex-col w-full shadow-2xl border border-white/10">
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('message_placeholder', { assistantName: assistant.name })}
                className="flex-1 bg-transparent text-white dark:text-white dark:placeholder-zinc-500 focus:outline-none resize-none max-h-40 overflow-y-auto custom-scrollbar w-full px-1 pt-1"
                rows={1}
            />
            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/jpeg, image/png, image/webp" className="hidden" />
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="p-2 text-white bg-white/10 dark:bg-white/10 rounded-lg transition-colors hover:bg-white/20"
                        aria-label="Add attachment"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                <button
                    onClick={() => handleSend()}
                    disabled={isSendDisabled}
                    className="flex items-center space-x-2.5 text-black bg-white dark:bg-white font-semibold rounded-lg px-3 sm:px-4 py-2 transition-all duration-200 transform
                    hover:bg-gray-200
                    disabled:bg-zinc-800 dark:disabled:bg-zinc-800 disabled:text-zinc-600 dark:disabled:text-zinc-600 disabled:cursor-not-allowed disabled:scale-100"
                    aria-label="Send message now"
                >
                    <span className="text-sm">Send<span className="hidden sm:inline"> now</span></span>
                    <span className="h-4 w-px bg-gray-500/50 dark:bg-gray-500/50"></span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-500" />
                </button>
            </div>
          </div>
        </div>
      </div>
      {modalImage && (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer" 
            onClick={() => setModalImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged image view"
        >
            <img 
                src={modalImage} 
                alt="Enlarged view" 
                className="max-w-full max-h-full rounded-lg object-contain cursor-default shadow-2xl" 
                onClick={(e) => e.stopPropagation()} 
            />
            <button 
                onClick={() => setModalImage(null)} 
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors"
                aria-label="Close image view"
            >
                <XIcon className="w-6 h-6"/>
            </button>
        </div>
      )}
       {isDraggingOver && assistant && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4 transition-opacity duration-300">
                <div className="w-full h-full border-4 border-dashed border-ocs-accent rounded-3xl flex flex-col items-center justify-center text-white pointer-events-none">
                    <ImageIcon className="w-16 h-16 mb-4 text-ocs-accent" />
                    <p className="text-2xl font-bold">{t('drop_files_here')}</p>
                </div>
            </div>
        )}
    </div>
  );
};

export default ChatView;