const express = require('express');
const multer = require('multer');
const Report = require('../models/Report');
const { protect } = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', protect, async (req, res) => {
  try {
    const filter = (req.user.role === 'reporter' || req.user.role === 'dorm parent') ? { reportedBy: req.user._id } : {};

    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
    });
  }
});

router.get('/all', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'maintenance worker' && req.user.specialization) {
      const spec = req.user.specialization.toLowerCase();
      let categoryMatch = req.user.specialization; // Fallback

      // Map common specializations to exact category names
      if (spec.includes('plumb')) categoryMatch = 'Plumbing';
      else if (spec.includes('elect')) categoryMatch = 'Electrical';
      else if (spec.includes('furn') || spec.includes('carpen')) categoryMatch = 'Furniture';
      
      // Use a case-insensitive regular expression match
      filter.category = { $regex: new RegExp(`^${categoryMatch}$`, 'i') };
    }

    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all reports',
    });
  }
});

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { 
      location, 
      classroomName, 
      teacher, 
      dormName, 
      roomNumber, 
      village, 
      facultyName, 
      oldCampusArea, 
      category, 
      urgency, 
      status, 
      description 
    } = req.body;

    const reportPayload = {
      location,
      classroomName,
      teacher,
      dormName,
      roomNumber,
      village,
      facultyName,
      oldCampusArea,
      category,
      urgency,
      status,
      description,
      reportedBy: req.user._id,
    };

    if (req.file) {
      reportPayload.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
        size: req.file.size,
      };
    }

    const report = await Report.create(reportPayload);

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create report',
    });
  }
});

router.get('/assigned', protect, async (req, res) => {
  try {
    const reports = await Report.find({ assignedTo: req.user._id, status: { $in: ['Pending', 'In Progress'] } }).populate('reportedBy').populate('assignedTo').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const reports = await Report.find({ assignedTo: req.user._id, status: 'Resolved' }).populate('reportedBy').populate('assignedTo').sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.put('/:id/assign', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to assign tasks' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Please provide a user ID to assign' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.assignedTo = userId;
    report.assignedAt = Date.now();
    // Move status to In Progress or keep Pending unless accepted? Let's say In Progress for now, 
    // or maybe 'Pending' if the user still needs to accept? But usually assignment means it's assigned.
    if (report.status === 'Pending') {
      report.status = 'In Progress';
    }

    await report.save();
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to assign task' });
  }
});

router.put('/:id/accept', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.assignedTo) {
      return res.status(400).json({ success: false, message: 'Task is already locked/accepted by another user' });
    }

    report.assignedTo = req.user._id;
    report.assignedAt = Date.now();
    report.status = 'In Progress';

    await report.save();

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to accept task' });
  }
});

router.put('/:id/decline', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.assignedTo && report.assignedTo.toString() === req.user._id.toString()) {
      // Unassign if currently assigned to this user
      report.assignedTo = null;
      report.assignedAt = null;
      report.status = 'Pending';
    }

    if (!report.declinedBy.includes(req.user._id)) {
      report.declinedBy.push(req.user._id);
    }

    await report.save();

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to decline task' });
  }
});

router.put('/:id/resolve', protect, upload.single('proofOfWork'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.assignedTo && report.assignedTo.toString() === req.user._id.toString()) {
      report.status = 'Resolved';
      
      const { actionTaken, rootCause, materialsUsed, costDetail, notesAndRemarks } = req.body;
      
      const completionData = {
        actionTaken,
        rootCause,
        materialsUsed,
        costDetail,
        notesAndRemarks
      };

      if (req.file) {
        completionData.proofOfWork = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
          size: req.file.size
        };
      }

      report.completionDetails = completionData;
      report.markModified('completionDetails');

      await report.save();
      return res.status(200).json({ success: true, data: report });
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized to resolve this task' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to resolve task' });
  }
});

module.exports = router;
