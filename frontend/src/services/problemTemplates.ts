import { FunctionParameter, FunctionValueType, Problem, SupportedLanguage } from '../types';

const pythonTypes: Record<FunctionValueType, string> = {
  integer: 'int',
  number: 'float',
  boolean: 'bool',
  string: 'str',
  'integer[]': 'list[int]',
  'number[]': 'list[float]',
  'boolean[]': 'list[bool]',
  'string[]': 'list[str]',
};

const cppTypes: Record<FunctionValueType, string> = {
  integer: 'int',
  number: 'double',
  boolean: 'bool',
  string: 'string',
  'integer[]': 'vector<int>',
  'number[]': 'vector<double>',
  'boolean[]': 'vector<bool>',
  'string[]': 'vector<string>',
};

const javaTypes: Record<FunctionValueType, string> = {
  integer: 'int',
  number: 'double',
  boolean: 'boolean',
  string: 'String',
  'integer[]': 'int[]',
  'number[]': 'double[]',
  'boolean[]': 'boolean[]',
  'string[]': 'String[]',
};

function javaDefaultValue(type: FunctionValueType): string {
  switch (type) {
    case 'integer': return '0';
    case 'number': return '0.0';
    case 'boolean': return 'false';
    case 'string': return '""';
    case 'integer[]': return 'new int[0]';
    case 'number[]': return 'new double[0]';
    case 'boolean[]': return 'new boolean[0]';
    case 'string[]': return 'new String[0]';
  }
}

export function getCustomProblemStarterCode(): Record<SupportedLanguage, string> {
  return {
    python: `import sys

def solve(input_data: str) -> str:
    # Parse input_data and return the expected output.
    return ""

if __name__ == "__main__":
    print(solve(sys.stdin.read()), end="")
`,
    javascript: `function solve(inputData) {
    // Parse inputData and return the expected output.
    return "";
}

let inputData = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => inputData += chunk);
process.stdin.on("end", () => process.stdout.write(solve(inputData)));
`,
    cpp: `#include <iostream>
#include <iterator>
#include <string>
using namespace std;

string solve(const string& inputData) {
    // Parse inputData and return the expected output.
    return "";
}

int main() {
    string inputData((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());
    cout << solve(inputData);
    return 0;
}
`,
    java: `import java.util.Scanner;

class Main {
    static String solve(String inputData) {
        // Parse inputData and return the expected output.
        return "";
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in).useDelimiter("\\\\A");
        String inputData = scanner.hasNext() ? scanner.next() : "";
        System.out.print(solve(inputData));
    }
}
`,
  };
}

export function getFunctionProblemStarterCode(
  functionName: string,
  parameters: FunctionParameter[],
  returnType: FunctionValueType
): Record<SupportedLanguage, string> {
  const pythonParameters = parameters
    .map((parameter) => `${parameter.name}: ${pythonTypes[parameter.type]}`)
    .join(', ');
  const cppParameters = parameters
    .map((parameter) => `${cppTypes[parameter.type]} ${parameter.name}`)
    .join(', ');
  const javaParameters = parameters
    .map((parameter) => `${javaTypes[parameter.type]} ${parameter.name}`)
    .join(', ');

  return {
    python: `class Solution:\n    def ${functionName}(self${pythonParameters ? `, ${pythonParameters}` : ''}) -> ${pythonTypes[returnType]}:\n        # Write your solution here\n        pass\n`,
    javascript: `class Solution {\n    ${functionName}(${parameters.map((parameter) => parameter.name).join(', ')}) {\n        // Write your solution here\n    }\n}\n`,
    cpp: `#include <string>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${cppTypes[returnType]} ${functionName}(${cppParameters}) {\n        // Write your solution here\n        return {};\n    }\n};\n`,
    java: `class Solution {\n    public ${javaTypes[returnType]} ${functionName}(${javaParameters}) {\n        // Write your solution here\n        return ${javaDefaultValue(returnType)};\n    }\n}\n`,
  };
}

export function migrateLegacyProblemStarterCode(problem: Problem): Problem {
  const { python, javascript, cpp, java } = problem.starterCode;
  const isLegacyTemplate =
    python.includes('TODO: Implement your solution here') &&
    python.includes('return input_val') &&
    javascript.includes('TODO: Implement your solution here') &&
    javascript.includes('return inputVal') &&
    cpp.includes('TODO: Implement your solution here') &&
    cpp.includes('void ') &&
    java.includes('TODO: Implement your solution here') &&
    java.includes('void ');

  return isLegacyTemplate
    ? { ...problem, starterCode: getCustomProblemStarterCode() }
    : problem;
}
