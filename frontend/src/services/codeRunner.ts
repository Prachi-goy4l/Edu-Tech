import { Problem, SupportedLanguage, ExecutionResult, TestCaseResult } from '../types';

interface WandboxRequest {
  code: string;
  compiler: string;
  stdin?: string;
}

interface WandboxResponse {
  status: string; // '0' is success
  signal?: string;
  compiler_output?: string;
  compiler_error?: string;
  compiler_message?: string;
  program_output?: string;
  program_error?: string;
  program_message?: string;
}

const WANDBOX_COMPILERS: Record<SupportedLanguage, string> = {
  python: 'cpython-3.10.15',
  javascript: 'nodejs-20.17.0',
  cpp: 'gcc-13.2.0',
  java: 'openjdk-jdk-21+35',
};

/**
 * Normalizes string outputs for fair comparison (e.g., spaces, quotes, brackets).
 */
function normalizeOutput(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/'/g, '"')
    .replace(/True/g, 'true')
    .replace(/False/g, 'false');
}

/**
 * Builds executable test wrapper around user code for Python
 */
function buildPythonWrapper(userCode: string, problem: Problem): string {
  if (problem.id === 'two-sum') {
    return `${userCode}

import json

tests = [
  {"id": 1, "nums": [2, 7, 11, 15], "target": 9},
  {"id": 2, "nums": [3, 2, 4], "target": 6},
  {"id": 3, "nums": [3, 3], "target": 6}
]

for t in tests:
    try:
        ans = twoSum(t["nums"], t["target"])
        if isinstance(ans, list):
            ans = sorted(ans)
        print(f"__TESTCASE__{t['id']}__" + json.dumps(ans))
    except Exception as e:
        print(f"__TESTCASE__{t['id']}__ERROR:" + str(e))
`;
  }

  if (problem.id === 'valid-palindrome') {
    return `${userCode}

tests = [
  {"id": 1, "s": "A man, a plan, a canal: Panama"},
  {"id": 2, "s": "race a car"},
  {"id": 3, "s": " "}
]

for t in tests:
    try:
        ans = isPalindrome(t["s"])
        print(f"__TESTCASE__{t['id']}__" + ("true" if ans else "false"))
    except Exception as e:
        print(f"__TESTCASE__{t['id']}__ERROR:" + str(e))
`;
  }

  if (problem.id === 'fizz-buzz') {
    return `${userCode}

import json

tests = [
  {"id": 1, "n": 3},
  {"id": 2, "n": 5},
  {"id": 3, "n": 15}
]

for t in tests:
    try:
        ans = fizzBuzz(t["n"])
        print(f"__TESTCASE__{t['id']}__" + json.dumps(ans))
    except Exception as e:
        print(f"__TESTCASE__{t['id']}__ERROR:" + str(e))
`;
  }

  return userCode;
}

/**
 * Builds executable test wrapper around user code for JavaScript
 */
function buildJavascriptWrapper(userCode: string, problem: Problem): string {
  if (problem.id === 'two-sum') {
    return `${userCode}

const tests = [
  { id: 1, nums: [2, 7, 11, 15], target: 9 },
  { id: 2, nums: [3, 2, 4], target: 6 },
  { id: 3, nums: [3, 3], target: 6 }
];

for (const t of tests) {
  try {
    const ans = twoSum(t.nums, t.target);
    const sortedAns = Array.isArray(ans) ? [...ans].sort((a,b) => a - b) : ans;
    console.log(\`__TESTCASE__\${t.id}__\${JSON.stringify(sortedAns)}\`);
  } catch (err) {
    console.log(\`__TESTCASE__\${t.id}__ERROR:\${err.message}\`);
  }
}
`;
  }

  if (problem.id === 'valid-palindrome') {
    return `${userCode}

const tests = [
  { id: 1, s: "A man, a plan, a canal: Panama" },
  { id: 2, s: "race a car" },
  { id: 3, s: " " }
];

for (const t of tests) {
  try {
    const ans = isPalindrome(t.s);
    console.log(\`__TESTCASE__\${t.id}__\${ans ? "true" : "false"}\`);
  } catch (err) {
    console.log(\`__TESTCASE__\${t.id}__ERROR:\${err.message}\`);
  }
}
`;
  }

  if (problem.id === 'fizz-buzz') {
    return `${userCode}

const tests = [
  { id: 1, n: 3 },
  { id: 2, n: 5 },
  { id: 3, n: 15 }
];

for (const t of tests) {
  try {
    const ans = fizzBuzz(t.n);
    console.log(\`__TESTCASE__\${t.id}__\${JSON.stringify(ans)}\`);
  } catch (err) {
    console.log(\`__TESTCASE__\${t.id}__ERROR:\${err.message}\`);
  }
}
`;
  }

  return userCode;
}

