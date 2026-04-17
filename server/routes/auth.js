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
    const { email, password, loginType } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password/card number',
      });
    }

    const user = await User.findOne({ email }).select('+password +cardNumber');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (loginType === 'with-cards') {
      if (user.role !== 'student') {
        return res.status(401).json({
          success: false,
          message: 'Only students can login with cards',
        });
      }
      // Assuming card number is directly matched (or hashed as password, we check both just in case)
      const isCardMatch = password === user.cardNumber || await user.matchPassword(password);
      if (!isCardMatch) {
         return res.status(401).json({
           success: false,
           message: 'Invalid card number',
         });
      }
    } else if (loginType === 'without-cards') {
      if (user.role === 'student' && user.cardNumber) {
        return res.status(401).json({
           success: false,
           message: 'Students must login with their card number',
        });
      }
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }
    } else {
      // standard login fallback
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }
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

// Admin routes for User Management
router.get('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this route' });
    }
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

router.post('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this route' });
    }
    const { name, email, password, role, status, cardNumber, specialization } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    let createData = { name, email, role, status, specialization };
    if (role === 'student') {
      if (!cardNumber) return res.status(400).json({ success: false, message: 'Student must have a tracking Card Number' });
      const existingCard = await User.findOne({ cardNumber });
      if (existingCard) return res.status(400).json({ success: false, message: 'Card Number already in use' });
      createData.cardNumber = cardNumber;
      createData.password = cardNumber; // card number will act as password to login with
    } else {
      createData.password = password || 'password123';
    }

    const user = await User.create(createData);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/users/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this route' });
    }
    
    // If student card number is being changed, update their password so they can log in
    if (req.body.role === 'student' && req.body.cardNumber) {
      req.body.password = req.body.cardNumber;
      // Note: Model validations and pre-save hooks won't run with findByIdAndUpdate if password is included
      // We must fetch the user, update the fields, and save to trigger password hashing.
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      
      const { name, email, role, status, cardNumber, password, specialization } = req.body;
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (status) user.status = status;
      if (cardNumber) user.cardNumber = cardNumber;
      if (specialization !== undefined) user.specialization = specialization;
      if (password) user.password = password; // will be hashed in pre-save hook
      
      await user.save();
      return res.status(200).json({ success: true, data: user });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Error updating user' });
  }
});

router.delete('/users/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this route' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error deleting user' });
  }
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
