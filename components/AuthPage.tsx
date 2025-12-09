
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { MailIcon, EyeIcon, EyeSlashIcon, ChevronDoubleRightIcon } from './icons/CoreIcons';
import { ASSISTANTS } from '../constants';

const AuthPage: React.FC = () => {
  type AuthMode = 'signUp' | 'signIn' | 'forgotPassword';
  const [authMode, setAuthMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlideVisible, setIsSlideVisible] = useState(true);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Dynamic Island Slideshow Logic
  const slides = [
    {
        id: 'vyne',
        assistant: ASSISTANTS.find(a => a.id === 'vyne'),
        label: 'New AI',
        text: 'VYNE is available',
        colorClass: 'text-purple-300'
    },
    {
        id: 'zora_json',
        assistant: ASSISTANTS.find(a => a.id === 'zora'), // Using Zora icon
        label: 'Feature',
        text: 'Zora JSON Edition',
        colorClass: 'text-orange-300'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
        setIsSlideVisible(false);
        setTimeout(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
            setIsSlideVisible(true);
        }, 5000);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[currentSlide];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'signUp') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            },
          },
        });

        if (signUpError) throw signUpError;
        setShowConfirmationModal(true);

      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (error: any) {
      setToast({ message: error.error_description || error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
             redirectTo: window.location.origin, 
        });
        if (error) throw error;
        setToast({ message: 'Password reset link sent! Check your email.', type: 'success' });
        setAuthMode('signIn');
    } catch (error: any) {
        setToast({ message: error.error_description || error.message, type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
    setAuthMode('signIn');
    setPassword('');
    setUsername('');
  };
  
  // High contrast "Launch Dapp" style button
  const primaryButtonClass = "w-full bg-quantum-lime hover:bg-lime-400 text-black font-bold py-4 rounded-full transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none mt-4 text-sm uppercase tracking-wider";
  
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-[#030303] overflow-hidden font-sans text-white selection:bg-lime-500/30">
       
       {/* Background Grid & Effects */}
       <div className="absolute inset-0 z-0 bg-quantum-grid bg-quantum-plus pointer-events-none"></div>
       
       {/* Glowing Orbs (Gradient Accents) */}
       {/* Top Left - Purple/Pink */}
       <div className="quantum-glow-blob top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-r from-purple-800 to-pink-600 opacity-40"></div>
       
       {/* Bottom Right - Green/Lime */}
       <div className="quantum-glow-blob bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-l from-emerald-800 to-lime-600 opacity-30" style={{ animationDelay: '-5s' }}></div>

       {/* Global Toast */}
       {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[80] px-6 py-3 rounded-full text-white font-bold shadow-[0_0_20px_rgba(0,0,0,0.5)] ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} backdrop-blur-md border border-white/10`}>
          {toast.message}
        </div>
      )}

       {/* Confirmation Modal */}
       {showConfirmationModal && (
        <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[70] p-4"
            onClick={handleCloseConfirmationModal}
        >
            <div 
                className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>
                <div className="mb-6 text-white bg-white/5 p-4 rounded-full border border-white/10 relative z-10">
                    <MailIcon className="w-8 h-8 text-quantum-lime" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Check your inbox</h3>
                <p className="text-zinc-400 mb-8 leading-relaxed text-sm relative z-10">
                    We've sent a confirmation link to <br/>
                    <span className="font-semibold text-white">{email}</span>. 
                </p>
                <button
                    onClick={handleCloseConfirmationModal}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors relative z-10"
                >
                    OK
                </button>
            </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-8">
             <div className="relative mb-6">
                 <div className="absolute inset-0 bg-quantum-lime blur-2xl opacity-20 rounded-full"></div>
                 <img src="https://i.imgur.com/7P8v6DA.png" alt="Zion Peak Logo" className="h-12 w-auto relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
             </div>
             
             {/* Notification Capsule */}
             {activeSlide.assistant && (
                <div className="mb-6">
                    <div 
                        className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform 
                        ${isSlideVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'}`}
                    >
                        <div className="flex items-center bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-lg pr-4 pl-1 py-1 gap-3">
                            <div className="relative w-8 h-8">
                                <img 
                                    src={activeSlide.assistant.iconUrl} 
                                    alt={activeSlide.assistant.name} 
                                    className="w-full h-full rounded-full object-cover flex-shrink-0 border border-white/10"
                                />
                                {activeSlide.id === 'zora_json' && (
                                    <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[6px] font-bold px-1 rounded-sm border border-black">JSON</div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${activeSlide.colorClass}`}>{activeSlide.label}</span>
                                <span className="text-xs text-white font-medium">{activeSlide.text}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Glass Card */}
        <div className="bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            
            {/* Subtle Gradient Line Top */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            {/* Content */}
            {authMode === 'forgotPassword' ? (
                 <div className="animate-modal-enter">
                    <button 
                        onClick={() => setAuthMode('signIn')}
                        className="mb-6 flex items-center text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        <ChevronDoubleRightIcon className="w-3 h-3 mr-1 rotate-180" /> Back
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                    <p className="text-zinc-400 mb-8 text-sm">Enter your email and we'll send you instructions.</p>
                    
                    <form onSubmit={handlePasswordReset} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required
                                className="w-full bg-black/40 border border-white/10 focus:border-quantum-lime rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none transition-all focus:ring-1 focus:ring-quantum-lime/50" 
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={primaryButtonClass}
                        >
                            {loading ? 'Sending...' : 'Send Link'}
                        </button>
                    </form>
                  </div>
            ) : (
                <div className="flex flex-col animate-modal-enter">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            {authMode === 'signUp' ? 'Join Zion' : 'Welcome Back'}
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            {authMode === 'signUp' ? 'Create your creative identity.' : 'Access your creative suite.'}
                        </p>
                    </div>

                    {/* Toggle Slider */}
                    <div className="bg-black/40 p-1 rounded-full mb-8 border border-white/5 relative grid grid-cols-2">
                         <div 
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-quantum-lime border border-transparent rounded-full shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${authMode === 'signIn' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
                        />
                        <button 
                            onClick={() => setAuthMode('signIn')} 
                            className={`relative z-10 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${authMode === 'signIn' ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Log In
                        </button>
                        <button 
                            onClick={() => setAuthMode('signUp')} 
                            className={`relative z-10 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${authMode === 'signUp' ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {authMode === 'signUp' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Username</label>
                                <input 
                                    type="text" 
                                    placeholder="Username" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    required 
                                    className="w-full bg-black/40 border border-white/10 focus:border-quantum-lime rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:outline-none transition-all focus:ring-1 focus:ring-quantum-lime/50" 
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required
                                className="w-full bg-black/40 border border-white/10 focus:border-quantum-lime rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:outline-none transition-all focus:ring-1 focus:ring-quantum-lime/50" 
                            />
                        </div>

                        <div className="space-y-1.5">
                             <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                                {authMode === 'signIn' && (
                                     <button 
                                        type="button"
                                        onClick={() => { setAuthMode('forgotPassword'); setPassword(''); }} 
                                        className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                                    >
                                        Forgot?
                                    </button>
                                )}
                             </div>
                            <div className="relative group/input">
                                <input 
                                    type={passwordVisible ? 'text' : 'password'}
                                    placeholder="••••••••" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required
                                    className="w-full bg-black/40 border border-white/10 focus:border-quantum-lime rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:outline-none transition-all focus:ring-1 focus:ring-quantum-lime/50 pr-10" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-600 hover:text-white transition-colors"
                                >
                                    {passwordVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={primaryButtonClass}>
                            {loading ? 'Processing...' : (authMode === 'signUp' ? 'Create Account' : 'Log In')}
                        </button>
                    </form>
                </div>
            )}
        </div>
        
        {/* Footer info - Removed 'Powered by Gemini 2.5' */}
        <div className="mt-8 text-center">
            <p className="text-zinc-600 text-xs">
                &copy; {new Date().getFullYear()} Zion Peak Suite.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
