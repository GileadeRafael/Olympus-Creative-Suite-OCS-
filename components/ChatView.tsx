import React, { useState, useRef, useEffect } from 'react';
import type { Assistant, Message } from '../types';
import { sendMessageStream } from '../services/geminiService';
import type { Chat } from '@google/genai';
import { XIcon, PlusIcon, ChevronDownIcon } from './icons/CoreIcons';
import WelcomeScreen from './WelcomeScreen';
import { useLanguage } from '../contexts/LanguageContext';
import { Remarkable } from 'remarkable';
import type { User } from '@supabase/supabase-js';

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
}

const ChatView: React.FC<ChatViewProps> = ({ assistant, chatSession, messages, setMessages, user, activeChatId, onCreateChat, onUpdateChat }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{ mimeType: string; data: string }[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const { t } = useLanguage();
  
  const username = user?.user_metadata?.username || 'User';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160; // Corresponds to max-h-40
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (!assistant) return;

    // Post-render DOM manipulation to add/update copy buttons to code blocks
    const timer = setTimeout(() => {
        if (!chatContainerRef.current) return;

        const buttonColorClass = getCopyButtonColors(assistant.ringColor);
        const [bgColor, hoverBgColor] = buttonColorClass.split(' ');

        chatContainerRef.current.querySelectorAll('pre').forEach(pre => {
            let wrapper = pre.parentElement;
            
            // If not wrapped, create wrapper and button
            if (!wrapper || !wrapper.classList.contains('code-block-wrapper')) {
                wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper relative group';
                
                const copyButton = document.createElement('button');
                copyButton.className = `p-1.5 ${buttonColorClass} text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100`;
                copyButton.setAttribute('aria-label', 'Copy code');
                copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.353-.026.692-.04 1.048-.041h.005c.356 0 .703.015 1.048.041 1.13.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5m-7.5 0l-1 10.5a1.5 1.5 0 001.5 1.5h7.5a1.5 1.5 0 001.5-1.5l-1-10.5m-7.5 0V6.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V7.5m-7.5 0h7.5"></path></svg>`;

                const copiedText = document.createElement('span');
                copiedText.className = 'absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 transition-opacity pointer-events-none';
                copiedText.innerText = 'Copied!';

                const copyButtonWrapper = document.createElement('div');
                copyButtonWrapper.className = 'absolute top-2 right-2 z-10';
                copyButtonWrapper.appendChild(copyButton);
                copyButtonWrapper.appendChild(copiedText);

                copyButton.onclick = () => {
                    const code = pre.querySelector('code')?.innerText || '';
                    navigator.clipboard.writeText(code).then(() => {
                        copiedText.classList.add('opacity-100');
                        setTimeout(() => {
                            copiedText.classList.remove('opacity-100');
                        }, 2000);
                    });
                };

                pre.parentNode?.insertBefore(wrapper, pre);
                wrapper.appendChild(pre);
                wrapper.appendChild(copyButtonWrapper);
            } else {
                // If already wrapped, just update the button color
                const button = wrapper.querySelector('button');
                if (button) {
                    const oldColorClasses = Array.from(button.classList).filter(c => c.startsWith('bg-') || c.startsWith('hover:bg-'));
                    button.classList.remove(...oldColorClasses);
                    button.classList.add(bgColor, hoverBgColor);
                }
            }
        });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, assistant]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imagePromises = files.map(file => {
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
      e.target.value = ''; // Allow re-selecting the same file
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!input.trim() && selectedImages.length === 0) || !chatSession) return;

    const userMessage: Message = { 
      id: `user-${Date.now()}`, 
      role: 'user', 
      content: input, 
      images: selectedImages 
    };
    
    // Optimistically update UI
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    
    setInput('');
    setSelectedImages([]);
    setIsLoading(true);

    try {
        const stream = await sendMessageStream(chatSession, input, selectedImages);
        let modelResponse = '';
        const modelMessageId = `model-${Date.now()}`;
        
        // FIX: Explicitly type `updatedMessages` as `Message[]` to prevent type widening on the `role` property of the new message object.
        // This resolves type errors in subsequent calls to setMessages, onCreateChat, and onUpdateChat.
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
        // FIX: Explicitly type the new error message object to `Message` to ensure the returned array is of type `Message[]`.
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
  
  if (!assistant) {
    return <WelcomeScreen user={user} />;
  }

  const isSendDisabled = isLoading || (!input.trim() && selectedImages.length === 0);

  return (
    <div className="flex flex-col h-full w-full relative">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-4 pt-6 h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className={`relative w-24 h-24 mb-6 border-4 ${assistant.ringColor} rounded-full flex items-center justify-center p-1`}>
                <img src={assistant.iconUrl} alt={assistant.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
                {assistant.name}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-lg">
                {t(assistant.descriptionKey)}
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} id={`message-${msg.id}`} className={`my-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="relative group">
                  <div
                    className={`p-4 rounded-2xl max-w-2xl prose-p:my-2 prose-p:leading-relaxed prose-headings:my-4 prose-pre:bg-black prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-code:text-white ${
                      msg.role === 'user' 
                        ? 'bg-gray-200 dark:bg-ocs-dark-hover prose dark:prose-invert'
                        : 'bg-gray-50 dark:bg-ocs-dark-input text-gray-800 dark:text-gray-200 prose dark:prose-invert'
                    }`}
                  >
                    {msg.content ? <div dangerouslySetInnerHTML={{ __html: md.render(msg.content) }} /> : null}
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
                    <img src={assistant.iconUrl} alt={assistant.name} className="absolute -bottom-4 -left-5 w-10 h-10 rounded-full border-4 border-white dark:border-ocs-dark-chat" />
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && messages.length > 0 && messages[messages.length-1]?.role === 'user' && (
            <div className="my-4 flex justify-start">
               <div className="relative group">
                <div className="p-4 rounded-2xl max-w-2xl bg-gray-50 dark:bg-ocs-dark-input flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2 delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                </div>
                <img src={assistant.iconUrl} alt={assistant.name} className="absolute -bottom-4 -left-5 w-10 h-10 rounded-full border-4 border-white dark:border-ocs-dark-chat" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="w-full pt-4 bg-gradient-to-t from-white dark:from-ocs-dark-chat to-transparent">
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
          <div className="bg-gray-100/80 dark:bg-ocs-dark-input/80 backdrop-blur-lg rounded-2xl p-3 flex flex-col w-full shadow-lg border border-gray-200/50 dark:border-ocs-dark-hover/50">
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('message_placeholder', { assistantName: assistant.name })}
                className="flex-1 bg-transparent text-gray-800 dark:text-gray-200 dark:placeholder-ocs-text-muted/70 focus:outline-none resize-none max-h-40 overflow-y-auto custom-scrollbar w-full px-1 pt-1"
                rows={1}
            />
            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/jpeg, image/png, image/webp" className="hidden" />
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="p-2 text-gray-600 dark:text-gray-300 bg-gray-200/70 dark:bg-ocs-dark-hover/70 rounded-lg transition-colors hover:bg-gray-300 dark:hover:bg-zinc-700"
                        aria-label="Add attachment"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                <button
                    onClick={handleSend}
                    disabled={isSendDisabled}
                    className="flex items-center space-x-2.5 text-white bg-gray-900 dark:bg-white dark:text-gray-900 font-semibold rounded-lg px-4 py-2 transition-all duration-200 transform
                    hover:bg-gray-700 dark:hover:bg-gray-200
                    disabled:bg-gray-300 dark:disabled:bg-zinc-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                    aria-label="Send message now"
                >
                    <span className="text-sm">Send now</span>
                    <span className="h-4 w-px bg-gray-500/50 dark:bg-gray-500/50"></span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400 dark:text-gray-600" />
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
    </div>
  );
};

export default ChatView;