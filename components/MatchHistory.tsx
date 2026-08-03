import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePremiumHistory, PremiumPick } from '../services/premiumHistoryHook';
import { 
  Trophy, Calendar, Globe, Zap, ChevronRight, Search, Filter, 
  Loader2, AlertTriangle, RefreshCw, BarChart3, Target, Activity, 
  Send, TrendingUp, DollarSign, Percent, ShieldCheck, Info, Clock,
  MapPin, ChevronDown, CheckCircle2, XCircle, HelpCircle
} from 'lucide-react';
import { shortenTeamName } from '../constants';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Dot 
} from 'recharts';

interface MatchHistoryProps {
  isPremium?: boolean;
}

type StatusFilter = 'all' | 'win' | 'loss' | 'pending';
type CategoryFilter = 'all' | 'bod' | 'verified' | 'elite_combo' | 'free';
type TimeframeFilter = 7 | 14 | 30;

const MatchHistory: React.FC<MatchHistoryProps> = ({ isPremium = false }) => {
  const { data, loading, loadingMore, error, hasMore, loadMore, refresh } = usePremiumHistory(isPremium);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // New Filter States
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<TimeframeFilter>(14);
  const [chartCategory, setChartCategory] = useState<CategoryFilter>('all');

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const packageNames: Record<string, string> = {
    'bod': 'Bet of the Day',
    'dob': 'Bet of the Day',
    'bet_of_the_day': 'Bet of the Day',
    'betoftheday': 'Bet of the Day',
    'dailybanker': 'Daily Banker',
    'dailyBanker': 'Daily Banker',
    'freePicks': 'Free Picks',
    'freepicks': 'Free Picks',
    'free': 'Free Picks',
    'topPicks': 'Verified Picks',
    'verified': 'Verified Picks',
    'toppicks': 'Verified Picks',
    'EliteCombo': 'Elite Combo',
    'eliteCombo': 'Elite Combo',
    'elite_combo': 'Elite Combo',
    'elitecombo': 'Elite Combo',
    'betOfTheDay': 'Bet of the Day'
  };

  const groupedPicks = useMemo(() => {
    if (!data) return [];
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 365);
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];

    const rawPicks: (PremiumPick & { date: string; historyDate: string; packageName: string; packageKey: string; normalizedPackageKey: string })[] = [];
    const seenPicks = new Set<string>();
    
    // Helper to process a pick and add it to rawPicks
    const processPick = (pick: any, dateStr: string, pkgKey: string) => {
      if (!pick || typeof pick !== 'object') return;
      
      const normalizedPkgKey = pkgKey.toLowerCase().replace(/_/g, '');
      
      // Keep EliteCombo visible in archive to showcase historical performance for all users
      // (Originally filtered: if (normalizedPkgKey === 'elitecombo' && !isPremium) return;)

      const pkgName = packageNames[pkgKey] || packageNames[normalizedPkgKey] || pick.package || pick.packageName || pkgKey;
      const finalPkgKey = pkgKey || pick.tipType || pick.packageKey || 'general';
      const normalizedFinalPkgKey = finalPkgKey.toLowerCase().replace(/_/g, '');
      
      // Map database fields to UI fields
      const rawOdds = pick.odds || pick.odd || pick.ODDS || pick.ODD || pick.selection_odds;
      let odds = 1.85;
      if (rawOdds !== undefined && rawOdds !== null) {
        const parsed = parseFloat(String(rawOdds).replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed) && parsed > 0) {
          odds = parsed;
        }
      }

      const statusVal = (pick.status || pick.status_color || pick.result || pick.outcome || 'pending').toLowerCase();
      const isWin = statusVal.includes('win') || statusVal.includes('won') || statusVal.includes('green') || statusVal.includes('verified');
      const isLoss = statusVal.includes('loss') || statusVal.includes('lost') || statusVal.includes('red');
      const isVoid = statusVal.includes('void');
      
      let status: 'win' | 'loss' | 'void' | 'pending' = 'pending';
      if (isWin) status = 'win';
      else if (isLoss) status = 'loss';
      else if (isVoid) status = 'void';
      
      // Calculate profit if missing
      let profit = pick.profit;
      if (profit !== undefined && profit !== null) {
        // Ensure profit is a string for display and parsing
        if (typeof profit === 'number') {
          profit = profit >= 0 ? `$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`;
        } else {
          profit = String(profit).replace('+', '');
          if (!profit.includes('$')) {
            const numProfit = parseFloat(profit);
            if (!isNaN(numProfit)) {
              profit = numProfit >= 0 ? `$${numProfit.toFixed(2)}` : `-$${Math.abs(numProfit).toFixed(2)}`;
            }
          }
        }
      } else if (status !== 'pending') {
        const stake = 100;
        if (status === 'win') {
          profit = `$${((odds - 1) * stake).toFixed(2)}`;
        } else if (status === 'loss') {
          profit = `-$${stake.toFixed(2)}`;
        }
      }

      // Construct score if missing
      const ft_score = pick.ft_score || pick.score || pick.predicted_score || 
        (pick.ftHome !== undefined && pick.ftAway !== undefined ? `${pick.ftHome}:${pick.ftAway}` :
        (pick.home_goals !== undefined && pick.away_goals !== undefined ? `${pick.home_goals}:${pick.away_goals}` : 
        (pick.homeTeamGoals !== undefined && pick.awayTeamGoals !== undefined ? `${pick.homeTeamGoals}:${pick.awayTeamGoals}` : 
        (pick.teamAGoals !== undefined && pick.teamBGoals !== undefined ? `${pick.teamAGoals}:${pick.teamBGoals}` : 
        (pick.ftHome !== undefined && pick.ftAway !== undefined ? `${pick.ftHome}:${pick.ftAway}` : undefined)))));

      const rawDate = pick.match_date || pick.kickoff_date || pick.date || pick.kickoff || dateStr;
      let normalizedDate = 'Archive';
      
      if (typeof rawDate === 'string') {
        if (rawDate.includes('T')) {
          normalizedDate = rawDate.split('T')[0];
        } else if (rawDate.includes(' ')) {
          const parts = rawDate.split(' ')[0];
          if (parts.includes('-')) {
            normalizedDate = parts;
          } else if (parts.includes('/')) {
            // Handle DD/MM/YYYY or MM/DD/YYYY
            const dateParts = parts.split('/');
            if (dateParts.length === 3) {
              const [d, m, y] = dateParts;
              // Simple heuristic: if first part > 12, it's definitely day
              if (parseInt(d) > 12) {
                normalizedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
              } else {
                // Default to YYYY-MM-DD assuming DD/MM/YYYY
                normalizedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
              }
            } else {
              normalizedDate = parts;
            }
          } else {
            normalizedDate = parts;
          }
        } else if (rawDate.includes('/')) {
          const dateParts = rawDate.split('/');
          if (dateParts.length === 3) {
            const [d, m, y] = dateParts;
            normalizedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          } else {
            normalizedDate = rawDate;
          }
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
          normalizedDate = rawDate;
        } else {
          normalizedDate = rawDate;
        }
      }

      const home = (pick.home || pick.Home || pick.homeTeam || pick.home_team || pick.teamA || (pick.match_name?.split(' vs ')[0]) || (pick.match?.split(' vs ')[0]) || 'Unknown').trim();
      const away = (pick.away || pick.Away || pick.awayTeam || pick.away_team || pick.teamB || (pick.match_name?.split(' vs ')[1]) || (pick.match?.split(' vs ')[1]) || 'Unknown').trim();
      const tip = pick.tip || pick.Tip || pick.market || pick.pick || pick.prediction || pick.selection || pick.selection_name || 'Verified Pick';
      
      // Deduplication check - use a more specific ID to avoid over-filtering
      const pickId = `${home}_${away}_${normalizedDate}_${normalizedFinalPkgKey}_${tip}_${odds}`.toLowerCase().replace(/\s+/g, '');
      if (seenPicks.has(pickId)) return;
      seenPicks.add(pickId);

      const mappedPick = {
        ...pick,
        home,
        away,
        home_logo: pick.home_logo || pick.homeLogo || pick.HomeLogo || pick.homeTeamLogoUrl || pick.home_logo_url,
        away_logo: pick.away_logo || pick.awayLogo || pick.AwayLogo || pick.awayTeamLogoUrl || pick.away_logo_url,
        league: pick.league || pick.Liga || pick.Sport || 'Elite Pro',
        league_logo: pick.league_logo || pick.leagueLogo || pick.LeagueLogo || pick.leagueLogoUrl || pick.league_logo_url,
        odds: odds,
        confidence: String(pick.confidence || pick.Confidence || pick.aiConfidence || pick.neuralConfidence || '90'),
        tip: tip,
        status: status,
        profit: profit,
        ft_score: ft_score || 'FT',
        date: normalizedDate,
        historyDate: dateStr,
        packageName: pkgName,
        packageKey: finalPkgKey,
        normalizedPackageKey: normalizedFinalPkgKey
      };

      rawPicks.push(mappedPick);
    };

    // Deep scan for picks in objects
    const scanForPicks = (obj: any, dateStr: string, currentKey: string) => {
      if (!obj || typeof obj !== 'object') return;
      
      // If it's a pick object
      if (obj.home || obj.homeTeam || obj.match_name || obj.match || obj.home_team) {
        processPick(obj, dateStr, currentKey);
        return;
      }
      
      // If it's an array, process each item
      if (Array.isArray(obj)) {
        obj.forEach(item => scanForPicks(item, dateStr, currentKey));
        return;
      }
      
      // Otherwise, iterate through values
      Object.values(obj).forEach(val => {
        if (val && typeof val === 'object') {
          scanForPicks(val, dateStr, currentKey);
        }
      });
    };

    if (Array.isArray(data)) {
      data.forEach(item => scanForPicks(item, 'Archive', 'elite'));
    } else {
      Object.entries(data).forEach(([key, value]) => {
        if (!value) return;

        if (/^\d{4}-\d{2}-\d{2}$/.test(key) && typeof value === 'object' && !Array.isArray(value)) {
          Object.entries(value as Record<string, any>).forEach(([pkgKey, pkgValue]) => {
            scanForPicks(pkgValue, key, pkgKey);
          });
        } else {
          scanForPicks(value, 'Archive', key);
        }
      });
    }

    // Grouping logic
    const groups: Record<string, any> = {};
    
    rawPicks.forEach(pick => {
      const normalizedPkgKey = (pick.normalizedPackageKey || pick.packageKey.toLowerCase()).replace(/_/g, '');
      // Group dailybanker, elitecombo, and banker of the day by historyDate to ensure they stay together
      // User requested Elite Combo ALWAYS multibet, Daily Banker multibet if >= 2
      const isPotentialMultibet = normalizedPkgKey === 'dailybanker' || normalizedPkgKey === 'elitecombo' || normalizedPkgKey === 'dob' || normalizedPkgKey === 'bod' || normalizedPkgKey === 'betoftheday';
      const groupKey = isPotentialMultibet ? `${pick.historyDate}_${normalizedPkgKey}` : `single_${pick.historyDate}_${pick.home}_${pick.away}_${pick.packageKey}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          type: isPotentialMultibet ? 'multibet' : 'single',
          date: pick.historyDate,
          packageName: pick.packageName,
          packageKey: normalizedPkgKey,
          picks: [],
          status: pick.status,
          profit: pick.profit,
          odds: pick.odds,
          confidence: pick.confidence
        };
      }
      
      groups[groupKey].picks.push(pick);
    });

    // Post-process groups (calculate multibet odds if needed, though usually they come with status)
    const result = Object.values(groups).map(group => {
      const normalizedPkgKey = group.packageKey.toLowerCase();
      
      // Elite Combo: ALWAYS treat as MULTIBET (regardless of picks count)
      if (normalizedPkgKey === 'elitecombo') {
        group.type = 'multibet';
        group.packageName = 'Elite Combo';
      } 
      // Daily Banker / Banker of the Day: If picks.length == 1 -> SINGLE, If >= 2 -> MULTIBET
      else if (normalizedPkgKey === 'dailybanker' || normalizedPkgKey === 'dob' || normalizedPkgKey === 'bod' || normalizedPkgKey === 'betoftheday') {
        if (group.picks.length === 1) {
          group.type = 'single';
        } else {
          group.type = 'multibet';
          // User requested: Rename daily banker combo to just daily banker even if there are two or more picks
          if (normalizedPkgKey === 'dailybanker') {
            group.packageName = 'Daily Banker';
          } else if (!group.packageName.toLowerCase().includes('combo')) {
            group.packageName = `${group.packageName} Combo`;
          }
        }
      }
      // Other packages: If only 1 pick, it's a single bet
      else if (group.picks.length === 1) {
        group.type = 'single';
      }
      
      if (group.type === 'multibet') {
        const hasLoss = group.picks.some((p: any) => p.status?.toLowerCase()?.includes('loss') || p.status?.toLowerCase()?.includes('red'));
        const allWin = group.picks.every((p: any) => p.status?.toLowerCase()?.includes('win') || p.status?.toLowerCase()?.includes('verified') || p.status?.toLowerCase()?.includes('green'));
        
        if (hasLoss) group.status = 'Loss';
        else if (allWin) group.status = 'Won';
        else group.status = 'Pending';

        // Calculate total odds for multibet (multiply all odds)
        // Use a more precise multiplication and ensure we don't multiply by 0 or NaN
        const totalOdds = group.picks.reduce((acc: number, p: any) => {
          const pOdds = parseFloat(String(p.odds));
          return acc * (isNaN(pOdds) || pOdds <= 0 ? 1 : pOdds);
        }, 1);
        group.odds = totalOdds.toFixed(2);
        
        // Average confidence
        const avgConf = group.picks.reduce((acc: number, p: any) => acc + (Number(p.confidence) || 0), 0) / group.picks.length;
        group.confidence = Math.round(avgConf);

        // Dynamically compute multibet group profit using standard stake of 100
        const stakeVal = 100;
        if (group.status === 'Won') {
          group.profit = `$${((totalOdds - 1) * stakeVal).toFixed(2)}`;
        } else if (group.status === 'Loss') {
          group.profit = `-$${stakeVal.toFixed(2)}`;
        } else {
          group.profit = '—';
        }
      } else {
        const p = group.picks[0];
        const status = (p.status || '').toLowerCase();
        if (status.includes('win') || status.includes('verified') || status.includes('green')) {
          group.status = 'Won';
        } else if (status.includes('loss') || status.includes('red')) {
          group.status = 'Loss';
        } else {
          group.status = 'Pending';
        }
      }
      return group;
    });

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [data]);

  const filteredPicks = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    
    // Filter by timeframe first
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - timeframeFilter);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    return groupedPicks.filter(group => {
      // Timeframe check
      if (group.date < cutoffStr) return false;

      // Status check
      if (statusFilter !== 'all') {
        const groupStatus = group.status?.toLowerCase() || '';
        if (statusFilter === 'win' && !groupStatus.includes('won')) return false;
        if (statusFilter === 'loss' && !groupStatus.includes('loss')) return false;
        if (statusFilter === 'pending' && !groupStatus.includes('pending')) return false;
      }

      // Category check
      if (categoryFilter !== 'all') {
        const pkg = group.packageKey.toLowerCase().replace(/_/g, '');
        if (categoryFilter === 'bod' && (pkg !== 'bod' && pkg !== 'dob' && pkg !== 'betoftheday')) return false;
        if (categoryFilter === 'verified' && (pkg !== 'toppicks' && pkg !== 'verified')) return false;
        if (categoryFilter === 'elite_combo' && pkg !== 'elitecombo') return false;
        if (categoryFilter === 'free' && pkg !== 'freepicks' && pkg !== 'free') return false;
      }

      // Search check
      const matchesSearch = group.picks.some((pick: any) => 
        (pick.home?.toLowerCase() || '').includes(term) || 
        (pick.away?.toLowerCase() || '').includes(term) ||
        (pick.league?.toLowerCase() || '').includes(term) ||
        (pick.packageName?.toLowerCase() || '').includes(term)
      );
      
      return matchesSearch;
    });
  }, [groupedPicks, searchTerm, statusFilter, categoryFilter, timeframeFilter]);

  const stats = useMemo(() => {
    if (filteredPicks.length === 0) return null;
    
    let totalPicks = 0;
    let wonPicks = 0;
    let lostPicks = 0;
    let totalBets = 0;
    let wonBets = 0;
    let lostBets = 0;
    let totalStake = 0;
    let totalProfit = 0;
    let totalOdds = 0;
    let oddsCount = 0;

    const categoryStats: Record<string, { wins: number; total: number; profit: number }> = {};
    const dateProfitMap: Record<string, { profit: number; count: number; isBigWin: boolean; isLoss: boolean }> = {};

    // Sort filteredPicks by date ascending for cumulative profit
    const sortedGroups = [...filteredPicks].sort((a, b) => a.date.localeCompare(b.date));
    
    sortedGroups.forEach(group => {
      const stake = 100; // Standard stake per bet group
      totalStake += stake;
      totalBets++;
      
      const pkgName = group.packageName;
      if (!categoryStats[pkgName]) categoryStats[pkgName] = { wins: 0, total: 0, profit: 0 };
      categoryStats[pkgName].total++;

      let groupProfit = 0;
      const status = (group.status || '').toLowerCase();
      
      if (status.includes('won')) {
        wonBets++;
        categoryStats[pkgName].wins++;
        const odds = parseFloat(group.odds) || 1.85;
        groupProfit = (odds - 1) * stake;
        totalOdds += odds;
        oddsCount++;
      } else if (status.includes('loss')) {
        lostBets++;
        groupProfit = -stake;
        const odds = parseFloat(group.odds) || 1.85;
        totalOdds += odds;
        oddsCount++;
      }

      totalProfit += groupProfit;
      categoryStats[pkgName].profit += groupProfit;
      
      // Chart data (filter by chartCategory if needed)
      const pkg = group.packageKey.toLowerCase();
      let includeInChart = true;
      if (chartCategory !== 'all') {
        if (chartCategory === 'bod' && (pkg !== 'bod' && pkg !== 'dob' && pkg !== 'betoftheday')) includeInChart = false;
        if (chartCategory === 'verified' && (pkg !== 'toppicks' && pkg !== 'verified')) includeInChart = false;
        if (chartCategory === 'elite_combo' && pkg !== 'elitecombo') includeInChart = false;
        if (chartCategory === 'free' && pkg !== 'freepicks' && pkg !== 'free') includeInChart = false;
      }

      if (includeInChart) {
        if (!dateProfitMap[group.date]) {
          dateProfitMap[group.date] = { profit: 0, count: 0, isBigWin: false, isLoss: false };
        }
        dateProfitMap[group.date].profit += groupProfit;
        dateProfitMap[group.date].count += 1;
        if (groupProfit > 200) dateProfitMap[group.date].isBigWin = true;
        if (groupProfit < 0) dateProfitMap[group.date].isLoss = true;
      }

      group.picks.forEach((pick: any) => {
        totalPicks++;
        const pStatus = (pick.status || '').toLowerCase();
        if (pStatus.includes('win') || pStatus.includes('won') || pStatus.includes('green') || pStatus.includes('verified')) {
          wonPicks++;
        } else if (pStatus.includes('loss') || pStatus.includes('lost') || pStatus.includes('red')) {
          lostPicks++;
        }
      });
    });

    // Generate cumulative chart data from aggregated date profits
    let cumulativeProfit = 0;
    const chartData = Object.entries(dateProfitMap)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => {
        cumulativeProfit += data.profit;
        return {
          date,
          profit: Number(cumulativeProfit.toFixed(2)),
          dailyProfit: Number(data.profit.toFixed(2)),
          count: data.count,
          isBigWin: data.isBigWin,
          isLoss: data.isLoss
        };
      });

    // Win rate based on individual picks as requested
    const winRate = totalPicks > 0 ? (wonPicks / (wonPicks + lostPicks || 1)) * 100 : 0;
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
    const avgOdds = oddsCount > 0 ? totalOdds / oddsCount : 0;

    // Find best performing category
    let bestCat = "N/A";
    let maxProfit = -Infinity;
    Object.entries(categoryStats).forEach(([name, data]) => {
      if (data.profit > maxProfit) {
        maxProfit = data.profit;
        bestCat = name;
      }
    });

    const bestCatContribution = totalProfit > 0 ? (maxProfit / totalProfit) * 100 : 0;

    return {
      total: totalPicks,
      wins: wonBets,
      losses: lostBets,
      totalBets,
      wonBets,
      lostBets,
      wonPicks,
      lostPicks,
      winRate: winRate.toFixed(1),
      roi: roi.toFixed(1),
      profit: totalProfit.toFixed(2),
      avgOdds: avgOdds.toFixed(2),
      bestCategory: bestCat,
      bestCategoryContribution: bestCatContribution.toFixed(0),
      categoryBreakdown: Object.entries(categoryStats).map(([name, data]) => ({
        name,
        winRate: ((data.wins / data.total) * 100).toFixed(1),
        profit: data.profit.toFixed(2),
        total: data.total
      })),
      chartData
    };
  }, [filteredPicks, chartCategory]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 size={40} className="animate-spin text-emerald-500" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Syncing Neural Archive...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 border border-rose-500/20 rounded-[2rem] bg-rose-500/5">
        <AlertTriangle size={40} className="text-rose-500" />
        <div className="text-center">
          <p className="text-sm font-bold text-white uppercase italic">Archive Sync Failed</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{error}</p>
        </div>
        <button onClick={refresh} className="mt-4 px-6 py-2 bg-slate-900 border border-white/10 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:bg-slate-800 transition-all">
          Retry Handshake
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 sm:space-y-10 animate-in fade-in duration-700 pb-20"
    >
      {/* Editorial Header */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-3 sm:space-y-4 px-1 sm:px-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-[1px] w-6 sm:w-12 bg-emerald-500/50" />
            <span className="text-[7px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] sm:tracking-[0.4em]">AI Intelligence Archive</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-black text-white italic uppercase tracking-tighter leading-[0.85]">
            Elite Performance <br />
            <span className="text-emerald-400">Vault</span>
          </h2>
          <div className="max-w-xs">
            <p className="text-[8px] sm:text-[11px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed border-l border-white/10 pl-3 sm:pl-4">
              Real Results. Verified Growth. Zero Guesswork. We focus on <span className="text-white">Certainty + Exclusivity</span> to deliver elite-level returns.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Decision-Grade KPIs */}
      {stats && (() => {
        const isRoiPositive = Number(stats.roi) >= 0;
        const roiValue = isRoiPositive 
          ? `${Math.abs(Number(stats.roi)).toFixed(1)}%` 
          : `-${Math.abs(Number(stats.roi)).toFixed(1)}%`;
        const roiColor = isRoiPositive ? "text-emerald-400" : "text-rose-500";
        const roiBorder = isRoiPositive ? "border-emerald-500/30" : "border-rose-500/30";
        const roiBg = isRoiPositive ? "bg-emerald-500/5" : "bg-rose-500/5";
        const roiIconColor = isRoiPositive ? "text-emerald-500" : "text-rose-500";

        const isProfitPositive = Number(stats.profit) >= 0;
        const profitValue = isProfitPositive 
          ? `$${Math.abs(Number(stats.profit)).toFixed(2)}` 
          : `-$${Math.abs(Number(stats.profit)).toFixed(2)}`;
        const profitColor = isProfitPositive ? "text-emerald-400" : "text-rose-500";
        const profitBorder = isProfitPositive ? "border-emerald-500/30" : "border-rose-500/30";
        const profitBg = isProfitPositive ? "bg-emerald-500/5" : "bg-rose-500/5";
        const profitIconColor = isProfitPositive ? "text-emerald-500" : "text-rose-500";

        const kpis = [
          { 
            label: "ROI (%)", 
            value: roiValue, 
            icon: TrendingUp, 
            color: roiColor, 
            border: roiBorder,
            bg: roiBg,
            shadowClass: isRoiPositive ? 'drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]',
            iconColor: roiIconColor,
            highlight: true, 
            subIcon: isRoiPositive ? "📈" : "📉" 
          },
          { 
            label: "Total Profit", 
            value: profitValue, 
            icon: DollarSign, 
            color: profitColor, 
            border: profitBorder,
            bg: profitBg,
            shadowClass: isProfitPositive ? 'drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]',
            iconColor: profitIconColor,
            highlight: true, 
            subIcon: "💰" 
          },
          { 
            label: "Win Rate", 
            value: `${stats.winRate}%`, 
            icon: Percent, 
            color: "text-amber-400", 
            border: "border-white/5",
            bg: "bg-amber-500/5",
            shadowClass: "",
            iconColor: "text-amber-500",
            highlight: false, 
            subIcon: "🎯" 
          }
        ];

        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
            {kpis.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className={`bg-slate-900/40 border ${item.border} rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 relative overflow-hidden group hover:border-white/10 transition-all shadow-2xl`}
              >
                <div className={`absolute -right-4 -bottom-4 sm:-right-6 sm:-bottom-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity ${item.iconColor}`}>
                  <item.icon size={60} className="sm:w-[100px] sm:h-[100px]" />
                </div>
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                  <span className="text-xs">{item.subIcon}</span>
                </div>
                <p className={`text-xl sm:text-2xl font-black italic tracking-tighter ${item.color} ${item.shadowClass}`}>
                  {item.value}
                </p>
                {item.highlight && (
                  <div className={`absolute top-0 left-0 w-full h-full ${item.bg} blur-3xl -z-10`} />
                )}
              </motion.div>
            ))}
          </div>
        );
      })()}

      {/* Performance Chart Section */}
      {stats && stats.chartData.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/40 border border-white/5 rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-white uppercase italic tracking-tight">Cumulative Profit</h3>
              <p className="text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest">Growth trajectory over time</p>
            </div>
            <div className="flex items-center gap-2 p-1 bg-slate-950/50 rounded-full overflow-x-auto no-scrollbar">
              {(['all', 'bod', 'verified', 'elite_combo', 'free'] as CategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setChartCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    chartCategory === cat ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {cat === 'bod' ? 'Bet of the Day' : cat === 'verified' ? 'Verified' : cat === 'elite_combo' ? 'Elite Combo' : cat === 'free' ? 'Free Pick' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[250px] sm:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-[10px] font-bold text-slate-400">Cumulative Profit</span>
                              <span className="text-xs font-black text-emerald-400 italic">${data.profit}</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-[10px] font-bold text-slate-400">Daily Delta</span>
                              <span className={`text-xs font-black italic ${data.dailyProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                                {data.dailyProfit >= 0 ? '+' : ''}${data.dailyProfit}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-[10px] font-bold text-slate-400">Signals Count</span>
                              <span className="text-xs font-black text-white italic">{data.count}</span>
                            </div>
                          </div>
                          {data.isBigWin && (
                            <div className="mt-2 pt-2 border-t border-white/5">
                              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                <Zap size={8} /> High Yield Day
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  animationDuration={2000}
                  dot={(props: any) => {
                    const { cx, cy, payload, index } = props;
                    if (payload.isBigWin) {
                      return <Dot key={`dot-${index}`} cx={cx} cy={cy} r={4} fill="#f59e0b" stroke="#000" strokeWidth={1} />;
                    }
                    if (payload.isLoss) {
                      return <Dot key={`dot-${index}`} cx={cx} cy={cy} r={3} fill="#f43f5e" />;
                    }
                    return <circle key={`dot-${index}`} r={0} />;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* User Value Framing */}
      {stats && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 flex items-center gap-6 group hover:border-emerald-500/20 transition-all">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Compound Growth Example</p>
              <p className="text-sm sm:text-base font-bold text-white leading-tight">
                If you started with <span className="text-emerald-400">$100</span>, <br />
                you would now have <span className="text-emerald-400 font-black italic text-lg sm:text-xl">${(100 * (1 + Number(stats.roi)/100)).toFixed(2)}+</span>
              </p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 flex items-center gap-6 group hover:border-blue-500/20 transition-all">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <DollarSign size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Standard Unit Profit</p>
              <p className="text-sm sm:text-base font-bold text-white leading-tight">
                If you staked <span className="text-blue-400">$10</span> per bet, <br />
                your total profit would be <span className="text-blue-400 font-black italic text-lg sm:text-xl">${(Number(stats.profit) / 10).toFixed(2)}+</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Advanced Filters Bar */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-4 bg-slate-900/40 p-4 sm:p-6 rounded-[2rem] sm:rounded-[3rem] border border-white/5 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH TEAM, LEAGUE OR PACKAGE..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-full py-3.5 pl-12 pr-4 text-[10px] font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-center">
            {/* Status Chips */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/50 rounded-full">
              {(['all', 'win', 'loss', 'pending'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === s ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/50 rounded-full">
              {(['all', 'bod', 'verified', 'elite_combo', 'free'] as CategoryFilter[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                    categoryFilter === c ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {c === 'bod' ? 'BOD' : c === 'verified' ? 'Verified' : c === 'elite_combo' ? 'Elite Combo' : c === 'free' ? 'Free' : c}
                </button>
              ))}
            </div>

            {/* Timeframe Chips */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/50 rounded-full">
              {([7, 14, 30] as TimeframeFilter[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframeFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                    timeframeFilter === t ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {t}d
                </button>
              ))}
            </div>

            <button onClick={refresh} className="p-3 text-slate-500 hover:text-emerald-400 transition-all bg-slate-950/50 rounded-full">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Data Grid */}
      <div className="space-y-4">
        {filteredPicks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {filteredPicks.map((group) => {
              const isWin = group.status?.toLowerCase()?.includes('won');
              const isLoss = group.status?.toLowerCase()?.includes('loss');
              const isPending = !isWin && !isLoss;
              
              const isExpanded = group.type === 'single' || expandedGroups[group.id];
              
              return (
                <motion.div 
                  key={group.id} 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`group bg-slate-900/20 border ${isWin ? 'border-emerald-500/20 hover:border-emerald-500/30' : isLoss ? 'border-rose-500/20 hover:border-rose-500/30' : 'border-white/5 hover:border-white/10'} rounded-2xl p-3 sm:p-5 hover:bg-slate-900/35 transition-all relative overflow-hidden shadow-lg`}
                >
                  {/* Glow Effect */}
                  <div className={`absolute -right-20 -top-20 w-40 h-40 blur-[80px] opacity-15 pointer-events-none ${isWin ? 'bg-emerald-500' : isLoss ? 'bg-rose-500' : 'bg-amber-500'}`} />

                  {/* Header Info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-md ${
                        group.packageKey === 'dailybanker' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                        group.packageKey === 'bod' || group.packageKey === 'dob' || group.packageKey === 'betoftheday' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        group.packageKey === 'toppicks' || group.packageKey === 'verified' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                        group.packageKey === 'elitecombo' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                        group.packageKey === 'freepicks' || group.packageKey === 'free' ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' :
                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        Verified: {group.packageName}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={11} />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic">{group.date}</span>
                      </div>
                      {group.type === 'multibet' && (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
                          {group.picks.length} Matches
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`flex flex-col items-end gap-0.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[11px] font-black uppercase tracking-widest shadow-md transition-all ${
                        isWin ? 'bg-white text-emerald-600 border border-emerald-200' : 
                        isLoss ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          {isWin ? <CheckCircle2 size={13} /> : isLoss ? <XCircle size={13} /> : <HelpCircle size={13} />}
                          {isWin ? `WON (${group.profit})` : isLoss ? `LOSS (${group.profit})` : 'PENDING'}
                        </div>
                        {group.type === 'single' && group.picks[0].ft_score && (
                          <span className="text-[8px] sm:text-[9px] opacity-70">Score: {group.picks[0].ft_score}</span>
                        )}
                      </div>
                      {group.type === 'multibet' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleGroup(group.id); }}
                          className="p-1.5 sm:p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 border border-white/5"
                        >
                          <ChevronDown size={15} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Matches List */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 sm:space-y-5"
                      >
                        {group.picks.map((pick: any, idx: number) => {
                          const confidence = Number(pick.confidence) || 90;
                          const riskLevel = confidence >= 90 ? 'LOW RISK' : confidence >= 80 ? 'MEDIUM' : 'HIGH';
                          const riskColor = confidence >= 90 ? 'text-emerald-400 bg-emerald-400/10' : confidence >= 80 ? 'text-amber-400 bg-amber-400/10' : 'text-rose-400 bg-rose-400/10';
                          const pickKey = `${pick.home}-${pick.away}-${idx}`;

                          return (
                            <div key={pickKey} className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-5 pb-4 sm:pb-5 last:pb-0 border-b last:border-0 border-white/5 w-full max-w-full box-border">
                              <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1 w-full md:w-auto">
                                <div className="flex -space-x-2.5 sm:-space-x-4 shrink-0">
                                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center p-1.5 sm:p-2.5 shadow-md relative z-10">
                                    {pick.home_logo ? <img src={pick.home_logo} alt={pick.home} className="w-full h-full object-contain" referrerPolicy="no-referrer" /> : <Target size={18} className="text-slate-800" />}
                                  </div>
                                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center p-1.5 sm:p-2.5 shadow-md">
                                    {pick.away_logo ? <img src={pick.away_logo} alt={pick.away} className="w-full h-full object-contain" referrerPolicy="no-referrer" /> : <Target size={18} className="text-slate-800" />}
                                  </div>
                                </div>
                                
                                <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-0.5">
                                      <MapPin size={9} /> {pick.league}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[7px] sm:text-[9px] font-black uppercase tracking-widest ${riskColor}`}>
                                      {riskLevel}
                                    </span>
                                  </div>
                                  <h4 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-tight leading-snug flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0 w-full break-normal overflow-wrap-normal whitespace-normal">
                                    <span className="sm:hidden whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] inline-block">
                                      {shortenTeamName(pick.home)}
                                    </span>
                                    <span className="sm:hidden text-slate-600 font-medium normal-case mx-1 text-xs inline-block">vs</span>
                                    <span className="sm:hidden whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] inline-block">
                                      {shortenTeamName(pick.away)}
                                    </span>
                                    
                                    <span className="hidden sm:inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] md:max-w-[280px] lg:max-w-[400px]">
                                      {pick.home}
                                    </span>
                                    <span className="hidden sm:inline-block text-slate-600 font-medium normal-case mx-1.5 text-xs sm:text-sm">vs</span>
                                    <span className="hidden sm:inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] md:max-w-[280px] lg:max-w-[400px]">
                                      {pick.away}
                                    </span>
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest">
                                    <span className="text-emerald-400">Market: {pick.tip || pick.pick || pick.prediction || 'Verified Pick'}</span>
                                    {pick.ft_score && (
                                      <span className="text-slate-400 bg-white/5 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px]">Score: {pick.ft_score}</span>
                                    )}
                                    {pick.kickoff && (
                                      <span className="text-slate-500 flex items-center gap-1"><Clock size={10} /> {pick.kickoff}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {group.type === 'single' && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-row md:items-center md:justify-end gap-2 sm:gap-4 md:gap-8 shrink-0 bg-slate-950/30 sm:bg-transparent p-3 sm:p-4 md:p-0 rounded-xl sm:rounded-none border border-white/5 sm:border-0 w-full md:w-auto max-w-full">
                                  <div className="flex justify-between sm:flex-col sm:text-center md:text-right space-y-0 sm:space-y-1 border-b sm:border-b-0 border-white/5 pb-1.5 sm:pb-0 w-full sm:w-auto">
                                    <p className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest">Odds</p>
                                    <p className="text-sm sm:text-base md:text-lg font-black text-white italic tracking-tighter">@ {pick.odds}</p>
                                  </div>
                                  <div className="flex justify-between sm:flex-col sm:text-center md:text-right space-y-0 sm:space-y-1 border-b sm:border-b-0 border-white/5 pb-1.5 sm:pb-0 w-full sm:w-auto">
                                    <p className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest">Confidence</p>
                                    <p className="text-sm sm:text-base md:text-lg font-black text-emerald-400 italic tracking-tighter">{pick.confidence}%</p>
                                  </div>
                                  <div className="flex justify-between sm:flex-col sm:text-center md:text-right space-y-0 sm:space-y-1 pt-1.5 sm:pt-0 w-full sm:w-auto">
                                    <p className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest">Profit</p>
                                    <p className={`text-sm sm:text-base md:text-lg font-black italic tracking-tighter ${
                                      pick.profit && typeof pick.profit === 'string' && pick.profit.includes('-') ? 'text-rose-500' : 'text-emerald-400'
                                    }`}>
                                      {pick.profit || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {group.type === 'multibet' && (
                                <div className="flex items-center gap-3 md:gap-5 shrink-0 md:justify-end w-full md:w-auto mt-2 md:mt-0 bg-slate-950/30 md:bg-transparent p-2 sm:p-3 md:p-0 rounded-lg md:rounded-none border border-white/5 md:border-0 justify-between md:justify-start">
                                  {/* Individual Pick Odds & Confidence inside Multibet */}
                                  <div className="flex items-center gap-3 text-left md:text-right">
                                    <div>
                                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Odds</p>
                                      <p className="text-xs font-bold text-slate-300">@ {pick.odds}</p>
                                    </div>
                                    <div className="border-l border-white/5 pl-3 h-5" />
                                    <div>
                                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Confidence</p>
                                      <p className="text-xs font-bold text-slate-400">{pick.confidence}%</p>
                                    </div>
                                  </div>

                                  <div className="hidden md:block border-l border-white/5 pl-3 h-6" />

                                  {/* Individual Match Status Badge (Won/Loss/Pending/Void) */}
                                  <div className="flex items-center justify-end min-w-[75px]">
                                    {pick.status === 'win' && (
                                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider shadow-sm">
                                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                                        <span>WON</span>
                                      </div>
                                    )}
                                    {pick.status === 'loss' && (
                                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase tracking-wider shadow-sm">
                                        <XCircle size={12} className="text-rose-400 shrink-0" />
                                        <span>LOST</span>
                                      </div>
                                    )}
                                    {pick.status === 'void' && (
                                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[9px] font-black uppercase tracking-wider shadow-sm">
                                        <HelpCircle size={12} className="text-slate-400 shrink-0" />
                                        <span>VOID</span>
                                      </div>
                                    )}
                                    {pick.status === 'pending' && (
                                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider shadow-sm">
                                        <Clock size={12} className="text-amber-400 shrink-0 animate-pulse" />
                                        <span>PENDING</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Multibet Footer */}
                  {group.type === 'multibet' && (
                    <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row md:items-center md:justify-start gap-3 sm:gap-4 md:gap-10 w-full md:w-auto bg-slate-950/30 md:bg-transparent p-3 sm:p-4 md:p-0 rounded-xl md:rounded-none border border-white/5 md:border-0">
                        <div className="flex justify-between sm:flex-col space-y-0 sm:space-y-1 border-b sm:border-b-0 border-white/5 pb-1.5 sm:pb-0 w-full sm:w-auto">
                          <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Multibet Odds</p>
                          <p className="text-sm sm:text-lg md:text-xl font-bold text-white italic tracking-tighter">@ {group.odds}</p>
                        </div>
                        <div className="flex justify-between sm:flex-col space-y-0 sm:space-y-1 pt-1.5 sm:pt-0 w-full sm:w-auto">
                          <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Confidence</p>
                          <p className="text-sm sm:text-lg md:text-xl font-bold text-emerald-400 italic tracking-tighter">{group.confidence}%</p>
                        </div>
                      </div>
                      <div className="flex justify-between sm:flex-col sm:text-right space-y-0 sm:space-y-1 bg-slate-950/30 md:bg-transparent p-3 sm:p-4 md:p-0 rounded-xl md:rounded-none border border-white/5 md:border-0 w-full md:w-auto">
                        <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Profit</p>
                        <p className={`text-sm sm:text-lg md:text-xl font-bold italic tracking-tighter ${
                          group.profit && typeof group.profit === 'string' && group.profit.includes('-') ? 'text-rose-500' : 'text-emerald-400'
                        }`}>
                          {group.profit}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border border-white/5 border-dashed rounded-[3rem] bg-slate-900/10">
            <Zap size={40} className="text-slate-800 mb-4" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">No data available for current filters</p>
          </div>
        )}

        {hasMore && data && (
          <div className="flex justify-center pt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="group relative px-10 py-4 bg-slate-900/60 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-3">
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-emerald-500" />
                    <span>Syncing Next Chunk...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>Load Older Archive Data</span>
                  </>
                )}
              </div>
              {loadingMore && (
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-emerald-500"
                />
              )}
            </button>
          </div>
        )}
      </div>
      {/* Sticky CTA for Mobile */}
      <div className="fixed bottom-6 left-0 w-full px-6 z-50 sm:hidden">
        <motion.a
          href="https://t.me/BetlifyAI"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="flex items-center justify-center gap-3 w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(16,185,129,0.3)] border border-emerald-400/30"
        >
          <ShieldCheck size={20} />
          🔓 Unlock Premium Signals
        </motion.a>
      </div>

      {/* Telegram CTA Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] p-8 sm:p-12 text-center space-y-6 relative overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/10 blur-[100px] rounded-full" />
        
        <div className="space-y-2 relative z-10">
          <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter">📲 Get Live Picks Instantly</h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Join 15,000+ members receiving real-time neural signals</p>
        </div>
        
        <a 
          href="https://t.me/BetlifyAI" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-10 py-4 bg-blue-500 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-400 transition-all shadow-2xl shadow-blue-500/20 group"
        >
          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          Connect to Telegram Channel
        </a>
      </motion.div>
    </motion.div>
  );
};

export default MatchHistory;
