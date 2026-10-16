const Problem = require('../models/problem');
const { HttpError } = require('../utils/http-error');
const { isValidFunctionName } = require('./function-runner');

function publicProblem(problem, includeDescription = false) {
  const mode = problem.mode || 'stdin';
  const result = {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    mode,
    functionName: mode === 'function' ? problem.functionName : undefined,
    tags: problem.tags,
    constraints: problem.constraints,
    starterCode: problem.starterCode instanceof Map
      ? Object.fromEntries(problem.starterCode)
      : { ...(problem.starterCode || {}) },
    sampleTests: problem.testCases
      .filter((testCase) => !testCase.isHidden)
      .map((testCase) => mode === 'function'
        ? { args: testCase.args, expected: testCase.expected }
        : { input: testCase.input, expectedOutput: testCase.expectedOutput }),
  };
  if (includeDescription) result.description = problem.description;
  return result;
}

async function list({ difficulty, search, page = 1, limit = 20 }) {
  const filter = {};
  if (difficulty) {
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      throw new HttpError(400, 'Difficulty must be easy, medium, or hard');
    }
    filter.difficulty = difficulty;
  }
  if (search) {
    if (typeof search !== 'string' || search.length > 100) {
      throw new HttpError(400, 'Search must be 100 characters or fewer');
    }
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { tags: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const [problems, total] = await Promise.all([
    Problem.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Problem.countDocuments(filter),
  ]);
  return {
    problems: problems.map((problem) => publicProblem(problem)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function getBySlug(slug) {
  const problem = await Problem.findOne({ slug });
  if (!problem) throw new HttpError(404, 'Problem not found');
  return publicProblem(problem, true);
}

async function create(data = {}) {
  if (!Array.isArray(data.testCases) || data.testCases.length === 0) {
    throw new HttpError(400, 'At least one test case is required');
  }
  const mode = data.mode || 'stdin';
  if (!['stdin', 'function'].includes(mode)) {
    throw new HttpError(400, 'Problem mode must be stdin or function');
  }
  if (mode === 'function') {
    if (!isValidFunctionName(data.functionName)) {
      throw new HttpError(400, 'A valid functionName is required');
    }
    if (data.testCases.some((testCase) => !testCase || !Array.isArray(testCase.args)
      || testCase.expected === undefined)) {
      throw new HttpError(400, 'Function test cases must provide args and expected values');
    }
  } else if (data.testCases.some((testCase) => !testCase || typeof testCase.input !== 'string'
    || typeof testCase.expectedOutput !== 'string')) {
    throw new HttpError(400, 'Standard-input test cases must provide input and expectedOutput strings');
  }
  return publicProblem(await Problem.create({ ...data, mode }), true);
}

module.exports = { create, getBySlug, list };
