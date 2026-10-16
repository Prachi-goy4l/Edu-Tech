const problemService = require('../services/problem.service');
const { HttpError } = require('../utils/http-error');

function positiveInteger(value, fallback, maximum) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new HttpError(400, `Value must be an integer between 1 and ${maximum}`);
  }
  return parsed;
}

async function list(request, response) {
  const result = await problemService.list({
    difficulty: request.query.difficulty,
    search: request.query.search,
    page: positiveInteger(request.query.page, 1, 1000000),
    limit: positiveInteger(request.query.limit, 20, 100),
  });
  response.json(result);
}

async function getBySlug(request, response) {
  response.json({ problem: await problemService.getBySlug(request.params.slug) });
}

async function create(request, response) {
  response.status(201).json({ problem: await problemService.create(request.body) });
}

module.exports = { create, getBySlug, list };
