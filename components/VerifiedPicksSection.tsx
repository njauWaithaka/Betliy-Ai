import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Check, 
  Trophy, 
  AlertTriangle, 
  TrendingUp,
  LayoutGrid,
  Layers,
  Info,
  ArrowRight,
  Radar
} from 'lucide-react';
import { cn } from '../services/utils';
import { FirebasePick } from '../types';

interface VerifiedPicksSectionProps {
  picks: FirebasePick[];
  isPremium: boolean;
  onAddPick: (pick: FirebasePick) => void;
  onRemovePick: (pick: FirebasePick) => void;
  selectedPicks: FirebasePick[];
  onViewAnalysis: (pick: FirebasePick) => void;
}

const RiskBadge: React.FC<{ level: string }> = ({ level }) => {
  const colors = {
    Low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    High: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  const colorClass = colors[level as keyof typeof colors] || colors.Medium;

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${colorClass}`}>
      {level} Risk
    </span>
  );
};

const VerifiedPickCard: React.FC<{
  pick: FirebasePick;
  isPremium: boolean;
  onAdd: () => void;
  onRemove: () => void;
  isSelected: boolean;
  onViewAnalysis: () => void;
}> = ({ pick, isPremium, onAdd, onRemove, isSelected, onViewAnalysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const confidenceColor = (conf: number) => {
    if (conf >= 85) return 'text-blue-400';
    if (conf >= 75) return 'text-emerald-400';
    return 'text-yellow-400';
  };

  const confidence = typeof pick.confidence === 'string' ? parseInt(pick.confidence) : (pick.aiConfidence || 77);

  return (
    <motion.div 
      layout
      className="bg-slate-900/40 border border-white/5 rounded-2xl sm:rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-colors group relative pt-8"
    >
      {/* Type Label */}
      <div className="absolute top-0 left-0 px-4 py-1.5 bg-emerald-500 text-slate-950 rounded-br-2xl text-[9px] sm:text-[11px] font-black uppercase italic tracking-widest z-30 flex items-center gap-2 shadow-lg">
        <Target size={12} />
        {pick.package || 'Verified Pick'}
      </div>
      {/* Header: League + Odds */}
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/20">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
            {pick.leagueLogoUrl ? (
              <img src={pick.leagueLogoUrl} alt={pick.league} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <Trophy size={14} className="text-slate-500" />
            )}
          </div>
          <span className="text-[11px] sm:text-sm font-black text-slate-400 uppercase tracking-wider truncate max-w-[150px]">
            {pick.league}
          </span>
        </div>
        <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <span className="text-sm sm:text-base font-black text-emerald-400">@{pick.odds?.toFixed(2)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-10 space-y-6">
        {/* Teams */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
              {pick.homeLogo ? (
                <img src={pick.homeLogo} alt={pick.home} className="w-full h-full object-contain p-3" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-sm font-black text-slate-500">{pick.home?.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-200 text-center line-clamp-1">{pick.home}</span>
          </div>
          
          <div className="text-xs font-black text-slate-600 uppercase italic">VS</div>

          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
              {pick.awayLogo ? (
                <img src={pick.awayLogo} alt={pick.away} className="w-full h-full object-contain p-3" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-sm font-black text-slate-500">{pick.away?.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-200 text-center line-clamp-1">{pick.away}</span>
          </div>
        </div>

        {/* Pick Info */}
        <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">Neural Pick</span>
          </div>
          <div className="text-base sm:text-xl font-black text-emerald-400 uppercase tracking-tight">{pick.tip}</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">Confidence</span>
            <div className={`text-sm sm:text-lg font-black ${confidenceColor(confidence)}`}>{confidence}%</div>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">Risk Level</span>
            <RiskBadge level={pick.riskFactor || 'Medium'} />
          </div>
        </div>

        {/* Quick Edge */}
        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center gap-2.5 mb-3">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Quick Edge</span>
          </div>
          <ul className="space-y-2.5">
            {(pick.preview_ui?.bullet_points || []).slice(0, 2).map((point: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-1.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Expand Toggle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-black text-slate-500 uppercase hover:text-slate-300 transition-colors min-h-[44px]"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isExpanded ? 'Full Neural Breakdown' : 'Full Neural Breakdown'}
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-6 border-t border-white/5">
                {pick.preview_ui?.sections.map((section: { heading: string; body: string }, i: number) => (
                  <div key={i} className="space-y-2">
                    <h4 className="text-[11px] sm:text-xs font-black text-emerald-400 uppercase tracking-widest">{section.heading}</h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed italic">{section.body}</p>
                  </div>
                ))}
                {pick.preview_ui?.summary && (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <h4 className="text-[11px] sm:text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Final Verdict</h4>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">{pick.preview_ui.summary}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const VerifiedPicksSection: React.FC<VerifiedPicksSectionProps> = ({ 
  picks, 
  isPremium, 
  onAddPick, 
  onRemovePick, 
  selectedPicks,
  onViewAnalysis
}) => {
  const [viewMode, setViewMode] = useState<'single' | 'combine'>('single');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const avgConfidence = Math.round(picks.reduce((acc, p) => acc + (p.aiConfidence || 77), 0) / (picks.length || 1));
  
  const riskCounts = picks.reduce((acc: Record<string, number>, p) => {
    const risk = p.riskFactor || 'Medium';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskMix = Object.entries(riskCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([risk]) => risk)
    .slice(0, 2)
    .join('–');

  return (
    <div ref={containerRef} className="space-y-8 sm:space-y-12 w-full">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter italic">Verified Picks</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-400 font-bold italic">High-confidence single bets analyzed by the AI system.</p>
          </div>
        </div>

        {/* Stat Bar */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-10 px-6 py-4 bg-slate-900/40 border border-white/5 rounded-2xl sm:rounded-[2rem]">
          <div className="flex items-center gap-3">
            <Check size={18} className="text-emerald-500 sm:w-[22px] sm:h-[22px]" />
            <span className="text-[10px] sm:text-xs font-black text-slate-300 uppercase tracking-widest">{picks.length} Picks Today</span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-blue-400 sm:w-[22px] sm:h-[22px]" />
            <span className="text-[10px] sm:text-xs font-black text-slate-300 uppercase tracking-widest">Avg Confidence: {avgConfidence}%</span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-yellow-500 sm:w-[22px] sm:h-[22px]" />
            <span className="text-[10px] sm:text-xs font-black text-slate-300 uppercase tracking-widest">Risk Mix: {riskMix}</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {picks.map((pick, idx) => (
          <VerifiedPickCard 
            key={`${pick.home}-${pick.away}-${idx}`}
            pick={pick}
            isPremium={isPremium}
            onAdd={() => onAddPick(pick)}
            onRemove={() => onRemovePick(pick)}
            isSelected={selectedPicks.some(p => p.home === pick.home && p.away === pick.away)}
            onViewAnalysis={() => onViewAnalysis(pick)}
          />
        ))}
      </div>
    </div>
  );
};

export default VerifiedPicksSection;
