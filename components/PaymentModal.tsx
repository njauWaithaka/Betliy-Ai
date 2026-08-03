import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, Zap, Flame, Lock, Trophy, Target, Star, Clock, BarChart3, Unlock, DollarSign, TrendingUp, Rocket, Activity, ChevronLeft, MoreHorizontal, AlertTriangle, Diamond, Crown } from 'lucide-react';
import { authService } from '../services/authService';
import { ASSETS } from '../constants';
import { motion } from 'motion/react';
import { cn } from '../services/utils';

import { FirebasePick, EliteComboPick } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isLoggedIn: boolean;
  onLoginRequired: (callback?: () => void) => void;
  freePick?: FirebasePick | null;
  bodPick?: FirebasePick | null;
  bankerPick?: FirebasePick | null;
  eliteCombo?: EliteComboPick[] | null;
  topPicks?: FirebasePick[] | null;
}

const LockedPickCard: React.FC<{ 
  title?: string; 
  confidence: number; 
  odds: string; 
  icon: React.ElementType; 
  isFree?: boolean; 
  home?: string; 
  away?: string; 
  tip?: string;
  footerText?: string;
  color?: string;
  badge?: string;
}> = ({ title, confidence, odds, icon: Icon, isFree, home, away, tip, footerText, color = "emerald", badge }) => {
  const colorClasses = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    teal: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  const badgeClasses = {
    emerald: "bg-emerald-500 text-slate-950",
    amber: "bg-amber-500 text-slate-950",
    blue: "bg-blue-500 text-white",
    teal: "bg-teal-500 text-white",
    yellow: "bg-yellow-500 text-slate-950",
    rose: "bg-rose-500 text-white",
  };

  const barClasses = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
    blue: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
    teal: "bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]",
    yellow: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]",
    rose: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]",
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -5 }}
      className={cn(
        "relative group overflow-hidden rounded-2xl border transition-all bg-slate-900/40 border-white/5 hover:border-white/10",
        isFree && "border-emerald-500/20"
      )}
    >
      {/* Label Badge */}
      <div className={cn(
        "absolute top-0 left-0 px-2.5 py-1 text-[8px] font-black uppercase italic tracking-widest z-20 rounded-br-xl shadow-lg",
        isFree ? "bg-emerald-500 text-slate-950" : badgeClasses[color as keyof typeof badgeClasses]
      )}>
        {isFree ? "Free Pick" : (badge || title)}
      </div>

      <div className={cn(
        "absolute top-0 right-0 px-2.5 py-1 text-[8px] font-black uppercase italic rounded-bl-xl z-20 flex items-center gap-1.5",
        isFree ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
      )}>
        {isFree ? "Free Pick" : "Premium Pick"}
      </div>

      <div className="p-5 pt-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-2xl",
            isFree ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : colorClasses[color as keyof typeof colorClasses]
          )}>
            <Icon size={24} />
          </div>
          
          <div className="flex-1 min-w-0">
            {isFree && (
              <h4 className="text-[13px] font-black text-white uppercase italic tracking-tight truncate mb-1">
                {home} v {away}
              </h4>
            )}
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{isFree ? 'MARKET' : 'ACCESS'}</span>
                <span className={cn(
                  "text-xs font-black italic uppercase",
                  isFree ? "text-emerald-400" : "text-[#00FFA3]"
                )}>
                  {isFree ? tip : "Premium Only"}
                </span>
                {isFree && <span className="text-lg font-black text-emerald-400 italic leading-none mt-1">{odds}</span>}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">CONFIDENCE</span>
                  <span className="text-[11px] font-black text-white italic tabular-nums">{confidence}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", isFree ? "bg-emerald-500" : barClasses[color as keyof typeof barClasses])}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              {isFree ? (
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">FREE DAILY SAMPLE UNLOCKED</span>
              ) : (
                <>
                  <Lock size={10} className={cn(colorClasses[color as keyof typeof colorClasses].split(' ')[0])} />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{footerText || "UNLOCK TO VIEW FULL PREDICTION"}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PricingTier: React.FC<{ 
  title: string; 
  price: string; 
  originalPrice: string; 
  features: string[]; 
  isPremium?: boolean; 
  subtext: string;
  supportingLine?: string;
  ctaText: string;
  onSelect: () => void;
  badge?: string;
  bestValue?: boolean;
}> = ({ title, price, originalPrice, features, isPremium, subtext, supportingLine, ctaText, onSelect, badge, bestValue }) => (
  <motion.div 
    whileHover={{ scale: 1.01 }}
    className={cn(
      "relative flex flex-col p-6 sm:p-8 rounded-[2.5rem] transition-all duration-300 border",
      isPremium 
        ? "bg-slate-900/60 border-[#00FFA3]/30 shadow-[0_0_50px_rgba(0,255,163,0.1)]" 
        : "bg-slate-900/40 border-white/5"
    )}
  >
    {badge && (
      <div className={cn(
        "absolute -top-3 left-6 px-4 py-1 text-[9px] font-black uppercase italic rounded-full z-20 shadow-lg",
        isPremium ? "bg-[#00FFA3] text-slate-950" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
      )}>
        {badge}
      </div>
    )}

    {bestValue && (
      <div className="absolute top-4 right-6 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
        <Diamond size={10} className="text-emerald-400" />
        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">BEST VALUE</span>
      </div>
    )}
    
    <div className="mb-6">
      <h3 className={cn(
        "text-xl font-black uppercase italic tracking-tighter mb-1",
        isPremium ? "text-[#00FFA3]" : "text-white"
      )}>{title}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{subtext}</p>
      
      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <span className="text-slate-500 text-sm font-black line-through decoration-rose-500/50 leading-none mb-1">{originalPrice}</span>
          <span className="text-2xl sm:text-xl sm:text-2xl font-black text-white italic tracking-tighter leading-none">{price}</span>
        </div>
        <span className="text-[10px] font-black text-[#00FFA3] uppercase tracking-widest mb-1">/ Month</span>
      </div>
    </div>

    <div className="flex-1 space-y-3.5 mb-8">
      {features.map((feature, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Check size={12} className="text-[#00FFA3]" />
          </div>
          <span className="text-[11px] font-black text-slate-200 uppercase tracking-tight">{feature}</span>
        </div>
      ))}
    </div>

    <div className="space-y-4">
      {supportingLine && (
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">
          {supportingLine}
        </p>
      )}
      
      {isPremium && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
            LIMITED-TIME PRICE — INCREASING SOON
          </p>
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
            BEST VALUE FOR USERS WHO WANT THE FULL AI SYSTEM
          </p>
        </div>
      )}

      <button
        onClick={onSelect}
        className={cn(
          "w-full py-5 rounded-2xl font-black uppercase italic transition-all active:scale-95 shadow-xl text-sm tracking-widest",
          isPremium 
            ? "bg-[#00FFA3] text-slate-950 hover:bg-[#00FFA3]/90 shadow-[0_0_30px_rgba(0,255,163,0.3)]" 
            : "bg-slate-800 text-white hover:bg-slate-700"
        )}
      >
        {ctaText}
      </button>
      
      <div className="text-center">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
          {isPremium ? "UNLOCK ALL 6 LOCKED PREMIUM SECTIONS" : "UNLOCK 2 CORE DAILY SIGNALS"}
        </span>
      </div>
    </div>
  </motion.div>
);

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  isLoggedIn, 
  onLoginRequired, 
  freePick,
  bodPick,
  bankerPick,
  eliteCombo,
  topPicks
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isTelegram = authService.isTelegramMiniApp();

  useEffect(() => {
    if (isTelegram && isOpen) {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.BackButton) {
        tg.BackButton.show();
        const handleBack = () => onClose();
        tg.BackButton.onClick(handleBack);
        return () => {
          tg.BackButton.hide();
          tg.BackButton.offClick(handleBack);
        };
      }
    }
  }, [isTelegram, isOpen, onClose]);

  const handlePayPalCheckout = (plan: 'entry' | 'premium') => {
    const paypalUrl = plan === 'premium' 
      ? 'https://www.paypal.com/billing/plans/P-75261333TT649832HNGO4H2I'
      : 'https://www.paypal.com/billing/plans/P-75261333TT649832HNGO4H2I';
    
    if (!isLoggedIn) {
      onLoginRequired(() => {
        window.open(paypalUrl, '_blank');
      });
    } else {
      window.open(paypalUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-start justify-center bg-slate-950/95 backdrop-blur-xl overflow-y-auto custom-scrollbar"
    >
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-[500px] min-h-screen bg-[#020617] flex flex-col shadow-2xl"
      >
        
        {/* Floating Close Button */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-6 right-6 z-[70]"
        >
          <button 
            onClick={onClose} 
            className="p-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-95 backdrop-blur-md border border-white/5"
          >
            <X size={20} />
          </button>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 px-6 pt-8 pb-32 space-y-10">
          
          {/* Hero Section */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#00FFA3]/5 blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-950 border border-white/10 rounded-full"
              >
                <Flame size={14} className="text-orange-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">TODAY'S PICKS ARE LIVE</span>
              </motion.div>

              <motion.h1 
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl sm:text-3xl font-black text-white italic uppercase tracking-tighter leading-[0.9] flex flex-col"
              >
                <span>YOU'RE MISSING</span>
                <span className="text-[#00FFA3]">TODAY'S WINNING</span>
                <span className="flex items-center justify-center gap-2">AI PICKS <Lock size={24} className="text-[#00FFA3]" /></span>
              </motion.h1>

              {/* Premium Stats Matrix */}
              <div className="space-y-3 pt-2 w-full max-w-sm sm:max-w-md mx-auto">
                <motion.div 
                  initial={{ y: 15, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 grid grid-cols-3 divide-x divide-white/5 text-center shadow-[0_0_25px_rgba(0,255,163,0.03)]"
                >
                  <div className="flex flex-col justify-center space-y-0.5 sm:space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">WIN RATE</span>
                    <span className="text-xl sm:text-2xl font-black text-[#00FFA3] tracking-tight hover:scale-105 transition-transform duration-300">80%</span>
                    <span className="text-[8px] font-medium text-slate-500 lowercase">last 50 signals</span>
                  </div>

                  <div className="flex flex-col justify-center space-y-0.5 sm:space-y-1 px-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">NET PROFIT</span>
                    <span className="text-xl sm:text-2xl font-black text-[#00FFA3] tracking-tight hover:scale-105 transition-transform duration-300">+$95</span>
                    <span className="text-[8px] font-medium text-slate-500 lowercase">+12.4 units</span>
                  </div>

                  <div className="flex flex-col justify-center space-y-0.5 sm:space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">LAST RESULTS</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight hover:scale-105 transition-transform duration-300">8/10</span>
                    <span className="text-[8px] font-medium text-slate-500 lowercase">verified daily</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Signals Section */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">TODAY'S SIGNALS</h3>
              <span className="text-xs font-black text-[#00FFA3] uppercase tracking-[0.2em]">1 FREE | 6 LOCKED</span>
            </div>

            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-3"
            >
              <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">6 HIGH-CONFIDENCE PICKS LOCKED TODAY</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">AI ELITE ACCESS UNLOCKS THE FULL BOARD INSTANTLY</p>
              </div>
            </motion.div>
            
            <div className="space-y-3">
              {freePick && (
                <LockedPickCard 
                  isFree 
                  home={freePick.home || "CRYSTAL PALACE"} 
                  away={freePick.away || "FIORENTINA"} 
                  tip={freePick.tip || "OVER 1.5 GOALS"} 
                  confidence={76} 
                  odds="1.35" 
                  icon={Star} 
                />
              )}

              <LockedPickCard 
                title="PREMIUM AI BET OF THE DAY" 
                confidence={91} 
                odds="SCANNING" 
                icon={Zap} 
                color="amber"
                footerText="ELITE ANALYSIS LOCKED"
              />
              <LockedPickCard 
                title="PREMIUM AI ELITE COMBO" 
                confidence={75} 
                odds="SCANNING" 
                icon={Flame} 
                color="teal"
                footerText="REVEAL MULTI-BET STRATEGY"
              />
              <LockedPickCard 
                title="AI VERIFIED PICKS" 
                confidence={88} 
                odds="SCANNING" 
                icon={Target} 
                color="blue"
                footerText="VIEW VERIFIED HIGH-CONFIDENCE PICKS"
                badge="AI VERIFIED PICKS"
              />
            </div>
          </motion.div>

          {/* Performance Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full"
              >
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">LIVE PERFORMANCE</span>
              </motion.div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">TODAY'S AI PICKS ARE LIVE</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">LAST RESULTS</p>
              </div>

              <div className="space-y-1">
                <motion.div 
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter leading-none"
                >
                  8/10 Won
                </motion.div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">VERIFIED DAILY RESULTS</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em]">NET PROFIT</p>
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  className="text-4xl sm:text-5xl font-black text-[#00FFA3] italic leading-none drop-shadow-[0_0_30px_rgba(0,255,163,0.5)]"
                >
                  +$95
                </motion.div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="text-xl font-black text-white italic">+12.4 UNITS</span>
                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-black text-slate-500 uppercase tracking-widest">VERIFIED</span>
              </div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-slate-950/50 border border-white/5 rounded-3xl p-6 space-y-1"
              >
                <div className="text-xl sm:text-2xl font-black text-white italic tracking-tighter">80% Win Rate</div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">LAST 50 AI SIGNALS</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Pricing Section */}
          <div className="space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <PricingTier 
                isPremium
                badge="MOST POPULAR"
                bestValue
                title="AI ELITE ACCESS"
                subtext="UNLOCK THE FULL AI SYSTEM."
                price="$29.99"
                originalPrice="$49.99"
                features={["BET OF THE DAY", "ELITE COMBO", "AI VERIFIED PICKS"]}
                supportingLine="MULTIPLE STRATEGIES. HIGHER PROFIT POTENTIAL. MORE WINNING OPPORTUNITIES."
                ctaText="UNLOCK FULL AI ACCESS"
                onSelect={() => handlePayPalCheckout('premium')}
              />
            </motion.div>
          </div>

          {/* Footer Trust Signals */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-8 pb-10"
          >
            <h3 className="text-lg font-black text-[#00FFA3] italic uppercase tracking-tighter leading-tight max-w-[280px] mx-auto">
              MOST USERS CHOOSE ELITE FOR FULL ACCESS AND HIGHER WIN POTENTIAL
            </h3>
            
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-2"><Check size={14} className="text-[#00FFA3]" /> INSTANT ACCESS</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-[#00FFA3]" /> SECURE PAYMENT</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-[#00FFA3]" /> CANCEL ANYTIME</div>
            </div>
          </motion.div>

          {errorMessage && (
            <div className="fixed bottom-6 left-6 right-6 z-[100] p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase italic backdrop-blur-md">
              <ShieldCheck size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;
