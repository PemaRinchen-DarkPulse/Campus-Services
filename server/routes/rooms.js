const express = require('express');
const RoomAssignment = require('../models/RoomAssignment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/rooms - fetch all room assignments
router.get('/', protect, async (req, res) => {
  try {
    const assignments = await RoomAssignment.find()
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch room assignments' });
  }
});

// POST /api/rooms - create a single room assignment
router.post('/', protect, async (req, res) => {
  try {
    const { cardNumber, fullName, email, grade, dorm, roomNumber } = req.body;
    if (!cardNumber || !fullName || !email || !grade || !dorm || !roomNumber) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const assignment = await RoomAssignment.create({
      cardNumber: cardNumber.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      grade: grade.trim(),
      dorm: dorm.trim(),
      roomNumber: roomNumber.trim(),
      assignedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create room assignment' });
  }
});

// PUT /api/rooms/:id - update a room assignment
router.put('/:id', protect, async (req, res) => {
  try {
    const { cardNumber, fullName, email, grade, dorm, roomNumber } = req.body;
    const assignment = await RoomAssignment.findByIdAndUpdate(
      req.params.id,
      { 
        cardNumber: cardNumber?.trim(), 
        fullName: fullName?.trim(), 
        email: email?.trim(), 
        grade: grade?.trim(), 
        dorm: dorm?.trim(), 
        roomNumber: roomNumber?.trim() 
      },
      { new: true, runValidators: true }
    );
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Room assignment not found' });
    }
    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update room assignment' });
  }
});

// DELETE /api/rooms/:id - delete a room assignment
router.delete('/:id', protect, async (req, res) => {
  try {
    const assignment = await RoomAssignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Room assignment not found' });
    }
    res.status(200).json({ success: true, message: 'Room assignment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete room assignment' });
  }
});

module.exports = router;
