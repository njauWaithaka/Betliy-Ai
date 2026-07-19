import { useState, useEffect, useCallback } from 'react';
import { fetchAndProcessAllBets } from './geminiService';

export interface PremiumPick {
  match_name: string;
  home: string;
  away: string;
  kickoff: string;
  league: string;
  odds: number;
  confidence: string | number;
  tip: string;
  pick?: string;
  prediction?: string;
  selection?: string;
  status: string;
  status_color: string;
  home_logo?: string;
  away_logo?: string;
  league_logo?: string;
  match_date: string;
  kickoff_date?: string;
  reason?: string;
  home_goals?: number;
  away_goals?: number;
  homeTeamGoals?: number;
  awayTeamGoals?: number;
  teamAGoals?: number;
  teamBGoals?: number;
  predicted_score?: string;
  ft_score?: string;
  ht_score?: string;
  profit?: string;
  match?: string;
  generated_at?: string;
  source?: string;
}

export interface PremiumPackage {
  package: string;
  type: string;
  status?: string;
  betStatus?: string;
  status_color?: string;
  confidence_avg: number;
  picked_at_utc: string;
  picks: PremiumPick[];
  overall_result?: string;
  total_lost?: number;
  total_pending?: number;
  total_picks?: number;
  total_won?: number;
}

export interface PremiumHistoryData {
  [packageName: string]: PremiumPackage | PremiumPick[] | any;
}

const buildHistoryDataStructure = (historyOutput: any, isPremium: boolean) => {
  const data: Record<string, Record<string, any>> = {};
  const categories = ['bet_of_the_day', 'verified', 'elite_combo', 'free'];
  
  const catToPkgKey: Record<string, string> = {
    'bet_of_the_day': 'bod',
    'verified': 'topPicks',
    'elite_combo': 'eliteCombo',
    'free': 'freePicks'
  };

  for (const cat of categories) {
    const list = historyOutput[cat]?.history || [];
    for (const bet of list) {
      const date = bet.date;
      if (!date) continue;
      
      if (!data[date]) {
        data[date] = {};
      }
      
      if (!data[date][cat]) {
        data[date][cat] = { picks: [] };
      }
      
      const hasSubObjects = (bet.free && typeof bet.free === 'object') || (bet.premium && typeof bet.premium === 'object');
      const activeObj = hasSubObjects ? (isPremium ? bet.premium : bet.free) : null;
      
      const statusValue = activeObj ? (activeObj.status || bet.status) : bet.status;
      const tipValue = activeObj ? (activeObj.market || bet.tip || bet.market || 'Analysis Pending') : (bet.tip || bet.market || 'Analysis Pending');
      const oddsValue = activeObj ? (activeObj.odds || bet.odds) : bet.odds;
      const confidenceValue = activeObj ? (activeObj.aiConfidence || bet.aiConfidence) : bet.aiConfidence;
      const finalVerdictValue = activeObj ? (activeObj.finalVerdict || bet.analysis || bet.finalVerdict || '') : (bet.analysis || bet.finalVerdict || '');
      
      const finalPkgKey = catToPkgKey[cat] || cat;

      data[date][cat].picks.push({
        ...bet,
        homeTeam: bet.homeTeam,
        awayTeam: bet.awayTeam,
        home: bet.homeTeam,
        away: bet.awayTeam,
        league: bet.league,
        time: bet.time,
        date: bet.date,
        tip: tipValue,
        market: tipValue,
        odds: Number(oddsValue) || 1.85,
        confidence: String(confidenceValue || '90'),
        aiConfidence: Number(confidenceValue) || 90,
        status: statusValue || 'pending',
        finalVerdict: finalVerdictValue,
        riskFactor: isPremium ? "Low" : "Medium",
        riskLevel: isPremium ? "Low" : "Medium",
        tipType: bet.tipType,
        packageKey: finalPkgKey
      });
    }
  }
  
  return data;
};

export const usePremiumHistory = (isPremium: boolean = false) => {
  const [data, setData] = useState<PremiumHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const processedBets = await fetchAndProcessAllBets(isPremium);
      const mappedHistory = buildHistoryDataStructure(processedBets, isPremium);
      setData(mappedHistory);
    } catch (err: any) {
      setError(err.message || 'Failed to load premium history');
    } finally {
      setLoading(false);
    }
  }, [isPremium]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return { 
    data, 
    loading, 
    loadingMore: false, 
    error, 
    hasMore: false, 
    loadMore: () => {}, 
    refresh: loadInitialData 
  };
};
