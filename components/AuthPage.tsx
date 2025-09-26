import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      if (isSignUp) {
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

        setToast({ message: 'Check your email for the confirmation link!', type: 'success' });

      } else {
        // Sign In Flow
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
      <div className="w-full max-w-md bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
        <div className="flex justify-between items-center mb-6">
            <div className="flex bg-black/20 rounded-full p-1 border border-white/10">
              <button onClick={() => setIsSignUp(true)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${isSignUp ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>Sign up</button>
              <button onClick={() => setIsSignUp(false)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${!isSignUp ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>Sign in</button>
            </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-6">Create an account</h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {isSignUp && (
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required 
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50" />
            )}
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50" />
            <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
            {loading ? 'Processing...' : (isSignUp ? 'Create an account' : 'Sign in')}
          </button>
        </form>
        
        <p className="text-xs text-white/40 text-center mt-6">
          By creating an account, you agree to our Terms & Service
        </p>
      </div>
    </div>
  );
};

export default AuthPage;