import { GoogleGenAI } from "@google/genai";
import { FixtureData, BetAnalysis, GroundingSource, Metric, EliteComboPick, FirebasePick } from "../types";
import { betrixDb, bettipsDb, ref, get, query, orderByKey, limitToLast } from './externalFirebase';

// Helper to map raw Firebase pick data to FirebasePick interface
const mapRawPick = (p: any, defaultLeague = 'Elite Pro', defaultDate = '', packageName?: string): FirebasePick => {
  if (!p || typeof p !== 'object') return {} as FirebasePick;
  
  const home = String(p.homeTeam || p.home || p.Home || p.match?.split(' vs ')[0] || 'Unknown');
  const away = String(p.awayTeam || p.away || p.Away || p.match?.split(' vs ')[1] || 'Unknown');
  const league = String(p.league || p.Liga || p.Sport || defaultLeague);
  const tip = String(p.market || p.tip || p.Tip || p.pick || p.prediction || 'Analysis Pending');
  const odds = typeof p.odds === 'number' ? p.odds : parseFloat(String(p.odds)) || 1.0;
  const confidence = String(p.aiConfidence || p.neuralConfidence || p.confidence || p.Confidence || '90');
  const homeLogo = p.homeTeamLogoUrl || p.homeLogo || p.HomeLogo || p.home_logo || '';
  const awayLogo = p.awayTeamLogoUrl || p.awayLogo || p.AwayLogo || p.away_logo || '';
  const leagueLogo = p.leagueLogoUrl || p.league_logo || p.leagueLogo || '';
  const kickoffRaw = p.kickoff || p.Kickoff || p.date || p.match_date || defaultDate || new Date().toISOString();
  const kickoff = (typeof kickoffRaw === 'string' && kickoffRaw.includes('T')) ? kickoffRaw.split('T')[0] : kickoffRaw;
  const riskFactor = p.riskFactor || p.riskLevel || 'Low';
  
  const statusValue = (p.status || p.Status || (p.result === 'WON' ? 'win' : p.result === 'LOST' ? 'loss' : 'pending')).toLowerCase();
  const status: 'win' | 'loss' | 'void' | 'pending' = 
    (statusValue.includes('win') || statusValue.includes('green') ? 'win' : 
     statusValue.includes('loss') || statusValue.includes('red') ? 'loss' : 
     statusValue.includes('void') ? 'void' : 'pending');
  
  // Extract predicted score from stats if available
  const statsStr = p.stats || "";
  const predictedScoreMatch = statsStr.match(/Projected score: (.*)/);
  const predictedScore = predictedScoreMatch ? predictedScoreMatch[1] : (p.preview_ui?.markets?.predicted_score || p.ft_score || (p.ftHome !== undefined && p.ftAway !== undefined ? `${p.ftHome}-${p.ftAway}` : ""));
  
  // Combine finalVerdict with predicted score
  let summary = p.finalVerdict || p.preview_ui?.summary || "";
  if (predictedScore && !summary.includes("Projected Score")) {
    summary = `Projected Score: ${predictedScore}\n\n${summary}`;
  }

  // Map extended AI fields if they exist but preview_ui doesn't
  let preview_ui = p.preview_ui;
  if (!preview_ui && (p.finalVerdict || p.formMomentum)) {
    preview_ui = {
      title: "Neural Market Analysis",
      headline: p.market || tip,
      summary: summary,
      sections: [
        { heading: "Form & Momentum", body: p.formMomentum || "" },
        { heading: "Tactical Goals", body: p.goalsTactical || p.goalstactical || "" },
        { heading: "Tactical Edge", body: p.tacticalEdge || "" },
        { heading: "Stats Analysis", body: p.stats || "" }
      ].filter(s => s.body),
      bullet_points: (p.riskFactors || "").split('\n').filter((b: string) => b.trim()),
      markets: {
        pick: p.market || tip,
        predicted_score: "", 
        over_under_2_5: p.stats?.match(/Totals lean: (.*)/)?.[1] || "N/A",
        btts: p.stats?.match(/BTTS lean: (.*)/)?.[1] || "N/A"
      }
    };
  } else if (preview_ui) {
    preview_ui.summary = summary;
  }
  
  return { 
    home, 
    away, 
    league, 
    tip, 
    odds, 
    confidence, 
    homeLogo, 
    awayLogo, 
    leagueLogoUrl: leagueLogo,
    kickoff, 
    status, 
    preview_ui, 
    riskFactor,
    aiConfidence: p.aiConfidence || p.neuralConfidence || parseInt(confidence),
    valueScore: p.valueScore,
    marketVolatility: p.marketVolatility,
    signal: p.signal,
    package: p.package || packageName || defaultLeague
  };
};

