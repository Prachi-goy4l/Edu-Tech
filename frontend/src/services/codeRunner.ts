import {
  FunctionValueType,
  Problem,
  SupportedLanguage,
  ExecutionResult,
  TestCaseResult,
  TestCase,
} from '../types';

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

const FUNCTION_VALUE_TYPES: FunctionValueType[] = [
  'integer',
  'number',
  'boolean',
  'string',
  'integer[]',
  'number[]',
  'boolean[]',
  'string[]',
];

const CPP_TYPES: Record<FunctionValueType, string> = {
  integer: 'int',
  number: 'double',
  boolean: 'bool',
  string: 'string',
  'integer[]': 'vector<int>',
  'number[]': 'vector<double>',
  'boolean[]': 'vector<bool>',
  'string[]': 'vector<string>',
};

const JAVA_TYPES: Record<FunctionValueType, string> = {
  integer: 'int',
  number: 'double',
  boolean: 'boolean',
  string: 'String',
  'integer[]': 'int[]',
  'number[]': 'double[]',
  'boolean[]': 'boolean[]',
  'string[]': 'String[]',
};

function isValueOfType(value: unknown, type: FunctionValueType): boolean {
  if (type.endsWith('[]')) {
    if (!Array.isArray(value)) return false;
    const elementType = type.slice(0, -2) as FunctionValueType;
    return value.every((item) => isValueOfType(item, elementType));
  }
  switch (type) {
    case 'integer': return typeof value === 'number' && Number.isInteger(value);
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'boolean': return typeof value === 'boolean';
    case 'string': return typeof value === 'string';
    default: return false;
  }
}

function cppStringLiteral(value: string): string {
  return `"${value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')}"`;
}

function javaStringLiteral(value: string): string {
  return `"${value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')}"`;
}

