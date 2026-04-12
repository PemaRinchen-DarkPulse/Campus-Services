const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const sendAuthResponse = (res, statusCode, user) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialization: user.specialization,
    },
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, specialization } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      specialization,
    });

    sendAuthResponse(res, 201, user);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Unable to register user',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    sendAuthResponse(res, 200, user);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
});

router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      specialization: req.user.specialization,
    },
  });
});

// Bulk register users
router.post('/bulk-register', protect, async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'users array is required' });
    }

    const results = [];
    for (const u of users) {
      const { name, email, password, phone, role, specialization } = u;
      if (!name || !email || !password) {
        results.push({ email, status: 'error', message: 'Missing required fields (name, email, password)' });
        continue;
      }
      try {
        const existing = await User.findOne({ email });
        if (existing) {
          results.push({ email, name, status: 'error', message: 'Email already exists' });
          continue;
        }
        await User.create({ name, email, password, phone: phone || '', role: role || 'reporter', specialization: specialization || '' });
        results.push({ email, name, status: 'success', message: 'Created' });
      } catch (err) {
        results.push({ email, name, status: 'error', message: err.message || 'Failed to create' });
      }
    }

    res.status(201).json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Bulk register failed' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error fetching users',
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, role, specialization, password } = req.body;
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (specialization !== undefined) user.specialization = specialization;
    if (password) user.password = password;

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

module.exports = router;
