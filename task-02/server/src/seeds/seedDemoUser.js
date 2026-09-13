const User = require('../models/User');

const DEMO_EMAIL = 'engineer@techloom.store';
const DEMO_PASSWORD = 'password123';

const seedDemoUser = async () => {
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    return existing;
  }

  const user = await User.create({
    name: 'Demo Engineer',
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    role: 'engineer',
  });

  console.log(`[Seed] Demo account created: ${DEMO_EMAIL}`);
  return user;
};

module.exports = { seedDemoUser, DEMO_EMAIL };
