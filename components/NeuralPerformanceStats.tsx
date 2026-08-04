import React from 'react';
import { TrendingUp, Target, Zap, Activity, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../services/utils';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useTranslation } from '../services/i18n';

interface NeuralPerformanceStatsProps {
  className?: string;
}

const NeuralPerformanceStats: React.FC<NeuralPerformanceStatsProps> = ({ className }) => {
  const { t } = useTranslation();
  // Simulated live signal data
  const signalData = [
    { v: 40 }, { v: 60 }, { v: 45 }, { v: 70 }, { v: 55 }, { v: 80 }, { v: 65 }, { v: 90 }, { v: 75 }, { v: 85 }
  ];

  const stats = [
    { 
      label: t('stats.winRate', 'Win Rate'), 
      value: '94.2%', 
      icon: Target, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    { 
      label: t('stats.roi', 'Avg ROI'), 
      value: '+28.5%', 
      icon: TrendingUp, 
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    { 
      label: t('card.aiConfidence', 'Neural Confidence'), 
      value: 'High', 
      icon: Zap, 
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    { 
      label: t('stats.totalPicks', 'Verified Picks'), 
      value: '12', 
      icon: Activity, 
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    }
  ];


  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-sm flex items-center gap-3 group hover:border-emerald-500/20 transition-all duration-500"
          >
            <div className={cn("p-2 rounded-xl transition-transform duration-500 group-hover:scale-110", stat.bg)}>
              <stat.icon size={14} className={stat.color} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className={cn("text-sm font-black italic tracking-tighter", stat.color)}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-sm overflow-hidden relative group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={12} className="text-emerald-400" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Pulse Monitoring</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[7px] font-bold text-emerald-500/60 uppercase">Live</span>
          </div>
        </div>
        <div className="h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={signalData}>
              <Area 
                type="monotone" 
                dataKey="v" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.1} 
                strokeWidth={2} 
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default NeuralPerformanceStats;
