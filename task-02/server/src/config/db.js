const mongoose = require('mongoose');

let memoryServer = null;

const isConnected = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  if (isConnected()) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();

  if (uri) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err.message);
      throw new Error(`MongoDB connection failed: ${err.message}. Check MONGODB_URI, Atlas credentials, and Network Access (allow 0.0.0.0/0 for Vercel).`);
    }
  }

  if (process.env.VERCEL) {
    throw new Error('MONGODB_URI is not set. Add it in Vercel → Project Settings → Environment Variables.');
  }

  // Fallback to MongoMemoryServer for development / evaluation environment
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    console.log(`Initializing in-memory MongoDB instance: ${memoryUri}`);
    const conn = await mongoose.connect(memoryUri);
    console.log(`In-memory MongoDB Connected successfully.`);
    return conn;
  } catch (err) {
    console.error('Failed to initialize in-memory MongoDB fallback:', err);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log('MongoDB disconnected.');
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
};

module.exports = { connectDB, disconnectDB, isConnected };
