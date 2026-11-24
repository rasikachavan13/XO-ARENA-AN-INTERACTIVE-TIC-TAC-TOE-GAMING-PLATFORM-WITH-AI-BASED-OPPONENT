export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function getOutcome(board) {
  for (const line of WIN_LINES) {
    const [first, second, third] = line;
    if (board[first] && board[first] === board[second] && board[first] === board[third]) {
      return { result: 'win', winner: board[first], line };
    }
  }
  return board.every(Boolean) ? { result: 'draw', winner: null, line: [] } : null;
}

function findImmediateMove(board, mark) {
  for (let index = 0; index < board.length; index += 1) {
    if (!board[index]) {
      const nextBoard = [...board];
      nextBoard[index] = mark;
      if (getOutcome(nextBoard)?.winner === mark) return index;
    }
  }
  return null;
}

function minimax(board, currentMark, botMark, depth) {
  const outcome = getOutcome(board);
  if (outcome) {
    if (outcome.result === 'draw') return 0;
    return outcome.winner === botMark ? 10 - depth : depth - 10;
  }

  const available = board.map((cell, index) => (cell ? null : index)).filter((index) => index !== null);
  const maximizing = currentMark === botMark;
  let bestScore = maximizing ? -Infinity : Infinity;
  for (const index of available) {
    board[index] = currentMark;
    const score = minimax(board, currentMark === 'X' ? 'O' : 'X', botMark, depth + 1);
    board[index] = null;
    bestScore = maximizing ? Math.max(bestScore, score) : Math.min(bestScore, score);
  }
  return bestScore;
}

export function chooseBotMove(board, botMark, difficulty) {
  const available = board.map((cell, index) => (cell ? null : index)).filter((index) => index !== null);
  if (!available.length) return null;

  if (difficulty === 'easy') {
    return available[Math.floor(Math.random() * available.length)];
  }

  const winningMove = findImmediateMove(board, botMark);
  if (winningMove !== null) return winningMove;
  const blockingMove = findImmediateMove(board, botMark === 'X' ? 'O' : 'X');
  if (blockingMove !== null) return blockingMove;

  if (difficulty === 'medium') {
    if (!board[4]) return 4;
    const corners = [0, 2, 6, 8].filter((index) => !board[index]);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return available[Math.floor(Math.random() * available.length)];
  }

  let bestScore = -Infinity;
  let bestMove = available[0];
  for (const index of available) {
    const nextBoard = [...board];
    nextBoard[index] = botMark;
    const score = minimax(nextBoard, botMark === 'X' ? 'O' : 'X', botMark, 1);
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }
  return bestMove;
}