function cppLiteral(value: unknown, type: FunctionValueType): string {
  if (!isValueOfType(value, type)) {
    throw new Error(`Test argument does not match the declared ${type} type`);
  }
  if (type.endsWith('[]')) {
    const elementType = type.slice(0, -2) as FunctionValueType;
    const items = (value as unknown[]).map((item) => cppLiteral(item, elementType));
    return `${CPP_TYPES[type]}{${items.join(', ')}}`;
  }
  if (type === 'string') return cppStringLiteral(value as string);
  if (type === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function javaLiteral(value: unknown, type: FunctionValueType): string {
  if (!isValueOfType(value, type)) {
    throw new Error(`Test argument does not match the declared ${type} type`);
  }
  if (type.endsWith('[]')) {
    const elementType = type.slice(0, -2) as FunctionValueType;
    const items = (value as unknown[]).map((item) => javaLiteral(item, elementType));
    return `new ${JAVA_TYPES[elementType]}[]{${items.join(', ')}}`;
  }
  if (type === 'string') return javaStringLiteral(value as string);
  return String(value);
}

function buildFunctionHarness(
  userCode: string,
  problem: Problem,
  language: SupportedLanguage,
  testCases: TestCase[]
): string {
  const functionName = problem.functionName || '';
  const parameters = problem.parameters || [];
  const returnType = problem.returnType;

  if (!/^[A-Za-z_$][\w$]*$/.test(functionName)) {
    throw new Error('This function problem has an invalid function name.');
  }
  if (!returnType || !FUNCTION_VALUE_TYPES.includes(returnType)) {
    throw new Error('This function problem has an unsupported return type.');
  }
  if (parameters.some((parameter) =>
    !/^[A-Za-z_$][\w$]*$/.test(parameter.name)
    || !FUNCTION_VALUE_TYPES.includes(parameter.type)
  )) {
    throw new Error('This function problem has an invalid parameter definition.');
  }
  for (const testCase of testCases) {
    if (!Array.isArray(testCase.args) || testCase.args.length !== parameters.length
      || testCase.expected === undefined
      || !isValueOfType(testCase.expected, returnType)
      || testCase.args.some((arg, index) => !isValueOfType(arg, parameters[index].type))) {
      throw new Error(`Test case ${testCase.id} does not match the function signature.`);
    }
  }

  if (language === 'python') {
    return `${userCode}

import json as __edu_json
__edu_cases = __edu_json.loads(${JSON.stringify(JSON.stringify(testCases.map((testCase) => ({
  id: testCase.id,
  args: testCase.args,
}))))})
__edu_solution = Solution()
for __edu_case in __edu_cases:
    try:
        __edu_result = getattr(__edu_solution, ${JSON.stringify(functionName)})(*__edu_case["args"])
        print("__TESTCASE__" + str(__edu_case["id"]) + "__" + __edu_json.dumps(__edu_result, separators=(",", ":")))
    except BaseException as __edu_error:
        print("__TESTCASE__" + str(__edu_case["id"]) + "__ERROR:" + str(__edu_error))
`;
  }

  if (language === 'javascript') {
    return `${userCode}

const __edu_cases = ${JSON.stringify(testCases.map((testCase) => ({
  id: testCase.id,
  args: testCase.args,
})))};
const __edu_solution = new Solution();
for (const __edu_case of __edu_cases) {
  try {
    const __edu_result = __edu_solution[${JSON.stringify(functionName)}](...__edu_case.args);
    console.log("__TESTCASE__" + __edu_case.id + "__" + JSON.stringify(__edu_result));
  } catch (__edu_error) {
    console.log("__TESTCASE__" + __edu_case.id + "__ERROR:" + String(__edu_error));
  }
}
`;
  }

  if (language === 'cpp') {
    const calls = testCases.map((testCase) => {
      const args = testCase.args!.map((arg, index) => cppLiteral(arg, parameters[index].type)).join(', ');
      return `    try {
        auto __edu_result = __edu_solution.${functionName}(${args});
        cout << "__TESTCASE__${testCase.id}__" << __edu_to_json(__edu_result) << "\\n";
    } catch (const exception& __edu_error) {
        cout << "__TESTCASE__${testCase.id}__ERROR:" << __edu_error.what() << "\\n";
    } catch (...) {
        cout << "__TESTCASE__${testCase.id}__ERROR:Unknown exception\\n";
    }`;
    }).join('\n');

    return `#include <exception>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <type_traits>
#include <vector>
using namespace std;

${userCode}

string __edu_escape_json(const string& value) {
    string escaped = "\\"";
    for (unsigned char ch : value) {
        if (ch == '"' || ch == '\\\\') {
            escaped += '\\\\';
            escaped += static_cast<char>(ch);
        } else if (ch == '\\n') escaped += "\\\\n";
        else if (ch == '\\r') escaped += "\\\\r";
        else if (ch == '\\t') escaped += "\\\\t";
        else if (ch < 0x20) {
            const char* hex = "0123456789abcdef";
            escaped += "\\\\u00";
            escaped += hex[ch >> 4];
            escaped += hex[ch & 0x0f];
        } else escaped += static_cast<char>(ch);
    }
    return escaped + "\\"";
}

inline string __edu_to_json(const string& value) { return __edu_escape_json(value); }
inline string __edu_to_json(bool value) { return value ? "true" : "false"; }
template <typename T>
typename enable_if<is_arithmetic<T>::value && !is_same<T, bool>::value, string>::type
__edu_to_json(T value) {
    ostringstream output;
    output << setprecision(15) << value;
    return output.str();
}
template <typename T>
string __edu_to_json(const vector<T>& values) {
    string output = "[";
    for (size_t index = 0; index < values.size(); ++index) {
        if (index) output += ",";
        output += __edu_to_json(static_cast<T>(values[index]));
    }
    return output + "]";
}

int main() {
    Solution __edu_solution;
${calls}
    return 0;
}
`;
  }

  const calls = testCases.map((testCase) => {
    const args = testCase.args!.map((arg, index) => javaLiteral(arg, parameters[index].type)).join(', ');
    return `        try {
            ${JAVA_TYPES[returnType]} __edu_result = __edu_solution.${functionName}(${args});
            System.out.println("__TESTCASE__${testCase.id}__" + __edu_to_json(__edu_result));
        } catch (Throwable __edu_error) {
            System.out.println("__TESTCASE__${testCase.id}__ERROR:" + __edu_error.getMessage());
        }`;
  }).join('\n');

  return `import java.lang.reflect.Array;

${userCode}

public class Main {
    static String __edu_quote(String value) {
        StringBuilder output = new StringBuilder("\\"");
        for (int index = 0; index < value.length(); index++) {
            char ch = value.charAt(index);
            if (ch == '"' || ch == '\\\\') output.append('\\\\').append(ch);
            else if (ch == '\\n') output.append("\\\\n");
            else if (ch == '\\r') output.append("\\\\r");
            else if (ch == '\\t') output.append("\\\\t");
            else if (ch < 0x20) output.append(String.format("\\\\u%04x", (int) ch));
            else output.append(ch);
        }
        return output.append('"').toString();
    }

    static String __edu_to_json(Object value) {
        if (value == null) return "null";
        if (value instanceof String) return __edu_quote((String) value);
        if (value instanceof Number || value instanceof Boolean) return value.toString();
        if (value.getClass().isArray()) {
            StringBuilder output = new StringBuilder("[");
            for (int index = 0; index < Array.getLength(value); index++) {
                if (index > 0) output.append(',');
                output.append(__edu_to_json(Array.get(value, index)));
            }
            return output.append(']').toString();
        }
        throw new IllegalArgumentException("Unsupported return value type");
    }

    public static void main(String[] args) {
        Solution __edu_solution = new Solution();
${calls}
    }
}
`;
}

function jsonValuesEqual(actual: string, expected: unknown): boolean {
  try {
    const parsed: unknown = JSON.parse(actual);
    const stableStringify = (value: unknown): string => {
      if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
      if (value && typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>)
          .sort(([left], [right]) => left.localeCompare(right));
        return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`;
      }
      return JSON.stringify(value);
    };
    return stableStringify(parsed) === stableStringify(expected);
  } catch {
    return false;
  }
}

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
    if (problem.mode !== 'function' && customInput !== undefined && customInput !== '') {
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

    if (problem.mode === 'function') {
      if (!problem.testCases.length) {
        return {
          status: 'Wrong Answer',
          testCaseResults: [],
          errorDetails: 'This function problem has no test cases.',
        };
      }

      const wrappedCode = buildFunctionHarness(code, problem, language, problem.testCases);
      const res = await callJudge0(wrappedCode, languageId, '');
      const duration = Math.round((parseFloat(res.time || '0') * 1000) || (performance.now() - startTime));

      if (res.compile_output) {
        return {
          status: 'Compile Error',
          testCaseResults: [],
          executionTimeMs: duration,
          errorDetails: res.compile_output,
        };
      }
      if (res.status?.id === 5) {
        return {
          status: 'Time Limit Exceeded',
          testCaseResults: [],
          executionTimeMs: duration,
          errorDetails: res.stderr || res.status.description,
        };
      }
      if (res.status?.id !== 3 && res.status?.id !== undefined) {
        return {
          status: 'Runtime Error',
          testCaseResults: [],
          executionTimeMs: duration,
          errorDetails: res.stderr || res.status.description,
        };
      }

      const outputs = new Map<number, { output?: string; error?: string }>();
      for (const line of (res.stdout || '').split(/\r?\n/)) {
        const match = line.match(/^__TESTCASE__(\d+)__(.*)$/);
        if (!match) continue;
        const testCaseId = Number(match[1]);
        const value = match[2];
        outputs.set(testCaseId, value.startsWith('ERROR:')
          ? { error: value.slice('ERROR:'.length).trim() }
          : { output: value.trim() });
      }

      const testCaseResults: TestCaseResult[] = problem.testCases.map((testCase) => {
        const output = outputs.get(testCase.id);
        const passed = !output?.error
          && output?.output !== undefined
          && jsonValuesEqual(output.output, testCase.expected);
        return {
          testCaseId: testCase.id,
          input: JSON.stringify(testCase.args),
          expected: JSON.stringify(testCase.expected),
          actual: output?.error ? `Error: ${output.error}` : (output?.output ?? 'No output generated'),
          passed,
          error: output?.error,
        };
      });

      return {
        status: testCaseResults.every((testCase) => testCase.passed) ? 'Accepted' : 'Wrong Answer',
        testCaseResults,
        executionTimeMs: duration,
        rawOutput: res.stdout || '',
        errorDetails: testCaseResults.find((testCase) => testCase.error)?.error,
      };
    }

    if (problem.createdBy) {
      if (problem.testCases.length === 0) {
        return {
          status: 'Wrong Answer',
          testCaseResults: [],
          errorDetails: 'This problem has no automated test cases.',
        };
      }

      const testCaseResults: TestCaseResult[] = [];

      for (const testCase of problem.testCases) {
        const res = await callJudge0(code, languageId, testCase.input);

        if (res.compile_output) {
          return {
            status: 'Compile Error',
            testCaseResults: [
              ...testCaseResults,
              {
                testCaseId: testCase.id,
                input: testCase.input,
                expected: testCase.expectedOutput,
                actual: '',
                passed: false,
                error: res.compile_output,
              },
            ],
            executionTimeMs: Math.round(performance.now() - startTime),
            errorDetails: res.compile_output,
          };
        }

        if (res.status?.id === 5) {
          return {
            status: 'Time Limit Exceeded',
            testCaseResults: [
              ...testCaseResults,
              {
                testCaseId: testCase.id,
                input: testCase.input,
                expected: testCase.expectedOutput,
                actual: (res.stdout || '').trim(),
                passed: false,
              },
            ],
            executionTimeMs: Math.round(performance.now() - startTime),
            errorDetails: res.stderr || undefined,
          };
        }

        if ((res.stderr && res.status?.id !== 3) || (res.status?.id !== undefined && res.status.id >= 7)) {
          return {
            status: 'Runtime Error',
            testCaseResults: [
              ...testCaseResults,
              {
                testCaseId: testCase.id,
                input: testCase.input,
                expected: testCase.expectedOutput,
                actual: (res.stdout || '').trim(),
                passed: false,
                error: res.stderr || res.status?.description,
              },
            ],
            executionTimeMs: Math.round(performance.now() - startTime),
            errorDetails: res.stderr || res.status?.description,
          };
        }

        const actual = (res.stdout || '').trim();
        testCaseResults.push({
          testCaseId: testCase.id,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual,
          passed: normalizeOutput(actual) === normalizeOutput(testCase.expectedOutput),
        });
      }

      return {
        status: testCaseResults.every((testCase) => testCase.passed) ? 'Accepted' : 'Wrong Answer',
        testCaseResults,
        executionTimeMs: Math.round(performance.now() - startTime),
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
