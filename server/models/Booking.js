const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    spaceName: {
      type: String,
      required: [true, 'Space name is required'],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    timeFrom: {
      type: String,
      required: [true, 'Start time is required'],
    },
    durationHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    durationMins: {
      type: Number,
      default: 0,
      min: 0,
      max: 59,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
