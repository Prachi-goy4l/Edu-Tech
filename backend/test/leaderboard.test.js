const assert = require('node:assert/strict');
const test = require('node:test');
const { buildLeaderboard } = require('../src/services/leaderboard');

test('scores distinct accepted problems by difficulty and includes students with no solves', () => {
  const leaderboard = buildLeaderboard([
    { _id: 'student-a', name: 'Alex' },
    { _id: 'student-b', name: 'Blair' },
    { _id: 'student-c', name: 'Casey' },
  ], [
    { studentId: 'student-a', problemId: 'easy-1', difficulty: 'easy' },
    { studentId: 'student-a', problemId: 'easy-1', difficulty: 'easy' },
    { studentId: 'student-a', problemId: 'hard-1', difficulty: 'hard' },
    { studentId: 'student-b', problemId: 'medium-1', difficulty: 'medium' },
  ]);

  assert.deepEqual(leaderboard, [
    { rank: 1, name: 'Alex', points: 40, problemsSolved: 2 },
    { rank: 2, name: 'Blair', points: 20, problemsSolved: 1 },
    { rank: 3, name: 'Casey', points: 0, problemsSolved: 0 },
  ]);
});

test('uses solved count as a tie-breaker and shares rank for a complete tie', () => {
  const leaderboard = buildLeaderboard([
    { _id: 'student-a', name: 'Alex' },
    { _id: 'student-b', name: 'Blair' },
    { _id: 'student-c', name: 'Casey' },
  ], [
    { studentId: 'student-a', problemId: 'hard-1', difficulty: 'hard' },
    { studentId: 'student-b', problemId: 'medium-1', difficulty: 'medium' },
    { studentId: 'student-b', problemId: 'medium-2', difficulty: 'medium' },
    { studentId: 'student-c', problemId: 'medium-3', difficulty: 'medium' },
    { studentId: 'student-c', problemId: 'medium-4', difficulty: 'medium' },
  ]);

  assert.deepEqual(leaderboard, [
    { rank: 1, name: 'Blair', points: 40, problemsSolved: 2 },
    { rank: 1, name: 'Casey', points: 40, problemsSolved: 2 },
    { rank: 3, name: 'Alex', points: 30, problemsSolved: 1 },
  ]);
});