export const fetchBOD = async (): Promise<FirebasePick[]> => {
  try {
    const bodRef = ref(bettipsDb, 'betrix/bod');
    const snapshot = await get(bodRef);
    const data = snapshot.exists() ? snapshot.val() : null;
    if (!data) return [];
    const rawPicks = Array.isArray(data) ? data : (data.home || data.homeTeam || data.match ? [data] : Object.values(data));
    return rawPicks.filter(p => p && typeof p === 'object' && (p.home || p.homeTeam || p.match)).map(p => mapRawPick(p, 'Bet of the Day', '', 'Bet of the Day'));
  } catch (error) {
    console.error("BOD Fetch Error:", error);
    return [];
  }
};

export const fetchDailyBanker = async (): Promise<FirebasePick[]> => {
  try {
    const bankerRef = ref(bettipsDb, 'betrix/dailybanker');
    const snapshot = await get(bankerRef);
    const data = snapshot.exists() ? snapshot.val() : null;
    if (!data) return [];
    const rawPicks = Array.isArray(data) ? data : (data.home || data.homeTeam || data.match ? [data] : Object.values(data));
    return rawPicks.filter(p => p && typeof p === 'object' && (p.home || p.homeTeam || p.match)).map(p => mapRawPick(p, 'Daily Banker', '', 'Daily Banker'));
  } catch (error) {
    console.error("Daily Banker Fetch Error:", error);
    return [];
  }
};

export const fetchTopPicks = async (): Promise<FirebasePick[]> => {
  try {
    const topPicksRef = ref(bettipsDb, 'betrix/topPicks');
    const snapshot = await get(topPicksRef);
    const data = snapshot.exists() ? snapshot.val() : null;
    if (!data) return [];
    const rawPicks = Array.isArray(data) ? data : (data.home || data.homeTeam || data.match ? [data] : Object.values(data));
    return rawPicks.filter(p => p && typeof p === 'object' && (p.home || p.homeTeam || p.match)).map(p => mapRawPick(p, 'Top Picks', '', 'Verified Pick'));
  } catch (error) {
    console.error("Top Picks Fetch Error:", error);
    return [];
  }
};

