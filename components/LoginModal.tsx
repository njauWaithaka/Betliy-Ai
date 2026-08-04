import React, { useState } from 'react';
import { X, LogIn, Globe, ShieldCheck, Mail, ArrowLeft, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authService, UserProfile } from '../services/authService';
import { useAuth } from '../services/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { setError: setGlobalError } = useAuth();
  const [view, setView] = useState<'options' | 'email-login' | 'email-signup'>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTelegramLogin = async () => {
    try {
      setLoading(true);
      const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      if (tgUser) {
        const profile = authService.createLocalProfile(tgUser);
        // Non-blocking sync
        authService.syncUserToFirebase(profile, tgUser).catch(console.error);
        onLoginSuccess(profile);
        setGlobalError(null);
        onClose();
      } else {
        const msg = "Telegram user data not available.";
        setError(msg);
        setGlobalError(msg);
      }
    } catch (error: any) {
      setError(error.message);
      setGlobalError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const profile = await authService.signInWithGoogle();
      onLoginSuccess(profile);
      setGlobalError(null);
      onClose();
    } catch (error: any) {
      setError(error.message);
      setGlobalError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[400px] bg-[#020617] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-8 space-y-8 z-10"
          >
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose} 
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-all bg-white/5 rounded-full"
            >
              <X size={20} />
            </motion.button>

            <div className="text-center space-y-2">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-2"
              >
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Secure Neural Sync</span>
              </motion.div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Neural <span className="text-white">Betl</span><span className="text-[#00FFA3]">ify</span></h2>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed">
                Sync your neural signals and premium access via Telegram.
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-bold text-red-400 uppercase tracking-wider text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              {authService.isTelegramMiniApp() ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleTelegramLogin}
                  disabled={loading}
                  className="w-full py-4 bg-[#24A1DE] text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase italic text-sm hover:bg-[#208ec4] transition-all shadow-[0_0_20px_rgba(36,161,222,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.25.38-.51 1.07-.77 4.21-1.83 7.02-3.04 8.42-3.63 4.02-1.68 4.85-1.97 5.4-1.98.12 0 .39.03.56.17.14.11.18.26.2.38.02.12.02.25.01.38z"/>
                  </svg>
                  Sync with Telegram
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-4 bg-white text-slate-950 rounded-2xl flex items-center justify-center gap-3 font-black uppercase italic text-sm hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-4 justify-center">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Neural Link Verified</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <p className="text-[9px] font-medium text-slate-600 text-center uppercase tracking-widest">By continuing, you agree to our <span className="text-slate-400 underline cursor-pointer">Terms of Intelligence</span>.</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
