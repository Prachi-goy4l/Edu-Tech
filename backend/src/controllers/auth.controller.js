const authService = require('../services/auth.service');

async function register(request, response) {
  const result = await authService.register(request.body || {});
  response.status(201).json(result);
}

async function login(request, response) {
  const result = await authService.login(request.body || {});
  response.json(result);
}

async function me(request, response) {
  response.json({ student: authService.publicStudent(request.student) });
}

module.exports = { login, me, register };