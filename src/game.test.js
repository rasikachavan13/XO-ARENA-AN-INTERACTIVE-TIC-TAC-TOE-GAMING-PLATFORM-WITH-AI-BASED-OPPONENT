import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseBotMove, getOutcome } from './game.js';

test('detects wins and full-board draws', () => {
  assert.deepEqual(getOutcome(['X', 'X', 'X', 'O', 'O', null, null, null, null]), {
    result: 'win',
    winner: 'X',
    line: [0, 1, 2],
  });
  assert.deepEqual(getOutcome(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']), {
    result: 'draw',
    winner: null,
    line: [],
  });
});

test('easy bot picks only an open square', () => {
  const board = ['X', null, 'O', 'O', 'X', null, null, 'X', 'O'];
  const move = chooseBotMove(board, 'O', 'easy');
  assert.ok([1, 5, 6].includes(move));
});

test('medium bot takes a win and blocks an immediate loss', () => {
  assert.equal(chooseBotMove(['O', 'O', null, 'X', null, null, null, 'X', null], 'O', 'medium'), 2);
  assert.equal(chooseBotMove(['X', 'X', null, 'O', null, null, null, null, null], 'O', 'medium'), 2);
});

test('hard bot takes a winning move instead of a slower line', () => {
  assert.equal(chooseBotMove(['X', 'X', null, 'O', 'O', null, null, null, null], 'X', 'hard'), 2);
});

test('hard bot never loses from the opening board against any legal response', () => {
  function explore(board, turn) {
    const outcome = getOutcome(board);
    if (outcome) return outcome.winner !== 'O';
    if (turn === 'X') {
      const move = chooseBotMove(board, 'X', 'hard');
      const next = [...board];
      next[move] = 'X';
      return explore(next, 'O');
    }
    return board.every((cell) => cell) || board.every((cell, index) => {
      if (cell) return true;
      const next = [...board];
      next[index] = 'O';
      return explore(next, 'X');
    });
  }

  assert.equal(explore(Array(9).fill(null), 'X'), true);
});
