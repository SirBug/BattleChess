import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CardAction, Combatant, DifficultyMode, DuelState, GameMode } from '../types';
import { PieceArt } from './PieceArt';
import { PIECE_BASE_STATS, LEVEL_THRESHOLDS } from '../utils/cardData';
import { chooseCombatAICard } from '../utils/combatAI';
import { sound } from '../utils/soundEffects';
import {
  Shield,
  Zap,
  Heart,
  Swords,
  Sparkles,
  Award,
  ChevronRight,
  Flame,
  ArrowUpCircle,
  Skull,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface CombatDuelProps {
  initialDuelState: DuelState;
  difficulty: DifficultyMode;
  adaptiveRating: number;
  gameMode?: GameMode;
  player1Name?: string;
  player2Name?: string;
  onDuelFinish: (winner: 'attacker' | 'defender', xpGained: number, leveledUp: boolean) => void;
}

interface FloatingEffect {
  id: string;
  text: string;
  color: string;
  target: 'player' | 'opponent';
}

export const CombatDuel: React.FC<CombatDuelProps> = ({
  initialDuelState,
  difficulty,
  adaptiveRating,
  gameMode = 'pvai',
  player1Name = 'Radiant White',
  player2Name = 'Dread Black',
  onDuelFinish,
}) => {
  const [duel, setDuel] = useState<DuelState>(initialDuelState);
  const duelRef = useRef<DuelState>(initialDuelState);

  const isPvP = gameMode === 'pvp';

  // Keep ref synchronized with state
  useEffect(() => {
    duelRef.current = duel;
  }, [duel]);

  const attackerColorName = initialDuelState.attacker.piece.color === 'white' ? player1Name : player2Name;
  const defenderColorName = initialDuelState.defender.piece.color === 'white' ? player1Name : player2Name;

  const [combatLogs, setCombatLogs] = useState<string[]>([
    `⚔️ Combat Initiated: ${attackerColorName}'s ${initialDuelState.attacker.piece.type.toUpperCase()} attacks ${defenderColorName}'s ${initialDuelState.defender.piece.type.toUpperCase()}!`,
  ]);
  const [floatingEffects, setFloatingEffects] = useState<FloatingEffect[]>([]);
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(
    !isPvP && initialDuelState.currentTurn === 'opponent'
  );
  const [playedCardAnim, setPlayedCardAnim] = useState<{ card: CardAction; source: 'player' | 'opponent' } | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [levelUpData, setLevelUpData] = useState<{ didLevelUp: boolean; newLevel: number; xp: number } | null>(null);

  const logsEndRef = useRef<HTMLDivElement | null>(null);

  const isPlayerAttacker = duel.attacker.isPlayer;
  const playerCombatant = isPlayerAttacker ? duel.attacker : duel.defender;
  const opponentCombatant = isPlayerAttacker ? duel.defender : duel.attacker;

  useEffect(() => {
    sound.playDuelClash();

    // If PvAI mode and the AI opponent is attacking first, start AI turn automatically
    if (!isPvP && initialDuelState.currentTurn === 'opponent') {
      setIsProcessingTurn(true);
      const timer = setTimeout(() => {
        runAITurn(initialDuelState);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLogs]);

  // Floating text animation helper
  const addFloatingText = (text: string, color: string, target: 'player' | 'opponent') => {
    const id = Math.random().toString();
    setFloatingEffects((prev) => [...prev, { id, text, color, target }]);
    setTimeout(() => {
      setFloatingEffects((prev) => prev.filter((e) => e.id !== id));
    }, 1200);
  };

  // Check if combat ended
  const checkCombatEnd = (pCombatant: Combatant, oCombatant: Combatant): boolean => {
    if (pCombatant.hp <= 0 || oCombatant.hp <= 0) {
      const playerWon = oCombatant.hp <= 0;
      const winnerRole = isPlayerAttacker
        ? playerWon ? 'attacker' : 'defender'
        : playerWon ? 'defender' : 'attacker';

      const winningCombatant = playerWon ? pCombatant : oCombatant;
      const losingCombatant = playerWon ? oCombatant : pCombatant;

      // XP calculation
      let xpEarned = 0;
      let didLevelUp = false;
      let newLevel = winningCombatant.piece.level;

      sound.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // XP formula: base 50 + bonus for defeating higher rank piece
      const rankTiers: Record<string, number> = { pawn: 1, knight: 2, bishop: 2, rook: 3, queen: 4, king: 5 };
      const tierDiff = (rankTiers[losingCombatant.piece.type] || 1) - (rankTiers[winningCombatant.piece.type] || 1);
      xpEarned = 50 + Math.max(0, tierDiff * 25);

      const currentXp = winningCombatant.piece.xp + xpEarned;
      const nextThreshold = LEVEL_THRESHOLDS[winningCombatant.piece.level] || 9999;

      if (currentXp >= nextThreshold && winningCombatant.piece.level < 5) {
        didLevelUp = true;
        newLevel = winningCombatant.piece.level + 1;
        sound.playLevelUp();
      }

      setLevelUpData({
        didLevelUp,
        newLevel,
        xp: xpEarned,
      });

      const finishedDuel: DuelState = {
        ...duelRef.current,
        phase: 'result',
        winner: winnerRole,
      };
      duelRef.current = finishedDuel;
      setDuel(finishedDuel);

      setShowResultModal(true);
      return true;
    }
    return false;
  };

  // Card execution logic
  const executeCard = (
    card: CardAction,
    user: 'player' | 'opponent',
    currentDuel: DuelState
  ): DuelState => {
    sound.playCardWhoosh();

    const isUserPlayer = user === 'player';
    
    // Retrieve player and opponent instances from currentDuel
    const playerInstance = isPlayerAttacker ? { ...currentDuel.attacker } : { ...currentDuel.defender };
    const opponentInstance = isPlayerAttacker ? { ...currentDuel.defender } : { ...currentDuel.attacker };

    const active = isUserPlayer ? playerInstance : opponentInstance;
    const target = isUserPlayer ? opponentInstance : playerInstance;

    // Deduct cost
    active.energy = Math.max(0, active.energy - card.cost);
    active.hand = active.hand.filter((c) => c.id !== card.id);
    active.discard = [...active.discard, card];

    const actorName = isUserPlayer
      ? (playerInstance.piece.color === 'white' ? player1Name : (isPvP ? player2Name : 'You'))
      : (opponentInstance.piece.color === 'white' ? player1Name : (isPvP ? player2Name : 'Enemy'));

    let logText = `⚔️ ${actorName} played [${card.name}]`;

    // 1. Apply Defense / Block
    if (card.block) {
      active.block += card.block;
      sound.playBlockClang();
      addFloatingText(`+${card.block} 🛡️`, 'text-blue-400', isUserPlayer ? 'player' : 'opponent');
      logText += ` (+${card.block} Block)`;
    }

    // 2. Apply Healing
    if (card.heal) {
      const prevHp = active.hp;
      active.hp = Math.min(active.maxHp, active.hp + card.heal);
      const actualHeal = active.hp - prevHp;
      sound.playSpellCast();
      addFloatingText(`+${actualHeal} 💚`, 'text-emerald-400', isUserPlayer ? 'player' : 'opponent');
      logText += ` (+${actualHeal} HP)`;
    }

    // 3. Apply Damage
    if (card.damage) {
      let finalDamage = card.damage;

      // Piece level slight damage boost
      if (active.piece.attackBonus) {
        finalDamage += active.piece.attackBonus;
      }

      // Check pierce
      let blockedDamage = 0;
      let hpDamage = finalDamage;

      if (card.pierce) {
        const halfBlock = Math.floor(target.block * 0.5);
        blockedDamage = Math.min(halfBlock, finalDamage);
        target.block -= blockedDamage;
        hpDamage = finalDamage - blockedDamage;
      } else {
        blockedDamage = Math.min(target.block, finalDamage);
        target.block -= blockedDamage;
        hpDamage = finalDamage - blockedDamage;
      }

      target.hp = Math.max(0, target.hp - hpDamage);

      if (card.isSignature) {
        sound.playSpellCast();
      } else {
        sound.playAttackHit();
      }

      if (hpDamage > 0) {
        addFloatingText(`-${hpDamage} 💥`, 'text-red-400', isUserPlayer ? 'opponent' : 'player');
      }
      if (blockedDamage > 0) {
        addFloatingText(`(${blockedDamage} Blocked)`, 'text-slate-300', isUserPlayer ? 'opponent' : 'player');
      }

      logText += ` -> Dealt ${hpDamage} DMG ${blockedDamage > 0 ? `(${blockedDamage} absorbed)` : ''}`;
    }

    // 4. Bonus AP / Draw
    if (card.bonusAp) {
      active.energy += card.bonusAp;
      addFloatingText(`+${card.bonusAp} ⚡`, 'text-amber-300', isUserPlayer ? 'player' : 'opponent');
    }

    if (card.drawCards) {
      const drawCount = card.drawCards;
      for (let i = 0; i < drawCount; i++) {
        if (active.deck.length === 0 && active.discard.length > 0) {
          active.deck = [...active.discard];
          active.discard = [];
        }
        if (active.deck.length > 0) {
          const drawn = active.deck.pop()!;
          active.hand.push(drawn);
        }
      }
    }

    setCombatLogs((prev) => [...prev, logText]);

    const finalPlayer = isUserPlayer ? active : target;
    const finalOpponent = isUserPlayer ? target : active;

    const updatedDuel: DuelState = {
      ...currentDuel,
      attacker: isPlayerAttacker ? finalPlayer : finalOpponent,
      defender: isPlayerAttacker ? finalOpponent : finalPlayer,
    };

    duelRef.current = updatedDuel;
    return updatedDuel;
  };

  // Play a card (supports both player & opponent in PvP)
  const handlePlayCard = (card: CardAction, user: 'player' | 'opponent' = 'player') => {
    if (isProcessingTurn) return;

    const activeCombatant = user === 'player' ? playerCombatant : opponentCombatant;
    if (card.cost > activeCombatant.energy) return;

    setPlayedCardAnim({ card, source: user });
    const updated = executeCard(card, user, duelRef.current);
    setDuel(updated);

    const pCombat = isPlayerAttacker ? updated.attacker : updated.defender;
    const oCombat = isPlayerAttacker ? updated.defender : updated.attacker;

    if (checkCombatEnd(pCombat, oCombat)) {
      return;
    }

    setTimeout(() => {
      setPlayedCardAnim(null);
    }, 500);
  };

  // End Turn handler (handles PvP pass-and-play and PvAI mode)
  const handleEndTurn = () => {
    if (isProcessingTurn) return;

    if (isPvP) {
      // PvP: Switch turn to the other human player!
      const nextTurn = duel.currentTurn === 'player' ? 'opponent' : 'player';
      const incomingCombatant = nextTurn === 'player' ? { ...playerCombatant } : { ...opponentCombatant };
      const outgoingCombatant = nextTurn === 'player' ? { ...opponentCombatant } : { ...playerCombatant };

      // Refresh incoming combatant AP & Draw card
      incomingCombatant.energy = incomingCombatant.maxEnergy;
      incomingCombatant.block = Math.floor(incomingCombatant.block * 0.5);

      if (incomingCombatant.deck.length === 0 && incomingCombatant.discard.length > 0) {
        incomingCombatant.deck = [...incomingCombatant.discard];
        incomingCombatant.discard = [];
      }
      if (incomingCombatant.deck.length > 0 && incomingCombatant.hand.length < 5) {
        incomingCombatant.hand = [...incomingCombatant.hand, incomingCombatant.deck.pop()!];
      }

      const nextPlayerName = incomingCombatant.piece.color === 'white' ? player1Name : player2Name;
      setCombatLogs((prev) => [...prev, `⏳ Turn passed to ${nextPlayerName}!`]);
      sound.playCardWhoosh();

      const nextState: DuelState = {
        ...duelRef.current,
        attacker: isPlayerAttacker
          ? (nextTurn === 'player' ? incomingCombatant : outgoingCombatant)
          : (nextTurn === 'player' ? outgoingCombatant : incomingCombatant),
        defender: isPlayerAttacker
          ? (nextTurn === 'player' ? outgoingCombatant : incomingCombatant)
          : (nextTurn === 'player' ? incomingCombatant : outgoingCombatant),
        currentTurn: nextTurn,
        round: duelRef.current.round + 1,
      };

      duelRef.current = nextState;
      setDuel(nextState);
      return;
    }

    // PvAI: Hand over to AI
    setIsProcessingTurn(true);
    setCombatLogs((prev) => [...prev, `⏳ Turn passed to Enemy.`]);

    const nextState: DuelState = {
      ...duelRef.current,
      currentTurn: 'opponent',
    };
    duelRef.current = nextState;
    setDuel(nextState);

    // AI Turn Execution
    setTimeout(() => {
      runAITurn(nextState);
    }, 700);
  };

  // Run AI Turn (PvAI mode only)
  const runAITurn = (startingState?: DuelState) => {
    let currentDuelState = { ...(startingState || duelRef.current) };
    let aiCombatant = isPlayerAttacker ? { ...currentDuelState.defender } : { ...currentDuelState.attacker };
    let pCombatant = isPlayerAttacker ? { ...currentDuelState.attacker } : { ...currentDuelState.defender };

    // Reset AI energy & draw 1-2 cards
    aiCombatant.energy = aiCombatant.maxEnergy;
    aiCombatant.block = Math.floor(aiCombatant.block * 0.5); // Carryover half block

    if (aiCombatant.deck.length === 0 && aiCombatant.discard.length > 0) {
      aiCombatant.deck = [...aiCombatant.discard];
      aiCombatant.discard = [];
    }
    if (aiCombatant.deck.length > 0 && aiCombatant.hand.length < 5) {
      aiCombatant.hand = [...aiCombatant.hand, aiCombatant.deck.pop()!];
    }

    currentDuelState = {
      ...currentDuelState,
      attacker: isPlayerAttacker ? pCombatant : aiCombatant,
      defender: isPlayerAttacker ? aiCombatant : pCombatant,
    };
    duelRef.current = currentDuelState;
    setDuel(currentDuelState);

    // Step-by-step AI card plays
    const playNextAICard = () => {
      const liveAI = isPlayerAttacker ? duelRef.current.defender : duelRef.current.attacker;
      const livePlayer = isPlayerAttacker ? duelRef.current.attacker : duelRef.current.defender;

      const chosenCard = chooseCombatAICard(liveAI, livePlayer, difficulty, adaptiveRating);

      if (chosenCard) {
        setPlayedCardAnim({ card: chosenCard, source: 'opponent' });
        const updated = executeCard(chosenCard, 'opponent', duelRef.current);
        setDuel(updated);

        const updatedAI = isPlayerAttacker ? updated.defender : updated.attacker;
        const updatedPlayer = isPlayerAttacker ? updated.attacker : updated.defender;

        if (checkCombatEnd(updatedPlayer, updatedAI)) {
          setIsProcessingTurn(false);
          setPlayedCardAnim(null);
          return;
        }

        setTimeout(() => {
          setPlayedCardAnim(null);
          setTimeout(playNextAICard, 600);
        }, 550);
      } else {
        // AI Ends Turn, Pass to Player
        setCombatLogs((prev) => [...prev, `⚡ Enemy finished actions. Your Turn!`]);

        const latestAI = isPlayerAttacker ? { ...duelRef.current.defender } : { ...duelRef.current.attacker };
        const latestPlayer = isPlayerAttacker ? { ...duelRef.current.attacker } : { ...duelRef.current.defender };

        // Refresh Player AP & Draw Cards
        latestPlayer.energy = latestPlayer.maxEnergy;
        latestPlayer.block = Math.floor(latestPlayer.block * 0.5);

        if (latestPlayer.deck.length === 0 && latestPlayer.discard.length > 0) {
          latestPlayer.deck = [...latestPlayer.discard];
          latestPlayer.discard = [];
        }
        while (latestPlayer.hand.length < 4 && latestPlayer.deck.length > 0) {
          latestPlayer.hand = [...latestPlayer.hand, latestPlayer.deck.pop()!];
        }

        const playerTurnState: DuelState = {
          ...duelRef.current,
          attacker: isPlayerAttacker ? latestPlayer : latestAI,
          defender: isPlayerAttacker ? latestAI : latestPlayer,
          currentTurn: 'player',
          round: duelRef.current.round + 1,
        };

        duelRef.current = playerTurnState;
        setDuel(playerTurnState);
        setIsProcessingTurn(false);
      }
    };

    // Begin AI card sequence
    setTimeout(playNextAICard, 600);
  };

  const handleFinishAndReturn = () => {
    if (!duel.winner || !levelUpData) return;
    onDuelFinish(duel.winner, levelUpData.xp, levelUpData.didLevelUp);
  };

  const topCombatant = isPvP
    ? (duel.currentTurn === 'player' ? opponentCombatant : playerCombatant)
    : opponentCombatant;
  const bottomCombatant = isPvP
    ? (duel.currentTurn === 'player' ? playerCombatant : opponentCombatant)
    : playerCombatant;

  const topPiece = topCombatant.piece;
  const bottomPiece = bottomCombatant.piece;

  const topStats = PIECE_BASE_STATS[topPiece.type];
  const bottomStats = PIECE_BASE_STATS[bottomPiece.type];

  const topHpPct = Math.max(0, Math.min(100, (topCombatant.hp / topCombatant.maxHp) * 100));
  const bottomHpPct = Math.max(0, Math.min(100, (bottomCombatant.hp / bottomCombatant.maxHp) * 100));

  const topPlayerLabel = topPiece.color === 'white' ? player1Name : (isPvP ? player2Name : 'Dread Black AI');
  const bottomPlayerLabel = bottomPiece.color === 'white' ? player1Name : (isPvP ? player2Name : 'You (Radiant)');

  const canActiveAct = isPvP ? !isProcessingTurn : duel.currentTurn === 'player' && !isProcessingTurn;
  const activeUserKey: 'player' | 'opponent' = isPvP
    ? (duel.currentTurn === 'player' ? 'player' : 'opponent')
    : 'player';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 overflow-hidden select-none">
      {/* Top Arena Header: Opponent / Waiting Combatant Card */}
      <div className={`w-full max-w-2xl bg-slate-900/90 border rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col gap-2 ${
        topPiece.color === 'white' ? 'border-amber-500/30' : 'border-red-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-slate-800 rounded-xl border relative ${
              topPiece.color === 'white' ? 'border-amber-400/40' : 'border-red-500/40'
            }`}>
              <PieceArt type={topPiece.type} color={topPiece.color} level={topPiece.level} size="lg" />
              {floatingEffects
                .filter((f) => f.target === (isPvP && duel.currentTurn === 'opponent' ? 'player' : 'opponent'))
                .map((f) => (
                  <div
                    key={f.id}
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 font-black text-base sm:text-lg animate-bounce drop-shadow ${f.color}`}
                  >
                    {f.text}
                  </div>
                ))}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-100 text-sm sm:text-base">
                  {topPlayerLabel}: {topStats.title}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                  topPiece.color === 'white'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-red-900/60 text-red-300 border-red-700'
                }`}>
                  Lv.{topPiece.level}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  {topCombatant.role === 'attacker' ? '(Attacking)' : '(Defending Square)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 italic">{topStats.signatureName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-right">
            {topCombatant.block > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-950/80 border border-blue-600/60 rounded-lg text-blue-300 text-xs font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>{topCombatant.block}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 border border-slate-700 rounded-lg text-amber-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{topCombatant.energy} AP</span>
            </div>
          </div>
        </div>

        {/* Top HP Bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-red-400" /> HP
            </span>
            <span>
              {topCombatant.hp} / {topCombatant.maxHp}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                topPiece.color === 'white'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                  : 'bg-gradient-to-r from-red-600 to-rose-500'
              }`}
              style={{ width: `${topHpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle Center Clash Arena / Combat Log */}
      <div className="w-full max-w-2xl flex-1 my-2 flex flex-col items-center justify-center relative min-h-[130px] sm:min-h-[160px]">
        {/* Played Card Visual Popup */}
        {playedCardAnim && (
          <div
            className={`absolute z-30 p-3 sm:p-4 rounded-xl border-2 shadow-2xl flex flex-col items-center gap-1 animate-in zoom-in-75 duration-200 ${
              playedCardAnim.source === 'player'
                ? 'bg-amber-950/90 border-amber-400 text-amber-100'
                : 'bg-red-950/90 border-red-500 text-red-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
              {playedCardAnim.source === 'player' ? `${player1Name} UNLEASHED` : `${player2Name} UNLEASHED`}
            </div>
            <div className="text-base sm:text-lg font-black">{playedCardAnim.card.name}</div>
            <div className="text-xs text-center max-w-[220px] text-slate-200">{playedCardAnim.card.description}</div>
          </div>
        )}

        {/* Turn Header for 2-Player */}
        {isPvP && (
          <div className="mb-1 px-3 py-1 bg-indigo-500/20 border border-indigo-400/50 rounded-xl text-xs font-black text-indigo-300 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            <span>Pass & Play: Active Combat Turn → <strong>{bottomPlayerLabel}</strong></span>
          </div>
        )}

        {/* Combat Action Feed */}
        <div className="w-full h-24 sm:h-28 bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 overflow-y-auto font-mono text-xs text-slate-300 flex flex-col gap-1 shadow-inner backdrop-blur-sm">
          {combatLogs.map((log, index) => (
            <div key={`log-${index}`} className="leading-tight">
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Bottom Arena Footer: Active Fighter & Action Cards Hand */}
      <div className={`w-full max-w-2xl bg-slate-900/90 border rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col gap-3 ${
        bottomPiece.color === 'white' ? 'border-amber-500/40' : 'border-indigo-500/40'
      }`}>
        {/* Active Fighter Stats Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-slate-800 rounded-xl border relative ${
              bottomPiece.color === 'white' ? 'border-amber-500/40' : 'border-indigo-500/40'
            }`}>
              <PieceArt type={bottomPiece.type} color={bottomPiece.color} level={bottomPiece.level} size="lg" />
              {floatingEffects
                .filter((f) => f.target === (isPvP && duel.currentTurn === 'opponent' ? 'opponent' : 'player'))
                .map((f) => (
                  <div
                    key={f.id}
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 font-black text-base sm:text-lg animate-bounce drop-shadow ${f.color}`}
                  >
                    {f.text}
                  </div>
                ))}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-200 text-sm sm:text-base">
                  {bottomPlayerLabel}: {bottomStats.title}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                  bottomPiece.color === 'white'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-indigo-900/60 text-indigo-300 border-indigo-700'
                }`}>
                  Lv.{bottomPiece.level}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  {bottomCombatant.role === 'attacker' ? '(Attacker)' : '(Defending)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{bottomStats.signatureName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {bottomCombatant.block > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-950/80 border border-blue-600/60 rounded-lg text-blue-300 text-xs font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>{bottomCombatant.block}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/80 border border-amber-500 rounded-xl text-amber-300 font-extrabold text-sm shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{bottomCombatant.energy} AP</span>
            </div>
            <button
              id="combat-end-turn-button"
              disabled={!canActiveAct}
              onClick={handleEndTurn}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                canActiveAct
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>End Turn</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Fighter HP Bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-emerald-400" /> HP
            </span>
            <span>
              {bottomCombatant.hp} / {bottomCombatant.maxHp}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-300 rounded-full"
              style={{ width: `${bottomHpPct}%` }}
            />
          </div>
        </div>

        {/* Hand Cards Carousel */}
        <div className="w-full pt-1">
          <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>TACTICAL CARDS IN HAND ({bottomCombatant.hand.length})</span>
            <span className="text-amber-400">
              {canActiveAct ? `${bottomPlayerLabel}'s turn: Tap card to play` : 'Waiting for turn...'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {bottomCombatant.hand.map((card) => {
              const canAfford = card.cost <= bottomCombatant.energy && canActiveAct;
              const isSignature = card.isSignature;

              return (
                <button
                  key={card.id}
                  id={`card-${card.id}`}
                  disabled={!canAfford}
                  onClick={() => handlePlayCard(card, activeUserKey)}
                  className={`relative p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 active:scale-95 touch-manipulation min-h-[95px] sm:min-h-[110px] ${
                    isSignature
                      ? 'bg-gradient-to-b from-amber-950/80 to-slate-900 border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : card.type === 'attack'
                      ? 'bg-slate-900/90 border-red-500/40 hover:border-red-400'
                      : card.type === 'defense'
                      ? 'bg-slate-900/90 border-blue-500/40 hover:border-blue-400'
                      : 'bg-slate-900/90 border-purple-500/40 hover:border-purple-400'
                  } ${
                    canAfford
                      ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer'
                      : 'opacity-40 cursor-not-allowed grayscale'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-xs text-slate-100 line-clamp-1">{card.name}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] shrink-0">
                      {card.cost} AP
                    </span>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-2 my-1 leading-tight">
                    {card.description}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    {card.damage && (
                      <span className="text-red-400 flex items-center gap-0.5">
                        <Swords className="w-3 h-3" /> {card.damage}
                      </span>
                    )}
                    {card.block && (
                      <span className="text-blue-400 flex items-center gap-0.5">
                        <Shield className="w-3 h-3" /> {card.block}
                      </span>
                    )}
                    {card.heal && (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Heart className="w-3 h-3" /> {card.heal}
                      </span>
                    )}
                    {isSignature && (
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" /> Special
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Duel Victory / Defeat Modal */}
      {showResultModal && levelUpData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
            {duel.winner ? (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_20px_#f59e0b]">
                  <Award className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-amber-300">
                  {duel.winner === 'attacker'
                    ? `${initialDuelState.attacker.piece.color === 'white' ? player1Name : player2Name} WINS DUEL!`
                    : `${initialDuelState.defender.piece.color === 'white' ? player1Name : player2Name} DEFENDED SQUARE!`}
                </h2>
                <p className="text-xs text-slate-300">
                  {duel.winner === 'attacker'
                    ? `${initialDuelState.attacker.piece.type.toUpperCase()} overpowered the defender and captured the square!`
                    : `${initialDuelState.defender.piece.type.toUpperCase()} repelled the attack and survived!`}
                </p>

                {/* Level Up Banner */}
                {levelUpData.didLevelUp ? (
                  <div className="w-full p-3 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/60 rounded-2xl flex items-center gap-3 animate-pulse">
                    <ArrowUpCircle className="w-8 h-8 text-amber-300 shrink-0" />
                    <div className="text-left">
                      <div className="text-sm font-black text-amber-200">LEVEL UP! REACHED LEVEL {levelUpData.newLevel}</div>
                      <div className="text-xs text-slate-300">+Max HP bonus & combat stats boosted!</div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-300 flex justify-between">
                    <span>XP Earned by Winner:</span>
                    <span className="font-bold text-amber-400">+{levelUpData.xp} XP</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center text-red-400 shadow-[0_0_20px_#ef4444]">
                  <Skull className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-red-400">DUEL COMPLETE</h2>
              </>
            )}

            <button
              id="return-to-board-button"
              onClick={handleFinishAndReturn}
              className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Return to Chess Battlefield</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
