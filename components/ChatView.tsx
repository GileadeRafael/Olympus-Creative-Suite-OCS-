import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Assistant, Message } from '../types';
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
    case 'border-lime-400':
      return 'bg-lime-400/80 hover:bg-lime-400';
    case 'border-pink-500':
      return 'bg-pink-500/80 hover:bg-pink-500';
    case 'border-[#f08080]':
      return 'bg-[#f08080]/80 hover:bg-[#f08080]';
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
  
  const handleMessageClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = (e.target as HTMLElement).closest('.code-block-wrapper');
    if (!wrapper || !chatContainerRef.current) return;

    e.stopPropagation();

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

    const handleSend = async (promptOverride?: string) => {
        const textToSend = promptOverride ?? input;
        if ((!textToSend.trim() && selectedImages.length === 0) || !chatSession || !assistant) return;

        if (textToSend.trim().toLowerCase() === 'olympus') {
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
      // Use relatedTarget to prevent flickering when moving over child elements
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
    return (
      <div className="h-full w-full" data-tour-id="chat-view-main">
          <WelcomeScreen user={user} personalizedData={personalizedWelcomeData} onAssistantClick={onAssistantClick} />
      </div>
    );
  }

  return (
    <div 
        className="flex flex-col h-full relative" 
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-tour-id="chat-view-main"
    >
      {isDraggingOver && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center pointer-events-none">
              <div className="border-4 border-dashed border-white/50 rounded-3xl p-12 text-center">
                  <ImageIcon className="w-16 h-16 text-white/80 mx-auto" />
                  <p className="mt-4 text-2xl font-bold text-white">{t('drop_files_here')}</p>
              </div>
          </div>
      )}
      {modalImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center" onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="Selected preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
           <button onClick={() => setModalImage(null)} className="absolute top-4 right-4 text-white hover:text-gray-300">
             <XIcon className="w-8 h-8"/>
           </button>
        </div>
      )}

      <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
          style={{ paddingBottom: `${inputHeight}px` }}
      >
        <div className="max-w-full md:max-w-3xl mx-auto py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-center px-4">
              <div className={`relative w-28 h-28 border-4 ${assistant.ringColor} rounded-full flex items-center justify-center p-1.5`}>
                <img src={assistant.iconUrl} alt={assistant.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <h1 className="text-3xl font-bold mt-6 text-gray-800 dark:text-white">{assistant.name}</h1>
              <p className="mt-2 text-gray-600 dark:text-ocs-text-muted max-w-md">{t(assistant.descriptionKey)}</p>
              
              <div className="mt-8 w-full max-w-lg">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-ocs-text-muted mb-3 flex items-center justify-center space-x-2">
                  <SparklesIcon className="w-4 h-4" />
                  <span>{t('example_prompts_title')}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {assistant.examplePrompts.map((promptKey) => (
                    <button 
                      key={promptKey}
                      onClick={() => handleSend(t(promptKey))}
                      className="text-left text-sm bg-gray-100 dark:bg-ocs-dark-input hover:bg-gray-200 dark:hover:bg-ocs-dark-hover p-3 rounded-lg transition-colors"
                    >
                      {t(promptKey)}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <div key={msg.id || index} className={`flex items-start gap-3 sm:gap-4 px-4 md:px-8 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && (
                    <img src={assistant.iconUrl} alt={assistant.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                  )}
                  <div
                    className={`relative max-w-full md:max-w-2xl px-4 py-3 sm:px-5 sm:py-3 rounded-2xl message-bubble ${
                      msg.role === 'user'
                        ? 'bg-ocs-accent text-white rounded-br-lg'
                        : 'bg-gray-200 dark:bg-ocs-dark-input text-gray-800 dark:text-gray-200 rounded-bl-lg'
                    }`}
                    onClick={handleMessageClick}
                  >
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.images.map((img, idx) => {
                          const imageUrl = `data:${img.mimeType};base64,${img.data}`;
                          return (
                            <img
                              key={idx}
                              src={imageUrl}
                              alt={`uploaded content ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setModalImage(imageUrl); }}
                            />
                          );
                        })}
                      </div>
                    )}
                    {msg.content && (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-2 prose-pre:p-0 prose-pre:bg-transparent"
                        dangerouslySetInnerHTML={renderMessageContent(msg.content)}
                      />
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 bg-gray-300 dark:bg-ocs-light-gray flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-200">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3 sm:gap-4 px-4 md:px-8">
                  <img src={assistant.iconUrl} alt={assistant.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                  <div className="max-w-full md:max-w-2xl px-4 py-3 sm:px-5 sm:py-3 rounded-2xl bg-gray-200 dark:bg-ocs-dark-input text-gray-800 dark:text-gray-200 rounded-bl-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
           <div ref={messagesEndRef} />
        </div>
      </div>
       {copyFeedback && (
          <div
            key={copyFeedback.key}
            className="absolute z-10 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center justify-center animate-fade-in-out pointer-events-none"
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
      <div 
        ref={inputContainerRef}
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-ocs-dark-chat pt-3"
      >
        <div className="max-w-full md:max-w-3xl mx-auto px-4">
            {selectedImages.length > 0 && (
            <div className="bg-gray-100 dark:bg-ocs-dark-input p-2 rounded-t-xl border-b border-gray-200 dark:border-ocs-light-gray/50">
              <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img
                      src={`data:${img.mimeType};base64,${img.data}`}
                      alt={`upload preview ${index}`}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <button
                      onClick={() => removeSelectedImage(index)}
                      className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={`relative flex items-end p-2 bg-gray-100 dark:bg-ocs-dark-input ${selectedImages.length > 0 ? 'rounded-b-xl' : 'rounded-xl'}`}>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 dark:text-ocs-text-muted hover:text-gray-800 dark:hover:text-white"
                aria-label="Attach image"
            >
                <ImageIcon className="w-6 h-6" />
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                multiple
            />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('message_placeholder', { assistantName: assistant.name })}
              className="flex-1 bg-transparent resize-none outline-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-ocs-text-muted px-3 py-2.5 max-h-40 custom-scrollbar"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || (!input.trim() && selectedImages.length === 0)}
              className="p-2.5 rounded-full bg-ocs-accent text-white disabled:bg-gray-300 dark:disabled:bg-ocs-light-gray disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <ChevronDownIcon className="w-5 h-5 -rotate-90" />
            </button>
          </div>
        </div>
        <div className="h-4 sm:h-6 md:h-8" />
      </div>
    </div>
  );
};

export default ChatView;
