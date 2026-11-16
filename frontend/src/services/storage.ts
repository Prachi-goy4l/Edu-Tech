import { Problem, SubmissionRecord, LeaderboardEntry, User } from '../types';
import { PROBLEMS } from '../data/problems';

const SUBMISSIONS_KEY = 'edu-tech-submissions-v1';
const CUSTOM_PROBLEMS_KEY = 'edu-tech-custom-problems-v1';

const INITIAL_SUBMISSIONS: SubmissionRecord[] = [
  {
    id: 'sub-1',
    problemId: 'two-sum',
    problemTitle: '1. Two Sum',
    language: 'python',
    status: 'Accepted',
    runtimeMs: 42,
    testCasesPassed: 3,
    totalTestCases: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    code: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
  },
  {
    id: 'sub-2',
    problemId: 'valid-palindrome',
    problemTitle: '125. Valid Palindrome',
    language: 'cpp',
    status: 'Accepted',
    runtimeMs: 28,
    testCasesPassed: 3,
    totalTestCases: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    code: `#include <iostream>\n// Palindrome solved with two pointers`,
  },
  {
    id: 'sub-3',
    problemId: 'fizz-buzz',
    problemTitle: '412. Fizz Buzz',
    language: 'javascript',
    status: 'Wrong Answer',
    runtimeMs: 35,
    testCasesPassed: 2,
    totalTestCases: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    code: `function fizzBuzz(n) {\n    return [];\n}`,
  },
];

export function getStoredSubmissions(): SubmissionRecord[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBMISSIONS;
  }
}

export function saveSubmission(submission: Omit<SubmissionRecord, 'id' | 'timestamp'>): SubmissionRecord {
  const all = getStoredSubmissions();
  const newRecord: SubmissionRecord = {
    ...submission,
    id: `sub-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newRecord, ...all];
  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save submission to localStorage', err);
  }
  return newRecord;
}

// ----------------- Dynamic Problem Management -----------------

export function getCustomProblems(): Problem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROBLEMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getStoredProblems(): Problem[] {
  const custom = getCustomProblems();
  // Filter out any default problems overridden by custom ones
  const customIds = new Set(custom.map((p) => p.id));
  const base = PROBLEMS.filter((p) => !customIds.has(p.id));
  return [...base, ...custom];
}

export function saveNewProblem(problem: Problem): Problem {
  const custom = getCustomProblems();
  // If problem already exists in custom, update it; else prepend
  const existsIndex = custom.findIndex((p) => p.id === problem.id);
  let updated: Problem[];
  if (existsIndex >= 0) {
    updated = [...custom];
    updated[existsIndex] = problem;
  } else {
    updated = [problem, ...custom];
  }

  try {
    localStorage.setItem(CUSTOM_PROBLEMS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom problem to localStorage', err);
  }
  return problem;
}

export function deleteProblem(id: string): boolean {
  const custom = getCustomProblems();
  const filtered = custom.filter((p) => p.id !== id);
  if (filtered.length !== custom.length) {
    try {
      localStorage.setItem(CUSTOM_PROBLEMS_KEY, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error('Failed to delete problem from localStorage', err);
    }
  }
  return false;
}

// ----------------- Platform Stats -----------------

export function getStats() {
  const submissions = getStoredSubmissions();
  const accepted = submissions.filter((s) => s.status === 'Accepted');
  const uniqueSolved = new Set(accepted.map((s) => s.problemId)).size;
  const accuracy = submissions.length ? Math.round((accepted.length / submissions.length) * 100) : 100;
  const totalProblems = getStoredProblems().length;

  return {
    totalSubmissions: submissions.length,
    acceptedSubmissions: accepted.length,
    problemsSolved: uniqueSolved,
    totalProblems,
    accuracy,
    currentStreak: 4,
  };
}

// ----------------- Competitive Leaderboard Engine -----------------

const SEED_LEADERBOARD_CANDIDATES: Omit<LeaderboardEntry, 'rank'>[] = [
  {
    userId: 'cand-1',
    name: 'Aarav Sharma',
    avatar: 'A',
    role: 'student',
    points: 380,
    problemsSolved: 8,
    accuracy: 96,
    streak: 14,
  },
  {
    userId: 'cand-2',
    name: 'Priya Patel',
    avatar: 'P',
    role: 'student',
    points: 310,
    problemsSolved: 6,
    accuracy: 92,
    streak: 9,
  },
  {
    userId: 'cand-3',
    name: 'Rohan Iyer',
    avatar: 'R',
    role: 'student',
    points: 250,
    problemsSolved: 5,
    accuracy: 89,
    streak: 7,
  },
  {
    userId: 'cand-4',
    name: 'Ananya Verma',
    avatar: 'V',
    role: 'student',
    points: 190,
    problemsSolved: 4,
    accuracy: 86,
    streak: 5,
  },
  {
    userId: 'cand-5',
    name: 'Vikram Malhotra',
    avatar: 'M',
    role: 'student',
    points: 140,
    problemsSolved: 3,
    accuracy: 83,
    streak: 4,
  },
  {
    userId: 'cand-6',
    name: 'Neha Gupta',
    avatar: 'N',
    role: 'student',
    points: 90,
    problemsSolved: 2,
    accuracy: 79,
    streak: 2,
  },
  {
    userId: 'cand-7',
    name: 'Siddharth Rao',
    avatar: 'S',
    role: 'student',
    points: 50,
    problemsSolved: 1,
    accuracy: 75,
    streak: 1,
  },
];

export function getLeaderboard(currentUser?: User | null): LeaderboardEntry[] {
  const submissions = getStoredSubmissions();
  const problems = getStoredProblems();
  const problemMap = new Map(problems.map((p) => [p.id, p]));

  // Calculate points for current user:
  // Easy: 20 pts, Medium: 50 pts, Hard: 100 pts.
  // Streak bonus: streak * 10
  const acceptedSubmissions = submissions.filter((s) => s.status === 'Accepted');
  const solvedProblemIds = Array.from(new Set(acceptedSubmissions.map((s) => s.problemId)));

  let userPoints = 0;
  for (const pid of solvedProblemIds) {
    const prob = problemMap.get(pid);
    if (prob) {
      if (prob.difficulty === 'Easy') userPoints += 20;
      else if (prob.difficulty === 'Medium') userPoints += 50;
      else if (prob.difficulty === 'Hard') userPoints += 100;
    } else {
      userPoints += 30; // fallback points for custom problems
    }
  }

  const streak = 4;
  userPoints += streak * 10; // streak bonus
  const accuracy = submissions.length ? Math.round((acceptedSubmissions.length / submissions.length) * 100) : 100;

  const currentUserName = currentUser?.name || 'Rahul Kumar (You)';
  const currentUserId = currentUser?.id || 'current-user';

  const userEntry: Omit<LeaderboardEntry, 'rank'> = {
    userId: currentUserId,
    name: `${currentUserName} (You)`,
    avatar: currentUser?.avatar || currentUserName.charAt(0).toUpperCase(),
    role: currentUser?.role || 'student',
    points: userPoints,
    problemsSolved: solvedProblemIds.length,
    accuracy,
    streak,
    isCurrentUser: true,
  };

  const allEntries = [...SEED_LEADERBOARD_CANDIDATES, userEntry];

  // Sort descending by points, then accuracy, then problemsSolved
  allEntries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return b.problemsSolved - a.problemsSolved;
  });

  return allEntries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}