export const fetchPremiumHistory = async (limit: number = 20): Promise<FirebasePick[]> => {
  try {
    const historyRef = ref(betrixDb, 'PremiumHistory');
    const historyQuery = query(historyRef, orderByKey(), limitToLast(limit));
    const snapshot = await get(historyQuery);
    const data = snapshot.exists() ? snapshot.val() : null;
    
    if (!data || typeof data !== 'object') return [];
    
    const flattenedPicks: FirebasePick[] = [];
    const packageNames: Record<string, string> = {
      'bod': 'Bet of the Day',
      'dailybanker': 'Daily Banker',
      'freePicks': 'Free Picks',
      'topPicks': 'Top Picks'
    };
    
    Object.entries(data).forEach(([key, value]: [string, any]) => {
      if (!value) return;

      const processPackage = (pkgKey: string, pkgValue: any, dateStr: string) => {
        let picksArray: any[] = [];
        if (Array.isArray(pkgValue)) {
          picksArray = pkgValue;
        } else if (pkgValue && typeof pkgValue === 'object') {
          if (pkgValue.picks && Array.isArray(pkgValue.picks)) {
            picksArray = pkgValue.picks;
          } else if (pkgValue.home || pkgValue.homeTeam || pkgValue.match) {
            picksArray = [pkgValue];
          } else {
            picksArray = Object.values(pkgValue).filter(v => v && typeof v === 'object');
          }
        }

        const packageName = packageNames[pkgKey] || packageNames[pkgKey.toLowerCase()] || pkgKey;

        picksArray.forEach((p: any) => {
          if (!p || typeof p !== 'object') return;
          
          // If it's a direct pick object (has home/away)
          if (p.home || p.Home || p.homeTeam || p.match) {
            // Status mapping
            const statusVal = (p.status || p.status_color || p.result || p.outcome || '').toLowerCase();
            const isWin = statusVal.includes('win') || statusVal.includes('won') || statusVal.includes('green') || statusVal.includes('verified');
            const isLoss = statusVal.includes('loss') || statusVal.includes('lost') || statusVal.includes('red');
            const isVoid = statusVal.includes('void');
            
            let status: 'win' | 'loss' | 'void' | 'pending' = 'pending';
            if (isWin) status = 'win';
            else if (isLoss) status = 'loss';
            else if (isVoid) status = 'void';
            
            const stakeValue = 100;
            const odds = Number(p.odds) || 1.85;
            
            let profitStr = p.profit;
            if (!profitStr && status !== 'pending') {
              const profitValue = status === 'win' ? (odds - 1) * stakeValue : -stakeValue;
              profitStr = profitValue > 0 ? `+$${profitValue.toFixed(2)}` : `-$${Math.abs(profitValue).toFixed(2)}`;
            }

            const score = p.ft_score || p.score || p.predicted_score || 
              (p.home_goals !== undefined && p.away_goals !== undefined ? `${p.home_goals}:${p.away_goals}` : 
              (p.homeTeamGoals !== undefined && p.awayTeamGoals !== undefined ? `${p.homeTeamGoals}:${p.awayTeamGoals}` : 
              (p.teamAGoals !== undefined && p.teamBGoals !== undefined ? `${p.teamAGoals}:${p.teamBGoals}` : 
              (p.ftHome !== undefined && p.ftAway !== undefined ? `${p.ftHome}:${p.ftAway}` : 'FT'))));

            const rawDate = p.match_date || p.kickoff_date || p.date || dateStr;
            const normalizedDate = (typeof rawDate === 'string' && rawDate.includes('T')) ? rawDate.split('T')[0] : rawDate;

            flattenedPicks.push({
              home: p.home || p.Home || p.homeTeam || p.match?.split(' vs ')[0] || 'Unknown',
              away: p.away || p.Away || p.awayTeam || p.match?.split(' vs ')[1] || 'Unknown',
              league: p.league || p.Liga || p.Sport || 'Elite Pro',
              tip: p.tip || p.Tip || p.market || p.pick || p.prediction || 'Verified Pick',
              odds: odds,
              confidence: String(p.confidence || p.Confidence || p.aiConfidence || p.neuralConfidence || '90'),
              status,
              profit: profitStr,
              stake: String(stakeValue),
              score: score,
              date: normalizedDate,
              isArchive: dateStr === 'Archive',
              package: packageName,
              homeLogo: p.home_logo || p.homeLogo || p.HomeLogo || p.homeTeamLogoUrl,
              awayLogo: p.away_logo || p.awayLogo || p.AwayLogo || p.awayTeamLogoUrl
            });
          }
        });
      };

      if (Array.isArray(data)) {
        // If data is an array of picks or packages
        data.forEach((item, idx) => {
          if (item && typeof item === 'object') {
            if (item.home || item.away) {
              processPackage('elite', [item], 'Archive');
            } else if (item.picks) {
              processPackage(item.package || 'elite', item.picks, item.picked_at_utc?.split('T')[0] || 'Archive');
            }
          }
        });
        return; // Exit the forEach loop early since we handled the array
      }

      // Check if key is a date (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value).forEach(([pkgKey, pkgValue]) => {
          processPackage(pkgKey, pkgValue, key);
        });
      } else {
        processPackage(key, value, 'Archive');
      }
    });
    
    return flattenedPicks
      .sort((a, b) => {
        const dateA = a.date && a.date !== 'Archive' ? new Date(a.date).getTime() : 0;
        const dateB = b.date && b.date !== 'Archive' ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
  } catch (error) {
    console.error("Premium History Error:", error);
    return [];
  }
};

export const fetchEliteCombo = async (): Promise<EliteComboPick[]> => {
  try {
    const eliteComboRef = ref(bettipsDb, 'betrix/EliteCombo');
    const snapshot = await get(eliteComboRef);
    const data = snapshot.exists() ? snapshot.val() : null;
    
    if (!data) return [];
    
    // Convert object to array and filter by tipType
    const rawPicks: any[] = Object.values(data);
    const filteredPicks = rawPicks.filter(p => 
      p && 
      typeof p === 'object' && 
      p.tipType === 'elite_combo' && 
      (p.odds !== undefined && p.odds !== null)
    );

    return filteredPicks.map(p => ({
      homeTeam: p.homeTeam || p.home || 'Unknown',
      awayTeam: p.awayTeam || p.away || 'Unknown',
      homeLogo: p.homeLogo || p.home_logo || '',
      awayLogo: p.awayLogo || p.away_logo || '',
      league: p.league || 'Elite Pro',
      country: p.country || '',
      tip: p.tip || p.market || 'Analysis Pending',
      odds: Number(p.odds),
      aiConfidence: Number(p.aiConfidence || p.confidence || 90),
      riskLevel: p.riskLevel || p.riskFactor || 'Medium',
      tipType: p.tipType || 'elite_combo',
      analysis: p.finalVerdict || p.analysis || p.shortReason || p.summary || 'No detailed analysis available for this pick.'
    }));
  } catch (error) {
    console.error("Elite Combo Fetch Error:", error);
    return [];
  }
};

