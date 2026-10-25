import { CardAction, PieceType, ChessPiece } from '../types';

export const PIECE_BASE_STATS: Record<
  PieceType,
  {
    baseHp: number;
    hpPerLevel: number;
    baseEnergy: number;
    title: string;
    description: string;
    signatureName: string;
  }
> = {
  pawn: {
    baseHp: 22,
    hpPerLevel: 4,
    baseEnergy: 3,
    title: 'Vanguard Footman',
    description: 'Relentless infantry with cheap strikes and adaptive defensive stances.',
    signatureName: 'Underdog Fury',
  },
  knight: {
    baseHp: 32,
    hpPerLevel: 5,
    baseEnergy: 3,
    title: 'Cavalier Raider',
    description: 'Agile flanker capable of bypassing enemy armor and stunning opponents.',
    signatureName: 'Blitz Charge',
  },
  bishop: {
    baseHp: 30,
    hpPerLevel: 5,
    baseEnergy: 3,
    title: 'High Inquisitor',
    description: 'Arcane mystic specializing in healing, holy smites, and divine barriers.',
    signatureName: 'Divine Radiance',
  },
  rook: {
    baseHp: 42,
    hpPerLevel: 6,
    baseEnergy: 3,
    title: 'Ironclad Bastion',
    description: 'Impenetrable siege defender who converts armor into devastating shockwaves.',
    signatureName: 'Seismic Fortress',
  },
  queen: {
    baseHp: 50,
    hpPerLevel: 7,
    baseEnergy: 4,
    title: 'War Sovereign',
    description: 'Supreme empress commanding devastating multi-hit celestial bursts and AP drains.',
    signatureName: 'Celestial Cataclysm',
  },
  king: {
    baseHp: 58,
    hpPerLevel: 8,
    baseEnergy: 4,
    title: 'Grand Warlord',
    description: 'Majestic commander whose strikes grow fiercer when wounded, with impenetrable royal shields.',
    signatureName: "Monarch's Last Stand",
  },
};

export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700];

export function getPieceMaxHp(piece: ChessPiece): number {
  const base = PIECE_BASE_STATS[piece.type].baseHp;
  const levelBonus = (piece.level - 1) * PIECE_BASE_STATS[piece.type].hpPerLevel;
  return base + levelBonus + (piece.maxHpBonus || 0);
}

export function getPieceStartingBlock(piece: ChessPiece): number {
  // Higher level pieces start with a small defensive cushion
  if (piece.level >= 3) return 4 + piece.shieldBonus;
  if (piece.level >= 2) return 2 + piece.shieldBonus;
  return piece.shieldBonus || 0;
}

