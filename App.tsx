import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AutoTranslate } from './components/AutoTranslate';
import AnalysisDisplay from './components/AnalysisDisplay';
import PaymentModal from './components/PaymentModal';
import LoginModal from './components/LoginModal';
import MatchHistory from './components/MatchHistory';
import SmartLoader from './components/SmartLoader';
import NeuralChatInput from './components/NeuralChatInput';
import { analyzeFixture, chatWithNeural, fetchFreePicks, fetchPremiumHistory, fetchEliteCombo, fetchBOD, fetchDailyBanker, fetchTopPicks, fetchAndProcessAllBets } from './services/geminiService';
import { authService, UserProfile } from './services/authService';
import AlphaSignalsCard from './components/AlphaSignalsCard';
import EliteComboCard from './components/EliteComboCard';
import VerifiedPicksSection from './components/VerifiedPicksSection';
import { PerformanceTracker } from './components/PerformanceTracker';
import { FixtureData, Message, BetType, BetAnalysis, AlphaSignal, EliteComboPick, FirebasePick } from './types';
import { ASSETS, shortenTeamName } from './constants';
import { usePremiumHistory, PremiumHistoryData, PremiumPackage, PremiumPick } from './services/premiumHistoryHook';
import { useTelegramTheme } from './hooks/useTelegramTheme';
import { 
  ResponsiveContainer, 
  Tooltip,
  Cell
} from 'recharts';
import { useAuth } from './services/AuthContext';
import { Bot, User, Zap, ChevronRight, X, TrendingUp, Cpu, Activity, Globe, Database, BrainCircuit, Search, Layers, Sparkles, BarChart3, ArrowUpRight, ShieldCheck, Star, Timer, CheckCircle, Target, Unlock, Users, Loader2, Radar, CreditCard, LayoutDashboard, Terminal, Menu, CheckCircle2, XCircle, History, Trophy, AlertTriangle, RefreshCw, PieChart as PieChartIcon, Send, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import confetti from 'canvas-confetti';

const TeamLogo: React.FC<{ url?: string; name: string; size?: string }> = ({ url, name, size = "w-8 h-8" }) => (
  <div className={`${size} rounded-lg bg-slate-950 border border-white/5 flex items-center justify-center overflow-hidden shrink-0`}>
    {url ? (
      <img src={url} alt={String(name)} className="w-[85%] h-[85%] object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} referrerPolicy="no-referrer" />
    ) : (
      <Target size={14} className="text-slate-700" />
    )}
  </div>
);

const BetwinnerBanner: React.FC = () => (
  <a 
    href="https://betwinner.com" 
    target="_blank" 
    rel="noopener noreferrer"
    className="block p-6 bg-gradient-to-br from-emerald-600 via-emerald-800 to-slate-950 rounded-[2rem] border-2 border-emerald-400/30 shadow-2xl overflow-hidden relative group transition-all hover:scale-[1.02]"
  >
    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 blur-[60px] rounded-full -mr-16 -mt-16 animate-pulse" />
    
    <div className="relative z-10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="px-3 py-1 bg-emerald-500 text-slate-950 text-[8px] font-black uppercase italic rounded-full shadow-lg shadow-emerald-500/20">PARTNER OFFER</div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
          <ArrowUpRight size={16} className="text-white" />
        </div>
      </div>
      
      <div>
        <div className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">100% BONUS</div>
        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest opacity-80">ON YOUR FIRST DEPOSIT</div>
      </div>

      <div className="pt-2">
        <div className="w-full py-3 bg-white text-slate-950 rounded-xl font-black uppercase italic text-xs flex items-center justify-center gap-2 group-hover:bg-emerald-400 transition-colors">
          BET ON BETWINNER
        </div>
      </div>
    </div>
  </a>
);

const TypingText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return <>{displayedText}</>;
};

