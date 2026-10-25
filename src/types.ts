export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type GameMode = 'pvai' | 'pvp';
export type RankTitle = 'Squire' | 'Knight' | 'Lord' | 'Prince' | 'King' | 'Emperor';

export interface PlayerProfile {
  id: string;
  name: string; // User-entered name (e.g. "Arthur", "Morgan")
  rating: number; // Difficulty score / MMR, starting at 1000
  wins: number;
  losses: number;
  duelsWon: number;
  duelsLost: number;
  highestPieceLevel: number;
  winStreak: number;
  piecesCaptured: number;
  piecesLost: number;
  avatarPiece: PieceType;
  createdAt: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface ChessPiece {
  id: string;
  type: PieceType;
  color: PieceColor;
  level: number; // 1 to 5
  xp: number;
  xpToNextLevel: number;
  victories: number;
  hasMoved: boolean;
  maxHpBonus: number;
  attackBonus: number;
  shieldBonus: number;
  customName?: string;
}

export type CardType = 'attack' | 'defense' | 'special' | 'utility';

export interface CardAction {
  id: string;
  name: string;
  cost: number; // AP cost (0-3)
  type: CardType;
  description: string;
  damage?: number;
  block?: number;
  heal?: number;
  bonusAp?: number;
  drawCards?: number;
  pierce?: boolean; // Ignores enemy block
  statusEffect?: {
    type: 'stun' | 'bleed' | 'weaken' | 'fortify' | 'empower';
    duration: number; // rounds
    value?: number;
  };
  isSignature?: boolean;
  requiredLevel?: number;
  tier?: number;
}

export interface ActiveStatusEffect {
  type: 'stun' | 'bleed' | 'weaken' | 'fortify' | 'empower';
  duration: number;
  value?: number;
}

export interface Combatant {
  piece: ChessPiece;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  hand: CardAction[];
  deck: CardAction[];
  discard: CardAction[];
  statusEffects: ActiveStatusEffect[];
  role: 'attacker' | 'defender';
}

export interface CombatLogEntry {
  id: string;
  text: string;
  type: 'player' | 'opponent' | 'system' | 'damage' | 'block' | 'special';
  timestamp: number;
}

export interface DuelState {
  attacker: Combatant;
  defender: Combatant;
  currentTurn: 'player' | 'opponent';
  round: number;
  originPos: Position;
  targetPos: Position;
  phase: 'intro' | 'action' | 'animating' | 'result';
  winner?: 'attacker' | 'defender';
  lastActionSummary?: string;
}

export type DifficultyMode = 'adaptive' | 'easy' | 'medium' | 'hard';

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  duelsPlayed: number;
  duelsWon: number;
  duelsLost: number;
  highestPieceLevel: number;
  winStreak: number;
  adaptiveRating: number; // starts at 1000, adjusts based on performance
  piecesCaptured: number;
  piecesLost: number;
}

export type MoveHistoryItem = {
  from: Position;
  to: Position;
  piece: ChessPiece;
  captured?: ChessPiece;
  duelWon?: boolean;
  notation: string;
  color: PieceColor;
};
