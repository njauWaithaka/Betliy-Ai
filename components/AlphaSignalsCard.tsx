import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Zap, Target, Lock as LockIcon, Unlock as UnlockIcon, Crown, ShieldCheck, Flame, Star, Radar } from 'lucide-react';
import { cn } from '../services/utils';

interface AlphaSignal {
  home: string;
  away: string;
  homeLogo?: string;
  awayLogo?: string;
  league: string;
  date: string;
  odds: string | number;
  confidence: string | number;
  isPremium?: boolean;
  type?: string;
}

interface AlphaSignalsCardProps {
  signals: AlphaSignal[];
  isPremium?: boolean;
  onSignalClick?: (signal: AlphaSignal) => void;
  totalVerifiedPicks?: number;
}

const TeamLogo: React.FC<{ url?: string; name: string; size?: string }> = ({ url, name, size = "w-8 h-8" }) => (
  <div className={`${size} rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl relative group`}>
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    {url ? (
      <img src={url} alt={name} className="w-[80%] h-[80%] object-contain relative z-10" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.display = 'none')} />
    ) : (
      <span className="text-[8px] font-black text-emerald-500 uppercase relative z-10">{String(name).substring(0, 2)}</span>
    )}
  </div>
);

const AlphaSignalsCard: React.FC<AlphaSignalsCardProps> = ({ signals, isPremium, onSignalClick, totalVerifiedPicks }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Zap size={16} className="text-emerald-400" />
            </div>
            <h2 className="text-base sm:text-2xl font-black text-white italic uppercase tracking-wider">🎯 Daily Free Picks</h2>
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider mt-1.5 ml-10">
            FREE EXPERT AND AI-DRIVEN PREDICTIONS EVERY DAY.
          </p>
          {totalVerifiedPicks !== undefined && (
            <div className="text-[8px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mt-1.5 ml-10">
              {totalVerifiedPicks} VERIFIED PICKS
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] sm:text-xs font-black text-emerald-500 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-4 sm:space-y-6">
        {signals.map((signal, idx) => {
          const isBOTD = signal.type?.toLowerCase().includes('bet of the day');
          const isBanker = signal.type?.toLowerCase().includes('daily banker');
          const isCombo = signal.type?.toLowerCase().includes('elite combo');
          const isVerified = signal.type?.toLowerCase().includes('verified picks');
          const isFree = !signal.isPremium && !isBOTD && !isBanker && !isCombo && !isVerified;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.15, duration: 0.6, ease: "easeOut" }}
              onClick={() => onSignalClick?.(signal)}
              className={cn(
                "bg-slate-900/40 border rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-10 hover:bg-slate-800/60 transition-all group relative overflow-hidden backdrop-blur-md shadow-2xl cursor-pointer active:scale-[0.98] min-h-[100px] touch-target",
                isFree ? "border-white/5 hover:border-slate-500/30" : 
                isBOTD ? "border-amber-500/20 hover:border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.15)]" :
                isBanker ? "border-blue-500/20 hover:border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)]" :
                isCombo ? "border-purple-500/20 hover:border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.15)]" :
                "border-emerald-500/20 hover:border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)]",
                (signal.isPremium && !isPremium) ? 'grayscale-[0.3]' : ''
              )}
            >
              {/* Type Label */}
              <div className={cn(
                "absolute top-0 left-0 px-3 py-1 rounded-br-xl text-[8px] sm:text-[11px] font-black uppercase italic tracking-widest z-30 flex items-center gap-1.5 shadow-lg",
                isFree ? "bg-slate-800 text-slate-400" :
                isBOTD ? "bg-amber-500 text-slate-950" :
                isBanker ? "bg-blue-500 text-white" :
                isCombo ? "bg-purple-500 text-white" :
                "bg-emerald-500 text-slate-950"
              )}>
                {isFree ? <Radar size={10} /> :
                 isBOTD ? <Zap size={10} /> :
                 isBanker ? <ShieldCheck size={10} /> :
                 isCombo ? <Flame size={10} /> :
                 <Target size={10} />}
                {isFree ? "Free" : (
                  (isBOTD || isBanker || isCombo || isVerified) && !signal.type?.toLowerCase().startsWith('premium') 
                    ? `Premium ${signal.type}` 
                    : signal.type
                )}
              </div>

              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:opacity-100 transition-opacity opacity-50",
                isFree ? "bg-slate-500/5" :
                isBOTD ? "bg-amber-500/10" :
                isBanker ? "bg-blue-500/10" :
                isCombo ? "bg-purple-500/10" :
                "bg-emerald-500/10"
              )} />
              
              {signal.isPremium && !isPremium && (
                <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-[6px] flex flex-col items-center justify-center p-4 text-center group-hover:bg-slate-950/50 transition-all">
                  <div className={cn(
                    "w-12 h-12 rounded-full border flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                    isBOTD ? "bg-amber-500/20 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]" :
                    isBanker ? "bg-blue-500/20 border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]" :
                    "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  )}>
                    <LockIcon size={20} />
                  </div>
                  <div className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] italic mb-1",
                    isBOTD ? "text-amber-400" : isBanker ? "text-blue-400" : "text-emerald-400"
                  )}>
                    🔒 {signal.type || 'PREMIUM PICK'}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unlock to view full prediction</div>
                </div>
              )}
              
              {signal.isPremium && isPremium && (
                <div className="absolute top-2 right-2 z-30">
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-0.5 border rounded-full text-[7px] font-black uppercase italic",
                    isBOTD ? "bg-amber-500/20 border-amber-500/30 text-amber-400" :
                    isBanker ? "bg-blue-500/20 border-blue-500/30 text-blue-400" :
                    "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                  )}>
                    <UnlockIcon size={8} />
                    UNLOCKED
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative z-10 mt-4">
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="flex -space-x-3 sm:-space-x-4">
                    <TeamLogo url={(signal.isPremium && !isPremium) ? undefined : signal.homeLogo} name={(signal.isPremium && !isPremium) ? '?' : signal.home} size="w-10 h-10 sm:w-16 sm:h-16" />
                    <TeamLogo url={(signal.isPremium && !isPremium) ? undefined : signal.awayLogo} name={(signal.isPremium && !isPremium) ? '?' : signal.away} size="w-10 h-10 sm:w-16 sm:h-16" />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[8px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest">{signal.league}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-[8px] sm:text-[11px] font-bold text-emerald-500/60 uppercase">{signal.date}</span>
                    </div>
                    <h3 className="text-sm sm:text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                      {signal.isPremium && !isPremium ? (
                        <span className={cn(
                          isBOTD ? "text-amber-400" : isBanker ? "text-blue-400" : "text-emerald-400"
                        )}>{signal.type || 'PREMIUM SIGNAL'}</span>
                      ) : (
                        <>
                          {signal.home} <span className="text-slate-600 mx-0.5 sm:mx-1">V</span> {signal.away}
                        </>
                      )}
                    </h3>
                    <div className="text-[10px] sm:text-lg font-black text-white italic mt-1">
                      {signal.isPremium && isVerified ? (
                        <span className="text-emerald-500/80">{totalVerifiedPicks} PICKS</span>
                      ) : (
                        <span className={cn(isFree ? "text-emerald-400" : "text-white")}>@ {signal.odds}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-3 border-t border-white/5 sm:border-none pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[8px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Confidence</div>
                    <div className={cn(
                      "text-lg sm:text-2xl font-black italic leading-none",
                      isBOTD ? "text-amber-400" : isBanker ? "text-blue-400" : "text-emerald-400"
                    )}>{signal.confidence}%</div>
                  </div>
                  <div className="w-20 sm:w-40 h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${parseInt(String(signal.confidence))}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={cn(
                        "h-full shadow-lg",
                        isBOTD ? "bg-amber-500 shadow-amber-500/50" :
                        isBanker ? "bg-blue-500 shadow-blue-500/50" :
                        "bg-emerald-500 shadow-emerald-500/50"
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AlphaSignalsCard;