export const fetchFreePicks = async (date?: string): Promise<FirebasePick[]> => {
  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    // Try fetching only the target date first
    const targetRef = ref(betrixDb, `Bets/FreeBets/${targetDate}`);
    const targetSnapshot = await get(targetRef);
    
    let data;
    if (targetSnapshot.exists()) {
      data = targetSnapshot.val()?.picks || targetSnapshot.val();
    } else {
      // Fallback: fetch last 3 dates to find the most recent one
      const freeBetsRef = ref(betrixDb, 'Bets/FreeBets');
      const latestQuery = query(freeBetsRef, orderByKey(), limitToLast(3));
      const latestSnapshot = await get(latestQuery);
      const allData = latestSnapshot.exists() ? latestSnapshot.val() : null;
      
      if (!allData) return [];
      
      const dates = Object.keys(allData).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort().reverse();
      if (dates.length > 0) {
        const latestDate = dates[0];
        data = allData[latestDate]?.picks || allData[latestDate];
      }
    }
    
    if (!data) return [];
    
    const rawPicks: any[] = (Array.isArray(data) ? data : Object.values(data)).filter(p => p !== null && typeof p === 'object');
      
    return rawPicks.map((p: any): FirebasePick => {
      const home = String(p.homeTeam || p.home || p.Home || p.match?.split(' vs ')[0] || 'Unknown');
      const away = String(p.awayTeam || p.away || p.Away || p.match?.split(' vs ')[1] || 'Unknown');
      const league = String(p.league || p.Liga || p.Sport || 'General League');
      const tip = String(p.market || p.tip || p.Tip || p.pick || p.prediction || 'Analysis Pending');
      const odds = typeof p.odds === 'number' ? p.odds : parseFloat(String(p.odds)) || 1.0;
      const confidence = String(p.aiConfidence || p.neuralConfidence || p.confidence || p.Confidence || '85');
      const homeLogo = p.homeTeamLogoUrl || p.homeLogo || p.HomeLogo || p.home_logo || null;
      const awayLogo = p.awayTeamLogoUrl || p.awayLogo || p.AwayLogo || p.away_logo || null;
      const leagueLogo = p.leagueLogoUrl || p.league_logo || p.leagueLogo || null;
      const kickoff = p.kickoff || p.Kickoff || p.date || p.match_date || targetDate;
      const riskFactor = p.riskFactor || p.riskLevel || 'Medium';
      
      const statusValue = (p.status || p.Status || (p.result === 'WON' ? 'win' : p.result === 'LOST' ? 'loss' : 'pending')).toLowerCase();
      const status: 'win' | 'loss' | 'void' | 'pending' = 
        (statusValue.includes('win') || statusValue.includes('green') ? 'win' : 
         statusValue.includes('loss') || statusValue.includes('red') ? 'loss' : 
         statusValue.includes('void') ? 'void' : 'pending');
      
      // Extract predicted score from stats if available
      const statsStr = p.stats || "";
      const predictedScoreMatch = statsStr.match(/Projected score: (.*)/);
      const predictedScore = predictedScoreMatch ? predictedScoreMatch[1] : (p.preview_ui?.markets?.predicted_score || p.ft_score || (p.ftHome !== undefined && p.ftAway !== undefined ? `${p.ftHome}-${p.ftAway}` : ""));
      
      // Combine finalVerdict with predicted score
      let summary = p.finalVerdict || p.preview_ui?.summary || "";
      if (predictedScore && !summary.includes("Projected Score")) {
        summary = `Projected Score: ${predictedScore}\n\n${summary}`;
      }

      // Map extended AI fields if they exist but preview_ui doesn't
      let preview_ui = p.preview_ui;
      if (!preview_ui && (p.finalVerdict || p.formMomentum)) {
        preview_ui = {
          title: "Neural Market Analysis",
          headline: p.market || tip,
          summary: summary,
          sections: [
            { heading: "Form & Momentum", body: p.formMomentum || "" },
            { heading: "Tactical Goals", body: p.goalsTactical || p.goalstactical || "" },
            { heading: "Tactical Edge", body: p.tacticalEdge || "" },
            { heading: "Stats Analysis", body: p.stats || "" }
          ].filter(s => s.body),
          bullet_points: (p.riskFactors || "").split('\n').filter((b: string) => b.trim()),
          markets: {
            pick: p.market || tip,
            predicted_score: "", 
            over_under_2_5: p.stats?.match(/Totals lean: (.*)/)?.[1] || "N/A",
            btts: p.stats?.match(/BTTS lean: (.*)/)?.[1] || "N/A"
          }
        };
      } else if (preview_ui) {
        // If preview_ui exists, still move predicted score to summary if requested
        preview_ui.summary = summary;
        if (preview_ui.markets) {
          preview_ui.markets.predicted_score = "";
        }
      }
      
      // Parse signal string into array for graphs
      const signalArray = p.signal ? String(p.signal).split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];
      
      return { 
        home, 
        away, 
        league, 
        tip, 
        odds, 
        confidence, 
        homeLogo, 
        awayLogo, 
        leagueLogoUrl: leagueLogo,
        kickoff, 
        status, 
        preview_ui, 
        riskFactor,
        aiConfidence: p.aiConfidence || p.neuralConfidence || parseInt(confidence),
        valueScore: p.valueScore,
        marketVolatility: p.marketVolatility,
        signal: p.signal, // Keeping raw signal just in case
        package: p.package || 'Free Pick'
      };
    });
  } catch (error) {
    console.error("Firebase Fetch Error:", error);
    return [];
  }
};

