import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChessPiece,
  DifficultyMode,
  DuelState,
  GameMode,
  PieceColor,
  PlayerProfile,
  PlayerStats,
  Position,
  Combatant,
} from './types';
import {
  Board,
  createInitialBoard,
  cloneBoard,
  getLegalMoves,
  findKing,
  isKingInCheck,
} from './utils/chessEngine';
import { getBestAIMove } from './utils/chessAI';
import {
  createInitialPieceDeck,
  getPieceMaxHp,
  getPieceStartingBlock,
  PIECE_BASE_STATS,
  LEVEL_THRESHOLDS,
} from './utils/cardData';
import {
  loadGameSettings,
  loadPlayerStats,
  saveGameSettings,
  savePlayerStats,
  updateAdaptiveRating,
  loadPlayerProfiles,
  loadActivePlayersState,
  saveActivePlayersState,
  updateProfilePerformance,
  getRankInfo,
} from './utils/storage';
import { sound } from './utils/soundEffects';

import { ChessBoard } from './components/ChessBoard';
import { CombatDuel } from './components/CombatDuel';
import { GameNavbar } from './components/GameNavbar';
import { PieceRosterModal } from './components/PieceRosterModal';
import { TutorialMode } from './components/TutorialMode';
import { StatsModal } from './components/StatsModal';
import { GameOverModal } from './components/GameOverModal';
import { ModeSelectionModal } from './components/ModeSelectionModal';
import { PieceArt } from './components/PieceArt';
import {
  Swords,
  Shield,
  Sparkles,
  BookOpen,
  Layers,
  Trophy,
  Zap,
  Sliders,
  RotateCcw,
  Activity,
  Heart,
  ChevronRight,
  TrendingUp,
  Users,
  User,
  Bot,
  Crown,
} from 'lucide-react';

interface BattleLogEntry {
  id: string;
  turnNumber: number;
  message: string;
  type: 'move' | 'clash' | 'victory' | 'levelup' | 'system' | 'check';
}

