import React, { useState, useEffect } from 'react';
import { X, Globe, User, LogOut, Check, Sparkles, Bell, Volume2, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../services/authService';
import { LANGUAGES, LanguageOption } from './AutoTranslate';
import { useTranslation } from '../services/i18n';
import { SupportedLanguage } from '../locales/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  isPremium: boolean;
  onLogout: () => void;
  onUpgrade: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  isPremium,
  onLogout,
  onUpgrade
}) => {
  const { language, setLanguage, t } = useTranslation();
  const [notifications, setNotifications] = useState<boolean>(true);
  const [soundEffects, setSoundEffects] = useState<boolean>(true);
  const [showConfirmLogout, setShowConfirmLogout] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfirmLogout(false);
    }
  }, [isOpen]);

  const handleSelectLanguage = (code: string) => {
    setLanguage(code as SupportedLanguage);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-[#020617] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6 z-10 my-auto max-h-[90vh] custom-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black italic uppercase tracking-wider text-white">
                    {t('settings.title', 'Account & Settings')}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {t('settings.subtitle', 'Neural Profile & Preferences')}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Profile Info Card */}
            {user && (
              <div className="p-5 bg-slate-900/60 border border-white/10 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="relative">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-white/10 flex items-center justify-center text-slate-400 font-black text-xl">
                        {user.firstName ? user.firstName[0] : 'U'}
                      </div>
                    )}
                    {isPremium && (
                      <div className="absolute -top-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full shadow-lg">
                        <Zap size={10} className="fill-current" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-base font-black text-white">{user.name}</h3>
                      {user.username && (
                        <span className="text-[10px] text-slate-500 font-bold">@{user.username}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isPremium ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
                        {isPremium ? t('nav.vipAccess', '⚡ VIP Neural Access') : t('nav.freeTier', 'Free Tier')}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck size={10} className="text-emerald-400" /> {t('nav.telegramLinked', 'Telegram Linked')}
                      </span>
                    </div>
                  </div>
                </div>

                {!isPremium && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onClose();
                      onUpgrade();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={12} />
                    {t('nav.upgradeVip', 'Upgrade VIP')}
                  </motion.button>
                )}
              </div>
            )}

            {/* Language Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                    {t('settings.language', 'App Language')}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  {language.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar p-1">
                {LANGUAGES.map((lang: LanguageOption) => {
                  const isSelected = language === lang.code;
                  return (
                    <motion.button
                      key={lang.code}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg leading-none">{lang.flag}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate leading-tight">{lang.nativeName}</div>
                          <div className="text-[9px] text-slate-500 truncate leading-tight">{lang.name}</div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 ml-1">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* App Preferences */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="text-xs font-black uppercase tracking-widest text-slate-300 mb-2">Preferences</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNotifications(!notifications)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    notifications
                      ? 'bg-slate-900/80 border-emerald-500/30 text-white'
                      : 'bg-slate-900/30 border-white/5 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bell size={16} className={notifications ? 'text-emerald-400' : 'text-slate-500'} />
                    <span className="text-xs font-bold">{t('settings.notifications', 'Push Notifications')}</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${notifications ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${notifications ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundEffects(!soundEffects)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    soundEffects
                      ? 'bg-slate-900/80 border-emerald-500/30 text-white'
                      : 'bg-slate-900/30 border-white/5 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Volume2 size={16} className={soundEffects ? 'text-emerald-400' : 'text-slate-500'} />
                    <span className="text-xs font-bold">{t('settings.sound', 'Sound Effects')}</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${soundEffects ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${soundEffects ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Logout / Exit Section */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              {showConfirmLogout ? (
                <div className="flex items-center gap-2 w-full">
                  <span className="text-xs font-bold text-red-400 flex-1">
                    {t('settings.signOutConfirm', 'Are you sure you want to sign out?')}
                  </span>
                  <button
                    onClick={() => setShowConfirmLogout(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                  >
                    {t('settings.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-red-500/20"
                  >
                    {t('settings.confirm', 'Confirm')}
                  </button>
                </div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmLogout(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <LogOut size={14} />
                    {t('settings.signOut', 'Sign Out')}
                  </motion.button>

                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {t('common.close', 'Done')}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
