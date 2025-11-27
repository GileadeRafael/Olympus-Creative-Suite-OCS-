
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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
  
  const vyneAssistant = ASSISTANTS.find(a => a.id === 'vyne');

  const primaryButtonClass = "w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]";
  
  return (
    <div className="min-h-screen w-full flex bg-[#050505] font-sans text-white selection:bg-purple-500/30">
       
       {/* Global Toast */}
       {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full text-white font-medium shadow-2xl ${toast.type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90'} backdrop-blur-md`}>
          {toast.message}
        </div>
      )}

       {/* Confirmation Modal */}
       {showConfirmationModal && (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4"
            onClick={handleCloseConfirmationModal}
        >
            <div 
                className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 text-white bg-zinc-800 p-4 rounded-full">
                    <MailIcon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Check your inbox</h3>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                    We've sent a confirmation link to <br/>
                    <span className="font-semibold text-white">{email}</span>. 
                </p>
                <button
                    onClick={handleCloseConfirmationModal}
                    className={primaryButtonClass}
                >
                    OK
                </button>
            </div>
        </div>
      )}

      {/* LEFT SIDE - VISUAL WITH GRADIENT CARD */}
      <div className="hidden lg:flex lg:w-1/2 p-6 h-screen">
         {/* Rounded Gradient Card */}
        <div className="relative w-full h-full rounded-[40px] overflow-hidden flex flex-col items-center justify-center isolate border border-white/5 shadow-2xl">
            
            {/* Background Gradient */}
            <div className="absolute inset-0 z-0 bg-black">
                {/* Main Spotlight Gradient - Radial Bottom-Up */}
                <div 
                    className="absolute inset-0" 
                    style={{
                        background: 'radial-gradient(circle at 50% 100%, #0d0d0d 0%, #0d0d0d 50%, #5c1c74 80%, #a465ff 92%, #e4caff 100%)'
                    }}
                ></div>

                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
            </div>

            {/* Notification (Dynamic Island) - Centered & Always Expanded */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30">
                 {vyneAssistant && (
                    <div className="transition-all duration-500 ease-out opacity-100 scale-100">
                        <div className="flex items-center bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-lg overflow-hidden pr-4 pl-1 py-1 gap-3">
                            <img 
                                src={vyneAssistant.iconUrl} 
                                alt={vyneAssistant.name} 
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/10"
                            />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">New Assistant</span>
                                <span className="text-xs text-white font-medium whitespace-nowrap">VYNE is now available</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Centered Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-8">
                 <div className="mb-8 flex items-center space-x-3 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    <img src="https://i.imgur.com/0vBQm1M.png" alt="Olympus Logo" className="h-5 w-auto" />
                    <span className="font-semibold text-base tracking-tight text-white/90">Olympus Creative Suite</span>
                 </div>
                 
                 <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight drop-shadow-xl">
                    Get Started<br/>with Us
                 </h1>
                 <p className="text-zinc-300/80 text-lg max-w-sm mx-auto leading-relaxed">
                    Complete these easy steps to register your account.
                 </p>
            </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#050505] relative px-6 py-12">
        <div className="w-full max-w-sm">
            
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
                <img src="https://i.imgur.com/0vBQm1M.png" alt="Olympus Logo" className="h-10 w-auto" />
            </div>

            {authMode === 'forgotPassword' ? (
                 <div>
                    <button 
                        onClick={() => setAuthMode('signIn')}
                        className="mb-6 flex items-center text-zinc-500 hover:text-white transition-colors text-sm"
                    >
                        <ChevronDoubleRightIcon className="w-4 h-4 mr-1 rotate-180" /> Back
                    </button>
                    <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                    <p className="text-zinc-400 mb-8">Enter your email and we'll send you instructions to reset your password.</p>
                    
                    <form onSubmit={handlePasswordReset} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide ml-1">Email</label>
                            <input 
                                type="email" 
                                placeholder="eg. johnfrans@gmail.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none transition-colors" 
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={primaryButtonClass}
                        >
                            {loading ? 'Sending...' : 'Send Instructions'}
                        </button>
                    </form>
                  </div>
            ) : (
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {authMode === 'signUp' ? 'Create an Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-zinc-400">
                            {authMode === 'signUp' ? 'Enter your details to register.' : 'Enter your credentials to access your account.'}
                        </p>
                    </div>

                    {/* Sliding Toggle */}
                    <div className="bg-zinc-900/50 p-1 rounded-xl mb-8 border border-zinc-800 relative grid grid-cols-2">
                         <div 
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-800 rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${authMode === 'signIn' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
                        />
                        <button 
                            onClick={() => setAuthMode('signIn')} 
                            className={`relative z-10 py-2.5 text-sm font-semibold transition-colors duration-200 ${authMode === 'signIn' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Log In
                        </button>
                        <button 
                            onClick={() => setAuthMode('signUp')} 
                            className={`relative z-10 py-2.5 text-sm font-semibold transition-colors duration-200 ${authMode === 'signUp' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {authMode === 'signUp' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide ml-1">Username</label>
                                <input 
                                    type="text" 
                                    placeholder="eg. JohnDoe" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    required 
                                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none transition-colors" 
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide ml-1">Email</label>
                            <input 
                                type="email" 
                                placeholder="eg. johnfrans@gmail.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none transition-colors" 
                            />
                        </div>

                        <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide ml-1">Password</label>
                                {authMode === 'signIn' && (
                                     <button 
                                        type="button"
                                        onClick={() => { setAuthMode('forgotPassword'); setPassword(''); }} 
                                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                                    >
                                        Forgot?
                                    </button>
                                )}
                             </div>
                            <div className="relative">
                                <input 
                                    type={passwordVisible ? 'text' : 'password'}
                                    placeholder="Enter your password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none transition-colors pr-10" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {passwordVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`${primaryButtonClass} !mt-8`}>
                            {loading ? 'Processing...' : (authMode === 'signUp' ? 'Create Account' : 'Log In')}
                        </button>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
