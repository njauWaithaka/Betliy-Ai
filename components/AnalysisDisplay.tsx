import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { BetAnalysis, GroundingSource, Metric } from '../types';
import { Target, Zap, ShieldCheck, Flame, Star, Cpu, TrendingUp, AlertTriangle, ExternalLink, Globe, BarChart3, Activity, Send, Share2, Lock as LockIcon, Unlock as UnlockIcon, Sparkles, CheckCircle2, Radar } from 'lucide-react';
import { cn } from '../services/utils';
import { shortenTeamName } from '../constants';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, AreaChart, Area } from 'recharts';

interface AnalysisDisplayProps {
  analysis: BetAnalysis;
  isPremium: boolean;
  onPremiumAction: () => void;
  isHighestOdds?: boolean;
  totalVerifiedPicks?: number;
}

const TeamLogo: React.FC<{ url?: string; name: string; size?: string }> = ({ url, name, size = "w-12 h-12" }) => (
  <div className={`${size} rounded-xl bg-slate-900 border border-emerald-500/20 flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative group`}>
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    {url ? (
      <img src={url} alt={name} className="w-[80%] h-[80%] object-contain relative z-10" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.display = 'none')} />
    ) : (
      <span className="text-[10px] font-black text-emerald-500 uppercase relative z-10">{String(name).substring(0, 2)}</span>
    )}
  </div>
);

