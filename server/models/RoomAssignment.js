const mongoose = require('mongoose');

const roomAssignmentSchema = new mongoose.Schema(
  {
    cardNumber: {
        type: String,
        required: [true, 'Card Number is required'],
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
    },
    grade: {
        type: String,
        required: [true, 'Grade is required'],
        trim: true,
    },
    dorm: {
      type: String,
      required: [true, 'Dorm is required'],
      trim: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoomAssignment', roomAssignmentSchema);
