const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/student');
const { HttpError } = require('../utils/http-error');

function createToken(student) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }

  return jwt.sign(
    { sub: student.id, role: student.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

function publicStudent(student) {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    role: student.role,
  };
}

async function register({ name, email, password } = {}) {
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    throw new HttpError(400, 'Name must be between 2 and 80 characters');
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'A valid email address is required');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new HttpError(400, 'Password must be between 8 and 128 characters');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingStudent = await Student.exists({ email: normalizedEmail });
  if (existingStudent) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const student = await Student.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
  });

  return { token: createToken(student), student: publicStudent(student) };
}

async function login({ email, password } = {}) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Email and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const student = await Student.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!student || !(await bcrypt.compare(password, student.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return { token: createToken(student), student: publicStudent(student) };
}

module.exports = { login, publicStudent, register };