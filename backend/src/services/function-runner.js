const { isDeepStrictEqual } = require('node:util');

function functionRuntime(languageName) {
  if (/^python(?:\s*\(?3(?:\.\d+)*\)?)?$/i.test(languageName)) return 'python';
  if (/node\.js/i.test(languageName)) return 'javascript';
  return null;
}

function isValidFunctionName(functionName) {
  return typeof functionName === 'string'
    && /^[A-Za-z_$][\w$]*$/.test(functionName);
}

function createFunctionDriver(sourceCode, functionName, runtime) {
  if (!isValidFunctionName(functionName)) {
    throw new Error('A valid function name is required');
  }

  if (runtime === 'python') {
    return `${sourceCode}

import json as __edu_json
import sys as __edu_sys
__edu_args = __edu_json.loads(__edu_sys.stdin.read())
__edu_result = Solution().${functionName}(*__edu_args)
print(__edu_json.dumps(__edu_result, separators=(',', ':')))
`;
  }

  if (runtime === 'javascript') {
    return `${sourceCode}

const __edu_args = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const __edu_result = new Solution()[${JSON.stringify(functionName)}](...__edu_args);
console.log(JSON.stringify(__edu_result));
`;
  }

  throw new Error(`Unsupported function runtime: ${runtime}`);
}

function functionOutputMatches(stdout, expected) {
  try {
    return isDeepStrictEqual(JSON.parse(stdout), expected);
  } catch {
    return false;
  }
}

module.exports = {
  createFunctionDriver,
  functionOutputMatches,
  functionRuntime,
  isValidFunctionName,
};