export default function App() {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [turn, setTurn] = useState<PieceColor>('white');
  const [turnCount, setTurnCount] = useState<number>(1);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);

  // Active Combat Duel
  const [activeDuel, setActiveDuel] = useState<DuelState | null>(null);

  // Match statistics
  const [matchStats, setMatchStats] = useState<{ totalDuels: number; duelsWon: number }>({
    totalDuels: 0,
    duelsWon: 0,
  });

  // Settings & Player record
  const [settings, setSettings] = useState(() => loadGameSettings());
  const [stats, setStats] = useState<PlayerStats>(() => loadPlayerStats());

  // Profiles & 2-Player Setup
  const [profiles, setProfiles] = useState<PlayerProfile[]>(() => loadPlayerProfiles());
  const [activePlayers, setActivePlayers] = useState(() => loadActivePlayersState());
  const [showModeModal, setShowModeModal] = useState<boolean>(false);

  // Live Battle Log
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([
    {
      id: 'init',
      turnNumber: 1,
      message: 'Battlefield initialized. Command your vanguard forces.',
      type: 'system',
    },
  ]);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // Modals & UI States
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showRoster, setShowRoster] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [inspectedPiece, setInspectedPiece] = useState<ChessPiece | null>(null);
  const [matchWinner, setMatchWinner] = useState<PieceColor | null>(null);

  const isPvP = activePlayers.gameMode === 'pvp';

  // Player Display Names with uneditable title prefix
  const player1Profile = profiles.find((p) => p.id === activePlayers.player1Id) || profiles[0];
  const player2Profile = activePlayers.player2Id
    ? profiles.find((p) => p.id === activePlayers.player2Id) || profiles[1] || null
    : null;

  const p1Rank = player1Profile ? getRankInfo(player1Profile.rating) : { title: 'Squire', color: 'text-slate-300', icon: '🛡️', nextRankRating: 1100 };
  const p2Rank = player2Profile ? getRankInfo(player2Profile.rating) : { title: 'Squire', color: 'text-slate-300', icon: '🛡️', nextRankRating: 1100 };

  const player1DisplayName = player1Profile
    ? `${p1Rank.title} ${player1Profile.name}`
    : 'Squire Radiant';
  const player2DisplayName = isPvP
    ? player2Profile
      ? `${p2Rank.title} ${player2Profile.name}`
      : 'Squire Black'
    : 'Dread Black AI';

  // Auto-scroll battle logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLogs]);

  const addBattleLog = (message: string, type: BattleLogEntry['type']) => {
    setBattleLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        turnNumber: turnCount,
        message,
        type,
      },
    ]);
  };

  // Check if first time player to offer tutorial
  useEffect(() => {
    if (stats.gamesPlayed === 0 && stats.duelsPlayed === 0 && profiles.length <= 2 && profiles[0].gamesPlayed === 0) {
      setShowTutorial(true);
    }
  }, []);

  // Find active unit to showcase on Bento Left Card (selected piece or highest vanguard)
  const getActiveShowcasePiece = useCallback((): ChessPiece => {
    if (selectedPos && board[selectedPos.row][selectedPos.col]) {
      return board[selectedPos.row][selectedPos.col]!;
    }
    // Default to strongest active piece based on turn
    const activeColor = turn;
    let bestPiece: ChessPiece | null = null;
    let maxScore = -1;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.color === activeColor) {
          const score = p.level * 10 + (p.type === 'queen' ? 9 : p.type === 'knight' ? 5 : 2);
          if (score > maxScore) {
            maxScore = score;
            bestPiece = p;
          }
        }
      }
    }
    return (
      bestPiece || {
        id: 'default-knight',
        type: 'knight',
        color: activeColor,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        victories: 0,
        maxHpBonus: 0,
        attackBonus: 0,
        shieldBonus: 0,
        hasMoved: false,
      }
    );
  }, [board, selectedPos, turn]);

  // Find Match MVP piece (highest level or most victories)
  const getMatchMvp = useCallback((): ChessPiece | null => {
    let mvp: ChessPiece | null = null;
    let maxScore = -1;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          const score = p.victories * 10 + p.level * 5 + p.xp;
          if (score > maxScore) {
            maxScore = score;
            mvp = p;
          }
        }
      }
    }
    return mvp;
  }, [board]);

  // Pos to notation helper (e.g. {row: 6, col: 4} -> "E2")
  const getNotation = (pos: Position): string => {
    const file = String.fromCharCode(65 + pos.col);
    const rank = 8 - pos.row;
    return `${file}${rank}`;
  };

  // Restart new match
  const handleNewMatch = () => {
    setBoard(createInitialBoard());
    setSelectedPos(null);
    setLegalMoves([]);
    setLastMove(null);
    setTurn('white');
    setTurnCount(1);
    setIsAIThinking(false);
    setActiveDuel(null);
    setMatchWinner(null);
    setMatchStats({ totalDuels: 0, duelsWon: 0 });
    setBattleLogs([
      {
        id: Math.random().toString(),
        turnNumber: 1,
        message: `New match commenced: ${player1DisplayName} (White) vs ${player2DisplayName} (Black).`,
        type: 'system',
      },
    ]);
    sound.playMove();
  };

  // Handle Game Mode selection confirmation
  const handleModeConfirmed = (
    mode: GameMode,
    p1Id: string,
    p2Id: string | null,
    newDiff: DifficultyMode
  ) => {
    setActivePlayers({ gameMode: mode, player1Id: p1Id, player2Id: p2Id });
    saveActivePlayersState({ gameMode: mode, player1Id: p1Id, player2Id: p2Id });

    const updatedSettings = { ...settings, difficulty: newDiff };
    setSettings(updatedSettings);
    saveGameSettings(updatedSettings);

    const refreshedProfiles = loadPlayerProfiles();
    setProfiles(refreshedProfiles);

    setShowModeModal(false);
    handleNewMatch();
  };

  // Create combatant model for a piece
  const createCombatant = (piece: ChessPiece, isPlayer: boolean, role: 'attacker' | 'defender'): Combatant => {
    const maxHp = getPieceMaxHp(piece);
    const startingBlock = getPieceStartingBlock(piece);
    const maxEnergy = PIECE_BASE_STATS[piece.type].baseEnergy;
    const fullDeck = createInitialPieceDeck(piece);

    // Initial hand of 4 cards
    const deck = [...fullDeck];
    const hand: typeof deck = [];
    for (let i = 0; i < 4 && deck.length > 0; i++) {
      hand.push(deck.pop()!);
    }

    return {
      piece: { ...piece },
      isPlayer,
      hp: maxHp,
      maxHp,
      block: startingBlock,
      energy: maxEnergy,
      maxEnergy,
      hand,
      deck,
      discard: [],
      statusEffects: [],
      role,
    };
  };

  // Initiate Duel between attacker and defender
  const initiateDuel = (from: Position, to: Position) => {
    const attackerPiece = board[from.row][from.col]!;
    const defenderPiece = board[to.row][to.col]!;

    const isWhiteAttacker = attackerPiece.color === 'white';
    // In PvP both sides are human players; in PvAI white is human
    const isAttackerHuman = isPvP ? true : isWhiteAttacker;
    const isDefenderHuman = isPvP ? true : !isWhiteAttacker;

    const attacker = createCombatant(attackerPiece, isAttackerHuman, 'attacker');
    const defender = createCombatant(defenderPiece, isDefenderHuman, 'defender');

    const attackerName = isWhiteAttacker ? player1DisplayName : player2DisplayName;
    const defenderName = isWhiteAttacker ? player2DisplayName : player1DisplayName;

    addBattleLog(
      `CLASH at ${getNotation(to)}! ${attackerName}'s ${attackerPiece.type.toUpperCase()} strikes ${defenderName}'s ${defenderPiece.type.toUpperCase()}!`,
      'clash'
    );

    const duelState: DuelState = {
      attacker,
      defender,
      currentTurn: isWhiteAttacker ? 'player' : (isPvP ? 'opponent' : 'opponent'),
      round: 1,
      originPos: from,
      targetPos: to,
      phase: 'action',
    };

    setSelectedPos(null);
    setLegalMoves([]);
    setActiveDuel(duelState);
  };

  // Complete Duel Resolution
  const handleDuelFinish = (winner: 'attacker' | 'defender', xpGained: number, leveledUp: boolean) => {
    if (!activeDuel) return;

    const { originPos, targetPos, attacker, defender } = activeDuel;
    const attackerWon = winner === 'attacker';
    const winningPiece = attackerWon ? attacker.piece : defender.piece;
    const winningColor = winningPiece.color;

    const winnerName = winningColor === 'white' ? player1DisplayName : player2DisplayName;

    addBattleLog(
      `[COMBAT] ${winnerName}'s ${winningPiece.type.toUpperCase()} won the duel! (+${xpGained} EXP)`,
      'victory'
    );

    // Update match stats
    setMatchStats((prev) => ({
      totalDuels: prev.totalDuels + 1,
      duelsWon: prev.duelsWon + (winningColor === 'white' ? 1 : 0),
    }));

    // Update player profile ratings and titles for PvP and PvAI
    if (player1Profile) {
      const p1WonDuel = winningColor === 'white';
      updateProfilePerformance(player1Profile.id, p1WonDuel, true);
    }
    if (isPvP && player2Profile) {
      const p2WonDuel = winningColor === 'black';
      updateProfilePerformance(player2Profile.id, p2WonDuel, true);
    }

    // Refresh profiles
    setProfiles(loadPlayerProfiles());

    const newBoard = cloneBoard(board);
    const winningPieceRef = attackerWon
      ? newBoard[originPos.row][originPos.col]
      : newBoard[targetPos.row][targetPos.col];

    // Grant XP and victory to the winning piece
    if (winningPieceRef) {
      winningPieceRef.victories += 1;
      winningPieceRef.xp += xpGained;

      if (leveledUp && winningPieceRef.level < 5) {
        winningPieceRef.level += 1;
        winningPieceRef.maxHpBonus += 4;
        winningPieceRef.attackBonus += 1;
        addBattleLog(
          `[LEVEL UP] ${winnerName}'s ${winningPieceRef.type.toUpperCase()} reached Level ${winningPieceRef.level}!`,
          'levelup'
        );
      }
    }

    if (attackerWon) {
      // Attacker takes square
      const advancingPiece = newBoard[originPos.row][originPos.col]!;
      advancingPiece.hasMoved = true;

      // Pawn promotion check
      if (advancingPiece.type === 'pawn') {
        if (
          (advancingPiece.color === 'white' && targetPos.row === 0) ||
          (advancingPiece.color === 'black' && targetPos.row === 7)
        ) {
          advancingPiece.type = 'queen';
          addBattleLog(
            `[PROMOTION] ${winnerName}'s Pawn ascended to War Sovereign (Queen)!`,
            'levelup'
          );
        }
      }

      newBoard[targetPos.row][targetPos.col] = advancingPiece;
      newBoard[originPos.row][originPos.col] = null;
    } else {
      // Defender holds ground!
      addBattleLog(`[DEFENSE] Defender stood ground at ${getNotation(targetPos)}.`, 'system');
    }

    setBoard(newBoard);
    setLastMove({ from: originPos, to: targetPos });
    setActiveDuel(null);
    setSelectedPos(null);
    setLegalMoves([]);

    // Check for King capture / Checkmate
    const whiteKing = findKing(newBoard, 'white');
    const blackKing = findKing(newBoard, 'black');

    if (!blackKing) {
      handleGameOver('white');
      return;
    }
    if (!whiteKing) {
      handleGameOver('black');
      return;
    }

    // Toggle Turn strictly based on who was the attacker
    const nextTurn = attacker.piece.color === 'white' ? 'black' : 'white';
    setTurn(nextTurn);
    setTurnCount((c) => c + 1);
    setIsAIThinking(false);
  };

  // Game Over handling
  const handleGameOver = (winner: PieceColor) => {
    setMatchWinner(winner);

    const winnerName = winner === 'white' ? player1DisplayName : player2DisplayName;
    addBattleLog(`VICTORY! ${winnerName} claimed supreme victory over the battlefield!`, 'victory');

    // Update player profile ratings and rank titles for Match conclusion
    if (player1Profile) {
      updateProfilePerformance(player1Profile.id, winner === 'white', false);
    }
    if (isPvP && player2Profile) {
      updateProfilePerformance(player2Profile.id, winner === 'black', false);
    }

    // Refresh profiles
    setProfiles(loadPlayerProfiles());

    if (winner === 'white' || isPvP) {
      sound.playVictory();
    } else {
      sound.playDefeat();
    }
  };

  // Handle Square Click on the Chessboard
  const handleSquareClick = (row: number, col: number) => {
    if (activeDuel || matchWinner) return;
    if (!isPvP && (turn !== 'white' || isAIThinking)) return;

    const clickedPiece = board[row][col];

    // If clicking active player's own piece: select it
    if (clickedPiece && clickedPiece.color === turn) {
      sound.playSelect();
      setSelectedPos({ row, col });
      const moves = getLegalMoves(board, { row, col });
      setLegalMoves(moves);
      return;
    }

    // If currently selected a piece and clicking a legal destination
    if (selectedPos) {
      const isLegal = (legalMoves || []).some((m) => m && m.row === row && m.col === col);
      if (isLegal) {
        const sourcePiece = board[selectedPos.row][selectedPos.col]!;
        const targetPiece = board[row][col];

        // If square has enemy piece: TRIGGER COMBAT DUEL!
        if (targetPiece && targetPiece.color !== turn) {
          initiateDuel(selectedPos, { row, col });
          return;
        }

        // Otherwise: Standard Peaceful Move
        sound.playMove();
        const newBoard = cloneBoard(board);
        sourcePiece.hasMoved = true;

        // Pawn Promotion
        if (sourcePiece.type === 'pawn') {
          if (
            (sourcePiece.color === 'white' && row === 0) ||
            (sourcePiece.color === 'black' && row === 7)
          ) {
            sourcePiece.type = 'queen';
            addBattleLog(
              `[PROMOTION] ${sourcePiece.color === 'white' ? player1DisplayName : player2DisplayName}'s Pawn ascended to Queen at ${getNotation({ row, col })}!`,
              'levelup'
            );
          }
        }

        newBoard[row][col] = sourcePiece;
        newBoard[selectedPos.row][selectedPos.col] = null;

        // Castling move rook displacement
        if (sourcePiece.type === 'king' && Math.abs(col - selectedPos.col) === 2) {
          if (col === 6) {
            newBoard[row][5] = newBoard[row][7];
            newBoard[row][7] = null;
          } else if (col === 2) {
            newBoard[row][3] = newBoard[row][0];
            newBoard[row][0] = null;
          }
          addBattleLog(
            `[MOVE] ${sourcePiece.color === 'white' ? player1DisplayName : player2DisplayName} executed Royal Castle!`,
            'move'
          );
        } else {
          addBattleLog(
            `[TURN ${turnCount}] ${sourcePiece.color === 'white' ? player1DisplayName : player2DisplayName} moved ${sourcePiece.type.toUpperCase()} to ${getNotation({ row, col })}`,
            'move'
          );
        }

        setBoard(newBoard);
        setLastMove({ from: selectedPos, to: { row, col } });
        setSelectedPos(null);
        setLegalMoves([]);
        setTurn(turn === 'white' ? 'black' : 'white');
        setTurnCount((c) => c + 1);
        return;
      }
    }

    // Deselect
    setSelectedPos(null);
    setLegalMoves([]);
  };

  // AI Turn Execution (PvAI mode only)
  useEffect(() => {
    if (!isPvP && turn === 'black' && !activeDuel && !matchWinner) {
      setIsAIThinking(true);
      setSelectedPos(null);
      setLegalMoves([]);

      const aiTimer = setTimeout(() => {
        const bestMove = getBestAIMove(board, settings.difficulty, stats.adaptiveRating);

        if (!bestMove) {
          // AI has no moves
          if (isKingInCheck(board, 'black')) {
            handleGameOver('white');
          }
          setIsAIThinking(false);
          return;
        }

        const targetPiece = board[bestMove.to.row][bestMove.to.col];

        // If attacking white piece: TRIGGER COMBAT DUEL!
        if (targetPiece && targetPiece.color === 'white') {
          setIsAIThinking(false);
          initiateDuel(bestMove.from, bestMove.to);
          return;
        }

        // Standard AI Move
        sound.playMove();
        const newBoard = cloneBoard(board);
        const movingPiece = newBoard[bestMove.from.row][bestMove.from.col]!;
        movingPiece.hasMoved = true;

        // Promotion
        if (movingPiece.type === 'pawn' && bestMove.to.row === 7) {
          movingPiece.type = 'queen';
        }

        newBoard[bestMove.to.row][bestMove.to.col] = movingPiece;
        newBoard[bestMove.from.row][bestMove.from.col] = null;

        addBattleLog(
          `[TURN ${turnCount}] Dread AI moved ${movingPiece.type.toUpperCase()} to ${getNotation(bestMove.to)}`,
          'move'
        );

        setBoard(newBoard);
        setLastMove(bestMove);
        setSelectedPos(null);
        setLegalMoves([]);
        setTurn('white');
        setTurnCount((c) => c + 1);
        setIsAIThinking(false);
      }, 900);

      return () => clearTimeout(aiTimer);
    }
  }, [isPvP, turn, activeDuel, matchWinner, board, settings.difficulty, stats.adaptiveRating]);

  // Compute Active Showcase Piece info
  const activePiece = getActiveShowcasePiece();
  const activePieceStats = PIECE_BASE_STATS[activePiece.type];
  const activeDeck = createInitialPieceDeck(activePiece);
  const nextXpGoal = LEVEL_THRESHOLDS[activePiece.level] || 1000;
  const xpPercentage = Math.min(100, Math.round((activePiece.xp / nextXpGoal) * 100));

  // Compute win rate
  const activeProfile = turn === 'white' ? player1Profile : player2Profile;
  const activeRating = activeProfile ? activeProfile.rating : stats.adaptiveRating;
  const activeRank = activeProfile ? getRankInfo(activeProfile.rating) : p1Rank;

  const winRate =
    activeProfile && (activeProfile.gamesPlayed > 0 || activeProfile.duelsPlayed > 0)
      ? Math.round(
          ((activeProfile.gamesWon + activeProfile.duelsWon) /
            Math.max(1, activeProfile.gamesPlayed + activeProfile.duelsPlayed)) *
            100
        )
      : 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-3 sm:p-6 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Bento Bar */}
      <GameNavbar
        difficulty={settings.difficulty}
        stats={stats}
        gameMode={activePlayers.gameMode}
        player1DisplayName={player1DisplayName}
        player2DisplayName={player2DisplayName}
        onOpenTutorial={() => setShowTutorial(true)}
        onOpenRoster={() => setShowRoster(true)}
        onOpenStats={() => setShowStats(true)}
        onOpenModeSelect={() => setShowModeModal(true)}
        onNewGame={handleNewMatch}
      />

      {/* Main Bento Grid Mainframe (12 columns) */}
      <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-12 gap-4 items-start">
        {/* ================= LEFT BENTO COLUMN (3 Cols on LG) ================= */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* Bento Card 1: Active Unit Dossier */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {selectedPos ? 'Selected Unit' : 'Active Vanguard'}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${
                    activePiece.color === 'white'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  }`}
                >
                  {activePiece.color === 'white' ? 'WHITE' : 'BLACK'} • TIER {activePiece.level}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border shrink-0 ${
                    activePiece.color === 'white'
                      ? 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-400/40'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-800 border-indigo-400/40'
                  }`}
                >
                  <PieceArt type={activePiece.type} color={activePiece.color} level={activePiece.level} size="md" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-100 leading-snug">{activePieceStats.title}</p>
                  <p className="text-xs text-indigo-400 font-mono font-bold">
                    LEVEL {activePiece.level} / {activePiece.level >= 3 ? 'ELITE' : 'ACTIVE'}
                  </p>
                </div>
              </div>

              {/* Combat Attributes */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center mb-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 flex items-center justify-center gap-0.5">
                    <Heart className="w-2.5 h-2.5 text-rose-400" /> HP
                  </span>
                  <span className="text-xs font-mono font-black text-rose-300">
                    {getPieceMaxHp(activePiece)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 flex items-center justify-center gap-0.5">
                    <Shield className="w-2.5 h-2.5 text-indigo-400" /> BLK
                  </span>
                  <span className="text-xs font-mono font-black text-indigo-300">
                    {getPieceStartingBlock(activePiece)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 flex items-center justify-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-amber-400" /> AP
                  </span>
                  <span className="text-xs font-mono font-black text-amber-300">
                    {activePieceStats.baseEnergy}
                  </span>
                </div>
              </div>
            </div>

            {/* EXP Progress Gauge */}
            <div>
              <div className="flex justify-between text-[10px] mb-1.5 font-bold font-mono">
                <span className="text-slate-400">EXP PROGRESS</span>
                <span className="text-indigo-400">
                  {activePiece.xp} / {nextXpGoal}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bento Card 2: Commander Profile & Rank Title Card */}
          <div
            onClick={() => setShowModeModal(true)}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer rounded-3xl p-4 flex flex-col gap-3 shadow-xl transition-all"
            title="Click to Switch Mode / Players"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" /> Active Commanders
              </span>
              <span className="text-[10px] text-amber-400 font-semibold hover:underline">Change</span>
            </div>

            {/* Player 1 Details */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base">{p1Rank.icon}</span>
                <div>
                  <div className="text-xs font-black text-amber-300 leading-tight">
                    {p1Rank.title} {player1Profile?.name || 'White'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">White Commander</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-black text-amber-400">
                  {player1Profile?.rating || 1000}
                </div>
                <div className="text-[9px] text-slate-500">MMR</div>
              </div>
            </div>

            {/* Player 2 Details */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base">{isPvP ? p2Rank.icon : '🤖'}</span>
                <div>
                  <div className="text-xs font-black text-indigo-300 leading-tight">
                    {isPvP ? `${p2Rank.title} ${player2Profile?.name || 'Black'}` : 'Dread AI Sovereign'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Black Commander</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-black text-indigo-400">
                  {isPvP ? (player2Profile?.rating || 1000) : settings.difficulty.toUpperCase()}
                </div>
                <div className="text-[9px] text-slate-500">{isPvP ? 'MMR' : 'Difficulty'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CENTER BENTO COLUMN: BATTLEFIELD (6 Cols on LG) ================= */}
        <div className="col-span-12 lg:col-span-6 flex flex-col items-center">
          <div className="w-full bg-slate-900/30 border border-slate-800 rounded-[36px] sm:rounded-[40px] p-3 sm:p-5 flex flex-col items-center justify-center relative shadow-inner">
            <ChessBoard
              board={board}
              selectedPos={selectedPos}
              legalMoves={legalMoves}
              lastMove={lastMove}
              turn={turn}
              isAIThinking={isAIThinking}
              gameMode={activePlayers.gameMode}
              player1Name={player1DisplayName}
              player2Name={player2DisplayName}
              onSquareClick={handleSquareClick}
              onPieceInspect={(p) => {
                setInspectedPiece(p);
                setShowRoster(true);
              }}
            />
          </div>
        </div>

        {/* ================= RIGHT BENTO COLUMN (3 Cols on LG) ================= */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* Bento Card 3: Combat Deck Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Combat Deck ({activePieceStats.title})
              </h3>
              <button
                onClick={() => {
                  setInspectedPiece(activePiece);
                  setShowRoster(true);
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
              >
                Spellbook <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-2.5">
              {activeDeck.slice(0, 3).map((card, idx) => {
                const borderColors = [
                  'border-amber-500',
                  'border-indigo-500',
                  'border-emerald-500',
                  'border-purple-500',
                ];
                const borderColor = borderColors[idx % borderColors.length];
                const cardIcon =
                  card.type === 'attack'
                    ? '⚔️'
                    : card.type === 'defense'
                    ? '🛡️'
                    : card.type === 'special'
                    ? '✨'
                    : '⚡';

                return (
                  <div
                    key={card.id}
                    className={`p-2.5 bg-slate-800/80 border-l-4 ${borderColor} rounded-xl flex items-center justify-between gap-2 shadow-sm`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{cardIcon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-100 leading-tight">{card.name}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{card.description}</p>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-mono font-bold shrink-0">
                      {card.cost} AP
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setInspectedPiece(activePiece);
                setShowRoster(true);
              }}
              className="mt-4 w-full py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl hover:bg-amber-400 transition-colors uppercase text-xs tracking-tight flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Armory & Decks</span>
            </button>
          </div>

          {/* Bento Card 4: Real-time Battle Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col shadow-xl min-h-[220px] max-h-[300px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" /> Battle Log
              </h3>
              <span className="text-[9px] font-mono text-slate-500">LIVE FEED</span>
            </div>

            <div
              ref={logContainerRef}
              className="flex-1 space-y-2.5 font-mono text-[11px] overflow-y-auto pr-1 text-slate-300 select-text scrollbar-thin scrollbar-thumb-slate-800"
            >
              {battleLogs.map((log) => {
                let colorClass = 'text-slate-300';
                if (log.type === 'move') colorClass = 'text-indigo-300';
                if (log.type === 'clash') colorClass = 'text-red-400 font-bold';
                if (log.type === 'victory') colorClass = 'text-emerald-400 font-bold';
                if (log.type === 'levelup') colorClass = 'text-amber-300 font-bold';
                if (log.type === 'check') colorClass = 'text-rose-400 font-bold animate-pulse';

                return (
                  <div key={log.id} className={`${colorClass} leading-snug border-b border-slate-800/40 pb-1`}>
                    {log.message}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Bento Bottom Quick Footer Actions */}
      <footer className="w-full max-w-7xl mx-auto mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setShowModeModal(true)}
          className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-slate-800/80 transition-all font-bold text-xs text-indigo-300 active:scale-95 shadow-sm"
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Select Mode & Players</span>
        </button>

        <button
          onClick={() => setShowTutorial(true)}
          className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-slate-800/80 transition-all font-bold text-xs text-slate-300 active:scale-95 shadow-sm"
        >
          <span>📋</span> Tactical Guide
        </button>

        <button
          onClick={() => setShowStats(true)}
          className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-slate-800/80 transition-all font-bold text-xs text-slate-300 active:scale-95 shadow-sm"
        >
          <span>⚙️</span> MMR & Leaderboards
        </button>

        <button
          onClick={handleNewMatch}
          className="bg-indigo-600 hover:bg-indigo-500 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-white font-black text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RESTART MATCH</span>
        </button>
      </footer>

      {/* Active Card Combat Duel Mini-Game Overlay */}
      {activeDuel && (
        <CombatDuel
          initialDuelState={activeDuel}
          difficulty={settings.difficulty}
          adaptiveRating={stats.adaptiveRating}
          gameMode={activePlayers.gameMode}
          player1Name={player1DisplayName}
          player2Name={player2DisplayName}
          onDuelFinish={handleDuelFinish}
        />
      )}

      {/* Game Mode & Player Profiles Selection Modal */}
      {showModeModal && (
        <ModeSelectionModal
          initialMode={activePlayers.gameMode}
          currentMode={activePlayers.gameMode}
          initialPlayer1Id={activePlayers.player1Id}
          currentP1Id={activePlayers.player1Id}
          initialPlayer2Id={activePlayers.player2Id}
          currentP2Id={activePlayers.player2Id}
          initialDifficulty={settings.difficulty}
          difficulty={settings.difficulty}
          profiles={profiles}
          onUpdateProfiles={(updated) => setProfiles(updated)}
          onConfirm={handleModeConfirmed}
          onStartGame={handleModeConfirmed}
          onClose={() => setShowModeModal(false)}
          isClosable={true}
        />
      )}

      {/* Tutorial Academy Modal */}
      {showTutorial && (
        <TutorialMode
          onClose={() => setShowTutorial(false)}
          onStartGame={() => {
            setShowTutorial(false);
            handleNewMatch();
          }}
        />
      )}

      {/* Army Roster & Spellbook Modal */}
      {showRoster && (
        <PieceRosterModal
          board={board}
          selectedPiece={inspectedPiece}
          onClose={() => {
            setShowRoster(false);
            setInspectedPiece(null);
          }}
        />
      )}

      {/* Player Stats & Difficulty Tuning Modal */}
      {showStats && (
        <StatsModal
          stats={stats}
          difficulty={settings.difficulty}
          onDifficultyChange={(newDiff) => {
            const updated = { ...settings, difficulty: newDiff };
            setSettings(updated);
            saveGameSettings(updated);
          }}
          onResetStats={() => {
            const resetStats: PlayerStats = {
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
            setStats(resetStats);
            savePlayerStats(resetStats);
          }}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Game Over Match Victory / Defeat Modal */}
      {matchWinner && (
        <GameOverModal
          winner={matchWinner}
          mvpPiece={getMatchMvp()}
          totalDuels={matchStats.totalDuels}
          duelsWon={matchStats.duelsWon}
          stats={stats}
          gameMode={activePlayers.gameMode}
          player1Profile={player1Profile}
          player2Profile={player2Profile}
          onRestart={handleNewMatch}
          onOpenRoster={() => setShowRoster(true)}
          onChangeMode={() => {
            setMatchWinner(null);
            setShowModeModal(true);
          }}
        />
      )}
    </div>
  );
}
