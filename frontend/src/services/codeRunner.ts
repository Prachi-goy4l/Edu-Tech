import { Problem, SupportedLanguage, ExecutionResult, TestCaseResult } from '../types';

interface Judge0Response {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
  status?: {
    id: number;
    description: string;
  };
}

const JUDGE0_LANGUAGES: Record<SupportedLanguage, number> = {
  python: 100,      // Python (3.12.5)
  javascript: 97,   // JavaScript (Node.js 20.17.0)
  cpp: 105,         // C++ (GCC 14.1.0)
  java: 91,         // Java (JDK 17.0.6)
};

/**
 * Normalizes string outputs for fair comparison (whitespace, quotes, casing, array spacing).
 */
export function normalizeOutput(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/'/g, '"')
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .replace(/,\s+/g, ', ')
    .replace(/True/g, 'true')
    .replace(/False/g, 'false');
}

/**
 * Builds automated test wrapper for Python
 */
function buildPythonHarness(userCode: string, problem: Problem): string {
  // If user is writing competitive programming with stdin / input()
  if (/input\s*\(|sys\.stdin/.test(userCode)) {
    return userCode;
  }

  const helper = `
import json

_sol = Solution() if 'Solution' in globals() else None
def _call(name, *args):
    if _sol and hasattr(_sol, name):
        return getattr(_sol, name)(*args)
    if name in globals():
        return globals()[name](*args)
    raise Exception(f"Function {name} not found in solution")
`;

  if (problem.id === 'two-sum') {
    return `${userCode}
${helper}
tests = [
  (1, [2, 7, 11, 15], 9),
  (2, [3, 2, 4], 6),
  (3, [3, 3], 6)
]
for tid, nums, target in tests:
    try:
        res = _call('twoSum', nums, target)
        if isinstance(res, (list, tuple)):
            res = sorted(list(res))
        print(f"__TESTCASE__{tid}__" + json.dumps(res))
    except Exception as e:
        print(f"__TESTCASE__{tid}__ERROR:" + str(e))
`;
  }

  if (problem.id === 'valid-palindrome') {
    return `${userCode}
${helper}
tests = [
  (1, "A man, a plan, a canal: Panama"),
  (2, "race a car"),
  (3, " ")
]
for tid, s in tests:
    try:
        res = _call('isPalindrome', s)
        print(f"__TESTCASE__{tid}__" + ("true" if res else "false"))
    except Exception as e:
        print(f"__TESTCASE__{tid}__ERROR:" + str(e))
`;
  }

  if (problem.id === 'fizz-buzz') {
    return `${userCode}
${helper}
tests = [
  (1, 3),
  (2, 5),
  (3, 15)
]
for tid, n in tests:
    try:
        res = _call('fizzBuzz', n)
        print(f"__TESTCASE__{tid}__" + json.dumps(res))
    except Exception as e:
        print(f"__TESTCASE__{tid}__ERROR:" + str(e))
`;
  }

  return userCode;
}

/**
 * Builds automated test wrapper for JavaScript
 */
function buildJavascriptHarness(userCode: string, problem: Problem): string {
  if (/readline|process\.stdin|fs\.readFileSync/.test(userCode)) {
    return userCode;
  }

  const helper = `
const _sol = typeof Solution !== 'undefined' ? new Solution() : null;
function _call(name, ...args) {
  if (_sol && typeof _sol[name] === 'function') {
    return _sol[name](...args);
  }
  if (typeof globalThis[name] === 'function') {
    return globalThis[name](...args);
  }
  throw new Error("Function " + name + " not found");
}
`;

  if (problem.id === 'two-sum') {
    return `${userCode}
${helper}
const tests = [
  { id: 1, nums: [2, 7, 11, 15], target: 9 },
  { id: 2, nums: [3, 2, 4], target: 6 },
  { id: 3, nums: [3, 3], target: 6 }
];
for (const t of tests) {
  try {
    const res = _call('twoSum', t.nums, t.target);
    const sorted = Array.isArray(res) ? [...res].sort((a,b) => a - b) : res;
    console.log(\`__TESTCASE__\${t.id}__\${JSON.stringify(sorted)}\`);
  } catch (err) {
    console.log(\`__TESTCASE__\${t.id}__ERROR:\${err.message}\`);
  }
}
`;
  }

  if (problem.id === 'valid-palindrome') {
    return `${userCode}
${helper}
const tests = [
  { id: 1, s: "A man, a plan, a canal: Panama" },
  { id: 2, s: "race a car" },
  { id: 3, s: " " }
];
for (const t of tests) {
  try {
    const res = _call('isPalindrome', t.s);
    console.log(\`__TESTCASE__\${t.id}__\${res ? "true" : "false"}\`);
  } catch (err) {
    console.log(\`__TESTCASE__\${t.id}__ERROR:\${err.message}\`);
  }
}
`;
  }

  if (problem.id === 'fizz-buzz') {
    return `${userCode}
${helper}
const tests = [
  { id: 1, n: 3 },
  { id: 2, n: 5 },
  { id: 3, n: 15 }
];
for (const t of tests) {
  try {
    const res = _call('fizzBuzz', t.n);
    console.log(\`__TESTCASE__\${t.id}__\${JSON.stringify(res)}\`);
  } catch (err) {
    console.log(\`__TESTCASE__\${t.id}__ERROR:\${err.message}\`);
  }
}
`;
  }

  return userCode;
}

/**
 * Builds automated test wrapper for Java
 */
function buildJavaHarness(userCode: string, problem: Problem): string {
  // If the user already defined public static void main or uses Scanner
  if (/public\s+static\s+void\s+main/.test(userCode) || /Scanner\s+/.test(userCode)) {
    // If user made a public class other than Main, strip 'public' keyword so Judge0 Main class works
    return userCode.replace(/public\s+class\s+([A-Za-z0-9_]+)/g, (match, className) => {
      return className === 'Main' ? match : `class ${className}`;
    });
  }

  // Ensure user class is non-public class Solution
  let cleanCode = userCode.replace(/public\s+class\s+Solution/g, 'class Solution');

  if (problem.id === 'two-sum') {
    return `import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        try {
            int[] r1 = sol.twoSum(new int[]{2, 7, 11, 15}, 9);
            if (r1 != null) Arrays.sort(r1);
            System.out.println("__TESTCASE__1__" + Arrays.toString(r1));
        } catch (Exception e) {
            System.out.println("__TESTCASE__1__ERROR:" + e.getMessage());
        }
        try {
            int[] r2 = sol.twoSum(new int[]{3, 2, 4}, 6);
            if (r2 != null) Arrays.sort(r2);
            System.out.println("__TESTCASE__2__" + Arrays.toString(r2));
        } catch (Exception e) {
            System.out.println("__TESTCASE__2__ERROR:" + e.getMessage());
        }
        try {
            int[] r3 = sol.twoSum(new int[]{3, 3}, 6);
            if (r3 != null) Arrays.sort(r3);
            System.out.println("__TESTCASE__3__" + Arrays.toString(r3));
        } catch (Exception e) {
            System.out.println("__TESTCASE__3__ERROR:" + e.getMessage());
        }
    }
}
`;
  }

  if (problem.id === 'valid-palindrome') {
    return `import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        try {
            boolean r1 = sol.isPalindrome("A man, a plan, a canal: Panama");
            System.out.println("__TESTCASE__1__" + r1);
        } catch (Exception e) {
            System.out.println("__TESTCASE__1__ERROR:" + e.getMessage());
        }
        try {
            boolean r2 = sol.isPalindrome("race a car");
            System.out.println("__TESTCASE__2__" + r2);
        } catch (Exception e) {
            System.out.println("__TESTCASE__2__ERROR:" + e.getMessage());
        }
        try {
            boolean r3 = sol.isPalindrome(" ");
            System.out.println("__TESTCASE__3__" + r3);
        } catch (Exception e) {
            System.out.println("__TESTCASE__3__ERROR:" + e.getMessage());
        }
    }
}
`;
  }

  if (problem.id === 'fizz-buzz') {
    return `import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        try {
            List<String> r1 = sol.fizzBuzz(3);
            System.out.println("__TESTCASE__1__" + r1);
        } catch (Exception e) {
            System.out.println("__TESTCASE__1__ERROR:" + e.getMessage());
        }
        try {
            List<String> r2 = sol.fizzBuzz(5);
            System.out.println("__TESTCASE__2__" + r2);
        } catch (Exception e) {
            System.out.println("__TESTCASE__2__ERROR:" + e.getMessage());
        }
        try {
            List<String> r3 = sol.fizzBuzz(15);
            System.out.println("__TESTCASE__3__" + r3);
        } catch (Exception e) {
            System.out.println("__TESTCASE__3__ERROR:" + e.getMessage());
        }
    }
}
`;
  }

  return userCode;
}

/**
 * Builds automated test wrapper for C++
 */
function buildCppHarness(userCode: string, problem: Problem): string {
  if (/int\s+main\s*\(|cin\s*>>/.test(userCode)) {
    return userCode;
  }

  if (problem.id === 'two-sum') {
    return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
using namespace std;

${userCode}

int main() {
    Solution sol;
    try {
        vector<int> n1 = {2, 7, 11, 15};
        auto r1 = sol.twoSum(n1, 9);
        sort(r1.begin(), r1.end());
        cout << "__TESTCASE__1__[" << r1[0] << ", " << r1[1] << "]" << endl;
    } catch (const exception& e) {
        cout << "__TESTCASE__1__ERROR:" << e.what() << endl;
    }
    try {
        vector<int> n2 = {3, 2, 4};
        auto r2 = sol.twoSum(n2, 6);
        sort(r2.begin(), r2.end());
        cout << "__TESTCASE__2__[" << r2[0] << ", " << r2[1] << "]" << endl;
    } catch (const exception& e) {
        cout << "__TESTCASE__2__ERROR:" << e.what() << endl;
    }
    try {
        vector<int> n3 = {3, 3};
        auto r3 = sol.twoSum(n3, 6);
        sort(r3.begin(), r3.end());
        cout << "__TESTCASE__3__[" << r3[0] << ", " << r3[1] << "]" << endl;
    } catch (const exception& e) {
        cout << "__TESTCASE__3__ERROR:" << e.what() << endl;
    }
    return 0;
}
`;
  }

  if (problem.id === 'valid-palindrome') {
    return `#include <iostream>
#include <string>
#include <algorithm>
#include <cctype>
using namespace std;

${userCode}

int main() {
    Solution sol;
    try {
        bool r1 = sol.isPalindrome("A man, a plan, a canal: Panama");
        cout << "__TESTCASE__1__" << (r1 ? "true" : "false") << endl;
    } catch (const exception& e) {
        cout << "__TESTCASE__1__ERROR:" << e.what() << endl;
    }
    try {
        bool r2 = sol.isPalindrome("race a car");
        cout << "__TESTCASE__2__" << (r2 ? "true" : "false") << endl;
    } catch (const exception& e) {
        cout << "__TESTCASE__2__ERROR:" << e.what() << endl;
    }
    try {
        bool r3 = sol.isPalindrome(" ");
        cout << "__TESTCASE__3__" << (r3 ? "true" : "false") << endl;
    } catch (const exception& e) {
        cout << "__TESTCASE__3__ERROR:" << e.what() << endl;
    }
    return 0;
}
`;
  }

  if (problem.id === 'fizz-buzz') {
    return `#include <iostream>
#include <vector>
#include <string>
using namespace std;

${userCode}

int main() {
    Solution sol;
    auto printFB = [](int tid, const vector<string>& list) {
        cout << "__TESTCASE__" << tid << "__[";
        for (size_t i = 0; i < list.size(); i++) {
            cout << "\\"" << list[i] << "\\"" << (i + 1 < list.size() ? ", " : "");
        }
        cout << "]" << endl;
    };
    try {
        printFB(1, sol.fizzBuzz(3));
    } catch (const exception& e) { cout << "__TESTCASE__1__ERROR:" << e.what() << endl; }
    try {
        printFB(2, sol.fizzBuzz(5));
    } catch (const exception& e) { cout << "__TESTCASE__2__ERROR:" << e.what() << endl; }
    try {
        printFB(3, sol.fizzBuzz(15));
    } catch (const exception& e) { cout << "__TESTCASE__3__ERROR:" << e.what() << endl; }
    return 0;
}
`;
  }

  return userCode;
}

/**
 * Execute code via Judge0 CE API
 */
async function callJudge0(sourceCode: string, languageId: number, stdin?: string): Promise<Judge0Response> {
  const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin || '',
    }),
  });

  if (!response.ok) {
    throw new Error(`Compiler API returned HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Main code execution function
 */
export async function executeCode(
  problem: Problem,
  language: SupportedLanguage,
  code: string,
  customInput?: string
): Promise<ExecutionResult> {
  const startTime = performance.now();
  const languageId = JUDGE0_LANGUAGES[language];

  try {
    // 1. If custom input was specified by candidate
    if (customInput !== undefined && customInput !== '') {
      let runnableCode = code;
      // In Java, ensure class with main is Main
      if (language === 'java' && /public\s+class\s+([A-Za-z0-9_]+)/.test(runnableCode)) {
        runnableCode = runnableCode.replace(/public\s+class\s+([A-Za-z0-9_]+)/, 'class $1');
      }

      const res = await callJudge0(runnableCode, languageId, customInput);
      const duration = Math.round((parseFloat(res.time || '0') * 1000) || (performance.now() - startTime));

      if (res.compile_output) {
        return {
          status: 'Compile Error',
          testCaseResults: [],
          executionTimeMs: duration,
          errorDetails: res.compile_output,
        };
      }

      if (res.stderr && res.status?.id !== 3) {
        return {
          status: 'Runtime Error',
          testCaseResults: [],
          executionTimeMs: duration,
          errorDetails: res.stderr,
        };
      }

      const stdout = (res.stdout || '').trim();
      const firstExpected = problem.testCases[0]?.expectedOutput || '';
      const isAccepted = normalizeOutput(stdout) === normalizeOutput(firstExpected);

      return {
        status: isAccepted ? 'Accepted' : 'Wrong Answer',
        testCaseResults: [
          {
            testCaseId: 1,
            input: customInput,
            expected: firstExpected,
            actual: stdout || '(no output)',
            passed: isAccepted,
          },
        ],
        executionTimeMs: duration,
        rawOutput: stdout,
      };
    }

    // 2. Automated Testcase Evaluation
    let wrappedCode = code;
    if (language === 'python') {
      wrappedCode = buildPythonHarness(code, problem);
    } else if (language === 'javascript') {
      wrappedCode = buildJavascriptHarness(code, problem);
    } else if (language === 'java') {
      wrappedCode = buildJavaHarness(code, problem);
    } else if (language === 'cpp') {
      wrappedCode = buildCppHarness(code, problem);
    }

    // Call compiler
    const res = await callJudge0(wrappedCode, languageId, '');
    const duration = Math.round((parseFloat(res.time || '0') * 1000) || (performance.now() - startTime));

    // Handle Compile Error
    if (res.compile_output) {
      return {
        status: 'Compile Error',
        testCaseResults: [],
        executionTimeMs: duration,
        errorDetails: res.compile_output,
      };
    }

    // Handle Runtime Error (if no testcase outputs were printed)
    const stdout = res.stdout || '';
    if (res.stderr && !stdout.includes('__TESTCASE__') && res.status?.id !== 3) {
      return {
        status: 'Runtime Error',
        testCaseResults: [],
        executionTimeMs: duration,
        errorDetails: res.stderr,
      };
    }

    // Parse structured testcase markers: __TESTCASE__<id>__<output>
    if (stdout.includes('__TESTCASE__')) {
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
        const item = resultMap.get(tc.id);
        const actual = item ? item.output : 'No output generated';
        const error = item ? item.error : undefined;
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
    }

    // Fallback: If stdin-style problem (e.g. custom problem like Sum of Array Elements)
    // Run the first testcase input as stdin if it was not caught by wrapper
    const firstExpected = problem.testCases[0]?.expectedOutput || '';
    const cleanOutput = stdout.trim();
    const isAccepted = normalizeOutput(cleanOutput) === normalizeOutput(firstExpected);

    return {
      status: isAccepted ? 'Accepted' : 'Wrong Answer',
      testCaseResults: [
        {
          testCaseId: 1,
          input: problem.testCases[0]?.input || '',
          expected: firstExpected,
          actual: cleanOutput || (res.stderr ? `Error: ${res.stderr}` : '(no output)'),
          passed: isAccepted,
        },
      ],
      executionTimeMs: duration,
      rawOutput: stdout,
    };
  } catch (err: any) {
    return {
      status: 'Runtime Error',
      testCaseResults: [],
      executionTimeMs: Math.round(performance.now() - startTime),
      errorDetails: `Execution error: ${err.message || err}`,
    };
  }
}