export function createInitialPieceDeck(piece: ChessPiece): CardAction[] {
  const type = piece.type;
  const level = piece.level;

  const deck: CardAction[] = [];

  // Universal basics
  deck.push({
    id: `${piece.id}_strike_1`,
    name: 'Swift Strike',
    cost: 1,
    type: 'attack',
    damage: 6 + Math.floor(level * 0.8),
    description: `Deal ${6 + Math.floor(level * 0.8)} damage to the enemy.`,
    tier: 1,
  });

  deck.push({
    id: `${piece.id}_guard_1`,
    name: 'Iron Guard',
    cost: 1,
    type: 'defense',
    block: 6 + Math.floor(level * 0.8),
    description: `Gain ${6 + Math.floor(level * 0.8)} block for this round.`,
    tier: 1,
  });

  // Archetype cards
  switch (type) {
    case 'pawn':
      deck.push({
        id: `${piece.id}_pawn_skirmish`,
        name: 'Vanguard Thrust',
        cost: 1,
        type: 'attack',
        damage: 8 + level,
        description: `Deal ${8 + level} damage. If enemy is higher rank, deal +4 bonus damage!`,
        tier: 1,
      });
      deck.push({
        id: `${piece.id}_pawn_parry`,
        name: 'Tactical Riposte',
        cost: 1,
        type: 'defense',
        block: 8 + level,
        damage: 3,
        description: `Gain ${8 + level} block and counter-thrust for 3 damage.`,
        tier: 1,
      });
      deck.push({
        id: `${piece.id}_pawn_overcome`,
        name: 'Underdog Fury',
        cost: level >= 5 ? 1 : 2,
        type: 'special',
        damage: 13 + level * 2,
        bonusAp: 1,
        description: `Deal ${13 + level * 2} damage and gain +1 AP next turn.`,
        isSignature: true,
        tier: 2,
      });
      break;

    case 'knight':
      deck.push({
        id: `${piece.id}_knight_lance`,
        name: 'Flank Charge',
        cost: 2,
        type: 'attack',
        damage: 12 + level * 2,
        pierce: true,
        description: `Deal ${12 + level * 2} PIERCE damage (bypasses half enemy block).`,
        tier: 2,
      });
      deck.push({
        id: `${piece.id}_knight_trample`,
        name: 'Trample',
        cost: 1,
        type: 'attack',
        damage: 7 + level,
        statusEffect: { type: 'weaken', duration: 1, value: 3 },
        description: `Deal ${7 + level} damage and weaken the enemy's next hit by 3.`,
        tier: 1,
      });
      deck.push({
        id: `${piece.id}_knight_blitz`,
        name: 'Blitz Charge',
        cost: level >= 5 ? 1 : 2,
        type: 'special',
        damage: 15 + level * 2,
        drawCards: 2,
        bonusAp: 1,
        description: `Deal ${15 + level * 2} damage, draw 2 cards, and gain +1 AP!`,
        isSignature: true,
        tier: 2,
      });
      break;

    case 'bishop':
      deck.push({
        id: `${piece.id}_bishop_smite`,
        name: 'Divine Smite',
        cost: 2,
        type: 'attack',
        damage: 11 + level * 2,
        heal: 4 + Math.floor(level * 0.5),
        description: `Deal ${11 + level * 2} Holy damage and restore ${4 + Math.floor(level * 0.5)} HP.`,
        tier: 2,
      });
      deck.push({
        id: `${piece.id}_bishop_sanctuary`,
        name: 'Sanctuary Ward',
        cost: 1,
        type: 'defense',
        block: 9 + level,
        heal: 2,
        description: `Gain ${9 + level} block and recover 2 HP.`,
        tier: 1,
      });
      deck.push({
        id: `${piece.id}_bishop_radiance`,
        name: 'Divine Radiance',
        cost: level >= 5 ? 1 : 2,
        type: 'special',
        damage: 16 + level * 2,
        heal: 6 + level,
        block: 8,
        description: `Blast enemy for ${16 + level * 2} holy damage, heal ${6 + level} HP, and gain 8 block!`,
        isSignature: true,
        tier: 2,
      });
      break;

    case 'rook':
      deck.push({
        id: `${piece.id}_rook_slam`,
        name: 'Ground Shatter',
        cost: 2,
        type: 'attack',
        damage: 15 + level * 2,
        statusEffect: { type: 'stun', duration: 1 },
        description: `Deal ${15 + level * 2} colossal damage and break enemy stance.`,
        tier: 2,
      });
      deck.push({
        id: `${piece.id}_rook_bulwark`,
        name: 'Bastion Fortress',
        cost: 1,
        type: 'defense',
        block: 12 + level * 2,
        description: `Erect an impenetrable fortress gaining ${12 + level * 2} block.`,
        tier: 1,
      });
      deck.push({
        id: `${piece.id}_rook_seismic`,
        name: 'Seismic Fortress',
        cost: level >= 5 ? 2 : 3,
        type: 'special',
        damage: 18 + level * 3,
        block: 14 + level * 2,
        description: `Unleash an earthquake for ${18 + level * 3} damage while reinforcing with ${14 + level * 2} block!`,
        isSignature: true,
        tier: 3,
      });
      break;

    case 'queen':
      deck.push({
        id: `${piece.id}_queen_arcane`,
        name: 'Royal Decree',
        cost: 2,
        type: 'attack',
        damage: 16 + level * 2,
        drawCards: 2,
        description: `Deal ${16 + level * 2} arcane damage and draw 2 tactical cards.`,
        tier: 2,
      });
      deck.push({
        id: `${piece.id}_queen_barrier`,
        name: 'Prism Aegis',
        cost: 1,
        type: 'defense',
        block: 11 + level * 2,
        damage: 4,
        description: `Reflect shield gaining ${11 + level * 2} block and dealing 4 retaliatory damage.`,
        tier: 1,
      });
      deck.push({
        id: `${piece.id}_queen_cataclysm`,
        name: 'Celestial Cataclysm',
        cost: level >= 5 ? 2 : 3,
        type: 'special',
        damage: 24 + level * 3,
        block: 10 + level,
        pierce: true,
        description: `Rain down ${24 + level * 3} PIERCING cosmic damage and gain ${10 + level} block!`,
        isSignature: true,
        tier: 3,
      });
      break;

    case 'king':
      deck.push({
        id: `${piece.id}_king_judgement`,
        name: 'Sovereign Smite',
        cost: 2,
        type: 'attack',
        damage: 14 + level * 2,
        block: 8 + level,
        description: `Execute a regal strike for ${14 + level * 2} damage with ${8 + level} defensive block.`,
        tier: 2,
      });
      deck.push({
        id: `${piece.id}_king_aegis`,
        name: 'Monarch Aegis',
        cost: 1,
        type: 'defense',
        block: 12 + level * 2,
        heal: 3,
        description: `Royal guard shields you for ${12 + level * 2} block and restores 3 HP.`,
        tier: 1,
      });
      deck.push({
        id: `${piece.id}_king_last_stand`,
        name: "Monarch's Last Stand",
        cost: level >= 5 ? 2 : 3,
        type: 'special',
        damage: 22 + level * 3,
        block: 16 + level * 2,
        description: `Unleash ${22 + level * 3} damage (doubles if HP is under 40%) and gain ${16 + level * 2} block!`,
        isSignature: true,
        tier: 3,
      });
      break;
  }

  // Shuffle deck
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: CardAction[]): CardAction[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
