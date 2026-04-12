const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    classroom: {
      type: String,
      trim: true,
    },
    classroomName: {
      type: String,
      trim: true,
    },
    teacher: {
      type: String,
      default: '',
      trim: true,
    },
    dormName: {
      type: String,
      trim: true,
    },
    roomNumber: {
      type: String,
      trim: true,
    },
    village: {
      type: String,
      trim: true,
    },
    facultyName: {
      type: String,
      trim: true,
    },
    oldCampusArea: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    image: {
      data: Buffer,
      contentType: String,
      fileName: String,
      size: Number,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    declinedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    completionDetails: {
      actionTaken: { type: String, trim: true },
      rootCause: { type: String, trim: true },
      materialsUsed: { type: String, trim: true },
      costDetail: { type: String, trim: true },
      proofOfWork: {
        data: Buffer,
        contentType: String,
        fileName: String,
        size: Number,
      },
      notesAndRemarks: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
