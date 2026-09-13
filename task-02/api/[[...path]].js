const { connectDB, isConnected } = require('../server/src/config/db');
const { seedProducts } = require('../server/src/seeds/seedProducts');
const { seedDemoUser } = require('../server/src/seeds/seedDemoUser');
const app = require('../server/src/app');

let ready;

const ensureReady = async () => {
  if (!ready) {
    ready = (async () => {
      if (!isConnected()) {
        await connectDB();
      }
      await seedProducts();
      await seedDemoUser();
    })().catch((err) => {
      ready = undefined;
      throw err;
    });
  }
  return ready;
};

module.exports = async (req, res) => {
  try {
    await ensureReady();
  } catch (err) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      statusCode: 503,
      message: err.message || 'Database is not connected. Set MONGODB_URI in Vercel environment variables.',
    }));
    return;
  }

  return app(req, res);
};
