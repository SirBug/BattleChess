import { DifficultyMode, Position, ChessPiece } from '../types';
import { Board, getAllLegalMoves, cloneBoard, isKingInCheck } from './chessEngine';

const PIECE_VALUES: Record<string, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 950,
  king: 20000,
};

// Piece-Square Positional Tables (Standard simplified)
const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

function evaluateBoard(board: Board): number {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let val = PIECE_VALUES[piece.type] || 0;
      // Level bonus
      val += (piece.level - 1) * 30 + piece.victories * 10;

      // Position bonus
      let posBonus = 0;
      if (piece.type === 'pawn') {
        posBonus = piece.color === 'black' ? PAWN_TABLE[r][c] : PAWN_TABLE[7 - r][c];
      } else if (piece.type === 'knight') {
        posBonus = piece.color === 'black' ? KNIGHT_TABLE[r][c] : KNIGHT_TABLE[7 - r][c];
      }

      const totalVal = val + posBonus;
      if (piece.color === 'black') {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  // King in check penalty/bonus
  if (isKingInCheck(board, 'white')) score += 50;
  if (isKingInCheck(board, 'black')) score -= 50;

  return score;
}

export function getBestAIMove(
  board: Board,
  difficulty: DifficultyMode,
  adaptiveRating: number = 1000,
): { from: Position; to: Position } | null {
  const legalMoves = getAllLegalMoves(board, 'black');
  if (legalMoves.length === 0) return null;

  // Determine effective difficulty
  let effectiveDifficulty = difficulty;
  if (difficulty === 'adaptive') {
    if (adaptiveRating < 1050) effectiveDifficulty = 'easy';
    else if (adaptiveRating < 1300) effectiveDifficulty = 'medium';
    else effectiveDifficulty = 'hard';
  }

  // Easy / Novice AI (introduces human-like variance and beginner-friendly mistakes)
  if (effectiveDifficulty === 'easy') {
    // 40% chance of making a random legal move, or prioritize obvious captures with slight randomness
    if (Math.random() < 0.35) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    // Find moves that capture or develop
    const scoredMoves = legalMoves.map((m) => {
      const targetPiece = board[m.to.row][m.to.col];
      const sourcePiece = board[m.from.row][m.from.col];
      let moveScore = 0;
      if (targetPiece) {
        moveScore = (PIECE_VALUES[targetPiece.type] || 0) * 1.5 - (PIECE_VALUES[sourcePiece?.type || 'pawn'] || 0) * 0.2;
      }
      // Slight noise
      moveScore += (Math.random() - 0.5) * 80;
      return { move: m, score: moveScore };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move;
  }

  // Medium / Adept AI (1-2 ply search)
  if (effectiveDifficulty === 'medium') {
    let bestScore = -Infinity;
    let bestMove = legalMoves[0];

    for (const m of legalMoves) {
      const tempBoard = cloneBoard(board);
      tempBoard[m.to.row][m.to.col] = tempBoard[m.from.row][m.from.col];
      tempBoard[m.from.row][m.from.col] = null;

      let score = evaluateBoard(tempBoard);
      // Small jitter for unpredictability
      score += (Math.random() - 0.5) * 20;

      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }
    return bestMove;
  }

  // Hard / Master AI (Minimax with depth 2-3)
  let bestScore = -Infinity;
  let bestMove = legalMoves[0];

  for (const m of legalMoves) {
    const tempBoard = cloneBoard(board);
    tempBoard[m.to.row][m.to.col] = tempBoard[m.from.row][m.from.col];
    tempBoard[m.from.row][m.from.col] = null;

    const score = minimax(tempBoard, 2, -Infinity, Infinity, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  return bestMove;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
): number {
  if (depth === 0) {
    return evaluateBoard(board);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    const moves = getAllLegalMoves(board, 'black');
    if (moves.length === 0) return isKingInCheck(board, 'black') ? -10000 : 0;

    for (const m of moves) {
      const nextBoard = cloneBoard(board);
      nextBoard[m.to.row][m.to.col] = nextBoard[m.from.row][m.from.col];
      nextBoard[m.from.row][m.from.col] = null;

      const ev = minimax(nextBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    const moves = getAllLegalMoves(board, 'white');
    if (moves.length === 0) return isKingInCheck(board, 'white') ? 10000 : 0;

    for (const m of moves) {
      const nextBoard = cloneBoard(board);
      nextBoard[m.to.row][m.to.col] = nextBoard[m.from.row][m.from.col];
      nextBoard[m.from.row][m.from.col] = null;

      const ev = minimax(nextBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
