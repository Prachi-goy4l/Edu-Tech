export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type SupportedLanguage = 'python' | 'javascript' | 'cpp' | 'java';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  joinedDate?: string;
}

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  acceptanceRate?: string;
  createdBy?: string;
  createdAt?: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: Record<SupportedLanguage, string>;
  testCases: TestCase[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  role: UserRole;
  points: number;
  problemsSolved: number;
  accuracy: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface TestCaseResult {
  testCaseId: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
}

export interface ExecutionResult {
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compile Error' | 'Time Limit Exceeded';
  testCaseResults: TestCaseResult[];
  executionTimeMs?: number;
  rawOutput?: string;
  errorDetails?: string;
}

export interface SubmissionRecord {
  id: string;
  problemId: string;
  problemTitle: string;
  language: SupportedLanguage;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compile Error';
  runtimeMs: number;
  testCasesPassed: number;
  totalTestCases: number;
  timestamp: string;
  code: string;
}

export interface LanguageOption {
  id: SupportedLanguage;
  name: string;
  monacoLang: string;
  version: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'python', name: 'Python 3 (CPython 3.10)', monacoLang: 'python', version: '3.10' },
  { id: 'javascript', name: 'JavaScript (Node.js 20)', monacoLang: 'javascript', version: '20.x' },
  { id: 'cpp', name: 'C++ (GCC 13.2)', monacoLang: 'cpp', version: '13.2' },
  { id: 'java', name: 'Java (OpenJDK 21)', monacoLang: 'java', version: '21' },
];
