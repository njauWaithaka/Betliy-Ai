import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Target, ShieldCheck, ChevronRight, ExternalLink, Flame, ChevronDown, BrainCircuit, Lock as LockIcon, Radar } from 'lucide-react';
import { cn } from '../services/utils';
import { EliteComboPick } from '../types';

interface EliteComboCardProps {
  picks: EliteComboPick[];
  isPremium?: boolean;
  onUnlock?: () => void;
  onPlaceBet?: () => void;
}

const TeamLogo: React.FC<{ url?: string; name: string; size?: string }> = ({ url, name, size = "w-8 h-8" }) => (
  <div className={`${size} rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative group`}>
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    {url ? (
      <img src={url} alt={name} className="w-[80%] h-[80%] object-contain relative z-10" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.display = 'none')} />
    ) : (
      <span className="text-[8px] font-black text-emerald-500 uppercase relative z-10">{String(name).substring(0, 2)}</span>
    )}
  </div>
);

const EliteComboCard: React.FC<EliteComboCardProps> = ({ picks, isPremium, onUnlock, onPlaceBet }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  if (!picks || picks.length === 0) {
    return (
      <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[2rem] text-center">
        <p className="text-slate-500 font-bold italic">No Elite Combo available today</p>
      </div>
    );
  }

  const totalOdds = picks.reduce((acc, pick) => acc * (Number(pick.odds) || 1), 1);
  const totalPicks = picks.length;

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4 pb-24 relative"
    >
      {/* Type Label */}
      <div className="absolute top-0 left-0 px-4 py-1.5 bg-purple-500 text-white rounded-br-2xl text-[10px] font-black uppercase italic tracking-[0.2em] z-[60] flex items-center gap-2 shadow-2xl">
        <Flame size={12} />
        Elite Combo
      </div>

      {/* Header Card */}
      <div className="bg-gradient-to-br from-emerald-500/20 via-slate-900/90 to-slate-950 border border-emerald-500/30 p-6 rounded-[2rem] relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)] pt-12">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full -mr-16 -mt-16 animate-pulse" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[8px] font-black uppercase italic rounded">PREMIUM MULTIBET</div>
              <div className="flex items-center gap-1 text-emerald-400">
                <Zap size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">Elite Combo</span>
              </div>
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
              ELITE COMBO
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              {totalPicks} Picks Combined
            </p>
          </div>

          <div className="bg-slate-950/50 border border-emerald-500/30 px-6 py-3 rounded-2xl backdrop-blur-md">
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Total Odds</div>
            <div className="text-3xl font-black text-emerald-400 italic leading-none drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              {isPremium ? `@ ${totalOdds.toFixed(2)}` : "🔒 LOCKED"}
            </div>
          </div>
        </div>
      </div>

      {/* Picks List */}
      <div className="space-y-2">
        {picks.map((pick, idx) => {
          const isLocked = !isPremium || !!pick.locked;

          if (isLocked) {
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl hover:border-amber-500/20 transition-all relative group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex -space-x-2">
                      <TeamLogo url={pick.homeLogo} name={pick.homeTeam} />
                      <TeamLogo url={pick.awayLogo} name={pick.awayTeam} />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest truncate">
                          {pick.league}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-white italic uppercase tracking-tight truncate">
                        {pick.homeTeam} <span className="text-slate-600 mx-0.5">V</span> {pick.awayTeam}
                      </h4>
                      <div className="text-[9px] font-bold text-amber-500 italic mt-0.5">
                        🔒 Locked Premium Pick — Upgrade to Unlock
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl hover:border-emerald-500/20 transition-all group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex -space-x-2">
                    <TeamLogo url={pick.homeLogo} name={pick.homeTeam} />
                    <TeamLogo url={pick.awayLogo} name={pick.awayTeam} />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest truncate">
                        {pick.league} {pick.country && `• ${pick.country}`}
                      </span>
                      <div className={`px-1.5 py-0.5 rounded text-[6px] font-black uppercase ${
                        pick.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                        pick.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {pick.riskLevel}
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-white italic uppercase tracking-tight truncate">
                      {pick.homeTeam} <span className="text-slate-600 mx-0.5">V</span> {pick.awayTeam}
                    </h4>
                    <div className="text-[9px] font-bold text-emerald-500/80 italic mt-0.5">
                      {pick.tip}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Confidence</div>
                    <div className="text-xs font-black text-white italic tabular-nums">{pick.aiConfidence}%</div>
                  </div>
                  
                  <div className="bg-slate-950 border border-white/5 px-3 py-2 rounded-xl min-w-[60px] text-center group-hover:border-emerald-500/30 transition-colors">
                    <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Odds</div>
                    <div className="text-sm font-black text-emerald-400 italic tabular-nums">@ {pick.odds}</div>
                  </div>
                </div>
              </div>

              {/* Analysis Dropdown */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <button 
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black text-emerald-400/60 uppercase tracking-widest hover:text-emerald-400 transition-colors touch-target px-2 py-1"
                >
                  <BrainCircuit size={10} />
                  VIEW ANALYSIS
                  <ChevronDown size={10} className={`transition-transform ${expandedIdx === idx ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {expandedIdx === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="py-3 text-[10px] text-slate-400 leading-relaxed font-medium italic whitespace-pre-wrap">
                        {pick.analysis || "Neural scan confirms high-value probability for this market. Form and statistical trends align with the current tip."}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="pt-2">
        {isPremium ? (
          <button 
            onClick={onPlaceBet}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black uppercase italic text-xs transition-all shadow-lg shadow-emerald-500/20 group touch-target"
          >
            <Flame size={14} className="group-hover:animate-bounce" />
            Place Bet
          </button>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center mt-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">🔒 Unlock Today's High-Odds Elite Combo</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto mb-4 leading-relaxed">
              Get instant access to this high-odds multi-bet ticket and the full neural breakdown.
            </p>
            <button 
              onClick={onUnlock}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black uppercase text-[10px] transition-all shadow-lg shadow-emerald-500/20 touch-target"
            >
              Upgrade to Unlock
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EliteComboCard;
