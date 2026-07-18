export const ASSETS = {
  LOGO: "https://cdn.jsdelivr.net/gh/marshallnjau/assets@main/logo.png"
};

export const shortenTeamName = (name: string, maxLength: number = 14) => {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  
  const shortenings: Record<string, string> = {
    'Manchester United': 'Man Utd',
    'Manchester City': 'Man City',
    'Tottenham Hotspur': 'Tottenham',
    'Wolverhampton Wanderers': 'Wolves',
    'Leicester City': 'Leicester',
    'West Ham United': 'West Ham',
    'Newcastle United': 'Newcastle',
    'Sheffield United': 'Sheffield Utd',
    'Nottingham Forest': 'Nottm Forest',
    'Brighton & Hove Albion': 'Brighton',
    'Paris Saint-Germain': 'PSG',
    'Borussia Dortmund': 'Dortmund',
    'Borussia Monchengladbach': 'Gladbach',
    'Atletico Madrid': 'Atleti',
    'Real Sociedad': 'R. Sociedad',
    'Real Valladolid': 'Valladolid',
    'Bayer Leverkusen': 'Leverkusen',
    'Eintracht Frankfurt': 'Frankfurt',
    'Sporting CP': 'Sporting',
    'PSV Eindhoven': 'PSV',
    'Borussia M\'gladbach': 'Gladbach',
    'Borussia Mönchengladbach': 'Gladbach',
    'Olympique Lyonnais': 'Lyon',
    'Olympique de Marseille': 'Marseille',
    'Athletic Bilbao': 'Athletic',
    'Celta Vigo': 'Celta',
    'Espanyol': 'Espanyol',
    'Mallorca': 'Mallorca',
    'Osasuna': 'Osasuna',
    'Rayo Vallecano': 'Rayo',
    'Villarreal': 'Villarreal',
    'Almeria': 'Almeria',
    'Cadiz': 'Cadiz',
    'Getafe': 'Getafe',
    'Girona': 'Girona',
    'Sevilla': 'Sevilla',
    'Valencia': 'Valencia',
    'Inter Milan': 'Inter',
    'AC Milan': 'Milan',
    'Juventus': 'Juve',
    'Fiorentina': 'Fiorentina',
    'Lazio': 'Lazio',
    'Napoli': 'Napoli',
    'Roma': 'Roma',
    'Atalanta': 'Atalanta',
    'Bologna': 'Bologna',
    'Empoli': 'Empoli',
    'Frosinone': 'Frosinone',
    'Genoa': 'Genoa',
    'Lecce': 'Lecce',
    'Monza': 'Monza',
    'Salernitana': 'Salernitana',
    'Sassuolo': 'Sassuolo',
    'Torino': 'Torino',
    'Udinese': 'Udinese',
    'Verona': 'Verona',
    'Cagliari': 'Cagliari',
  };

  if (shortenings[name]) return shortenings[name];
  
  return name.substring(0, maxLength - 2) + '..';
};
