import React from 'react';
import { ChessPiece, GameMode, PlayerProfile, PlayerStats } from '../types';
import { PieceArt } from './PieceArt';
import { PIECE_BASE_STATS } from '../utils/cardData';
import { getRankInfo } from '../utils/storage';
import {
  Trophy,
  Crown,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Users,
} from 'lucide-react';

interface GameOverModalProps {
  winner: 'white' | 'black';
  mvpPiece: ChessPiece | null;
  totalDuels: number;
  duelsWon: number;
  stats: PlayerStats;
  gameMode?: GameMode;
  player1Profile?: PlayerProfile;
  player2Profile?: PlayerProfile | null;
  onRestart: () => void;
  onOpenRoster: () => void;
  onChangeMode?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  mvpPiece,
  totalDuels,
  duelsWon,
  stats,
  gameMode = 'pvai',
  player1Profile,
  player2Profile,
  onRestart,
  onOpenRoster,
  onChangeMode,
}) => {
  const isPvP = gameMode === 'pvp';
  const isWhiteWinner = winner === 'white';

  const p1Rank = player1Profile ? getRankInfo(player1Profile.rating) : null;
  const p2Rank = player2Profile ? getRankInfo(player2Profile.rating) : null;

  const winnerName = isPvP
    ? isWhiteWinner
      ? `${p1Rank?.title} ${player1Profile?.name}`
      : `${p2Rank?.title} ${player2Profile?.name}`
    : isWhiteWinner
    ? `${p1Rank?.title || 'Commander'} ${player1Profile?.name || 'Radiant'}`
    : 'Dread AI Sovereign';

  const mvpInfo = mvpPiece ? PIECE_BASE_STATS[mvpPiece.type] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto select-none animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 text-slate-100">
        {/* Header Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center border-2 shadow-2xl ${
            isWhiteWinner
              ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-amber-500/30'
              : 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-indigo-500/30'
          }`}
        >
          {isPvP ? <Trophy className="w-12 h-12" /> : (isWhiteWinner ? <Trophy className="w-12 h-12" /> : <Crown className="w-12 h-12" />)}
        </div>

        {/* Title */}
        <div>
          <h2
            className={`text-2xl sm:text-3xl font-black ${
              isWhiteWinner ? 'text-amber-300' : isPvP ? 'text-indigo-300' : 'text-red-400'
            }`}
          >
            {isPvP ? `${winnerName} VICTORIOUS!` : (isWhiteWinner ? 'VICTORY ROYALE!' : 'DEFEAT')}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {isPvP
              ? `Checkmate achieved! ${winnerName} claimed supremacy in tactical chess & card duels.`
              : isWhiteWinner
              ? 'You triumphed over the Dread Black Legion in chess tactics and combat!'
              : 'The Dread Black army overcame your royal forces.'}
          </p>
        </div>

        {/* Player Ratings / Difficulty Ranks in 2-Player */}
        {isPvP && player1Profile && player2Profile && (
          <div className="w-full grid grid-cols-2 gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-left">
            <div className={`p-2.5 rounded-xl border ${isWhiteWinner ? 'bg-amber-500/10 border-amber-400/50' : 'bg-slate-900 border-slate-800'}`}>
              <div className="text-[10px] text-slate-400 font-bold uppercase">White (P1)</div>
              <div className="font-black text-xs text-amber-300 truncate">{p1Rank?.title} {player1Profile.name}</div>
              <div className="text-[10px] font-mono text-slate-300 flex items-center justify-between mt-1">
                <span>Rating:</span>
                <span className="font-bold text-amber-400">{player1Profile.rating}</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border ${!isWhiteWinner ? 'bg-indigo-500/10 border-indigo-400/50' : 'bg-slate-900 border-slate-800'}`}>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Black (P2)</div>
              <div className="font-black text-xs text-indigo-300 truncate">{p2Rank?.title} {player2Profile.name}</div>
              <div className="text-[10px] font-mono text-slate-300 flex items-center justify-between mt-1">
                <span>Rating:</span>
                <span className="font-bold text-indigo-400">{player2Profile.rating}</span>
              </div>
            </div>
          </div>
        )}

        {/* Match Statistics Summary */}
        <div className="w-full grid grid-cols-3 gap-2 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400">Duels Fought</span>
            <span className="text-base font-black text-slate-200">{totalDuels}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400">White Duels Won</span>
            <span className="text-base font-black text-amber-400">{duelsWon}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400">{isPvP ? 'Black Duels Won' : 'Adaptive MMR'}</span>
            <span className="text-base font-black text-emerald-400 flex items-center justify-center gap-0.5">
              {isPvP ? (totalDuels - duelsWon) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {stats.adaptiveRating}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Match MVP Hero Award */}
        {mvpPiece && mvpInfo && (
          <div className="w-full p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl border border-amber-400/40">
                <PieceArt type={mvpPiece.type} color={mvpPiece.color} level={mvpPiece.level} size="md" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Award className="w-3 h-3" /> MATCH MVP
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-100">{mvpInfo.title}</div>
                <div className="text-[11px] text-slate-400">
                  Level {mvpPiece.level} • {mvpPiece.victories} Battle Victories
                </div>
              </div>
            </div>

            <button
              onClick={onOpenRoster}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-amber-300"
              title="Inspect Piece Details"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 pt-2">
          <button
            id="play-again-button"
            onClick={onRestart}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Next Match</span>
          </button>

          {onChangeMode && (
            <button
              onClick={onChangeMode}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors text-xs flex items-center justify-center gap-1.5"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Change Mode / Players</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
