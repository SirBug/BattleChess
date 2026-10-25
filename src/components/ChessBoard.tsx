import React from 'react';
import { ChessPiece, GameMode, PieceColor, Position } from '../types';
import { Board, findKing, isKingInCheck } from '../utils/chessEngine';
import { PieceArt } from './PieceArt';
import { PIECE_BASE_STATS } from '../utils/cardData';
import { Shield, Sparkles, Swords, Users, User, Bot } from 'lucide-react';

interface ChessBoardProps {
  board: Board;
  selectedPos: Position | null;
  legalMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  turn: PieceColor;
  isAIThinking: boolean;
  gameMode?: GameMode;
  player1Name?: string;
  player2Name?: string;
  onSquareClick: (row: number, col: number) => void;
  onPieceInspect?: (piece: ChessPiece) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedPos,
  legalMoves = [],
  lastMove,
  turn,
  isAIThinking,
  gameMode = 'pvai',
  player1Name = 'Radiant White',
  player2Name = 'Dread Black',
  onSquareClick,
  onPieceInspect,
}) => {
  const isPvP = gameMode === 'pvp';
  const isWhiteTurn = turn === 'white';
  const canInteract = isPvP ? true : (isWhiteTurn && !isAIThinking);

  const whiteInCheck = isKingInCheck(board, 'white');
  const blackInCheck = isKingInCheck(board, 'black');
  const whiteKingPos = findKing(board, 'white');
  const blackKingPos = findKing(board, 'black');

  const isLegalDestination = (r: number, c: number) => {
    return (legalMoves || []).some((m) => m && m.row === r && m.col === c);
  };

  const isLastMoveSquare = (r: number, c: number) => {
    if (!lastMove) return false;
    return (
      (lastMove.from.row === r && lastMove.from.col === c) ||
      (lastMove.to.row === r && lastMove.to.col === c)
    );
  };

  const isSelectedSquare = (r: number, c: number) => {
    return selectedPos?.row === r && selectedPos?.col === c;
  };

  const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-lg">
      {/* Turn & Status Header Banner */}
      <div className="w-full flex items-center justify-between mb-3 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm text-sm">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-3.5 h-3.5 rounded-full ring-2 transition-all ${
              isWhiteTurn
                ? 'bg-amber-400 ring-amber-400/30 shadow-[0_0_12px_#f59e0b]'
                : 'bg-indigo-500 ring-indigo-500/30 shadow-[0_0_12px_#6366f1]'
            }`}
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
              {isPvP ? (
                <>
                  <Users className="w-3.5 h-3.5 text-indigo-400 inline" />
                  <span>{isWhiteTurn ? `${player1Name} (White)` : `${player2Name} (Black)`}</span>
                </>
              ) : isWhiteTurn ? (
                <>
                  <User className="w-3.5 h-3.5 text-amber-400 inline" />
                  <span>{player1Name} (White)</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-red-400 inline" />
                  <span>{player2Name} (AI Turn)</span>
                </>
              )}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {isWhiteTurn ? 'White Moves' : 'Black Moves'}
            </span>
          </div>
        </div>

        {isAIThinking ? (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold animate-pulse">
            <Swords className="w-3.5 h-3.5" />
            <span>AI THINKING...</span>
          </div>
        ) : whiteInCheck ? (
          <span className="text-xs px-2.5 py-1 bg-red-950 text-red-300 border border-red-700 rounded-lg font-black animate-bounce shadow-md">
            WHITE IN CHECK!
          </span>
        ) : blackInCheck ? (
          <span className="text-xs px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-600 rounded-lg font-black shadow-md">
            BLACK IN CHECK!
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            {isPvP ? 'SELECT PIECE TO MOVE' : (isWhiteTurn ? 'YOUR COMMAND' : 'WAITING FOR AI')}
          </span>
        )}
      </div>

      {/* Main Chess Board Frame */}
      <div className="relative p-2 sm:p-4 bg-slate-950/80 rounded-3xl border border-slate-800 shadow-2xl">
        {/* Top File Notation */}
        <div className="grid grid-cols-8 text-center text-[10px] sm:text-xs font-mono font-bold text-slate-500 mb-1.5">
          {files.map((f) => (
            <span key={`top-${f}`}>{f}</span>
          ))}
        </div>

        <div className="flex">
          {/* Left Rank Notation */}
          <div className="flex flex-col justify-around text-center text-[10px] sm:text-xs font-mono font-bold text-slate-500 mr-2 w-3">
            {[8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
              <span key={`left-${r}`}>{r}</span>
            ))}
          </div>

          {/* 8x8 Grid */}
          <div
            id="chessboard-grid"
            className="grid grid-cols-8 grid-rows-8 w-[290px] h-[290px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px] lg:w-[460px] lg:h-[460px] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950"
          >
            {board.map((row, rIdx) =>
              row.map((piece, cIdx) => {
                const isLight = (rIdx + cIdx) % 2 === 0;
                const isSelected = isSelectedSquare(rIdx, cIdx);
                const isLegal = isLegalDestination(rIdx, cIdx);
                const isLast = isLastMoveSquare(rIdx, cIdx);
                const isEnemyOccupied = piece && piece.color !== turn;
                const isCombatSquare = isLegal && isEnemyOccupied;

                const isKingCheckTarget =
                  (whiteInCheck && whiteKingPos?.row === rIdx && whiteKingPos?.col === cIdx) ||
                  (blackInCheck && blackKingPos?.row === rIdx && blackKingPos?.col === cIdx);

                return (
                  <button
                    key={`sq-${rIdx}-${cIdx}`}
                    id={`square-${rIdx}-${cIdx}`}
                    type="button"
                    disabled={!canInteract}
                    onClick={() => onSquareClick(rIdx, cIdx)}
                    className={`relative flex items-center justify-center transition-all duration-150 active:scale-95 touch-manipulation focus:outline-none ${
                      !canInteract ? 'cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      isLight
                        ? 'bg-slate-800/40 hover:bg-slate-700/60'
                        : 'bg-slate-900/80 hover:bg-slate-800/80'
                    } ${
                      isSelected
                        ? '!bg-amber-500/25 ring-2 ring-inset ring-amber-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.25)]'
                        : isLast
                        ? '!bg-indigo-950/60 ring-1 ring-inset ring-indigo-500/40'
                        : ''
                    } ${isKingCheckTarget ? '!bg-red-950/80 ring-2 ring-red-500 animate-pulse' : ''}`}
                    title={
                      piece
                        ? `${piece.color} ${piece.type} (Lv ${piece.level})`
                        : `${files[cIdx]}${8 - rIdx}`
                    }
                  >
                    {/* Legal Destination Highlight */}
                    {isLegal && !isCombatSquare && (
                      <div className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] pointer-events-none animate-pulse" />
                    )}

                    {/* Combat Clash Trigger Reticle */}
                    {isCombatSquare && (
                      <div className="absolute inset-1 rounded-xl border-2 border-red-500/90 bg-red-600/30 flex items-center justify-center pointer-events-none animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                        <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-red-200 drop-shadow" />
                      </div>
                    )}

                    {/* Piece Display */}
                    {piece && (
                      <div className="relative z-10 transition-transform duration-150 hover:scale-110">
                        <PieceArt
                          type={piece.type}
                          color={piece.color}
                          level={piece.level}
                          size="md"
                          showLevelBadge={true}
                          className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11"
                        />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Selected Piece Card / Quick Inspector Footer */}
      {selectedPos && board[selectedPos.row][selectedPos.col] && (
        <div className="w-full max-w-md mt-3 p-3 bg-slate-900/90 border border-amber-500/30 rounded-xl shadow-lg flex items-center justify-between text-xs sm:text-sm">
          {(() => {
            const piece = board[selectedPos.row][selectedPos.col]!;
            const info = PIECE_BASE_STATS[piece.type];
            return (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700">
                    <PieceArt type={piece.type} color={piece.color} level={piece.level} size="sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{info.title}</span>
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-semibold">
                        Lv.{piece.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {info.signatureName} • {piece.victories} Duel Wins
                    </p>
                  </div>
                </div>

                {onPieceInspect && (
                  <button
                    onClick={() => onPieceInspect(piece)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 font-medium text-xs flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
