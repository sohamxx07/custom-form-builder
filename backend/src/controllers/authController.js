const { User } = require('../models');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        data: null,
        message: 'Name, email, and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({
        data: null,
        message: 'A user with this email already exists',
      });
    }

    // Password hashing is handled automatically by the User model beforeCreate hook
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim(),
    });

    return res.status(201).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        data: null,
        message: error.errors[0]?.message || 'Validation failed',
      });
    }

    return res.status(500).json({
      data: null,
      message: 'An error occurred while registering the user',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        data: null,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({
        data: null,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        data: null,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      message: 'An error occurred during login',
    });
  }
};

module.exports = {
  register,
  login,
};
