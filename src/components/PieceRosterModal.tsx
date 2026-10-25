import React, { useState } from 'react';
import { ChessPiece, PieceColor } from '../types';
import { Board } from '../utils/chessEngine';
import { PieceArt } from './PieceArt';
import { PIECE_BASE_STATS, createInitialPieceDeck, LEVEL_THRESHOLDS } from '../utils/cardData';
import {
  X,
  Shield,
  Zap,
  Heart,
  Swords,
  Sparkles,
  Award,
  Crown,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface PieceRosterModalProps {
  board: Board;
  selectedPiece?: ChessPiece | null;
  onClose: () => void;
}

export const PieceRosterModal: React.FC<PieceRosterModalProps> = ({
  board,
  selectedPiece: initialSelected,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<PieceColor>('white');
  const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(
    initialSelected || null
  );

  // Extract pieces from board
  const allWhitePieces: ChessPiece[] = [];
  const allBlackPieces: ChessPiece[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        if (p.color === 'white') allWhitePieces.push(p);
        else allBlackPieces.push(p);
      }
    }
  }

  // Sort by rank priority (King, Queen, Rook, Bishop, Knight, Pawn)
  const rankOrder: Record<string, number> = {
    king: 6,
    queen: 5,
    rook: 4,
    bishop: 3,
    knight: 2,
    pawn: 1,
  };

  allWhitePieces.sort((a, b) => (rankOrder[b.type] || 0) - (rankOrder[a.type] || 0) || b.level - a.level);
  allBlackPieces.sort((a, b) => (rankOrder[b.type] || 0) - (rankOrder[a.type] || 0) || b.level - a.level);

  const currentPieces = activeTab === 'white' ? allWhitePieces : allBlackPieces;
  const activePiece = selectedPiece || currentPieces[0] || null;

  const pieceDeck = activePiece ? createInitialPieceDeck(activePiece) : [];
  const pieceInfo = activePiece ? PIECE_BASE_STATS[activePiece.type] : null;

  const currentXp = activePiece ? activePiece.xp : 0;
  const nextXp = activePiece ? (LEVEL_THRESHOLDS[activePiece.level] || 999) : 100;
  const xpPct = Math.min(100, Math.max(0, (currentXp / nextXp) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto select-none">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-slate-100 max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black text-slate-100">
              Army Roster & Tactical Spellbook
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Faction Tab Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab('white');
              setSelectedPiece(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'white'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Radiant White Army ({allWhitePieces.length} Active)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('black');
              setSelectedPiece(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'black'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Dread Black Army ({allBlackPieces.length} Active)</span>
          </button>
        </div>

        {/* Content Layout: Left Piece List + Right Card Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto pr-1">
          {/* Piece Grid */}
          <div className="md:col-span-1 flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Character to Inspect
            </span>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              {currentPieces.map((p) => {
                const isSelected = activePiece?.id === p.id;
                const info = PIECE_BASE_STATS[p.type];

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPiece(p)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-slate-100 shadow-md ring-1 ring-amber-400'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <PieceArt type={p.type} color={p.color} level={p.level} size="sm" />
                      <div>
                        <div className="text-xs font-bold capitalize flex items-center gap-1.5">
                          <span>{p.type}</span>
                          <span className="text-[10px] px-1 bg-slate-800 border border-slate-700 rounded text-amber-300">
                            ★{p.level}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">{p.victories} Duel Wins</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Piece Detailed Cards & Stats */}
          {activePiece && pieceInfo && (
            <div className="md:col-span-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
              {/* Piece Profile Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 border border-amber-400/40 rounded-2xl">
                    <PieceArt type={activePiece.type} color={activePiece.color} level={activePiece.level} size="lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-100">{pieceInfo.title}</h3>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold">
                        Level {activePiece.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{pieceInfo.description}</p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <div className="text-xs text-slate-400">Victories</div>
                  <div className="text-lg font-black text-amber-400">{activePiece.victories} Wins</div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Award className="w-3.5 h-3.5" /> Combat XP Progression
                  </span>
                  <span>
                    {activePiece.xp} / {nextXp} XP (Level {activePiece.level}/5)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  {activePiece.level < 5
                    ? `Need ${nextXp - activePiece.xp} more XP to reach Level ${activePiece.level + 1} (+Max HP & ability boost)`
                    : '⭐ Maximum Veteran Rank Achieved!'}
                </div>
              </div>

              {/* Deck of Tactical Cards */}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>COMBAT DECK & ABILITIES ({pieceDeck.length} Cards)</span>
                  <span className="text-amber-400 text-[11px]">Drawn during battle duels</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pieceDeck.map((card) => (
                    <div
                      key={card.id}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 ${
                        card.isSignature
                          ? 'bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-400/80 shadow-md'
                          : card.type === 'attack'
                          ? 'bg-slate-900/90 border-red-500/30'
                          : card.type === 'defense'
                          ? 'bg-slate-900/90 border-blue-500/30'
                          : 'bg-slate-900/90 border-purple-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-slate-100 flex items-center gap-1">
                          {card.isSignature && <Sparkles className="w-3 h-3 text-amber-400" />}
                          {card.name}
                        </span>
                        <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded text-[10px]">
                          {card.cost} AP
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">{card.description}</p>
                      <div className="flex gap-2 text-[10px] font-bold">
                        {card.damage && <span className="text-red-400">⚔️ {card.damage} DMG</span>}
                        {card.block && <span className="text-blue-400">🛡️ {card.block} BLK</span>}
                        {card.heal && <span className="text-emerald-400">💚 +{card.heal} HP</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
