import { ChessPiece, PieceColor, PieceType, Position } from '../types';

export type Board = (ChessPiece | null)[][];

export function createInitialBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const createPiece = (type: PieceType, color: PieceColor, col: number, row: number): ChessPiece => ({
    id: `${color}_${type}_${col}_${row}`,
    type,
    color,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    victories: 0,
    hasMoved: false,
    maxHpBonus: 0,
    attackBonus: 0,
    shieldBonus: 0,
  });

  // Black major pieces (Row 0)
  board[0][0] = createPiece('rook', 'black', 0, 0);
  board[0][1] = createPiece('knight', 'black', 1, 0);
  board[0][2] = createPiece('bishop', 'black', 2, 0);
  board[0][3] = createPiece('queen', 'black', 3, 0);
  board[0][4] = createPiece('king', 'black', 4, 0);
  board[0][5] = createPiece('bishop', 'black', 5, 0);
  board[0][6] = createPiece('knight', 'black', 6, 0);
  board[0][7] = createPiece('rook', 'black', 7, 0);

  // Black Pawns (Row 1)
  for (let c = 0; c < 8; c++) {
    board[1][c] = createPiece('pawn', 'black', c, 1);
  }

  // White Pawns (Row 6)
  for (let c = 0; c < 8; c++) {
    board[6][c] = createPiece('pawn', 'white', c, 6);
  }

  // White major pieces (Row 7)
  board[7][0] = createPiece('rook', 'white', 0, 7);
  board[7][1] = createPiece('knight', 'white', 1, 7);
  board[7][2] = createPiece('bishop', 'white', 2, 7);
  board[7][3] = createPiece('queen', 'white', 3, 7);
  board[7][4] = createPiece('king', 'white', 4, 7);
  board[7][5] = createPiece('bishop', 'white', 5, 7);
  board[7][6] = createPiece('knight', 'white', 6, 7);
  board[7][7] = createPiece('rook', 'white', 7, 7);

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function isWithinBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function getRawMoves(board: Board, from: Position): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const moves: Position[] = [];
  const { type, color } = piece;
  const isWhite = color === 'white';
  const forward = isWhite ? -1 : 1;

  if (type === 'pawn') {
    // Forward 1
    const nextR = from.row + forward;
    if (isWithinBounds(nextR, from.col) && !board[nextR][from.col]) {
      moves.push({ row: nextR, col: from.col });
      // Forward 2 from start
      const startRow = isWhite ? 6 : 1;
      const doubleR = from.row + 2 * forward;
      if (from.row === startRow && isWithinBounds(doubleR, from.col) && !board[doubleR][from.col]) {
        moves.push({ row: doubleR, col: from.col });
      }
    }
    // Diagonal captures
    [-1, 1].forEach((dc) => {
      const targetC = from.col + dc;
      if (isWithinBounds(nextR, targetC)) {
        const targetPiece = board[nextR][targetC];
        if (targetPiece && targetPiece.color !== color) {
          moves.push({ row: nextR, col: targetC });
        }
      }
    });
  } else if (type === 'knight') {
    const deltas = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    deltas.forEach(([dr, dc]) => {
      const nr = from.row + dr;
      const nc = from.col + dc;
      if (isWithinBounds(nr, nc)) {
        const targetPiece = board[nr][nc];
        if (!targetPiece || targetPiece.color !== color) {
          moves.push({ row: nr, col: nc });
        }
      }
    });
  } else if (type === 'bishop' || type === 'rook' || type === 'queen') {
    const directions: [number, number][] = [];
    if (type === 'bishop' || type === 'queen') {
      directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }
    if (type === 'rook' || type === 'queen') {
      directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }

    directions.forEach(([dr, dc]) => {
      let step = 1;
      while (true) {
        const nr = from.row + dr * step;
        const nc = from.col + dc * step;
        if (!isWithinBounds(nr, nc)) break;

        const targetPiece = board[nr][nc];
        if (!targetPiece) {
          moves.push({ row: nr, col: nc });
        } else {
          if (targetPiece.color !== color) {
            moves.push({ row: nr, col: nc });
          }
          break; // Ray blocked
        }
        step++;
      }
    });
  } else if (type === 'king') {
    const deltas = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];
    deltas.forEach(([dr, dc]) => {
      const nr = from.row + dr;
      const nc = from.col + dc;
      if (isWithinBounds(nr, nc)) {
        const targetPiece = board[nr][nc];
        if (!targetPiece || targetPiece.color !== color) {
          moves.push({ row: nr, col: nc });
        }
      }
    });

    // Castling
    if (!piece.hasMoved) {
      const row = from.row;
      // Kingside
      const kRook = board[row][7];
      if (kRook && kRook.type === 'rook' && !kRook.hasMoved && !board[row][5] && !board[row][6]) {
        moves.push({ row, col: 6 });
      }
      // Queenside
      const qRook = board[row][0];
      if (qRook && qRook.type === 'rook' && !qRook.hasMoved && !board[row][1] && !board[row][2] && !board[row][3]) {
        moves.push({ row, col: 2 });
      }
    }
  }

  return moves;
}

export function findKing(board: Board, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'king' && p.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

export function isKingInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const enemyColor: PieceColor = color === 'white' ? 'black' : 'white';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === enemyColor) {
        const rawMoves = getRawMoves(board, { row: r, col: c });
        if (rawMoves.some((m) => m.row === kingPos.row && m.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function getLegalMoves(board: Board, from: Position): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const rawMoves = getRawMoves(board, from);
  const legalMoves: Position[] = [];

  for (const move of rawMoves) {
    const tempBoard = cloneBoard(board);
    // Simulating non-combat movement
    tempBoard[move.row][move.col] = tempBoard[from.row][from.col];
    tempBoard[from.row][from.col] = null;

    // In chess with combat duels, moves that don't leave your king in check are legal
    if (!isKingInCheck(tempBoard, piece.color)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

export function getAllLegalMoves(board: Board, color: PieceColor): { from: Position; to: Position }[] {
  const allMoves: { from: Position; to: Position }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        const moves = getLegalMoves(board, { row: r, col: c });
        moves.forEach((to) => allMoves.push({ from: { row: r, col: c }, to }));
      }
    }
  }
  return allMoves;
}

export function getAlgebraicNotation(from: Position, to: Position, piece: ChessPiece, isCapture: boolean): string {
  const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const pChar = piece.type === 'pawn' ? '' : piece.type === 'knight' ? 'N' : piece.type[0].toUpperCase();
  const capChar = isCapture ? (piece.type === 'pawn' ? `${cols[from.col]}x` : 'x') : '';
  const toSquare = `${cols[to.col]}${8 - to.row}`;
  return `${pChar}${capChar}${toSquare}`;
}
