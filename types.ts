
export interface FixtureData {
  homeTeam: string;
  awayTeam: string;
  date: string;
  betType: string;
  homeLogo?: string;
  awayLogo?: string;
  odds?: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Metric {
  label: string;
  value: number; // 0-100
}

export interface BetAnalysis {
  homeTeam: string;
  awayTeam: string;
  tip: string;
  confidence: number;
  riskFactor: 'Low' | 'Medium' | 'High';
  metrics: Metric[];
  keyStats: string[];
  shortReason: string;
  sources: GroundingSource[];
  aiConfidence?: number;
  valueScore?: number;
  marketVolatility?: number;
  signal?: string;
  pickType?: 'Daily Banker' | 'Bet of the Day' | 'Verified Pick' | 'Free Pick' | 'Elite Signal' | 'Alpha Signal';
  homeLogo?: string;
  awayLogo?: string;
  odds?: number;
  predictedScore?: string;
  sections?: { heading: string; body: string }[];
  bulletPoints?: string[];
}

export interface AlphaSignal {
  home: string;
  away: string;
  homeLogo?: string;
  awayLogo?: string;
  league: string;
  date: string;
  odds: string | number;
  confidence: string | number;
  isPremium?: boolean;
  type?: string;
}

export interface EliteComboPick {
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  league: string;
  country?: string;
  tip: string;
  odds: number;
  aiConfidence: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  tipType: string;
  analysis?: string;
}

export interface FirebasePick {
  home?: string;
  away?: string;
  homeTeam?: string;
  awayTeam?: string;
  league?: string;
  tip?: string;
  odds?: number;
  confidence?: string;
  aiConfidence?: number;
  match?: string;
  kickoff?: string;
  homeLogo?: string;
  awayLogo?: string;
  homeTeamLogoUrl?: string;
  awayTeamLogoUrl?: string;
  home_logo?: string;
  away_logo?: string;
  league_logo?: string;
  leagueLogoUrl?: string;
  status?: 'win' | 'loss' | 'void' | 'pending';
  result?: string;
  profit?: string;
  value?: string;
  stake?: string;
  score?: string;
  date?: string;
  isArchive?: boolean;
  package?: string;
  riskFactor?: 'Low' | 'Medium' | 'High';
  valueScore?: number;
  marketVolatility?: number;
  signal?: string;
  preview_ui?: {
    title?: string;
    headline?: string;
    summary: string;
    sections: { heading: string; body: string }[];
    bullet_points: string[];
    markets?: {
      pick: string;
      predicted_score: string;
      over_under_2_5: string;
      btts: string;
    };
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'analysis' | 'alpha-signals' | 'elite-combo' | 'verified-picks';
  analysis?: BetAnalysis;
  alphaSignals?: AlphaSignal[];
  eliteCombo?: EliteComboPick[];
  verifiedPicks?: FirebasePick[];
  isFree?: boolean;
  timestamp: Date;
}

export enum BetType {
  FULL_TIME_RESULT = 'Full-Time Result (1X2)',
  BOTH_TEAMS_TO_SCORE = 'Both Teams To Score (BTTS)',
  OVER_UNDER = 'Over/Under Goals',
  DOUBLE_CHANCE = 'Double Chance',
  ASIAN_HANDICAP = 'Asian Handicap',
  PLAYER_PROPS = 'Player Props'
}
