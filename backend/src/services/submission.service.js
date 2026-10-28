const Problem = require('../models/problem');
const Submission = require('../models/submission');
const Student = require('../models/student');
const { execute, listLanguages } = require('./judge0.service');
const {
  createFunctionDriver,
  functionOutputMatches,
  isValidFunctionName,
} = require('./function-runner');
const { HttpError } = require('../utils/http-error');
const { buildLeaderboard } = require('./leaderboard');

const MAX_SOURCE_LENGTH = 100000;
const MAX_TEST_CASES = 50;

function validateCode({ sourceCode, languageId }) {
  if (typeof sourceCode !== 'string' || !sourceCode.trim() || sourceCode.length > MAX_SOURCE_LENGTH) {
    throw new HttpError(400, 'Source code must be between 1 and 100,000 characters');
  }
  if (!Number.isInteger(languageId) || languageId < 1) {
    throw new HttpError(400, 'A valid Judge0 languageId is required');
  }
}

function validateProblemSlug(problemSlug) {
  if (typeof problemSlug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(problemSlug)) {
    throw new HttpError(400, 'A valid problemSlug is required');
  }
}

function normalizedOutput(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

function mapVerdict(statusId) {
  if (statusId === 3) return 'accepted';
  if (statusId === 4) return 'wrong_answer';
  if (statusId === 5) return 'time_limit_exceeded';
  if (statusId === 6) return 'compilation_error';
  if (statusId >= 7 && statusId <= 12) return 'runtime_error';
  if (statusId === 13) return 'internal_error';
  if (statusId === 14) return 'runtime_error';
  return 'internal_error';
}

function safeResult(testResult) {
  const result = {
    passed: testResult.passed,
    isHidden: testResult.isHidden,
  };
  if (!testResult.isHidden) {
    result.status = testResult.status;
    result.stdout = testResult.stdout;
    result.stderr = testResult.stderr;
    result.compileOutput = testResult.compileOutput;
    result.message = testResult.message;
  }
  return result;
}

async function evaluate({
  sourceCode,
  languageId,
  testCases,
  mode = 'stdin',
  functionName,
  runtime,
}) {
  const results = [];
  let totalRuntime = 0;
  let maxMemory = 0;
  let hasRuntime = false;
  let hasMemory = false;

  for (const testCase of testCases) {
    const functionMode = mode === 'function';
    const execution = await execute({
      sourceCode: functionMode
        ? createFunctionDriver(sourceCode, functionName, runtime)
        : sourceCode,
      languageId,
      input: functionMode ? JSON.stringify(testCase.args) : testCase.input,
    });
    const statusId = execution.status?.id;
    const status = mapVerdict(statusId);
    const passed = statusId === 3
      && (functionMode
        ? functionOutputMatches(execution.stdout, testCase.expected)
        : normalizedOutput(execution.stdout) === normalizedOutput(testCase.expectedOutput));
    const verdict = passed ? 'accepted' : (status === 'accepted' ? 'wrong_answer' : status);

    if (execution.time !== null && execution.time !== undefined && Number.isFinite(Number(execution.time))) {
      totalRuntime += Number(execution.time);
      hasRuntime = true;
    }
    if (execution.memory !== null && execution.memory !== undefined && Number.isFinite(Number(execution.memory))) {
      maxMemory = Math.max(maxMemory, Number(execution.memory));
      hasMemory = true;
    }

    results.push({
      passed,
      isHidden: testCase.isHidden,
      status: verdict,
      stdout: testCase.isHidden ? null : (execution.stdout || null),
      stderr: testCase.isHidden ? null : (execution.stderr || null),
      compileOutput: testCase.isHidden ? null : (execution.compile_output || null),
      message: testCase.isHidden ? null : (execution.message || execution.status?.description || null),
    });
  }

  const passedCount = results.filter((result) => result.passed).length;
  let verdict = 'accepted';
  if (passedCount !== results.length) {
    const failure = results.find((result) => !result.passed);
    verdict = failure.status;
  }

  return {
    verdict,
    score: Math.floor((passedCount / results.length) * 100),
    runtime: hasRuntime ? Number(totalRuntime.toFixed(3)) : null,
    memory: hasMemory ? maxMemory : null,
    results,
  };
}

async function functionRuntimeForLanguage(languageId) {
  const languages = await listLanguages();
  const language = languages.find((item) => item.id === languageId);
  if (!language || !language.functionSupported) {
    throw new HttpError(400, 'Function-style problems support Python 3 and Node.js only');
  }
  return language.name.toLowerCase().includes('python') ? 'python' : 'javascript';
}

function validateFunctionProblem(problem, testCases) {
  if (!isValidFunctionName(problem.functionName)) {
    throw new HttpError(400, 'Problem has an invalid function name');
  }
  if (!testCases.length || testCases.length > MAX_TEST_CASES
    || testCases.some((testCase) => !Array.isArray(testCase.args)
      || testCase.expected === undefined)) {
    throw new HttpError(400, 'Problem has invalid function test cases');
  }
}

async function run({ problemSlug, sourceCode, languageId }) {
  validateCode({ sourceCode, languageId });
  validateProblemSlug(problemSlug);
  const problem = await Problem.findOne({ slug: problemSlug });
  if (!problem) throw new HttpError(404, 'Problem not found');

  const testCases = problem.testCases.filter((testCase) => !testCase.isHidden);
  const functionMode = problem.mode === 'function';
  if (functionMode) {
    validateFunctionProblem(problem, testCases);
  } else if (!testCases.length || testCases.length > MAX_TEST_CASES) {
    throw new HttpError(400, 'Problem has an invalid number of public test cases');
  }
  const runtime = functionMode ? await functionRuntimeForLanguage(languageId) : null;
  const result = await evaluate({
    sourceCode,
    languageId,
    testCases,
    mode: functionMode ? 'function' : 'stdin',
    functionName: problem.functionName,
    runtime,
  });
  return {
    verdict: result.verdict,
    score: result.score,
    runtime: result.runtime,
    memory: result.memory,
    testResults: result.results.map(safeResult),
  };
}

async function submit({ studentId, problemSlug, sourceCode, languageId }) {
  validateCode({ sourceCode, languageId });
  validateProblemSlug(problemSlug);
  const problem = await Problem.findOne({ slug: problemSlug });
  if (!problem) throw new HttpError(404, 'Problem not found');
  const functionMode = problem.mode === 'function';
  if (functionMode) {
    validateFunctionProblem(problem, problem.testCases);
  } else if (!problem.testCases.length || problem.testCases.length > MAX_TEST_CASES) {
    throw new HttpError(400, 'Problem has an invalid number of test cases');
  }

  const runtime = functionMode ? await functionRuntimeForLanguage(languageId) : null;
  const result = await evaluate({
    sourceCode,
    languageId,
    testCases: problem.testCases,
    mode: functionMode ? 'function' : 'stdin',
    functionName: problem.functionName,
    runtime,
  });
  const submissionData = {
    student: studentId,
    problem: problem.id,
    languageId,
    sourceCode,
    verdict: result.verdict,
    score: result.score,
    runtime: result.runtime,
    memory: result.memory,
    testResults: result.results,
    createdAt: new Date(),
  };
  const submission = await Submission.create(submissionData);

  return {
    id: submission.id,
    problem: { slug: problem.slug, title: problem.title },
    verdict: result.verdict,
    score: result.score,
    runtime: result.runtime,
    memory: result.memory,
    testResults: result.results.map(safeResult),
    createdAt: submission.createdAt,
  };
}

function serializeSubmission(submission, includeSource = false) {
  const result = {
    id: submission.id,
    problem: submission.problem,
    languageId: submission.languageId,
    verdict: submission.verdict,
    score: submission.score,
    runtime: submission.runtime,
    memory: submission.memory,
    testResults: submission.testResults.map(safeResult),
    createdAt: submission.createdAt,
  };
  if (includeSource) result.sourceCode = submission.sourceCode;
  return result;
}

async function history({ studentId, page, limit, problemSlug }) {
  const filter = { student: studentId };
  if (problemSlug) {
    validateProblemSlug(problemSlug);
    const problem = await Problem.findOne({ slug: problemSlug }).select('_id');
    if (!problem) throw new HttpError(404, 'Problem not found');
    filter.problem = problem.id;
  }

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .populate('problem', 'slug title difficulty')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Submission.countDocuments(filter),
  ]);
  return {
    submissions: submissions.map((submission) => serializeSubmission(submission)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function adminHistory({ page, limit, verdict }) {
  const verdicts = [
    'accepted',
    'wrong_answer',
    'time_limit_exceeded',
    'compilation_error',
    'runtime_error',
    'internal_error',
  ];
  if (verdict) {
    if (!verdicts.includes(verdict)) {
      throw new HttpError(400, 'Verdict is not valid');
    }
  }

  const [aggregateResult, studentCount, problemCount] = await Promise.all([
    Submission.aggregate([
      {
        $lookup: {
          from: Student.collection.name,
          localField: 'student',
          foreignField: '_id',
          as: 'studentData',
        },
      },
      { $unwind: '$studentData' },
      {
        $lookup: {
          from: Problem.collection.name,
          localField: 'problem',
          foreignField: '_id',
          as: 'problemData',
        },
      },
      { $unwind: '$problemData' },
      {
        $facet: {
          submissions: [
            ...(verdict ? [{ $match: { verdict } }] : []),
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                id: { $toString: '$_id' },
                student: { name: '$studentData.name', email: '$studentData.email' },
                problem: {
                  slug: '$problemData.slug',
                  title: '$problemData.title',
                  difficulty: '$problemData.difficulty',
                },
                languageId: 1,
                verdict: 1,
                score: 1,
                runtime: 1,
                memory: 1,
                createdAt: 1,
              },
            },
          ],
          filteredTotal: [
            ...(verdict ? [{ $match: { verdict } }] : []),
            { $count: 'count' },
          ],
          stats: [
            {
              $group: {
                _id: null,
                submissions: { $sum: 1 },
                acceptedSubmissions: {
                  $sum: { $cond: [{ $eq: ['$verdict', 'accepted'] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
    ]),
    Student.countDocuments({ role: 'student' }),
    Problem.countDocuments(),
  ]);
  const result = aggregateResult[0];
  const stats = result.stats[0] || { submissions: 0, acceptedSubmissions: 0 };
  return {
    stats: {
      submissions: stats.submissions,
      acceptedSubmissions: stats.acceptedSubmissions,
      students: studentCount,
      problems: problemCount,
    },
    submissions: result.submissions,
    pagination: {
      page,
      limit,
      total: result.filteredTotal[0]?.count || 0,
      pages: Math.ceil((result.filteredTotal[0]?.count || 0) / limit),
    },
  };
}

async function adminLeaderboard() {
  const [students, acceptedProblems] = await Promise.all([
    Student.find({ role: 'student' }).select('_id name').lean(),
    Submission.aggregate([
      { $match: { verdict: 'accepted' } },
      {
        $lookup: {
          from: Problem.collection.name,
          localField: 'problem',
          foreignField: '_id',
          as: 'problemData',
        },
      },
      { $unwind: '$problemData' },
      {
        $group: {
          _id: { studentId: '$student', problemId: '$problem' },
          difficulty: { $first: '$problemData.difficulty' },
        },
      },
      {
        $project: {
          _id: 0,
          studentId: '$_id.studentId',
          problemId: '$_id.problemId',
          difficulty: 1,
        },
      },
    ]),
  ]);
  return buildLeaderboard(students, acceptedProblems);
}

async function getById({ studentId, submissionId }) {
  const submission = await Submission.findOne({
    _id: submissionId,
    student: studentId,
  }).populate('problem', 'slug title difficulty');
  if (!submission) throw new HttpError(404, 'Submission not found');
  return serializeSubmission(submission, true);
}

module.exports = {
  adminHistory,
  adminLeaderboard,
  getById,
  history,
  listLanguages,
  run,
  submit,
};
