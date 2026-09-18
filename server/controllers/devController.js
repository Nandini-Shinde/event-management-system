const User = require('../models/User');

const createOrganizer = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Development route is not available in production'
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists. Use a new email for the organizer account.'
      });
    }

    // User.js automatically hashes the password before saving.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'organizer'
    });

    const token = user.generateAuthToken();

    return res.status(201).json({
      success: true,
      message: 'Organizer created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Create organizer error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create organizer'
    });
  }
};

module.exports = {
  createOrganizer
};