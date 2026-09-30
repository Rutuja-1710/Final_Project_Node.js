const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema(
  {
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true, index: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['preventive', 'corrective', 'inspection'], default: 'preventive' },
    description: { type: String, required: true, trim: true, minlength: 5 },
    performedOn: { type: Date, required: true, default: Date.now },
    photo: { type: String }, // optional, relative path e.g. uploads/171234-abc.jpg
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
