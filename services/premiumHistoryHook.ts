import { useState, useEffect, useCallback, useRef } from 'react';
import { betrixDb, bettipsDb, ref, get, query, orderByKey, limitToLast, endBefore } from './externalFirebase';

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
  // Free pick specific fields
  match?: string;
  generated_at?: string;
  scores?: {
    confidence: number;
    final: number;
    form: number;
    odds_value: number;
  };
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

const CHUNK_SIZE = 15; // Number of dates to fetch per chunk

export const usePremiumHistory = () => {
  const [data, setData] = useState<PremiumHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const lastKeyRef = useRef<string | null>(null);
  const isInitialFetchRef = useRef(true);

  const fetchEliteCombo = async () => {
    try {
      const eliteComboRef = ref(bettipsDb, 'betrix/EliteCombo');
      const snapshot = await get(eliteComboRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (err) {
      console.error("Error fetching EliteCombo:", err);
      return null;
    }
  };

  const fetchHistoryChunk = async (lastDate: string | null) => {
    try {
      let historyQuery;
      const historyRef = ref(betrixDb, 'PremiumHistory');
      
      if (lastDate) {
        historyQuery = query(
          historyRef,
          orderByKey(),
          endBefore(lastDate),
          limitToLast(CHUNK_SIZE)
        );
      } else {
        historyQuery = query(
          historyRef,
          orderByKey(),
          limitToLast(CHUNK_SIZE)
        );
      }

      const snapshot = await get(historyQuery);
      if (!snapshot.exists()) return null;
      
      return snapshot.val();
    } catch (err) {
      console.error("Error fetching history chunk:", err);
      throw err;
    }
  };

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    lastKeyRef.current = null;
    setHasMore(true);
    isInitialFetchRef.current = true;

    try {
      // Fetch EliteCombo and first chunk of history in parallel
      const [eliteCombo, historyChunk] = await Promise.all([
        fetchEliteCombo(),
        fetchHistoryChunk(null)
      ]);

      const mergedData: PremiumHistoryData = {};
      
      if (eliteCombo) {
        mergedData['EliteCombo'] = eliteCombo;
      }

      if (historyChunk) {
        Object.assign(mergedData, historyChunk);
        
        // Track the oldest key in this chunk for next pagination
        const keys = Object.keys(historyChunk).sort();
        if (keys.length > 0) {
          lastKeyRef.current = keys[0];
          if (keys.length < CHUNK_SIZE) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }

      setData(mergedData);
    } catch (err: any) {
      setError(err.message || 'Failed to load initial data');
    } finally {
      setLoading(false);
      isInitialFetchRef.current = false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastKeyRef.current) return;

    setLoadingMore(true);
    try {
      const historyChunk = await fetchHistoryChunk(lastKeyRef.current);
      
      if (historyChunk) {
        setData(prev => ({
          ...prev,
          ...historyChunk
        }));

        const keys = Object.keys(historyChunk).sort();
        if (keys.length > 0) {
          lastKeyRef.current = keys[0];
          if (keys.length < CHUNK_SIZE) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return { 
    data, 
    loading, 
    loadingMore, 
    error, 
    hasMore, 
    loadMore, 
    refresh: loadInitialData 
  };
};
