const mongoose = require('mongoose');

const roomAssignmentSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
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
