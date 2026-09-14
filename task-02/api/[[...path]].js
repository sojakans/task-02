// Vercel Serverless Entry Point
// NOTE: dotenv is NOT called here because Vercel injects env vars automatically
// and the .env file doesn't exist on Vercel (it's gitignored).
const { connectDB, isConnected } = require('../server/src/config/db');
const { seedProducts } = require('../server/src/seeds/seedProducts');
const { seedDemoUser } = require('../server/src/seeds/seedDemoUser');
const app = require('../server/src/app');

let ready;

console.log('[Serverless] Cold start. MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('[Serverless] JWT_SECRET set:', !!process.env.JWT_SECRET);

const ensureReady = async () => {
  if (!ready) {
    ready = (async () => {
      if (!isConnected()) {
        await connectDB();
      }
      await seedProducts();
      await seedDemoUser();
      console.log('[Serverless] Initialization complete.');
    })().catch((err) => {
      console.error('[Serverless] Initialization FAILED:', err.message);
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
    console.error('[Serverless] Request failed during init:', err.message);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      statusCode: 503,
      message: err.message || 'Database is not connected. Set MONGODB_URI in Vercel environment variables.',
      hint: 'Check Vercel Function Logs for details. Go to: Vercel Dashboard → Your Project → Deployments → (latest) → Functions tab → View logs.',
    }));
    return;
  }

  return app(req, res);
};

