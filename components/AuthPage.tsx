import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { MailIcon, EyeIcon, EyeSlashIcon } from './icons/CoreIcons';

const AuthPage: React.FC = () => {
  type AuthMode = 'signUp' | 'signIn' | 'forgotPassword';
  const [authMode, setAuthMode] = useState<AuthMode>('signUp');
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
        // Sign Up Flow
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

      } else { // Sign In Flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        // The onAuthStateChange listener in useAuth.ts will handle the session update.
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

  const backgroundStyle = {
    backgroundImage: `url('https://i.imgur.com/SDbDZkl.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4" style={backgroundStyle}>
       {toast && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      {showConfirmationModal && (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseConfirmationModal}
        >
            <div 
                className="w-full max-w-sm bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 flex flex-col items-center text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 text-white bg-white/10 p-3 rounded-full">
                    <MailIcon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Confirm your email</h3>
                <p className="text-white/80 mb-6">
                    We've sent a confirmation link to <br/>
                    <span className="font-semibold text-white">{email}</span>. 
                    Please check your inbox to complete your registration.
                </p>
                <button
                    onClick={handleCloseConfirmationModal}
                    className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    OK
                </button>
            </div>
        </div>
      )}

      <div className="w-full max-w-md bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
        {authMode === 'forgotPassword' ? (
             <div>
                <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-sm text-white/60 mb-6">Enter your email and we'll send you instructions to reset your password.</p>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50" 
                  />
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Instructions'}
                  </button>
                </form>
                 <button onClick={() => { setAuthMode('signIn'); }} className="w-full text-center text-sm text-white/50 hover:text-white mt-6">
                    Back to Sign In
                </button>
              </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
                <div className="flex bg-black/20 rounded-full p-1 border border-white/10">
                  <button onClick={() => setAuthMode('signUp')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${authMode === 'signUp' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>Sign up</button>
                  <button onClick={() => setAuthMode('signIn')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${authMode === 'signIn' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>Sign in</button>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6">{authMode === 'signUp' ? 'Create an account' : 'Welcome back'}</h2>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {authMode === 'signUp' && (
                  <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50" />
                )}
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50" />
                <div className="relative">
                    <input 
                        type={passwordVisible ? 'text' : 'password'}
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 pr-10" />
                    <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white transition-colors"
                        aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                    >
                        {passwordVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                </div>
              </div>
              
                {authMode === 'signIn' && (
                  <div className="text-right -mt-2">
                      <button 
                          type="button"
                          onClick={() => { setAuthMode('forgotPassword'); setPassword(''); }} 
                          className="text-xs font-medium text-white/60 hover:text-white hover:underline transition-colors"
                      >
                          Forgot Password?
                      </button>
                  </div>
              )}


              <button type="submit" disabled={loading} className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 !mt-6">
                {loading ? 'Processing...' : (authMode === 'signUp' ? 'Create an account' : 'Sign in')}
              </button>
            </form>
            
            <p className="text-xs text-white/40 text-center mt-6">
              By creating an account, you agree to our Terms & Service
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;