const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const {
  createFunctionDriver,
  functionOutputMatches,
  functionRuntime,
  isValidFunctionName,
} = require('../src/services/function-runner');
const Problem = require('../src/models/problem');

test('recognizes supported Python and Node.js Judge0 runtimes', () => {
  assert.equal(functionRuntime('Python 3.12.0'), 'python');
  assert.equal(functionRuntime('Python (3.8.1)'), 'python');
  assert.equal(functionRuntime('JavaScript (Node.js 12.14.0)'), 'javascript');
  assert.equal(functionRuntime('Node.js 22.08.0'), 'javascript');
  assert.equal(functionRuntime('C++ (GCC 9.2.0)'), null);
});

test('accepts JavaScript identifiers and rejects invalid function names', () => {
  assert.equal(isValidFunctionName('twoSum'), true);
  assert.equal(isValidFunctionName('_solve2'), true);
  assert.equal(isValidFunctionName('two-sum'), false);
  assert.equal(isValidFunctionName('solve()'), false);
});

test('generates a Node.js driver that invokes the student method with JSON arguments', () => {
  const code = createFunctionDriver(
    'class Solution { twoSum(nums, target) { const seen = new Map(); for (let i = 0; i < nums.length; i += 1) { const complement = target - nums[i]; if (seen.has(complement)) return [seen.get(complement), i]; seen.set(nums[i], i); } } }',
    'twoSum',
    'javascript',
  );
  const execution = spawnSync(process.execPath, ['-e', code], {
    encoding: 'utf8',
    input: JSON.stringify([[2, 7, 11], 9]),
  });

  assert.equal(execution.status, 0, execution.stderr);
  assert.equal(execution.stdout.trim(), '[0,1]');
  assert.equal(functionOutputMatches(execution.stdout, [0, 1]), true);
});

test('runs the Sum Two Numbers class method with function-style arguments', () => {
  const code = createFunctionDriver(
    'class Solution { sum(a, b) { return a + b; } }',
    'sum',
    'javascript',
  );
  const execution = spawnSync(process.execPath, ['-e', code], {
    encoding: 'utf8',
    input: JSON.stringify([2, 3]),
  });

  assert.equal(execution.status, 0, execution.stderr);
  assert.equal(execution.stdout.trim(), '5');
  assert.equal(functionOutputMatches(execution.stdout, 5), true);
});

test('compares structured JSON output independent of object key order', () => {
  assert.equal(functionOutputMatches('{"second":2,"first":1}', { first: 1, second: 2 }), true);
  assert.equal(functionOutputMatches('[1,2]', [2, 1]), false);
  assert.equal(functionOutputMatches('not JSON', null), false);
});

test('generates a Python class-method driver', () => {
  const code = createFunctionDriver(
    'class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]',
    'twoSum',
    'python',
  );

  assert.match(code, /Solution\(\)\.twoSum\(\*__edu_args\)/);
  assert.match(code, /json\.loads\(__edu_sys\.stdin\.read\(\)\)/);
});

test('validates function-style problems and rejects malformed function test cases', async () => {
  const validProblem = new Problem({
    slug: 'valid-function',
    title: 'Valid Function',
    description: 'A valid function problem.',
    difficulty: 'easy',
    mode: 'function',
    functionName: 'twoSum',
    testCases: [{ args: [[2, 7], 9], expected: [0, 1], isHidden: false }],
  });
  await assert.doesNotReject(validProblem.validate());

  const invalidProblem = new Problem({
    slug: 'invalid-function',
    title: 'Invalid Function',
    description: 'An invalid function problem.',
    difficulty: 'easy',
    mode: 'function',
    functionName: 'twoSum',
    testCases: [{ input: '2 7', expectedOutput: '0 1', isHidden: false }],
  });
  await assert.rejects(invalidProblem.validate(), /Function test cases must provide/);
});
