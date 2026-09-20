require('dotenv').config();

const connectToDatabase = require('../config/db');
const User = require('../models/User');

const [, , emailArg, passwordArg] = process.argv;

if (!emailArg || !passwordArg) {
  console.error('Usage: node scripts/makeAdmin.js <email> <new-password>');
  process.exit(1);
}

const run = async () => {
  try {
    await connectToDatabase();

    const email = emailArg.trim().toLowerCase();
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error(`No user found with email ${email}`);
    }

    await User.updateMany(
      { role: 'admin', _id: { $ne: user._id } },
      { $set: { role: 'user' } }
    );

    user.role = 'admin';
    user.password = passwordArg;
    await user.save();

    console.log(`Admin account ready: ${user.email}`);
    console.log('Any previous admin accounts were downgraded to regular users.');
  } catch (error) {
    console.error('Failed to make admin:', error.message);
    process.exitCode = 1;
  } finally {
    process.exitCode ??= 0;
    const mongoose = require('mongoose');
    await mongoose.connection.close();
  }
};

run();
