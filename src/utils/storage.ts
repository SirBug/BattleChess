import { DifficultyMode, GameMode, PieceType, PlayerProfile, PlayerStats, RankTitle } from '../types';

const STATS_KEY = 'chess_duel_player_stats_v1';
const SETTINGS_KEY = 'chess_duel_settings_v1';
const PROFILES_KEY = 'chess_duel_player_profiles_v2';
const ACTIVE_PLAYERS_KEY = 'chess_duel_active_players_v2';

export interface GameSettings {
  difficulty: DifficultyMode;
  showMoveHints: boolean;
  combatSpeed: 'normal' | 'fast';
  theme: 'mystic' | 'classic' | 'cyber';
  gameMode: GameMode;
}

export interface RankDetails {
  title: RankTitle;
  tier: number; // 1 to 6
  minRating: number;
  nextRating: number;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  icon: string;
  description: string;
  progressPercent: number;
}

export function getRankInfo(rating: number): RankDetails {
  const safeRating = Math.max(800, rating);

  if (safeRating >= 2450) {
    const progress = Math.min(100, Math.round(((safeRating - 2450) / 550) * 100));
    return {
      title: 'Emperor',
      tier: 6,
      minRating: 2450,
      nextRating: 3000,
      badgeBg: 'bg-amber-500/25',
      badgeText: 'text-amber-300',
      borderColor: 'border-amber-400',
      icon: '👑',
      description: 'Supreme Overlord of the Grand Realm',
      progressPercent: progress,
    };
  }
  if (safeRating >= 2050) {
    const progress = Math.min(100, Math.round(((safeRating - 2050) / 400) * 100));
    return {
      title: 'King',
      tier: 5,
      minRating: 2050,
      nextRating: 2450,
      badgeBg: 'bg-purple-500/25',
      badgeText: 'text-purple-300',
      borderColor: 'border-purple-400',
      icon: '🤴',
      description: 'Grandmaster Sovereign of the Board',
      progressPercent: progress,
    };
  }
  if (safeRating >= 1700) {
    const progress = Math.min(100, Math.round(((safeRating - 1700) / 350) * 100));
    return {
      title: 'Prince',
      tier: 4,
      minRating: 1700,
      nextRating: 2050,
      badgeBg: 'bg-rose-500/25',
      badgeText: 'text-rose-300',
      borderColor: 'border-rose-400',
      icon: '⚜️',
      description: 'Royal High Commander & Tactician',
      progressPercent: progress,
    };
  }
  if (safeRating >= 1400) {
    const progress = Math.min(100, Math.round(((safeRating - 1400) / 300) * 100));
    return {
      title: 'Lord',
      tier: 3,
      minRating: 1400,
      nextRating: 1700,
      badgeBg: 'bg-indigo-500/25',
      badgeText: 'text-indigo-300',
      borderColor: 'border-indigo-400',
      icon: '🛡️',
      description: 'Noble Battle Strategist',
      progressPercent: progress,
    };
  }
  if (safeRating >= 1150) {
    const progress = Math.min(100, Math.round(((safeRating - 1150) / 250) * 100));
    return {
      title: 'Knight',
      tier: 2,
      minRating: 1150,
      nextRating: 1400,
      badgeBg: 'bg-blue-500/25',
      badgeText: 'text-blue-300',
      borderColor: 'border-blue-400',
      icon: '⚔️',
      description: 'Valiant Champion of the Vanguard',
      progressPercent: progress,
    };
  }

  // Base Rank: Squire
  const progress = Math.min(100, Math.max(0, Math.round(((safeRating - 800) / 350) * 100)));
  return {
    title: 'Squire',
    tier: 1,
    minRating: 800,
    nextRating: 1150,
    badgeBg: 'bg-emerald-500/25',
    badgeText: 'text-emerald-300',
    borderColor: 'border-emerald-400',
    icon: '🌱',
    description: 'Aspiring Warrior learning the Art of War',
    progressPercent: progress,
  };
}

export function formatPlayerDisplayName(profile: PlayerProfile): string {
  const rank = getRankInfo(profile.rating);
  return `${rank.title} ${profile.name}`;
}

const DEFAULT_PROFILES: PlayerProfile[] = [
  {
    id: 'p-arthur',
    name: 'Arthur',
    rating: 1220, // Knight
    wins: 4,
    losses: 1,
    duelsWon: 11,
    duelsLost: 3,
    highestPieceLevel: 2,
    winStreak: 2,
    piecesCaptured: 14,
    piecesLost: 4,
    avatarPiece: 'knight',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'p-morgan',
    name: 'Morgan',
    rating: 1460, // Lord
    wins: 8,
    losses: 2,
    duelsWon: 23,
    duelsLost: 5,
    highestPieceLevel: 3,
    winStreak: 4,
    piecesCaptured: 31,
    piecesLost: 9,
    avatarPiece: 'queen',
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'p-galahad',
    name: 'Galahad',
    rating: 1040, // Squire
    wins: 1,
    losses: 2,
    duelsWon: 4,
    duelsLost: 6,
    highestPieceLevel: 1,
    winStreak: 0,
    piecesCaptured: 5,
    piecesLost: 7,
    avatarPiece: 'pawn',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'p-guinevere',
    name: 'Guinevere',
    rating: 1780, // Prince
    wins: 15,
    losses: 3,
    duelsWon: 42,
    duelsLost: 8,
    highestPieceLevel: 4,
    winStreak: 6,
    piecesCaptured: 58,
    piecesLost: 12,
    avatarPiece: 'bishop',
    createdAt: Date.now() - 86400000 * 20,
  },
];

