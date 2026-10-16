const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const problemRoutes = require('./routes/problem.routes');
const submissionRoutes = require('./routes/submission.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();
const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([
  ...configuredOrigins,
  ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173']),
])];

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }));
app.use('/api/submissions', rateLimit({ windowMs: 60 * 1000, limit: 20 }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;