const User = require('../models/User');

const ensureDevelopmentRoute = (res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({
      success: false,
      message: 'Development route is not available in production'
    });

    return false;
  }

  return true;
};

const promoteAdmin = async (req, res) => {
  try {
    if (!ensureDevelopmentRoute(res)) {
      return;
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    user.role = 'admin';
    user.password = password;

    await user.save();

    const token = user.generateAuthToken();

    return res.status(200).json({
      success: true,
      message: 'User promoted to admin and password reset successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Promote admin error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to promote user to admin'
    });
  }
};

module.exports = {
  promoteAdmin
};