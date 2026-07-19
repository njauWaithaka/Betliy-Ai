import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Trophy, TrendingUp, AlertTriangle, HelpCircle, Check, X, ShieldCheck, RefreshCw } from 'lucide-react';
import { cn } from '../services/utils';
import { FirebasePick } from '../types';

interface PerformanceTrackerProps {
  premiumHistory: FirebasePick[];
  isLoading: boolean;
  onUnlockPremium?: () => void;
  isPremium?: boolean;
}

export const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({
  premiumHistory,
  isLoading,
  onUnlockPremium,
  isPremium = false
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const streakData = useMemo(() => {
    if (!premiumHistory || premiumHistory.length === 0) {
      return { type: 'none', count: 0, winRate: 0, last10: [] };
    }

    // Sort by date descending (newest first)
    const sorted = [...premiumHistory].sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return dateB.localeCompare(dateA);
    });

    // Filter for resolved picks with status 'win' or 'loss'
    const resolved = sorted.filter(p => p.status === 'win' || p.status === 'loss');
    
    // Take the last 10 resolved premium picks
    const last10 = resolved.slice(0, 10);

    if (last10.length === 0) {
      return { type: 'none', count: 0, winRate: 0, last10: [] };
    }

    const firstStatus = last10[0].status; // 'win' or 'loss'
    let count = 0;

    for (const pick of last10) {
      if (pick.status === firstStatus) {
        count++;
      } else {
        break;
      }
    }

    const winsCount = last10.filter(p => p.status === 'win').length;
    const winRate = (winsCount / last10.length) * 100;

    return {
      type: firstStatus === 'win' ? 'win' : 'loss',
      count,
      winRate: Math.round(winRate),
      last10
    };
  }, [premiumHistory]);

  const { type, count, winRate, last10 } = streakData;

  if (isLoading) {
    return (
      <div className="bg-slate-900/40 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-slate-800 rounded-md" />
          <div className="h-3 w-16 bg-slate-800 rounded-full" />
        </div>
        <div className="flex items-center gap-4 py-2">
          <div className="w-12 h-12 rounded-full bg-slate-800" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-40 bg-slate-800 rounded-md" />
            <div className="h-3 w-28 bg-slate-800 rounded-md" />
          </div>
        </div>
        <div className="flex justify-between gap-1.5 pt-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-900/40 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 space-y-5 relative overflow-hidden backdrop-blur-md group hover:border-emerald-500/20 transition-all duration-500"
    >
      {/* Glow Effect */}
      <div className={cn(
        "absolute -right-12 -bottom-12 w-32 h-32 blur-3xl rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700",
        type === 'win' ? "bg-emerald-400" : type === 'loss' ? "bg-rose-400" : "bg-blue-400"
      )} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Trophy size={14} className={cn(type === 'win' ? 'text-emerald-400' : 'text-slate-400')} />
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Performance Tracker</span>
        </div>
        <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          Live Stats
        </span>
      </div>

      {/* Main Stats Area */}
      {last10.length > 0 ? (
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500",
            type === 'win' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-110' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)] group-hover:scale-110'
          )}>
            <Flame size={22} className={cn(type === 'win' ? 'animate-pulse' : '')} />
          </div>
          <div className="text-left">
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">
              CURRENT PREMIUM STREAK
            </div>
            <div className="text-lg sm:text-xl font-black italic tracking-tighter uppercase leading-none">
              {count} GAME {type === 'win' ? 'WIN' : 'LOSS'} STREAK
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 flex items-center gap-2">
              <span>Last 10 Win Rate:</span>
              <span className={cn("font-black italic", winRate >= 70 ? 'text-emerald-400' : 'text-yellow-400')}>
                {winRate}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 py-1">
          <HelpCircle size={16} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-400 uppercase">No resolved premium picks found</span>
        </div>
      )}

      {/* Timeline Grid (Last 10 picks) */}
      {last10.length > 0 && (
        <div className="space-y-3 pt-1 border-t border-white/5 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
              Last 10 Outcomes (Newest Left)
            </span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              {last10.filter(p => p.status === 'win').length}W – {last10.filter(p => p.status === 'loss').length}L
            </span>
          </div>

          <div className="flex justify-between gap-1.5 relative">
            {last10.map((pick, idx) => {
              const isWin = pick.status === 'win';
              return (
                <div
                  key={idx}
                  className="relative flex-1 flex justify-center"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-[10px] font-black transition-all cursor-pointer relative",
                      isWin 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 shadow-inner' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 shadow-inner'
                    )}
                  >
                    {isWin ? <Check size={12} className="stroke-[3]" /> : <X size={12} className="stroke-[3]" />}
                    
                    {/* Tiny index indicator */}
                    <span className="absolute -bottom-1.5 text-[6px] font-bold text-slate-600">
                      {idx + 1}
                    </span>
                  </motion.div>

                  {/* High Quality Interactive Tooltip */}
                  <AnimatePresence>
                    {hoveredIndex === idx && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: -90, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 z-[200] w-48 bg-slate-950 border border-white/15 p-3 rounded-xl shadow-2xl backdrop-blur-md text-left space-y-1.5 mb-2 pointer-events-none"
                      >
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2.5 h-2.5 bg-slate-950 border-r border-b border-white/15 rotate-45" />
                        
                        <div className="flex justify-between items-center border-b border-white/5 pb-1">
                          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[100px]">
                            {pick.league || 'Premium League'}
                          </span>
                          <span className={cn(
                            "px-1 py-0.5 rounded text-[6px] font-black uppercase tracking-widest leading-none",
                            isWin ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                            {isWin ? 'Won' : 'Lost'}
                          </span>
                        </div>
                        
                        <div className="text-[10px] font-black text-white truncate">
                          {pick.home} v {pick.away}
                        </div>
                        
                        <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                          <span>Tip: <span className="text-white uppercase">{pick.tip}</span></span>
                          <span className="text-emerald-400">@{pick.odds?.toFixed(2)}</span>
                        </div>
                        
                        {pick.score && (
                          <div className="text-[8px] font-bold text-slate-500 flex justify-between">
                            <span>Score: <span className="text-slate-300 font-black">{pick.score}</span></span>
                            <span>{pick.date}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
