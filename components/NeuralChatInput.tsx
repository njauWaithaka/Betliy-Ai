import React from 'react';
import { BrainCircuit, MessageSquareLock, Zap, Lock, ChevronRight, Trophy, ShieldCheck, Unlock, Flame, Crown, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../services/utils';

interface NeuralChatInputProps {
  loading: boolean;
  isPremium?: boolean;
  onQuickAction?: (action: string, isFree?: boolean) => void;
}

const QUICK_PACKS = [
  { 
    id: 'botd', 
    label: 'BET OF THE DAY', 
    icon: Zap, 
    color: 'text-orange-400', 
    border: 'border-orange-500/30', 
    glow: 'shadow-orange-500/20', 
    desc: 'ONE HIGH-CONFIDENCE MATCH PER DAY. CLEAN & SIMPLE.',
    isFree: false 
  },
  { 
    id: 'toppicks', 
    label: 'TOP PICKS', 
    icon: Trophy, 
    color: 'text-amber-400', 
    border: 'border-amber-500/30', 
    glow: 'shadow-amber-500/20',
    desc: 'STRONGEST VALUE, PROBABILITY AND FORM SIGNALS.',
    isFree: false
  },
  { 
    id: 'elitecombo', 
    label: 'ELITE COMBO', 
    icon: Flame, 
    color: 'text-rose-400', 
    border: 'border-rose-500/30', 
    glow: 'shadow-rose-500/20',
    desc: 'TWO OR MORE HIGH-PROBABILITY LEGS STACKED FOR AMPLIFIED VALUE.',
    isFree: false
  },
  { 
    id: 'alphasignals', 
    label: '🎯 DAILY FREE PICKS', 
    icon: Zap, 
    color: 'text-blue-400', 
    border: 'border-blue-500/30', 
    glow: 'shadow-blue-500/20',
    desc: 'FREE EXPERT AND AI-DRIVEN PREDICTIONS EVERY DAY.',
    isFree: true
  },
];

const NeuralChatInput: React.FC<NeuralChatInputProps> = ({ loading, isPremium, onQuickAction }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative group"
    >
      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-emerald-500/10 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
      
      <div className="relative bg-slate-950/90 border border-emerald-500/20 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl space-y-4 sm:space-y-8 backdrop-blur-2xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-1 sm:px-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-emerald-500/10 rounded-lg sm:rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <BrainCircuit className="text-emerald-400 animate-pulse" size={14} />
            </div>
            <div>
              <h3 className="text-[8px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] sm:tracking-[0.4em] italic leading-none">BETLIFY COMMAND HUB</h3>
            </div>
          </div>
          <div className="relative group/badge self-start sm:self-auto">
            <div className="absolute -inset-0.5 bg-emerald-500 rounded-lg sm:rounded-xl blur-[2px] sm:blur-[3px] opacity-40 group-hover/badge:opacity-100 transition-opacity animate-pulse" />
            <div className="relative flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-slate-950 text-[7px] sm:text-[9px] font-black uppercase italic rounded-lg sm:rounded-xl shadow-lg border border-white/20">
              <MessageSquareLock size={8} className="group-hover/badge:rotate-12 transition-transform sm:w-[10px] sm:h-[10px]" />
              <span className="tracking-tighter">MARKET ANALYSIS</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:gap-4 px-1 sm:px-2">
           {QUICK_PACKS.map((pack, idx) => (
             <motion.button 
               key={pack.id} 
               initial={{ opacity: 0, x: -5 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.05, duration: 0.2 }}
               type="button" 
               disabled={loading} 
               onClick={() => onQuickAction?.(pack.label, pack.isFree)} 
               className={cn(
                 "flex items-center justify-between p-3 sm:p-5 bg-slate-900/60 border rounded-xl sm:rounded-3xl hover:bg-slate-800/80 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all duration-500 group/chip relative overflow-hidden disabled:opacity-50 text-left",
                 pack.border
               )}
             >
               <div className="flex items-center gap-2 sm:gap-4 relative z-10">
                 <div className={cn(
                   "p-1.5 sm:p-2.5 rounded-lg sm:rounded-2xl bg-slate-950 border border-white/5 transition-all duration-500 group-hover/chip:scale-110 shadow-lg",
                   pack.color,
                   pack.glow
                 )}>
                   <pack.icon size={14} className="sm:w-[18px] sm:h-[18px]" />
                 </div>
                 <div className="text-left leading-none">
                    <span className="text-[9px] sm:text-[11px] font-black text-white uppercase italic tracking-tighter flex items-center gap-1.5 sm:gap-2 group-hover/chip:text-emerald-400 transition-colors">
                      {pack.label}
                    </span>
                    <div className="text-[5px] sm:text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1 sm:mt-1.5 w-full max-w-full leading-tight">
                      {pack.desc}
                    </div>
                 </div>
               </div>
               <div className="relative z-10 flex flex-col items-center gap-1">
                 {pack.isFree || isPremium ? (
                   <Unlock size={10} className="text-emerald-500 sm:w-[12px] sm:h-[12px]" />
                 ) : (
                   <Lock size={10} className="text-slate-800 group-hover/chip:text-emerald-400 transition-colors sm:w-[12px] sm:h-[12px]" />
                 )}
                 <ChevronRight size={10} className="text-slate-700 group-hover/chip:text-emerald-500 transition-transform group-hover/chip:translate-x-1 sm:w-[12px] sm:h-[12px]" />
               </div>
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-white/5 to-transparent -translate-x-full group-hover/chip:translate-x-0 transition-transform duration-1000" />
             </motion.button>
           ))}
        </div>

      </div>
    </motion.div>
  );
};

export default NeuralChatInput;
