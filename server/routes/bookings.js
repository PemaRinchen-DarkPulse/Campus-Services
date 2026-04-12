const express = require('express');
const Booking = require('../models/Booking');
const { sendBookingStatusEmail } = require('../utils/mailer');

const router = express.Router();

// POST /api/bookings — create a new facility booking (public, no auth required on landing page)
router.post('/', async (req, res) => {
  try {
    const { spaceName, fullName, email, phone, date, timeFrom, durationHours, durationMins, purpose } = req.body;

    if (!spaceName || !fullName || !email || !phone || !date || !timeFrom || !purpose) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const booking = await Booking.create({
      spaceName: spaceName.trim(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      date,
      timeFrom,
      durationHours: Number(durationHours) || 0,
      durationMins: Number(durationMins) || 0,
      purpose: purpose.trim(),
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create booking' });
  }
});

// GET /api/bookings — fetch all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// PATCH /api/bookings/:id/status — update booking status (Approved / Rejected)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (status === 'Approved' || status === 'Rejected') {
      try {
        await sendBookingStatusEmail(booking, status);
      } catch (emailErr) {
        console.error('Failed to send booking status email:', emailErr.message);
      }
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update booking status' });
  }
});

module.exports = router;
