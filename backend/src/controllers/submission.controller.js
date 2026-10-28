const submissionService = require('../services/submission.service');
const { HttpError } = require('../utils/http-error');

async function languages(_request, response) {
  response.json({ languages: await submissionService.listLanguages() });
}

function positiveInteger(value, fallback, maximum) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new HttpError(400, `Value must be an integer between 1 and ${maximum}`);
  }
  return parsed;
}

async function run(request, response) {
  const body = request.body || {};
  const result = await submissionService.run({
    problemSlug: body.problemSlug,
    sourceCode: body.sourceCode,
    languageId: body.languageId,
  });
  response.json(result);
}

async function submit(request, response) {
  const body = request.body || {};
  const result = await submissionService.submit({
    studentId: request.student.id,
    problemSlug: body.problemSlug,
    sourceCode: body.sourceCode,
    languageId: body.languageId,
  });
  response.status(201).json({ submission: result });
}

async function history(request, response) {
  const result = await submissionService.history({
    studentId: request.student.id,
    problemSlug: request.query.problemSlug,
    page: positiveInteger(request.query.page, 1, 1000000),
    limit: positiveInteger(request.query.limit, 20, 100),
  });
  response.json(result);
}

async function adminHistory(request, response) {
  const result = await submissionService.adminHistory({
    verdict: request.query.verdict,
    page: positiveInteger(request.query.page, 1, 1000000),
    limit: positiveInteger(request.query.limit, 20, 100),
  });
  response.json(result);
}

async function getById(request, response) {
  response.json({
    submission: await submissionService.getById({
      studentId: request.student.id,
      submissionId: request.params.id,
    }),
  });
}

module.exports = { adminHistory, getById, history, languages, run, submit };
