const mongoose = require('mongoose');

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to MongoDB database "${mongoose.connection.name}"`);
}

module.exports = connectToDatabase;
