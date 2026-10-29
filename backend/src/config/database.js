const mongoose = require('mongoose');

let connectionPromise;

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  if (mongoose.connection.readyState === 1) return;
  if (!connectionPromise || mongoose.connection.readyState === 0) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        console.log(`Connected to MongoDB database "${mongoose.connection.name}"`);
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }
  await connectionPromise;
}

module.exports = connectToDatabase;