const HistoryCard: React.FC<{ pick: FirebasePick }> = ({ pick }) => {
  const statusLabel = useMemo(() => {
    if (pick.status === 'win') return 'Signal Confirmed';
    if (pick.status === 'loss') return 'Model Misread';
    if (pick.status === 'pending') return 'Awaiting Resolution';
    return 'Partial Outcome';
  }, [pick.status]);

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 space-y-3 hover:border-emerald-500/20 transition-all group relative overflow-hidden backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[6px] font-black text-emerald-400 uppercase tracking-widest">{pick.package || 'Elite Signal'}</span>
          </div>
          <h4 className="text-[11px] sm:text-[13px] font-bold text-white tracking-tight truncate w-full max-w-full">
            <span className="sm:hidden">{shortenTeamName(pick.home || '')} {pick.score || 'FT'} {shortenTeamName(pick.away || '')}</span>
            <span className="hidden sm:inline">{pick.home} {pick.score || 'FT'} {pick.away}</span>
          </h4>
          <div className="flex items-center gap-1.5">
            <Globe size={10} className="text-blue-400" />
            <span className="text-[9px] font-medium text-slate-500">{pick.league} • {pick.date}</span>
          </div>
        </div>
        <div className={`text-[13px] font-black ${pick.status === 'win' ? 'text-emerald-400' : 'text-rose-500'}`}>
          {pick.profit}
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-slate-400">
          {pick.home} @ {pick.odds}
        </div>
        <div className="text-[10px] font-medium text-slate-600">Stake: ${pick.stake} • Confidence: {pick.confidence}%</div>
      </div>

      <div className="flex justify-end">
        <div className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest ${pick.status === 'win' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {statusLabel.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// Removed chart components and history dashboard for simplicity as per user request.
const App: React.FC = () => {
  const { user, isAuthenticated, isLoading, error, login: setAuthUser, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('betlify_is_premium') === 'true');

  useEffect(() => {
    // Log Critical Telegram Data Immediately
    const tg = (window as any).Telegram?.WebApp;
    console.log("Telegram object detected:", !!tg);
    if (tg) {
      console.log("initData:", tg.initData);
      console.log("initDataUnsafe:", tg.initDataUnsafe);
      console.log("user:", tg.initDataUnsafe?.user);
      console.log("platform:", tg.platform);
      console.log("version:", tg.version);
    } else {
      console.log("Telegram WebApp object not found in window.");
    }
  }, []);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "NEURAL LINK ESTABLISHED. I am Betlify, your high-performance sports market analyst. Ready to scan for value signals.", type: 'text', timestamp: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  const [activeSignalIndex, setActiveSignalIndex] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const [featuredPick, setFeaturedPick] = useState<FirebasePick | null>(null);
  const [freePicks, setFreePicks] = useState<FirebasePick[]>([]);
  const [eliteCombo, setEliteCombo] = useState<EliteComboPick[]>([]);
  const [bodPicks, setBodPicks] = useState<FirebasePick[]>([]);
  const [bankerPicks, setBankerPicks] = useState<FirebasePick[]>([]);
  const [topPicks, setTopPicks] = useState<FirebasePick[]>([]);
  const [premiumHistory, setPremiumHistory] = useState<FirebasePick[]>([]);
  const [activeTab, setActiveTab] = useState<'terminal' | 'command'>('command');
  const [view, setView] = useState<'dashboard' | 'history'>('dashboard');
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<BetAnalysis | null>(null);
  const [postLoginAction, setPostLoginAction] = useState<(() => void) | null>(null);
  const [initialSignalsShown, setInitialSignalsShown] = useState(false);
  const [betSlip, setBetSlip] = useState<FirebasePick[]>([]);
  
  useTelegramTheme();
  const isTelegram = authService.isTelegramMiniApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (scrollRef.current && lastMsg && (lastMsg.type === 'text' || loading)) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const loadData = async () => {
    setIsInitialLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const [picks, processed] = await Promise.all([
        fetchFreePicks(today),
        fetchAndProcessAllBets(isPremium)
      ]);
      
      setFreePicks(picks || []);
      
      const mapProcessedBetToFirebasePick = (b: any): FirebasePick => {
        if (!b) return {} as FirebasePick;
        const isLocked = !!b.locked;
        const activeObj = b.premium || {};
        const resolvedOdds = Number(activeObj.odds || b.odds) || 1.85;
        const resolvedConf = String(activeObj.aiConfidence || b.confidence || "90");
        const resolvedScore = b.score || b.ft_score || activeObj.score || activeObj.ft_score || b.predicted_score || '';
        
        if (isLocked) {
          return {
            home: b.homeTeam,
            away: b.awayTeam,
            homeTeam: b.homeTeam,
            awayTeam: b.awayTeam,
            league: b.league,
            kickoff: b.time,
            time: b.time,
            locked: true,
            tip: "Locked Pick",
            odds: resolvedOdds,
            confidence: resolvedConf,
            aiConfidence: Number(resolvedConf) || 90,
            status: b.status || "pending",
            score: resolvedScore,
            ft_score: resolvedScore
          } as any;
        }

        return {
          home: b.homeTeam,
          away: b.awayTeam,
          homeTeam: b.homeTeam,
          awayTeam: b.awayTeam,
          league: b.league,
          kickoff: b.time,
          time: b.time,
          date: b.date,
          locked: false,
          tip: activeObj.market || b.tip || b.market || "Analysis Pending",
          odds: resolvedOdds,
          confidence: resolvedConf,
          aiConfidence: Number(resolvedConf) || 90,
          status: activeObj.status || b.status || "pending",
          riskFactor: "Low",
          score: resolvedScore,
          ft_score: resolvedScore,
          preview_ui: {
            title: "Neural Market Analysis",
            summary: activeObj.finalVerdict || b.finalVerdict || "",
            sections: [],
            bullet_points: []
          }
        } as any;
      };

      const mapProcessedBetToEliteComboPick = (b: any): EliteComboPick => {
        if (!b) return {} as EliteComboPick;
        const isLocked = !!b.locked;
        const activeObj = b.premium || {};
        const resolvedOdds = Number(activeObj.odds || b.odds) || 1.85;
        const resolvedConf = Number(activeObj.aiConfidence || b.confidence) || 90;

        if (isLocked) {
          return {
            homeTeam: b.homeTeam,
            awayTeam: b.awayTeam,
            league: b.league,
            tip: "Locked Pick",
            odds: resolvedOdds,
            aiConfidence: resolvedConf,
            riskLevel: "Medium",
            tipType: "elite_combo",
            locked: true
          } as any;
        }
        
        return {
          homeTeam: b.homeTeam,
          awayTeam: b.awayTeam,
          league: b.league,
          tip: activeObj.market || "Analysis Pending",
          odds: resolvedOdds,
          aiConfidence: resolvedConf,
          riskLevel: "Low",
          tipType: "elite_combo",
          analysis: activeObj.finalVerdict || "",
          locked: false
        };
      };

      const bodList = (processed.bet_of_the_day.display || []).map(mapProcessedBetToFirebasePick);
      const verifiedList = (processed.verified.display || []).map(mapProcessedBetToFirebasePick);
      const eliteList = (processed.elite_combo.display || []).map(mapProcessedBetToEliteComboPick);

      setBodPicks(bodList);
      setTopPicks(verifiedList);
      setEliteCombo(eliteList);

      if (picks?.length) {
        setFeaturedPick(picks[0]);
      }

      const allHistory = [
        ...(processed.bet_of_the_day.history || []).map(mapProcessedBetToFirebasePick),
        ...(processed.verified.history || []).map(mapProcessedBetToFirebasePick),
        ...(processed.elite_combo.history || []).map(mapProcessedBetToFirebasePick)
      ];
      setPremiumHistory(allHistory);
    } catch (error) {
      console.error("Initial load failed:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isPremium]);

  useEffect(() => {
    if (user) {
      setIsPremium(user.role === 'admin' || !!(user as any).isPremium);
    } else {
      setIsPremium(false);
    }
  }, [user]);

  useEffect(() => {
    if (premiumHistory.length > 0) {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const dateStr = fourteenDaysAgo.toISOString().split('T')[0];
      const last14Days = premiumHistory.filter(p => {
        if (!p.date) return false;
        return p.date >= dateStr;
      });

      // Grouping logic for greeting
      const groups: Record<string, any> = {};
      last14Days.forEach(p => {
        const isDailyBanker = (p.package?.toLowerCase() || '').includes('daily banker') || p.package === 'dailybanker';
        const isEliteCombo = (p.package?.toLowerCase() || '').includes('elite combo') || p.package === 'EliteCombo';
        const groupKey = (isDailyBanker || isEliteCombo) ? `${p.date}_${p.package}` : `single_${Math.random()}_${p.home}_${p.away}`;
        if (!groups[groupKey]) groups[groupKey] = { picks: [] };
        groups[groupKey].picks.push(p);
      });

      const groupedList = Object.values(groups).map((group: any) => {
        const picks = group.picks;
        let status = picks[0].status;
        let profit = picks[0].profit;
        if (picks.length > 1) {
          const hasLoss = picks.some((p: any) => p.status === 'loss');
          const allWin = picks.every((p: any) => p.status === 'win');
          status = hasLoss ? 'loss' : (allWin ? 'win' : 'pending');
          if (status === 'win') {
            const totalOdds = picks.reduce((acc: number, p: any) => acc * (Number(p.odds) || 1), 1);
            profit = `+$${((totalOdds - 1) * 100).toFixed(2)}`;
          } else if (status === 'loss') {
            profit = '-$100.00';
          }
        }
        return { status, profit };
      });

      const displayCount = groupedList.length;
      const wins = groupedList.filter(g => g.status === 'win').length;
      const losses = groupedList.filter(g => g.status === 'loss').length;
      const winRate = ((wins / (wins + losses || 1)) * 100).toFixed(1);
      const totalProfit = groupedList.reduce((acc, g) => acc + parseFloat(g.profit?.replace('$', '').replace('+', '') || '0'), 0).toFixed(0);
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === '1') {
          return {
            ...msg,
            content: `NEURAL LINK ESTABLISHED. I am Betlify. I've analyzed ${displayCount} signals in the last 14 days with a ${winRate}% accuracy rate and $${totalProfit} total profit. High-probability signals detected. How shall we proceed?`
          };
        }
        return msg;
      }));
    }
  }, [premiumHistory]);

  const generateAlphaSignals = () => {
    const signals: AlphaSignal[] = [];
    
    // Add up to 3 free picks
    freePicks.slice(0, 3).forEach(p => {
      signals.push({
        home: p.home || '',
        away: p.away || '',
        homeLogo: p.homeLogo || p.home_logo,
        awayLogo: p.awayLogo || p.away_logo,
        league: p.league || 'Unknown League',
        date: p.kickoff || p.date || '',
        odds: p.odds || '0',
        confidence: p.confidence || '0',
        isPremium: false
      });
    });

    // Add AI Bet of the Day (Premium)
    if (bodPicks.length > 0) {
      const botd = bodPicks[0];
      signals.push({
        home: botd.home || '',
        away: botd.away || '',
        homeLogo: botd.homeLogo || botd.home_logo,
        awayLogo: botd.awayLogo || botd.away_logo,
        league: botd.league || 'Premium League',
        date: botd.kickoff || botd.date || 'Today',
        odds: botd.odds || '0',
        confidence: botd.confidence || '0',
        isPremium: true,
        type: 'AI Bet Of The Day'
      });
    }

    // Add AI Elite Combo (Premium)
    if (eliteCombo.length > 0) {
      const totalOdds = eliteCombo.reduce((acc, pick) => acc * (Number(pick.odds) || 1), 1);
      const combo = eliteCombo[0];
      signals.push({
        home: combo.homeTeam || '',
        away: combo.awayTeam || '',
        homeLogo: combo.homeLogo,
        awayLogo: combo.awayLogo,
        league: combo.league || 'Elite League',
        date: 'Today',
        odds: totalOdds.toFixed(2),
        confidence: combo.aiConfidence || '0',
        isPremium: true,
        type: 'AI Elite Combo'
      });
    }

    // Add AI Verified Picks (Premium)
    if (topPicks.length > 0) {
      const top = topPicks[0];
      signals.push({
        home: top.home || '',
        away: top.away || '',
        homeLogo: top.homeLogo || top.home_logo,
        awayLogo: top.awayLogo || top.away_logo,
        league: top.league || 'Premium League',
        date: top.kickoff || top.date || 'Today',
        odds: top.odds || '0',
        confidence: top.confidence || '0',
        isPremium: true,
        type: 'AI Verified Picks'
      });
    }

    return signals;
  };

  useEffect(() => {
    if (!isInitialLoading && !initialSignalsShown && freePicks.length > 0 && messages.length > 0) {
      const timer = setTimeout(() => {
        const signals = generateAlphaSignals();

        setMessages(prev => [...prev, { 
          id: 'initial-signals', 
          role: 'assistant', 
          content: "LIVE DAILY FREE PICKS DETECTED:", 
          type: 'alpha-signals', 
          alphaSignals: signals, 
          timestamp: new Date() 
        }]);
        setInitialSignalsShown(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoading, initialSignalsShown, freePicks, messages.length]);

  const handleSyncHistory = async () => {
    setIsSyncingHistory(true);
    setMessages(prev => [...prev, { 
      id: `sync-${Date.now()}`, 
      role: 'assistant', 
      content: "Syncing performance metrics. Verified data points are being integrated.", 
      type: 'text', 
      timestamp: new Date() 
    }]);

    try {
      await loadData();
      setMessages(prev => [...prev, { 
        id: `sync-success-${Date.now()}`, 
        role: 'assistant', 
        content: "Sync complete. All records are now up to date.", 
        type: 'text', 
        timestamp: new Date() 
      }]);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#10b981', '#059669', '#34d399', '#fbbf24']
      });
    } catch (error: any) {
      console.error("Sync failed:", error);
      setMessages(prev => [...prev, { 
        id: `sync-error-${Date.now()}`, 
        role: 'assistant', 
        content: `SYNC ERROR: ${error.message || "Connection to remote database timed out."}`, 
        type: 'text', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsSyncingHistory(false);
    }
  };

  useEffect(() => {
    if (authService.isTelegramMiniApp()) {
      (window as any).Telegram.WebApp.ready();
      (window as any).Telegram.WebApp.expand();
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      const timer = setTimeout(() => {
        setMessages([{ 
          id: 'welcome', 
          role: 'assistant', 
          content: "Hi — I'm Betlify. I track confidence signals, prediction history, and live market patterns. What would you like to explore today?", 
          type: 'text', 
          timestamp: new Date() 
        }]);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const handleAnalyze = async (data: FixtureData, index?: number, isFree: boolean = false, pick?: FirebasePick) => {
    if (index !== undefined) setActiveSignalIndex(index);
    setActiveTab('terminal');
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', content: `SCAN: ${data.homeTeam} vs ${data.awayTeam}`, type: 'text', timestamp: new Date() }]);
    setLoading(true);

    // Find the pick in our local data if not provided
    const targetPick = pick || [...freePicks, ...premiumHistory, ...topPicks].find(p =>  
      (p.home === data.homeTeam && p.away === data.awayTeam) ||
      (p.match === `${data.homeTeam} vs ${data.awayTeam}`)
    );

    if (targetPick?.preview_ui) {
      const result: BetAnalysis = {
        homeTeam: targetPick.home || '',
        awayTeam: targetPick.away || '',
        tip: targetPick.tip || '',
        confidence: parseInt(targetPick.confidence || '0') || 90,
        riskFactor: 'Medium',
        metrics: [
          { label: "Neural Confidence", value: targetPick.aiConfidence || parseInt(targetPick.confidence || '0') || 88 },
          { label: "Market Volatility", value: targetPick.marketVolatility || 45 },
          { label: "Value Score", value: targetPick.valueScore || 92 }
        ],
        keyStats: targetPick.preview_ui.bullet_points || [],
        shortReason: targetPick.preview_ui.summary || '',
        sources: [],
        homeLogo: targetPick.homeLogo || targetPick.home_logo || '',
        awayLogo: targetPick.awayLogo || targetPick.away_logo || '',
        odds: parseFloat(String(targetPick.odds || '0')),
        predictedScore: targetPick.preview_ui.markets?.predicted_score || targetPick.score || '',
        sections: targetPick.preview_ui.sections || [],
        bulletPoints: targetPick.preview_ui.bullet_points || [],
        aiConfidence: targetPick.aiConfidence,
        valueScore: targetPick.valueScore,
        marketVolatility: targetPick.marketVolatility,
        signal: targetPick.signal,
        pickType: (targetPick.package === 'Daily Banker' || targetPick.package === 'Bet of the Day' || targetPick.package === 'Elite Signal' || targetPick.package === 'Verified Pick') 
          ? targetPick.package as any 
          : (targetPick.package === 'Alpha Signal' ? 'Alpha Signal' : 'Free Pick')
      };
      
      setTimeout(() => {
        const signals = generateAlphaSignals();

        setMessages(prev => [...prev, 
          { id: `a-${Date.now()}`, role: 'assistant', content: `SCAN COMPLETE.`, type: 'analysis', analysis: result, isFree, timestamp: new Date() },
          { id: `s-${Date.now()}`, role: 'assistant', content: "SELECT NEXT SIGNAL TO ANALYZE:", type: 'alpha-signals', alphaSignals: signals, timestamp: new Date() }
        ]);
        setSelectedAnalysis(result);
        setLoading(false);
        setActiveSignalIndex(null);
      }, 1000);
      return;
    }

    // If we reach here, we don't have local data. 
    // The user said "it should not use api key", so we provide a fallback message.
    setTimeout(() => {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: `DATA ERROR: No isolated analysis found for this fixture in the local database. Only verified signals can be scanned.`, type: 'text', timestamp: new Date() }]);
      setLoading(false);
      setActiveSignalIndex(null);
    }, 1000);
  };

  const handleChatMessage = async (text: string) => {
    const upperText = text.toUpperCase();
    const isBanker = upperText.includes('DAILY BANKER');
    const isTopPicks = upperText.includes('TOP PICKS') || upperText.includes('VERIFIED PICKS');
    const isEliteCombo = upperText.includes('ELITE COMBO');
    const isAlphaSignals = upperText.includes('ALPHA SIGNALS');
    const isScanRequest = upperText.startsWith('SCAN') || upperText.includes('ANALYZE') || upperText.includes('EXECUTE:');
    
    // Alpha Signals and their analysis are free
    const isFreeSignal = upperText.includes('BET OF THE DAY') || isAlphaSignals || (upperText.includes('ANALYZE') && !upperText.startsWith('SCAN'));
    
    setActiveTab('terminal');
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text, type: 'text', timestamp: new Date() }]);
    setLoading(true);

    // Handle Quick Action Commands
    if (upperText.includes('BET OF THE DAY') && bodPicks.length > 0) {
      const pick = bodPicks[0];
      setTimeout(() => {
        handleAnalyze({ homeTeam: pick.home || '', awayTeam: pick.away || '', date: '', betType: pick.tip || '', odds: Number(pick.odds) || 0 }, undefined, false, pick);
      }, 500);
      return;
    }

    if (isEliteCombo) {
      if (eliteCombo.length > 0) {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: `a-${Date.now()}`, 
            role: 'assistant', 
            content: "ELITE COMBO SCAN COMPLETE. MULTIBET GENERATED.", 
            type: 'elite-combo', 
            eliteCombo: eliteCombo,
            timestamp: new Date() 
          }]);
          setLoading(false);
        }, 1000);
      } else {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: `a-${Date.now()}`, 
            role: 'assistant', 
            content: "No Elite Combo available today. Please check back later.", 
            type: 'text', 
            timestamp: new Date() 
          }]);
          setLoading(false);
        }, 1000);
      }
      return;
    }

    if (isBanker && bankerPicks.length > 0) {
      const pick = bankerPicks[0];
      setTimeout(() => {
        handleAnalyze({ homeTeam: pick.home || '', awayTeam: pick.away || '', date: '', betType: pick.tip || '', odds: Number(pick.odds) || 0 }, undefined, false, pick);
      }, 500);
      return;
    }

    if (isTopPicks && topPicks.length > 0) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: "Accessing high-confidence verified signals. These picks are statistically validated and ready for deployment.",
          type: 'verified-picks',
          verifiedPicks: topPicks,
          timestamp: new Date()
        }]);
        setLoading(false);
      }, 1000);
      return;
    }

    if (isFreeSignal && featuredPick) {
      setTimeout(() => {
        handleAnalyze({ homeTeam: featuredPick.home || '', awayTeam: featuredPick.away || '', date: '', betType: featuredPick.tip || '', odds: parseFloat(String(featuredPick.odds || '0')) }, undefined, true, featuredPick);
      }, 500);
      return;
    }

    if (isBanker || isTopPicks) {
      const match = [...freePicks, ...premiumHistory].find(p => 
        isBanker ? (p.tip?.toUpperCase().includes('BANKER') || p.confidence === '99%') : true
      ) || freePicks[0] || premiumHistory[0];

      if (match) {
        setTimeout(() => {
          handleAnalyze({ homeTeam: match.home || '', awayTeam: match.away || '', date: '', betType: match.tip || '', odds: parseFloat(String(match.odds || '0')) }, undefined, true, match);
        }, 500);
        return;
      }
    }

    if (isScanRequest) {
      // Try to find a match in our picks
      const match = [...freePicks, ...premiumHistory].find(p => 
        (p.home?.toUpperCase() && upperText.includes(p.home.toUpperCase())) || 
        (p.away?.toUpperCase() && upperText.includes(p.away.toUpperCase()))
      );

      if (match) {
        // We use a slight delay to allow the user message to render
        setTimeout(() => {
          handleAnalyze({ homeTeam: match.home || '', awayTeam: match.away || '', date: '', betType: match.tip || '', odds: parseFloat(String(match.odds || '0')) }, undefined, true, match);
        }, 500);
        return;
      }
    }

    if (isAlphaSignals && freePicks.length > 0) {
      const signals: AlphaSignal[] = freePicks.slice(0, 3).map(p => ({
        home: p.home || '',
        away: p.away || '',
        homeLogo: p.homeLogo || p.home_logo,
        awayLogo: p.awayLogo || p.away_logo,
        league: p.league || 'Unknown League',
        date: p.kickoff || p.date || '',
        odds: p.odds || '0',
        confidence: p.confidence || '0'
      }));

      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: `a-${Date.now()}`, 
          role: 'assistant', 
          content: `SYNCING LIVE DAILY FREE PICKS...`, 
          type: 'alpha-signals', 
          alphaSignals: signals, 
          timestamp: new Date() 
        }]);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const response = await chatWithNeural(text);
      setMessages(prev => [...prev, { id: `ai-${Date.now()}`, role: 'assistant', content: response, type: 'text', timestamp: new Date() }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: `SYNC ERROR: ${err.message || "Unknown internal error"}`, type: 'text', timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  const handleLoginSuccess = (newUser: UserProfile) => {
    setAuthUser(newUser);
    if (postLoginAction) {
      postLoginAction();
      setPostLoginAction(null);
    }
  };

  const last7DaysArchive = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];
    return premiumHistory.filter(p => p.date && p.date >= dateStr);
  }, [premiumHistory]);

  const handleSignalClick = (signal: AlphaSignal) => {
    if (signal.isPremium && !isPremium) {
      setShowPaymentModal(true);
      return;
    }
    // If it's a specific premium type, use that as the query to trigger correct logic in handleChatMessage
    const query = signal.type ? signal.type : `Analyze ${signal.home} vs ${signal.away}`;
    setShowChatInput(true);
    handleChatMessage(query);
  };

  if (isLoading) {
    return (
      <div className="h-[100dvh] bg-[#020617] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Cpu size={24} className="text-emerald-500" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-black text-white uppercase tracking-[0.3em] animate-pulse">Neural Link Initializing</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authenticating Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#020617] text-slate-100 font-sans overflow-hidden w-full max-w-full overflow-x-hidden">
      <AutoTranslate />
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        freePick={featuredPick}
        bodPick={bodPicks[0]}
        bankerPick={bankerPicks[0]}
        eliteCombo={eliteCombo}
        topPicks={topPicks}
        onSuccess={async () => { 
          setIsPremium(true); 
          confetti({ particleCount: 200 }); 
          if (user) {
            try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./firebase');
              await updateDoc(doc(db, 'users', user.uid), { isPremium: true });
            } catch (e) {
              console.error('Failed to sync premium status to Firestore', e);
            }
          }
        }} 
        isLoggedIn={!!user}
        onLoginRequired={(callback) => {
          if (callback) setPostLoginAction(() => callback);
          setShowLoginModal(true);
        }}
      />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} />
      
      {!isTelegram && (
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 h-14 sm:h-16 bg-slate-950/80 border-b border-white/5 px-4 sm:px-8 shrink-0 z-[100] backdrop-blur-3xl flex items-center justify-between"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-1 rounded-lg overflow-hidden w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
              <img 
                src={ASSETS.LOGO} 
                alt="Betlify Logo" 
                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-xs sm:text-base font-black tracking-tighter text-white italic uppercase leading-none">BETL<span className="text-[#00FFA3]">IFY</span></h1>
            
            <div className="hidden md:flex items-center gap-6 ml-8">
              <button 
                onClick={() => setView('dashboard')} 
                className={`text-[9px] font-black uppercase tracking-widest transition-all ${view === 'dashboard' ? 'text-emerald-500' : 'text-slate-500 hover:text-white'}`}
              >
                Analysis
              </button>
              <button 
                onClick={() => setView('history')} 
                className={`text-[9px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'text-emerald-500' : 'text-slate-500 hover:text-white'}`}
              >
                Archive
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-[9px] font-black text-white uppercase tracking-tighter leading-none">{user.firstName}</div>
                  <div className={`text-[7px] font-bold uppercase tracking-widest mt-0.5 ${isPremium ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {isPremium ? 'Premium' : 'Free'}
                  </div>
                </div>
                <button 
                  onClick={() => logout()}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/10 overflow-hidden bg-slate-900 flex items-center justify-center p-0.5 touch-target"
                >
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt={user.name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={14} className="text-slate-500" />
                  )}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-1.5 bg-slate-900 border border-white/10 text-white rounded-lg text-[9px] font-black uppercase hover:bg-slate-800 transition-all touch-target"
              >
                Sign In
              </button>
            )}

            {!isPremium && (
              <button 
                onClick={() => setShowPaymentModal(true)} 
                className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-emerald-500/20 touch-target"
              >
                UPGRADE
              </button>
            )}
          </div>
        </motion.header>
      )}

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <div className="scanline" />
        
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex-1 flex flex-col border-r border-white/5 bg-slate-950/30 overflow-hidden ${activeTab !== 'terminal' ? 'hidden lg:flex' : 'flex'}`}
        >
          <div className="px-4 sm:px-8 py-3 sm:py-4 border-b border-white/5 flex items-center gap-3 shrink-0 bg-slate-900/10">
            <Terminal size={12} className="text-emerald-500 sm:w-[16px] sm:h-[16px]" />
            <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.4em]">Betlify Analysis Hub</span>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-10 custom-scrollbar pb-32">
            {view === 'dashboard' ? (
              <>
                {messages.map((msg, idx) => (
                  <React.Fragment key={msg.id}>
                    <div className={`flex gap-3 sm:gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2`}>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0 overflow-hidden ${msg.role === 'user' ? 'bg-slate-800 border-white/5' : 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] p-1.5'}`}>
                        {msg.role === 'user' ? (
                          <User size={16} className="text-slate-500 sm:w-[20px] sm:h-[20px]" />
                        ) : (
                          <img 
                            src={ASSETS.LOGO} 
                            alt="Betlify" 
                            className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <div className={`flex flex-col gap-3 sm:gap-5 max-w-[calc(100%-3.5rem)] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 ${msg.role === 'user' ? 'bg-slate-900 border border-white/10 text-emerald-400' : 'bg-slate-900/40 border border-emerald-500/10 text-slate-200'}`}>
                          <p className="text-xs sm:text-base font-bold italic leading-relaxed">
                            {msg.role === 'assistant' && msg.type === 'text' ? (
                              <TypingText text={msg.content} />
                            ) : (
                              msg.content
                            )}
                          </p>
                          {msg.type === 'analysis' && msg.analysis && (
                            <AnalysisDisplay 
                              analysis={msg.analysis} 
                              isPremium={isPremium} 
                              onPremiumAction={() => setShowPaymentModal(true)} 
                              totalVerifiedPicks={freePicks.length}
                            />
                          )}
                          {msg.type === 'alpha-signals' && msg.alphaSignals && (
                            <AlphaSignalsCard 
                              signals={msg.alphaSignals} 
                              isPremium={isPremium}
                              onSignalClick={handleSignalClick} 
                              totalVerifiedPicks={topPicks.length}
                            />
                          )}
                          {msg.type === 'verified-picks' && msg.verifiedPicks && (
                            <VerifiedPicksSection 
                              picks={msg.verifiedPicks}
                              isPremium={isPremium}
                              onAddPick={(pick) => {
                                setBetSlip(prev => {
                                  if (prev.some(p => p.home === pick.home && p.away === pick.away)) return prev;
                                  return [...prev, pick];
                                });
                              }}
                              onRemovePick={(pick) => {
                                setBetSlip(prev => prev.filter(p => p.home !== pick.home || p.away !== pick.away));
                              }}
                              selectedPicks={betSlip}
                              onViewAnalysis={(pick) => handleSignalClick({
                                home: pick.home || '',
                                away: pick.away || '',
                                isPremium: true,
                                league: pick.league || '',
                                date: pick.date || '',
                                odds: pick.odds || 0,
                                confidence: pick.confidence || 0
                              })}
                            />
                          )}
                          {msg.type === 'elite-combo' && msg.eliteCombo && (
                            <EliteComboCard 
                              picks={msg.eliteCombo} 
                              isPremium={isPremium}
                              onUnlock={() => setShowPaymentModal(true)}
                              onPlaceBet={() => window.open('https://t.me/BetlifyAI', '_blank')}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
                
                {loading && (
                  <div className="flex gap-3 sm:gap-5 animate-in fade-in">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 flex items-center justify-center p-1.5">
                      <SmartLoader size={16} className="text-slate-950 sm:w-[20px] sm:h-[20px]" />
                    </div>
                    <div className="p-4 sm:p-8 bg-slate-900/40 border border-emerald-500/10 rounded-2xl sm:rounded-[2rem] flex-1 flex flex-col items-center gap-3">
                      <Cpu size={24} className="text-emerald-400 animate-spin sm:w-[32px] sm:h-[32px]" />
                      <span className="text-[8px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Analyzing Market Data...</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <MatchHistory isPremium={isPremium} />
            )}
          </div>
        </motion.section>

        <motion.aside 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`w-full lg:w-[450px] flex-1 lg:none overflow-y-auto custom-scrollbar bg-slate-950/50 backdrop-blur-xl lg:border-l border-white/5 p-4 sm:p-8 flex flex-col gap-6 sm:gap-10 ${activeTab !== 'command' ? 'hidden lg:flex' : 'flex'}`}
        >
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <BrainCircuit size={12} className="text-emerald-500 sm:w-[18px] sm:h-[18px]" />
                <span className="text-[9px] sm:text-[11px] font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.4em] italic">Command Hub</span>
              </div>
              
              {/* User Profile or Error */}
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 size={12} className="text-slate-600 animate-spin" />
                ) : error ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
                    <XCircle size={10} className="text-red-400" />
                    <span className="text-[7px] font-black text-red-400 uppercase tracking-widest truncate max-w-[80px]">{error}</span>
                  </div>
                ) : user ? (
                  <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <div className="text-right">
                      <div className="text-[8px] font-black text-white uppercase tracking-tighter leading-none">{user.firstName}</div>
                      {user.username && <div className="text-[7px] font-bold text-emerald-400/60 leading-none mt-0.5">@{user.username}</div>}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-emerald-500/40 overflow-hidden shadow-inner">
                      {user.photoUrl ? (
                        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-emerald-400 bg-emerald-500/10">{user.firstName.substring(0, 1)}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                    <AlertTriangle size={10} className="text-slate-500" />
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Guest Mode</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Telegram CTA */}
            <a 
              href="https://t.me/BetlifyAI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full p-5 sm:p-7 bg-gradient-to-r from-blue-600/20 to-blue-900/40 border border-blue-500/30 rounded-[1.5rem] sm:rounded-[2rem] hover:border-blue-400 transition-all group relative overflow-hidden min-h-[80px] flex items-center"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 blur-3xl rounded-full -mr-16 -mt-16" />
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Send size={22} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-[8px] sm:text-[9px] font-black text-blue-300 uppercase tracking-widest leading-none mb-1.5">JOIN THE NETWORK</div>
                    <div className="text-sm sm:text-base font-black text-white italic uppercase tracking-tighter">TELEGRAM CHANNEL</div>
                  </div>
                </div>
                <div className="p-2 bg-white/10 rounded-full text-white group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={16} />
                </div>
              </div>
            </a>

            <button onClick={() => setShowChatInput(!showChatInput)} className={`w-full p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border transition-all flex items-center justify-between group shadow-xl min-h-[80px] ${showChatInput ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.25)]' : 'bg-slate-900 border-white/5 hover:border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'}`}>
               <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                 <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-950 border flex items-center justify-center ${showChatInput ? 'border-emerald-500/50' : 'border-white/5'}`}><Cpu className={showChatInput ? 'text-emerald-400' : 'text-slate-600'} size={20} /></div>
                 <div className="text-left"><span className="text-[8px] sm:text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none block mb-1.5 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">PREMIUM SCAN</span><span className="text-sm sm:text-base font-black text-white italic uppercase tracking-tighter block">Expert Picks & Commands</span></div>
               </div>
               <div className={`p-1.5 rounded-full ${showChatInput ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-500'}`}><ChevronRight size={16} className={showChatInput ? 'rotate-90' : ''} /></div>
            </button>
            {showChatInput && (
              <NeuralChatInput 
                loading={loading} 
                isPremium={isPremium}
                onQuickAction={(a, isFree) => {
                  if (!isPremium && !isFree) {
                    setShowPaymentModal(true);
                    return;
                  }
                  handleChatMessage(`EXECUTE: ${a}`);
                }} 
              />
            )}

            <PerformanceTracker 
              premiumHistory={premiumHistory}
              isLoading={isInitialLoading}
              isPremium={isPremium}
              onUnlockPremium={() => setShowPaymentModal(true)}
            />
          </div>

          <div className="space-y-4 sm:space-y-6">
              {/* Alpha Signals Header */}
             <div className="flex flex-col gap-1 px-1">
               <div className="flex items-center justify-between w-full">
                 <div className="flex items-center gap-3">
                   <Zap size={14} className="text-emerald-400 sm:w-[20px] sm:h-[20px]" />
                   <span className="text-[10px] sm:text-[12px] font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.4em] italic">🎯 Daily Free Picks</span>
                 </div>
                 <span className="text-[8px] font-black text-emerald-500 animate-pulse">LIVE SYNC</span>
               </div>
               <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1 pl-[26px] sm:pl-[32px]">
                 FREE EXPERT AND AI-DRIVEN PREDICTIONS EVERY DAY.
               </span>
             </div>

             {freePicks.length > 0 ? (
               <div className="grid grid-cols-1 gap-4">
                 {freePicks.slice(0, 3).map((pick, i) => (
                   <button 
                     key={i} 
                     onClick={() => handleAnalyze({ homeTeam: pick.home || '', awayTeam: pick.away || '', date: '', betType: pick.tip || '', odds: Number(pick.odds) || 0 }, i, true, pick)} 
                     className={`group p-5 bg-slate-900/60 border rounded-[1.5rem] flex flex-col gap-4 transition-all relative overflow-hidden min-h-[100px] ${activeSignalIndex === i ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/5 hover:border-emerald-500/40'}`}
                   >
                     <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full -mr-12 -mt-12" />
                     
                     <div className="flex items-center justify-between relative z-10 w-full">
                       <div className="flex items-center gap-4">
                         <div className="flex -space-x-3">
                           <TeamLogo url={pick.homeLogo} name={pick.home || ''} size="w-10 h-10" />
                           <TeamLogo url={pick.awayLogo} name={pick.away || ''} size="w-10 h-10" />
                         </div>
                         <div className="text-left">
                           <div className="flex items-center gap-2.5 mb-1">
                             <span className="text-[7px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest">{pick.league}</span>
                             <div className="w-1 h-1 rounded-full bg-slate-800" />
                             <span className="text-[7px] sm:text-[8px] font-black text-emerald-500/60 uppercase">{pick.kickoff}</span>
                           </div>
                           <div className="text-[10px] sm:text-xs font-black text-white uppercase italic tracking-tighter truncate w-full max-w-full">{pick.home} v {pick.away}</div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Confidence</div>
                         <div className="text-sm font-black text-emerald-400 italic leading-none">{pick.confidence}</div>
                       </div>
                     </div>

                     <div className="flex items-center justify-between w-full pt-3 border-t border-white/5 relative z-10">
                       <div className="flex items-center gap-4">
                         <div className="text-[10px] font-black text-white italic">@ {pick.odds}</div>
                       </div>
                       <div className="w-24 sm:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                           style={{ width: `${parseInt(pick.confidence || '0') || 85}%` }} 
                         />
                       </div>
                     </div>
                   </button>
                 ))}
               </div>
             ) : isInitialLoading ? (
               <div className="p-16 border border-white/5 border-dashed rounded-[2.5rem] flex flex-col items-center gap-3 opacity-40">
                 <Loader2 size={32} className="animate-spin text-emerald-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning Markets...</span>
               </div>
             ) : (
               <div className="p-16 border border-white/5 border-dashed rounded-[2.5rem] flex flex-col items-center gap-3 opacity-40">
                 <Zap size={32} className="text-slate-700" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Active Signals</span>
               </div>
             )}
          </div>

          <div className="space-y-6 pb-20 lg:pb-0">
            <BetwinnerBanner />
          </div>
        </motion.aside>

        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 border-t border-white/10 backdrop-blur-2xl z-[150] lg:hidden flex items-center px-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <button 
              onClick={() => { setActiveTab('terminal'); setView('dashboard'); }} 
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-300 touch-target ${activeTab === 'terminal' && view === 'dashboard' ? 'text-emerald-500' : 'text-slate-500'}`}
            >
              <Terminal size={20} className={activeTab === 'terminal' && view === 'dashboard' ? 'scale-110' : ''} />
              <span className="text-[8px] font-black uppercase tracking-tighter">Analysis</span>
              {activeTab === 'terminal' && view === 'dashboard' && <motion.div layoutId="nav-indicator" className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />}
            </button>
            <button 
              onClick={() => { setActiveTab('terminal'); setView('history'); }} 
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-300 touch-target ${activeTab === 'terminal' && view === 'history' ? 'text-emerald-500' : 'text-slate-500'}`}
            >
              <History size={20} className={activeTab === 'terminal' && view === 'history' ? 'scale-110' : ''} />
              <span className="text-[8px] font-black uppercase tracking-tighter">Archive</span>
              {activeTab === 'terminal' && view === 'history' && <motion.div layoutId="nav-indicator" className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />}
            </button>
            <button 
              onClick={() => setActiveTab('command')} 
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-300 touch-target ${activeTab === 'command' ? 'text-emerald-500' : 'text-slate-500'}`}
            >
              <LayoutDashboard size={20} className={activeTab === 'command' ? 'scale-110' : ''} />
              <span className="text-[8px] font-black uppercase tracking-tighter">Command</span>
              {activeTab === 'command' && <motion.div layoutId="nav-indicator" className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />}
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
};

export default App;