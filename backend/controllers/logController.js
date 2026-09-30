const Equipment = require('../models/Equipment');
const MaintenanceLog = require('../models/MaintenanceLog');
const { discardUpload } = require('../middleware/validate');

// POST /logs  (multipart/form-data, optional "photo" file)
exports.createLog = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.body.equipment);
    if (!equipment) {
      discardUpload(req);
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const performedOn = req.body.performedOn ? new Date(req.body.performedOn) : new Date();

    const log = await MaintenanceLog.create({
      equipment: equipment._id,
      technician: req.user.id,
      type: req.body.type,
      description: req.body.description,
      performedOn,
      photo: req.file ? `uploads/${req.file.filename}` : undefined,
    });

    // Keep lastServicedDate in sync (a back-dated log never moves it backwards)
    if (!equipment.lastServicedDate || performedOn > equipment.lastServicedDate) {
      equipment.lastServicedDate = performedOn;
      await equipment.save();
    }

    res.status(201).json(log);
  } catch (err) {
    discardUpload(req);
    next(err);
  }
};

// GET /logs?equipment=<id>
exports.listLogs = async (req, res, next) => {
  try {
    const filter = req.query.equipment ? { equipment: req.query.equipment } : {};
    const logs = await MaintenanceLog.find(filter)
      .populate('equipment', 'name')
      .populate('technician', 'name')
      .sort({ performedOn: -1 })
      .limit(200);
    res.json(logs);
  } catch (err) { next(err); }
};
