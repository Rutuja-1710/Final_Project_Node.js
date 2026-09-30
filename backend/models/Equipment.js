const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    location: { type: String, trim: true },
    serviceIntervalDays: { type: Number, required: true, min: 1, default: 30 },
    // null until the first maintenance log is recorded
    lastServicedDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
