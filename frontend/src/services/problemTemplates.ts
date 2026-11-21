import { Problem, SupportedLanguage } from '../types';

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
