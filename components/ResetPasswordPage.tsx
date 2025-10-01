import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { EyeIcon, EyeSlashIcon } from './icons/CoreIcons';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
        if (toast.type === 'success') {
          // Success, sign out to force re-login
          supabase.auth.signOut().then(() => {
            window.location.reload(); // Reload to go back to AuthPage
          });
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setToast({ message: "Passwords do not match.", type: 'error' });
      return;
    }
    if (password.length < 6) {
      setToast({ message: "Password should be at least 6 characters.", type: 'error' });
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      setToast({ message: "Password updated successfully! Redirecting to login...", type: 'success' });
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
        <h2 className="text-3xl font-bold text-white mb-2">Set a New Password</h2>
        <p className="text-sm text-white/60 mb-6">Enter and confirm your new password below.</p>
        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <input 
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Enter new password" 
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
          <div className="relative">
            <input 
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Confirm new password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
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
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 !mt-6"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