export const chatWithNeural = async (message: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) throw new Error("Neural Link Error: API Key missing from environment.");
  
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `You are Betlify, a human-like, confident, and analytical sports market analyst. 
Your tone should be professional yet approachable. 
Avoid robotic phrases like "Neural uplink" or "Terminal online". 
Instead of saying "Prediction generated", say "This looks like a strong opportunity. Here's why:".
Focus on confidence signals, prediction history, and live market patterns.
Do NOT use markdown bolding.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: message,
      config: { systemInstruction, tools: [{ googleSearch: {} }] },
    });
    
    let resultText = (response.text || "").replace(/\*/g, '');
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
      const sources = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => `[${chunk.web.title}](${chunk.web.uri})`)
        .join(', ');
      
      if (sources) {
        resultText += `\n\nSources: ${sources}`;
      }
    }
    return resultText;
  } catch (error: any) {
    console.error("Chat Neural Error:", error);
    if (error.message?.includes("API key")) throw new Error("Neural Link Error: Invalid API Key.");
    if (error.message?.includes("safety")) throw new Error("Neural Link Error: Content blocked by safety filters.");
    throw new Error(`Neural Link Failed: ${error.message || "Unknown internal error"}`);
  }
};

export const analyzeFixture = async (pick: FirebasePick): Promise<any> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) throw new Error("Neural Link Error: API Key missing from environment.");

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
You are NOT generating new analysis.
You are ONLY reading an existing football pick object from my database and returning the exact UI-ready response.

STRICT RULES:
- Do NOT invent text.
- Do NOT summarize.
- Do NOT rewrite anything.
- Do NOT add explanations.
- ONLY extract the fields listed below from the input JSON.
- Output MUST be valid JSON only.

FIELDS TO EXTRACT:
- match            <- input.match
- league           <- input.league
- league_logo      <- input.league_logo
- kickoff          <- input.kickoff
- home             <- input.home
- away             <- input.away
- home_logo        <- input.home_logo
- away_logo        <- input.away_logo
- odds             <- input.odds
- confidence       <- input.confidence
- tip              <- input.tip
- title            <- input.preview_ui.title
- headline         <- input.preview_ui.headline
- summary          <- input.preview_ui.summary
- bullet_points    <- input.preview_ui.bullet_points
- pick             <- input.preview_ui.markets.pick
- predicted_score  <- input.preview_ui.markets.predicted_score
- over_under_2_5   <- input.preview_ui.markets.over_under_2_5
- btts             <- input.preview_ui.markets.btts
- sections         <- input.preview_ui.sections

OUTPUT FORMAT (EXACT STRUCTURE):
{
  "match": "",
  "league": "",
  "league_logo": "",
  "kickoff": "",
  "home": "",
  "away": "",
  "home_logo": "",
  "away_logo": "",
  "odds": "",
  "confidence": "",
  "tip": "",
  "preview": {
    "title": "",
    "headline": "",
    "summary": "",
    "bullet_points": [],
    "markets": {
      "pick": "",
      "predicted_score": "",
      "over_under_2_5": "",
      "btts": ""
    },
    "sections": []
  }
}
`;

  const prompt = `INPUT JSON: ${JSON.stringify(pick)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: { 
        systemInstruction,
        responseMimeType: "application/json"
      },
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Analyze Fixture Error:", error);
    if (error.message?.includes("API key")) throw new Error("Neural Link Error: Invalid API Key.");
    throw new Error(`Neural Link Failed: ${error.message || "Unknown internal error"}`);
  }
};
