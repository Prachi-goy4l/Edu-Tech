const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const test = require('node:test');
const { authenticate } = require('../src/middlewares/auth.middleware');

test('rejects a signed legacy UUID token before querying MongoDB', async () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
  const token = jwt.sign({ sub: 'f71214dc-9479-402d-8e22-32f61c8896ff' }, process.env.JWT_SECRET);
  const request = {
    get: (header) => (header === 'authorization' ? `Bearer ${token}` : ''),
  };

  try {
    const error = await new Promise((resolve) => {
      authenticate(request, {}, (nextError) => resolve(nextError));
    });

    assert.equal(error.statusCode, 401);
    assert.equal(error.message, 'Invalid or expired token');
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
