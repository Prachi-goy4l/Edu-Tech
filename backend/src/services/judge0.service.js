const { HttpError } = require('../utils/http-error');
const { functionRuntime } = require('./function-runner');

const JUDGE0_BASE_URL = (process.env.JUDGE0_BASE_URL || 'https://ce.judge0.com')
  .replace(/\/+$/, '');
const POLL_INTERVAL_MS = Number(process.env.JUDGE0_POLL_INTERVAL_MS || 1000);
const POLL_TIMEOUT_MS = Number(process.env.JUDGE0_POLL_TIMEOUT_MS || 90000);
const LANGUAGE_CACHE_MS = 5 * 60 * 1000;
let languageCache;
let languageCacheExpiresAt = 0;

function judgeHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.JUDGE0_API_KEY) {
    headers['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY;
    if (process.env.JUDGE0_API_HOST) {
      headers['X-RapidAPI-Host'] = process.env.JUDGE0_API_HOST;
    }
  }
  return headers;
}

async function judgeRequest(url, options) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(POLL_TIMEOUT_MS),
      headers: { ...judgeHeaders(), ...(options.headers || {}) },
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new HttpError(504, 'Judge0 request timed out');
    }
    throw new HttpError(502, 'Unable to reach Judge0');
  }

  if (!response.ok) {
    const message = await response.text();
    console.error(`Judge0 returned HTTP ${response.status}: ${message.slice(0, 500)}`);
    throw new HttpError(502, 'Judge0 could not process this request');
  }
  try {
    return await response.json();
  } catch (_error) {
    throw new HttpError(502, 'Judge0 returned an invalid response');
  }
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function execute({ sourceCode, languageId, input }) {
  const tokenResult = await judgeRequest(
    `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`,
    {
      method: 'POST',
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin: input,
        cpu_time_limit: Number(process.env.JUDGE0_CPU_TIME_LIMIT || 2),
        memory_limit: Number(process.env.JUDGE0_MEMORY_LIMIT || 128000),
      }),
    },
  );

  if (!tokenResult.token) {
    throw new HttpError(502, 'Judge0 did not return an execution token');
  }

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await delay(Math.min(POLL_INTERVAL_MS, Math.max(0, deadline - Date.now())));
    const result = await judgeRequest(
      `${JUDGE0_BASE_URL}/submissions/${encodeURIComponent(tokenResult.token)}?base64_encoded=false`,
      { method: 'GET' },
    );
    if (result.status && result.status.id > 2) return result;
  }

  throw new HttpError(504, 'Code execution timed out while waiting for Judge0');
}

async function listLanguages() {
  if (languageCache && Date.now() < languageCacheExpiresAt) return languageCache;
  const languages = await judgeRequest(`${JUDGE0_BASE_URL}/languages/`, { method: 'GET' });
  if (!Array.isArray(languages)) {
    throw new HttpError(502, 'Judge0 returned an invalid language list');
  }
  languageCache = languages.map(({ id, name }) => ({
    id,
    name,
    functionSupported: functionRuntime(name) !== null,
  }));
  languageCacheExpiresAt = Date.now() + LANGUAGE_CACHE_MS;
  return languageCache;
}

module.exports = { execute, listLanguages };
