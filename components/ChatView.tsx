import React, { useState, useRef, useEffect } from 'react';
import type { Assistant, Message } from '../types';
import { sendMessageStream } from '../services/geminiService';
import type { Chat } from '@google/genai';
import { ChevronDownIcon, ArrowUpIcon, CopyIcon } from './icons/CoreIcons';
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
  assistants: Assistant[];
  onSelectAssistant: (assistant: Assistant) => void;
  chatSession: Chat | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  user: User | null;
}

const ChatView: React.FC<ChatViewProps> = ({ assistant, assistants, onSelectAssistant, chatSession, messages, setMessages, user }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  const username = user?.user_metadata?.username || 'User';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

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

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await sendMessageStream(chatSession, input);
      let modelResponse = '';
      const modelMessageId = `model-${Date.now()}`;
      setMessages(prev => [...prev, { id: modelMessageId, role: 'model', content: '...' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => prev.map(m => m.id === modelMessageId ? { ...m, content: modelResponse } : m));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorId = `error-${Date.now()}`;
      setMessages(prev => prev.map(m => m.content === '...' ? { ...m, id: errorId, content: t('send_error')} : m));
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
    return <WelcomeScreen />;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-4 pt-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
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
                    className={`p-4 rounded-2xl max-w-2xl prose dark:prose-invert prose-p:my-2 prose-p:leading-relaxed prose-headings:my-4 prose-pre:bg-black prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-code:text-white ${
                      msg.role === 'user' ? 'bg-ocs-accent text-white' : 'bg-gray-50 dark:bg-ocs-dark-input text-gray-800 dark:text-gray-200'
                    }`}
                    dangerouslySetInnerHTML={{ __html: md.render(msg.content) }}
                  />
                  {msg.role === 'model' && (
                    <img src={assistant.iconUrl} alt={assistant.name} className="absolute -bottom-4 -left-5 w-10 h-10 rounded-full border-4 border-white dark:border-ocs-dark-chat" />
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && messages[messages.length-1]?.role === 'user' && (
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
          <div className="relative bg-white/70 dark:bg-ocs-dark-input/70 backdrop-blur-lg border border-gray-200 dark:border-zinc-700 rounded-xl p-2 flex items-center w-full">
              <div className="relative" ref={dropdownRef}>
                   <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 bg-gray-100 dark:bg-ocs-dark-hover px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-ocs-dark-sidebar transition-colors">
                      <img src={assistant.iconUrl} alt={assistant.name} className="w-5 h-5 rounded-full object-cover" />
                      <span>{assistant.name}</span>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                   </button>
                   {isDropdownOpen && (
                       <div className="absolute bottom-full mb-2 w-48 bg-white dark:bg-ocs-dark-hover border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg z-10">
                           {assistants.map(a => (
                               <button key={a.id} onClick={() => { onSelectAssistant(a); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-ocs-dark-sidebar flex items-center space-x-2">
                                  <img src={a.iconUrl} alt={a.name} className="w-5 h-5 rounded-full object-cover" />
                                  <span>{a.name}</span>
                               </button>
                           ))}
                       </div>
                   )}
              </div>
              <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('message_placeholder', { assistantName: assistant.name })}
                  className="flex-1 bg-transparent pl-4 pr-12 text-gray-800 dark:text-gray-200 dark:placeholder-zinc-400 focus:outline-none resize-none max-h-40"
                  rows={1}
              />
              <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white rounded-full p-2 transition-colors
                  disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                  dark:disabled:bg-zinc-800 dark:disabled:text-gray-500
                  bg-blue-500 hover:bg-blue-600"
              >
                  <ArrowUpIcon className="w-5 h-5" />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;