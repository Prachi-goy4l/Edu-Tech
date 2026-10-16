require('dotenv').config();

const app = require('./app');
const connectToDatabase = require('./config/database');

const port = Number(process.env.PORT || 5000);

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  await connectToDatabase();
  const server = app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});