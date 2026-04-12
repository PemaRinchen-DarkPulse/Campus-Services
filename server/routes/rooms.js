const express = require('express');
const RoomAssignment = require('../models/RoomAssignment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/rooms — fetch all room assignments
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

// POST /api/rooms — create a single room assignment
router.post('/', protect, async (req, res) => {
  try {
    const { studentName, dorm, roomNumber } = req.body;
    if (!studentName || !dorm || !roomNumber) {
      return res.status(400).json({ success: false, message: 'studentName, dorm, and roomNumber are required' });
    }
    const assignment = await RoomAssignment.create({
      studentName: studentName.trim(),
      dorm: dorm.trim(),
      roomNumber: roomNumber.trim(),
      assignedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create room assignment' });
  }
});

// POST /api/rooms/bulk — create multiple room assignments
router.post('/bulk', protect, async (req, res) => {
  try {
    const { assignments } = req.body;
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ success: false, message: 'assignments array is required' });
    }
    for (const a of assignments) {
      if (!a.studentName || !a.dorm || !a.roomNumber) {
        return res.status(400).json({ success: false, message: 'Each assignment must have studentName, dorm, and roomNumber' });
      }
    }
    const docs = assignments.map((a) => ({
      studentName: a.studentName.trim(),
      dorm: a.dorm.trim(),
      roomNumber: a.roomNumber.trim(),
      assignedBy: req.user._id,
    }));
    const created = await RoomAssignment.insertMany(docs);
    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to bulk-create room assignments' });
  }
});

// PUT /api/rooms/:id — update a room assignment
router.put('/:id', protect, async (req, res) => {
  try {
    const { studentName, dorm, roomNumber } = req.body;
    const assignment = await RoomAssignment.findByIdAndUpdate(
      req.params.id,
      { studentName: studentName?.trim(), dorm: dorm?.trim(), roomNumber: roomNumber?.trim() },
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

// DELETE /api/rooms/:id — delete a room assignment
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