/**
 * Main code execution function using Wandbox API
 */
export async function executeCode(
  problem: Problem,
  language: SupportedLanguage,
  code: string,
  customInput?: string
): Promise<ExecutionResult> {
  const startTime = performance.now();
  const compiler = WANDBOX_COMPILERS[language];

  let wrappedCode = code;
  if (!customInput) {
    if (language === 'python') {
      wrappedCode = buildPythonWrapper(code, problem);
    } else if (language === 'javascript') {
      wrappedCode = buildJavascriptWrapper(code, problem);
    }
  }

  const payload: WandboxRequest = {
    compiler,
    code: wrappedCode,
    stdin: customInput || '',
  };

  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Execution service responded with HTTP ${response.status}`);
    }

    const data: WandboxResponse = await response.json();
    const duration = Math.round(performance.now() - startTime);

    // Compilation error (e.g. C++ or Java syntax errors)
    if (data.compiler_error && data.status !== '0' && !data.program_output) {
      return {
        status: 'Compile Error',
        testCaseResults: [],
        executionTimeMs: duration,
        errorDetails: data.compiler_error || data.compiler_message || 'Compilation failed.',
      };
    }

    // Runtime error
    if (data.status !== '0' && !data.program_output?.includes('__TESTCASE__')) {
      return {
        status: 'Runtime Error',
        testCaseResults: [],
        executionTimeMs: duration,
        errorDetails: data.program_error || data.compiler_error || data.program_message || 'Process exited with non-zero status.',
      };
    }

    const stdout = data.program_output || '';

    // If custom input was run or languages like C++/Java that output direct stdout
    if (customInput || (!stdout.includes('__TESTCASE__') && (language === 'cpp' || language === 'java'))) {
      const cleanOutput = stdout.trim();
      const firstExpected = problem.testCases[0]?.expectedOutput || '';
      const isAccepted = normalizeOutput(cleanOutput) === normalizeOutput(firstExpected);

      return {
        status: isAccepted ? 'Accepted' : 'Wrong Answer',
        testCaseResults: [
          {
            testCaseId: 1,
            input: customInput || problem.testCases[0]?.input || '',
            expected: firstExpected,
            actual: cleanOutput || (data.program_error ? `Error: ${data.program_error}` : 'No output'),
            passed: isAccepted,
          },
        ],
        executionTimeMs: duration,
        rawOutput: stdout,
      };
    }

    // Parse structured testcase markers: __TESTCASE__<id>__<output>
    const testResults: TestCaseResult[] = [];
    const lines = stdout.split('\n');
    const resultMap = new Map<number, { output: string; error?: string }>();

    for (const line of lines) {
      const match = line.match(/__TESTCASE__(\d+)__(.*)/);
      if (match) {
        const id = parseInt(match[1], 10);
        const val = match[2];
        if (val.startsWith('ERROR:')) {
          resultMap.set(id, { output: '', error: val.replace('ERROR:', '').trim() });
        } else {
          resultMap.set(id, { output: val.trim() });
        }
      }
    }

    let allPassed = true;
    for (const tc of problem.testCases) {
      const res = resultMap.get(tc.id);
      const actual = res ? res.output : 'No output generated';
      const error = res ? res.error : undefined;
      const passed = !error && normalizeOutput(actual) === normalizeOutput(tc.expectedOutput);

      if (!passed) allPassed = false;

      testResults.push({
        testCaseId: tc.id,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: error ? `Error: ${error}` : actual,
        passed,
        error,
      });
    }

    return {
      status: allPassed ? 'Accepted' : 'Wrong Answer',
      testCaseResults: testResults,
      executionTimeMs: duration,
      rawOutput: stdout,
    };
  } catch (err: any) {
    return {
      status: 'Runtime Error',
      testCaseResults: [],
      executionTimeMs: Math.round(performance.now() - startTime),
      errorDetails: `Execution failed: ${err.message || err}. Please check your internet connection.`,
    };
  }
}
