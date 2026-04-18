const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { customerName, items, total, status, time } = req.body;

    const newOrder = await Order.create({
      customer: req.user._id,
      customerName,
      items,
      total,
      status: status || 'Pending',
      time
    });

    res.status(201).json({
      success: true,
      data: newOrder
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/orders
// @desc    Get orders (all for admin/staff, only own for student)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let orders;
    
    // If regular user/student, only return their own orders
    if (req.user.role === 'student' || req.user.role === 'user') {
      orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    } else {
      // Admin/Staff can see all orders
      orders = await Order.find().sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Staff/Admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    // Only allow staff/admin to update status
    if (req.user.role === 'student' || req.user.role === 'user') {
      return res.status(403).json({ success: false, message: 'Not authorized to update status' });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