const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  duelsPlayed: 0,
  duelsWon: 0,
  duelsLost: 0,
  highestPieceLevel: 1,
  winStreak: 0,
  adaptiveRating: 1000,
  piecesCaptured: 0,
  piecesLost: 0,
};

const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'adaptive',
  showMoveHints: true,
  combatSpeed: 'normal',
  theme: 'mystic',
  gameMode: 'pvai',
};

export function loadPlayerProfiles(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  savePlayerProfiles(DEFAULT_PROFILES);
  return DEFAULT_PROFILES;
}

export function savePlayerProfiles(profiles: PlayerProfile[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // ignore
  }
}

export function createNewPlayerProfile(name: string, avatarPiece: PieceType = 'knight'): PlayerProfile {
  const trimmed = name.trim() || 'Champion';
  const newProfile: PlayerProfile = {
    id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name: trimmed,
    rating: 1000, // Starts as Squire
    wins: 0,
    losses: 0,
    duelsWon: 0,
    duelsLost: 0,
    highestPieceLevel: 1,
    winStreak: 0,
    piecesCaptured: 0,
    piecesLost: 0,
    avatarPiece,
    createdAt: Date.now(),
  };

  const current = loadPlayerProfiles();
  const updated = [newProfile, ...current];
  savePlayerProfiles(updated);
  return newProfile;
}

export function deletePlayerProfile(profileId: string): PlayerProfile[] {
  const current = loadPlayerProfiles();
  const updated = current.filter((p) => p.id !== profileId);
  if (updated.length === 0) {
    savePlayerProfiles(DEFAULT_PROFILES);
    return DEFAULT_PROFILES;
  }
  savePlayerProfiles(updated);
  return updated;
}

export function updateProfilePerformance(
  profileId: string,
  won: boolean,
  isDuel: boolean,
  pieceLevel?: number
): PlayerProfile | null {
  const profiles = loadPlayerProfiles();
  const idx = profiles.findIndex((p) => p.id === profileId);
  if (idx === -1) return null;

  const current = { ...profiles[idx] };
  const kFactor = isDuel ? 14 : 36;

  if (won) {
    current.rating = Math.min(3000, current.rating + kFactor);
    current.winStreak += 1;
    if (isDuel) {
      current.duelsWon += 1;
      current.piecesCaptured += 1;
    } else {
      current.wins += 1;
    }
  } else {
    current.rating = Math.max(800, current.rating - Math.round(kFactor * 0.85));
    current.winStreak = 0;
    if (isDuel) {
      current.duelsLost += 1;
      current.piecesLost += 1;
    } else {
      current.losses += 1;
    }
  }

  if (pieceLevel && pieceLevel > current.highestPieceLevel) {
    current.highestPieceLevel = pieceLevel;
  }

  profiles[idx] = current;
  savePlayerProfiles(profiles);
  return current;
}

export interface ActivePlayersState {
  player1Id: string; // White
  player2Id: string; // Black (PvP)
  gameMode: GameMode;
}

export function loadActivePlayers(): ActivePlayersState {
  const profiles = loadPlayerProfiles();
  const defaultP1 = profiles[0]?.id || 'p-arthur';
  const defaultP2 = profiles[1]?.id || 'p-morgan';

  try {
    const raw = localStorage.getItem(ACTIVE_PLAYERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate IDs still exist
      const p1Valid = profiles.some((p) => p.id === parsed.player1Id) ? parsed.player1Id : defaultP1;
      const p2Valid = profiles.some((p) => p.id === parsed.player2Id) ? parsed.player2Id : defaultP2;
      return {
        player1Id: p1Valid,
        player2Id: p2Valid,
        gameMode: parsed.gameMode === 'pvp' ? 'pvp' : 'pvai',
      };
    }
  } catch {
    // fallback
  }

  return {
    player1Id: defaultP1,
    player2Id: defaultP2,
    gameMode: 'pvai',
  };
}

export const loadActivePlayersState = loadActivePlayers;

export function saveActivePlayers(state: ActivePlayersState): void {
  try {
    localStorage.setItem(ACTIVE_PLAYERS_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export const saveActivePlayersState = saveActivePlayers;

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return { ...DEFAULT_STATS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_STATS;
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function updateAdaptiveRating(stats: PlayerStats, won: boolean, isDuel: boolean): PlayerStats {
  const current = { ...stats };
  const kFactor = isDuel ? 15 : 40;

  if (won) {
    current.adaptiveRating = Math.min(2400, current.adaptiveRating + kFactor);
    current.winStreak += 1;
    if (isDuel) {
      current.duelsWon += 1;
      current.piecesCaptured += 1;
    } else {
      current.gamesWon += 1;
    }
  } else {
    current.adaptiveRating = Math.max(800, current.adaptiveRating - Math.round(kFactor * 0.8));
    current.winStreak = 0;
    if (isDuel) {
      current.duelsLost += 1;
      current.piecesLost += 1;
    } else {
      current.gamesLost += 1;
    }
  }

  if (isDuel) {
    current.duelsPlayed += 1;
  } else {
    current.gamesPlayed += 1;
  }

  savePlayerStats(current);
  return current;
}