const SignalGraph: React.FC<{ signal?: string }> = ({ signal }) => {
  if (!signal) return null;
  const data = signal.split(',').map((val, i) => ({ name: i, value: parseInt(val.trim()) }));
  
  return (
    <div className="h-32 w-full mt-4 bg-slate-950/50 rounded-xl border border-white/5 p-2 overflow-hidden">
      <div className="flex items-center gap-2 mb-2 px-2">
        <Activity size={10} className="text-emerald-500" />
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Signal Flow</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSignal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const MetricGauge: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex-1 min-w-[100px] bg-slate-900/40 border border-white/5 p-3 rounded-xl">
    <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</div>
    <div className="flex items-end justify-between gap-2">
      <div className={`text-lg font-black italic leading-none ${color}`}>{value}%</div>
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden mb-1">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </div>
  </div>
);

const useNeuralInterpolation = (targetValue: number, duration: number = 2000) => {
// ... same as before ...
  const [value, setValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const currentValRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = null;
    startValueRef.current = currentValRef.current;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValueRef.current + (targetValue - startValueRef.current) * easeOutCubic;
      
      currentValRef.current = nextValue;
      setValue(nextValue);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [targetValue, duration]);

  return value;
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ 
  analysis, 
  isPremium, 
  onPremiumAction, 
  totalVerifiedPicks 
}) => {
  const interpolatedConfidence = useNeuralInterpolation(analysis.confidence, 2500);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLocked = !isPremium && analysis.pickType && analysis.pickType !== 'Free Pick' && analysis.pickType !== 'Alpha Signal';

  // 3D Tilt Effect Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      
      {/* 1) HERO SIGNAL HEADER (Sticky) */}
      <div className="sticky top-0 z-[60] -mx-4 sm:-mx-8 px-4 sm:px-8 py-2 sm:py-4 bg-slate-950/95 backdrop-blur-xl border-b border-emerald-500/20 flex items-center justify-between gap-2 sm:gap-6 shadow-xl">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <div className="flex -space-x-1.5 sm:-space-x-3 shrink-0">
            <TeamLogo url={analysis.homeLogo} name={String(analysis.homeTeam)} size="w-5 h-5 sm:w-10 sm:h-10" />
            <TeamLogo url={analysis.awayLogo} name={String(analysis.awayTeam)} size="w-5 h-5 sm:w-10 sm:h-10" />
          </div>
          <div className="truncate">
            <h4 className="text-[9px] sm:text-sm font-black text-white italic uppercase tracking-tighter truncate">
              <span className="sm:hidden">{shortenTeamName(String(analysis.homeTeam))} <span className="text-slate-600">v</span> {shortenTeamName(String(analysis.awayTeam))}</span>
              <span className="hidden sm:inline">{String(analysis.homeTeam)} <span className="text-slate-600">v</span> {String(analysis.awayTeam)}</span>
            </h4>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <span className="text-[7px] sm:text-[10px] font-black text-emerald-400 italic uppercase">{isLocked ? '🔒 PREMIUM' : analysis.tip}</span>
              <span className="text-[7px] sm:text-[10px] font-bold text-slate-500">@ {analysis.odds}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-8 shrink-0">
          <div className="text-right">
            <div className="text-[6px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">CONFIDENCE</div>
            <div className="text-xs sm:text-lg font-black text-emerald-400 italic tabular-nums leading-none mt-0.5">{Math.round(interpolatedConfidence)}%</div>
          </div>
        </div>
      </div>

      <motion.div 
        className="relative perspective-1000"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-[1.5rem] blur opacity-40" />
        <div className="relative bg-slate-950/80 border border-emerald-500/20 rounded-[1.25rem] sm:rounded-[1.5rem] overflow-hidden shadow-2xl backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.15)]">
           
            {/* Type Label */}
            <div className={cn(
              "absolute top-0 left-0 px-4 py-1.5 rounded-br-2xl text-[10px] font-black uppercase italic tracking-[0.2em] z-[70] flex items-center gap-2 shadow-2xl",
              analysis.pickType === 'Bet of the Day' ? "bg-amber-500 text-slate-950" :
              analysis.pickType === 'Daily Banker' ? "bg-blue-500 text-white" :
              analysis.pickType === 'Elite Signal' ? "bg-purple-500 text-white" :
              analysis.pickType === 'Free Pick' ? "bg-slate-800 text-slate-400" :
              "bg-emerald-500 text-slate-950"
            )}>
              {analysis.pickType === 'Bet of the Day' ? <Zap size={12} /> :
               analysis.pickType === 'Daily Banker' ? <ShieldCheck size={12} /> :
               analysis.pickType === 'Free Pick' ? <Radar size={12} /> :
               <Target size={12} />}
              {analysis.pickType === 'Free Pick' ? "Free Pick" : (
                (analysis.pickType === 'Bet of the Day' || analysis.pickType === 'Daily Banker' || analysis.pickType === 'Elite Signal' || analysis.pickType === 'Verified Pick')
                  ? `Premium AI ${analysis.pickType}`
                  : analysis.pickType || 'Alpha Signal'
              )}
            </div>

            <div className="p-5 sm:p-10 pt-12 sm:pt-16">
            {/* 2) PRIMARY SIGNAL CARD */}
            <div className={`relative p-5 sm:p-12 rounded-2xl sm:rounded-[3rem] mb-6 sm:mb-12 overflow-hidden group transition-all duration-700 ${
              analysis.pickType && analysis.pickType !== 'Free Pick' 
                ? analysis.pickType === 'Daily Banker'
                  ? 'bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border-2 border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] hover:shadow-[0_0_80px_rgba(245,158,11,0.35)]'
                  : 'bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 border-2 border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.25)] hover:shadow-[0_0_80px_rgba(16,185,129,0.35)]'
                : 'bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-slate-950 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
            }`}>
               {/* Background Effects */}
               {analysis.pickType && analysis.pickType !== 'Free Pick' ? (
                 <>
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                   <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />
                   
                   {/* Dynamic Glows */}
                   <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[80px] rounded-full animate-pulse pointer-events-none ${
                     analysis.pickType === 'Daily Banker' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                   }`} />
                   <div className={`absolute -bottom-24 -left-24 w-64 h-64 blur-[80px] rounded-full animate-pulse pointer-events-none ${
                     analysis.pickType === 'Daily Banker' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                   }`} />
                   
                   {/* Scanning Line */}
                   <div className={`absolute top-0 left-0 w-full h-[2px] z-20 opacity-50 animate-scan-line ${
                     analysis.pickType === 'Daily Banker' ? 'bg-amber-400' : 'bg-emerald-400'
                   }`} />

                   {/* Shimmer Overlay */}
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                   
                   {/* Sparkles for Banker */}
                   {analysis.pickType === 'Daily Banker' && (
                     <div className="absolute inset-0 pointer-events-none">
                       <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" />
                       <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-white rounded-full animate-ping delay-700" />
                       <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-ping delay-300" />
                     </div>
                   )}
                   
                   {/* Watermark Seal */}
                   <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none select-none">
                     <CheckCircle2 size={120} className="text-white rotate-12" />
                   </div>
                 </>
               ) : (
                 <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-emerald-500/10 blur-[40px] sm:blur-[60px] rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 animate-pulse" />
               )}
               
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                 <div className="space-y-4 w-full">
                   <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                     <div className={`px-1.5 py-0.5 text-[7px] sm:text-[8px] font-black uppercase italic rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden ${
                       analysis.pickType && analysis.pickType !== 'Free Pick' 
                        ? analysis.pickType === 'Daily Banker' 
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                          : 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-emerald-500 text-slate-950'
                     }`}>
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                       <span className="relative z-10">{analysis.pickType && analysis.pickType !== 'Free Pick' ? 'PREMIUM' : 'FREE'}</span>
                     </div>
                     
                     {analysis.pickType && analysis.pickType !== 'Free Pick' && (
                       <div className={`px-1.5 py-0.5 border text-[7px] sm:text-[8px] font-black uppercase italic rounded flex items-center gap-1 animate-bounce-subtle ${
                         analysis.pickType === 'Daily Banker' ? 'bg-amber-500/30 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                         analysis.pickType === 'Bet of the Day' ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                         'bg-blue-500/30 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                       }`}>
                         <Star size={6} fill="currentColor" />
                         {analysis.pickType}
                       </div>
                     )}

                     {analysis.riskFactor && (
                       <div className={`px-1.5 py-0.5 border text-[7px] sm:text-[8px] font-black uppercase italic rounded ${
                         analysis.riskFactor === 'Low' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                         analysis.riskFactor === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                         'bg-rose-500/10 border-rose-500/20 text-rose-400'
                       }`}>
                         {analysis.riskFactor} RISK
                       </div>
                     )}
                   </div>

                   {analysis.pickType && analysis.pickType !== 'Free Pick' && (
                     <div className={cn(
                       "mt-2 px-4 py-2 border rounded-xl backdrop-blur-md relative overflow-hidden group-hover:scale-[1.01] transition-all duration-300",
                       analysis.pickType === 'Daily Banker' ? 'bg-blue-500/5 border-blue-500/20' : 
                       analysis.pickType === 'Bet of the Day' ? 'bg-amber-500/5 border-amber-500/20' :
                       'bg-emerald-500/5 border-emerald-500/20'
                     )}>
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                       <div className="flex items-center gap-2 mb-1">
                         <Activity size={10} className={cn(
                           "animate-pulse",
                           analysis.pickType === 'Daily Banker' ? 'text-blue-400' : 
                           analysis.pickType === 'Bet of the Day' ? 'text-amber-400' :
                           'text-emerald-400'
                         )} />
                         <div className={cn(
                           "text-[7px] font-black uppercase tracking-[0.2em]",
                           analysis.pickType === 'Daily Banker' ? 'text-blue-500/70' : 
                           analysis.pickType === 'Bet of the Day' ? 'text-amber-500/70' :
                           'text-emerald-500/70'
                         )}>Neural Value Label</div>
                       </div>
                       <div className="text-[10px] sm:text-xs font-black text-white italic tracking-tight leading-tight uppercase flex items-center gap-2">
                         <span className={cn(
                           analysis.pickType === 'Daily Banker' ? 'text-blue-400' : 
                           analysis.pickType === 'Bet of the Day' ? 'text-amber-400' :
                           'text-emerald-400'
                         )}>[</span>
                         MAXIMUM NEURAL CONFIDENCE • PREMIUM VALUE SIGNAL • STATISTICAL ANOMALY
                         <span className={cn(
                           analysis.pickType === 'Daily Banker' ? 'text-blue-400' : 
                           analysis.pickType === 'Bet of the Day' ? 'text-amber-400' :
                           'text-emerald-400'
                         )}>]</span>
                       </div>
                     </div>
                   )}
                   
                   <div>
                     <div className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${
                       analysis.pickType && analysis.pickType !== 'Free Pick' 
                        ? analysis.pickType === 'Daily Banker' ? 'text-blue-500/50' : analysis.pickType === 'Bet of the Day' ? 'text-amber-500/50' : 'text-emerald-500/50'
                        : 'text-slate-500'
                     }`}>MARKET SELECTION</div>
                     <h3 className={`font-black text-white italic uppercase tracking-tighter leading-none ${
                       analysis.pickType && analysis.pickType !== 'Free Pick' 
                        ? analysis.pickType === 'Daily Banker' 
                          ? 'text-3xl sm:text-7xl drop-shadow-[0_0_25px_rgba(59,130,246,0.4)]' 
                          : analysis.pickType === 'Bet of the Day'
                            ? 'text-3xl sm:text-7xl drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                            : 'text-3xl sm:text-7xl drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                        : 'text-xl sm:text-5xl drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                     }`}>
                       {analysis.tip}
                     </h3>
                   </div>

                   <div className="flex items-center gap-6">
                     <div className="group/stat">
                       <div className="flex items-center gap-1 mb-1">
                         <div className={`w-1 h-1 rounded-full ${analysis.pickType === 'Daily Banker' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                         <div className={`text-[8px] font-black uppercase tracking-widest ${
                           analysis.pickType && analysis.pickType !== 'Free Pick' 
                            ? analysis.pickType === 'Daily Banker' ? 'text-amber-500/50' : 'text-emerald-500/50'
                            : 'text-slate-500'
                         }`}>ODDS</div>
                       </div>
                       <div className={`font-black italic tabular-nums transition-all duration-300 group-hover/stat:scale-110 ${
                         analysis.pickType && analysis.pickType !== 'Free Pick' 
                          ? analysis.pickType === 'Daily Banker' ? 'text-xl sm:text-4xl text-amber-400' : 'text-xl sm:text-4xl text-emerald-300' 
                          : 'text-sm sm:text-2xl text-emerald-400'
                       }`}>@ {analysis.odds}</div>
                     </div>
                     <div className="w-px h-8 bg-white/10" />
                     <div className="group/stat">
                       <div className="flex items-center gap-1 mb-1">
                         <div className={`w-1 h-1 rounded-full ${analysis.pickType === 'Daily Banker' ? 'bg-white' : 'bg-emerald-400'}`} />
                         <div className={`text-[8px] font-black uppercase tracking-widest ${
                           analysis.pickType && analysis.pickType !== 'Free Pick' 
                            ? analysis.pickType === 'Daily Banker' ? 'text-amber-500/50' : 'text-emerald-500/50'
                            : 'text-slate-500'
                         }`}>CONFIDENCE</div>
                       </div>
                       <div className={`font-black italic tabular-nums transition-all duration-300 group-hover/stat:scale-110 ${
                         analysis.pickType && analysis.pickType !== 'Free Pick' ? 'text-xl sm:text-4xl text-white' : 'text-sm sm:text-2xl text-white'
                       }`}>{Math.round(interpolatedConfidence)}%</div>
                     </div>
                   </div>
                    <div className="flex flex-col gap-2 sm:gap-4 w-full sm:w-auto shrink-0 border-t border-white/5 sm:border-none pt-4 sm:pt-0">
                      {/* Telegram CTA */}
                      <a 
                        href="https://t.me/BetlifyAI" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#229ED9] hover:bg-[#229ED9]/90 text-white rounded-lg sm:rounded-2xl font-black uppercase italic text-[9px] sm:text-sm transition-all shadow-xl shadow-blue-500/20 group min-h-[44px]"
                      >
                        <Send size={14} className="group-hover:scale-110 transition-transform" />
                        Join Telegram
                      </a>

                      {/* Share Analysis */}
                      <button 
                        onClick={() => {
                          const shareData = {
                            title: `Betlify AI: ${analysis.homeTeam} vs ${analysis.awayTeam}`,
                            text: `Check out this AI analysis: ${analysis.tip} @ ${analysis.odds}`,
                            url: window.location.href
                          };
                          if (navigator.share) {
                            navigator.share(shareData).catch(console.error);
                          } else {
                            navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-white/10 hover:border-emerald-500/50 text-white rounded-lg sm:rounded-2xl font-black uppercase italic text-[9px] sm:text-sm transition-all min-h-[44px]"
                      >
                        <Share2 size={14} />
                        Share
                      </button>
                    </div>
</div>
               </div>

               {/* Signal Graph */}
               <SignalGraph signal={analysis.signal} />
            </div>

            {/* 2.5) METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <MetricGauge label="Neural Confidence" value={analysis.aiConfidence || analysis.confidence} color="text-emerald-400" />
              <MetricGauge label="Market Volatility" value={analysis.marketVolatility || 30} color="text-amber-400" />
              <MetricGauge label="Value Score" value={analysis.valueScore ? Math.round(analysis.valueScore * 10) : 75} color="text-blue-400" />
            </div>

            {/* 3) QUICK INSIGHTS STRIP */}
            <div className="mb-4 sm:mb-6">
               <div className="flex flex-wrap gap-1.5 sm:gap-2">
                 {(analysis.bulletPoints || analysis.keyStats || []).map((stat, i) => (
                   <div key={i} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/60 border border-white/5 rounded-full text-[8px] sm:text-[10px] font-bold text-slate-300 italic hover:border-blue-500/30 transition-colors">
                     <div className="w-1 h-1 rounded-full bg-blue-400" />
                     {stat}
                   </div>
                 ))}
               </div>
            </div>

            {/* 4) SUMMARY ANALYSIS */}
            <div className={`space-y-4 relative ${isLocked ? 'blur-md select-none pointer-events-none' : ''}`}>
              {isLocked && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-white/5">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-4">
                    <LockIcon size={32} className="text-amber-400" />
                  </div>
                  <div className="text-sm font-black text-white uppercase tracking-widest mb-2">Premium Analysis Locked</div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase max-w-xs mb-6 leading-relaxed">
                    Unlock premium to access the full neural breakdown, statistical validation, and market edge for this pick.
                  </p>
                  <button 
                    onClick={onPremiumAction}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black uppercase italic text-xs transition-all shadow-lg shadow-emerald-500/20 pointer-events-auto"
                  >
                    Unlock Analysis
                  </button>
                </div>
              )}
              <div className="bg-slate-900/40 border border-white/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Cpu size={12} className="text-cyan-400 sm:w-4 sm:h-4" />
                  <span className="text-[8px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-widest">Neural Summary</span>
                </div>
                <p className="text-[10px] sm:text-[12px] font-bold text-slate-400 leading-relaxed italic whitespace-pre-wrap">
                  {!isPremium ? (
                    <span className="flex items-center gap-2 text-amber-500/80 font-black tracking-widest">
                      <LockIcon size={12} className="animate-pulse" /> LOCKED PREMIUM NEURAL SUMMARY
                    </span>
                  ) : (
                    analysis.shortReason
                  )}
                </p>
              </div>

              {analysis.sections && analysis.sections.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.sections
                    .filter(section => {
                      if (!isPremium) {
                        const heading = section.heading.toLowerCase();
                        const restricted = ['form', 'momentum', 'tactical edge', 'stats analysis', 'tactical goals'];
                        return !restricted.some(r => heading.includes(r));
                      }
                      return true;
                    })
                    .map((section, idx) => (
                    <div key={idx} className="bg-slate-900/20 border border-white/5 p-5 rounded-2xl hover:border-emerald-500/20 transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        <span className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-widest">{section.heading}</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-relaxed italic">
                        {section.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sources */}
            {analysis.sources && analysis.sources.length > 0 && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/5 flex flex-wrap gap-1.5 sm:gap-2">
                <div className="w-full flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Globe size={10} className="text-slate-500 sm:w-3 sm:h-3" />
                  <span className="text-[7px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Data Sources</span>
                </div>
                {analysis.sources.slice(0, 3).map((source, i) => (
                  <a 
                    key={i} href={source.uri} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-900 border border-white/5 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-bold text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                  >
                    <span className="truncate max-w-[100px] sm:max-w-none">{source.title}</span>
                    <ExternalLink size={8} className="sm:w-2.5 sm:h-2.5" />
                  </a>
                ))}
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalysisDisplay;
