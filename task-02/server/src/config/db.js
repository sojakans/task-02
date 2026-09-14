const mongoose = require('mongoose');

let memoryServer = null;
let cachedPromise = null;

const isConnected = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  // Return immediately if already connected
  if (isConnected()) {
    return mongoose.connection;
  }

  // Reuse an in-flight connection attempt (prevents duplicate connects on serverless cold starts)
  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();

  if (uri) {
    cachedPromise = (async () => {
      try {
        console.log('[DB] Connecting to MongoDB Atlas...');
        console.log(`[DB] URI target: ${uri.replace(/\/\/[^@]+@/, '//<credentials>@')}`);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          bufferCommands: false,
        });
        console.log(`[DB] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      } catch (err) {
        cachedPromise = null; // Allow retry on next invocation
        console.error('[DB] Failed to connect to MongoDB:', err.message);
        throw new Error(
          `MongoDB connection failed: ${err.message}. ` +
          'Checklist: (1) Verify MONGODB_URI is correct in Vercel env vars, ' +
          '(2) In MongoDB Atlas → Network Access, add 0.0.0.0/0 to allow all IPs (required for Vercel), ' +
          '(3) Confirm database user password is correct.'
        );
      }
    })();
    return cachedPromise;
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
    cachedPromise = null;
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
