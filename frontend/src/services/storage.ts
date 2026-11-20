import { Problem, SubmissionRecord, LeaderboardEntry, User } from '../types';
import { PROBLEMS } from '../data/problems';

const ALL_SUBMISSIONS_KEY = 'edu-tech-all-submissions-v1';
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

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem('edu-tech-user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredSubmissions(targetUserId?: string): SubmissionRecord[] {
  const user = getCurrentUser();
  const activeId = targetUserId || user?.id;

  // Admin view (without specific target user) sees all platform submissions
  if (user?.role === 'admin' && !targetUserId) {
    try {
      const allRaw = localStorage.getItem(ALL_SUBMISSIONS_KEY);
      if (allRaw) return JSON.parse(allRaw);
    } catch {}
    return INITIAL_SUBMISSIONS;
  }

  if (!activeId) return [];

  // Seed sample data ONLY for the pre-configured Demo Student account
  if (activeId === 'usr-student-1') {
    const key = `edu-tech-submissions-${activeId}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        localStorage.setItem(key, JSON.stringify(INITIAL_SUBMISSIONS));
        return INITIAL_SUBMISSIONS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  }

  // Any real new user (Google, Registration, etc.) starts completely fresh with 0 solved
  const userKey = `edu-tech-submissions-${activeId}`;
  try {
    const raw = localStorage.getItem(userKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSubmission(submission: Omit<SubmissionRecord, 'id' | 'timestamp'>): SubmissionRecord {
  const user = getCurrentUser();
  const activeId = user?.id || 'guest';
  const newRecord: SubmissionRecord = {
    ...submission,
    id: `sub-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  // 1. Save to user's personal scoped submissions
  const userKey = `edu-tech-submissions-${activeId}`;
  const userSubmissions = getStoredSubmissions(activeId);
  const updatedUser = [newRecord, ...userSubmissions];
  try {
    localStorage.setItem(userKey, JSON.stringify(updatedUser));
  } catch (err) {
    console.error('Failed to save user submission to localStorage', err);
  }

  // 2. Also record to platform-wide submissions for staff/admin oversight
  try {
    const allRaw = localStorage.getItem(ALL_SUBMISSIONS_KEY);
    const allSubs: SubmissionRecord[] = allRaw ? JSON.parse(allRaw) : INITIAL_SUBMISSIONS;
    localStorage.setItem(ALL_SUBMISSIONS_KEY, JSON.stringify([newRecord, ...allSubs]));
  } catch (err) {
    console.error('Failed to save to all submissions', err);
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
  const customIds = new Set(custom.map((p) => p.id));
  const base = PROBLEMS.filter((p) => !customIds.has(p.id));
  return [...base, ...custom];
}

export function saveNewProblem(problem: Problem): Problem {
  const custom = getCustomProblems();
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

export function getStats(targetUser?: User | null) {
  const user = targetUser || getCurrentUser();
  const submissions = getStoredSubmissions(user?.id);
  const accepted = submissions.filter((s) => s.status === 'Accepted');
  const uniqueSolved = new Set(accepted.map((s) => s.problemId)).size;
  const accuracy = submissions.length ? Math.round((accepted.length / submissions.length) * 100) : 0;
  const totalProblems = getStoredProblems().length;

  const streak = user?.id === 'usr-student-1' ? 4 : (submissions.length > 0 ? 1 : 0);

  return {
    totalSubmissions: submissions.length,
    acceptedSubmissions: accepted.length,
    problemsSolved: uniqueSolved,
    totalProblems,
    accuracy,
    currentStreak: streak,
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
  const user = currentUser || getCurrentUser();
  const submissions = getStoredSubmissions(user?.id);
  const problems = getStoredProblems();
  const problemMap = new Map(problems.map((p) => [p.id, p]));

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
      userPoints += 30;
    }
  }

  const streak = user?.id === 'usr-student-1' ? 4 : (submissions.length > 0 ? 1 : 0);
  userPoints += streak * 10;
  const accuracy = submissions.length ? Math.round((acceptedSubmissions.length / submissions.length) * 100) : 0;

  const currentUserName = user?.name || 'Rahul Kumar (You)';
  const currentUserId = user?.id || 'current-user';

  const userEntry: Omit<LeaderboardEntry, 'rank'> = {
    userId: currentUserId,
    name: `${currentUserName} (You)`,
    avatar: user?.avatar || currentUserName.charAt(0).toUpperCase(),
    role: user?.role || 'student',
    points: userPoints,
    problemsSolved: solvedProblemIds.length,
    accuracy,
    streak,
    isCurrentUser: true,
  };

  const allEntries = [...SEED_LEADERBOARD_CANDIDATES, userEntry];

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
