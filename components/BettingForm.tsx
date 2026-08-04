
import React, { useState } from 'react';
import { FixtureData, BetType } from '../types';
import { Target, Cpu, ChevronRight, Zap } from 'lucide-react';
import { useTranslation } from '../services/i18n';

interface BettingFormProps {
  onSubmit: (data: FixtureData) => void;
  loading: boolean;
}

const BettingForm: React.FC<BettingFormProps> = ({ onSubmit, loading }) => {
  const { t } = useTranslation();
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [betType, setBetType] = useState<BetType>(BetType.FULL_TIME_RESULT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam) return;
    
    onSubmit({
      homeTeam,
      awayTeam,
      betType,
      date: new Date().toISOString()
    });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-slate-900/60 border border-emerald-500/20 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <Target className="text-emerald-400" size={18} />
        </div>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('form.customScan', 'CUSTOM NEURAL SCAN')}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('form.homeTeam', 'Home Team')}</label>
          <input 
            type="text" 
            value={homeTeam} 
            onChange={(e) => setHomeTeam(e.target.value)}
            placeholder="e.g. Real Madrid"
            className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-700 focus:border-emerald-500/50 focus:outline-none transition-all font-bold italic"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('form.awayTeam', 'Away Team')}</label>
          <input 
            type="text" 
            value={awayTeam} 
            onChange={(e) => setAwayTeam(e.target.value)}
            placeholder="e.g. Barcelona"
            className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-700 focus:border-emerald-500/50 focus:outline-none transition-all font-bold italic"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('form.betType', 'Bet Type')}</label>
        <select 
          value={betType} 
          onChange={(e) => setBetType(e.target.value as BetType)}
          className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-white appearance-none focus:border-emerald-500/50 focus:outline-none transition-all font-bold italic cursor-pointer"
        >
          {Object.entries(BetType).map(([key, value]) => (
            <option key={key} value={value} className="bg-slate-950 text-white font-bold">{value}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !homeTeam || !awayTeam}
        className="w-full py-5 bg-emerald-500 text-slate-950 font-black rounded-3xl flex items-center justify-center gap-3 uppercase italic shadow-2xl shadow-emerald-500/20 active:scale-[0.98] transition-all hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed group overflow-hidden relative"
      >
        <span className="relative z-10 flex items-center gap-3">
          {loading ? (
            <Cpu size={20} className="animate-spin" />
          ) : (
            <Zap size={20} className="group-hover:scale-125 transition-transform" />
          )}
          {loading ? t('form.initializing', 'INITIALIZING NEURAL LINK...') : t('form.executeScan', 'EXECUTE CUSTOM SCAN')}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </button>
    </form>
  );
};

export default BettingForm;
