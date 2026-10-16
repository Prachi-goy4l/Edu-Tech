const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Student = require('../models/student');
const { HttpError } = require('../utils/http-error');
const asyncHandler = require('../utils/async-handler');

const authenticate = asyncHandler(async (request, _response, next) => {
  const authorization = request.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Authentication is required');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new HttpError(401, 'Invalid or expired token');
    }
    throw error;
  }

  if (!mongoose.isValidObjectId(payload.sub)) {
    throw new HttpError(401, 'Invalid or expired token');
  }

  const student = await Student.findById(payload.sub);
  if (!student) {
    throw new HttpError(401, 'Account no longer exists');
  }
  request.student = student;
  next();
});

function requireAdmin(request, _response, next) {
  if (request.student.role !== 'admin') {
    return next(new HttpError(403, 'Administrator access is required'));
  }
  return next();
}

module.exports = { authenticate, requireAdmin };