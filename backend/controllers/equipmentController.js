const Equipment = require('../models/Equipment');
const MaintenanceLog = require('../models/MaintenanceLog');

const DAY_MS = 24 * 60 * 60 * 1000;

exports.createEquipment = async (req, res, next) => {
  try {
    const { name, location, serviceIntervalDays } = req.body;
    res.status(201).json(await Equipment.create({ name, location, serviceIntervalDays }));
  } catch (err) { next(err); }
};

exports.listEquipment = async (req, res, next) => {
  try {
    res.json(await Equipment.find().sort({ name: 1 }));
  } catch (err) { next(err); }
};

exports.getEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    res.json(equipment);
  } catch (err) { next(err); }
};

// PATCH /equipment/:id/interval  (supervisor only)
exports.updateInterval = async (req, res, next) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { serviceIntervalDays: req.body.serviceIntervalDays },
      { new: true, runValidators: true }
    );
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    res.json(equipment);
  } catch (err) { next(err); }
};

// GET /equipment/overdue
// Overdue when (lastServicedDate, or createdAt if never serviced) + serviceIntervalDays < now.
// Computed in MongoDB with an aggregation so the frontend never calculates it.
exports.getOverdue = async (req, res, next) => {
  try {
    const now = new Date();
    const overdue = await Equipment.aggregate([
      {
        $addFields: {
          baseDate: { $ifNull: ['$lastServicedDate', '$createdAt'] },
          neverServiced: { $eq: [{ $ifNull: ['$lastServicedDate', null] }, null] },
        },
      },
      {
        $addFields: {
          dueDate: { $add: ['$baseDate', { $multiply: ['$serviceIntervalDays', DAY_MS] }] },
        },
      },
      { $match: { dueDate: { $lt: now } } },
      {
        $addFields: {
          daysOverdue: { $floor: { $divide: [{ $subtract: [now, '$dueDate'] }, DAY_MS] } },
        },
      },
      { $project: { baseDate: 0 } },
      { $sort: { dueDate: 1 } }, // most overdue first
    ]);
    res.json({ count: overdue.length, asOf: now, equipment: overdue });
  } catch (err) { next(err); }
};

// GET /equipment/:id/logs  -> maintenance history for one machine
exports.getHistory = async (req, res, next) => {
  try {
    if (!(await Equipment.exists({ _id: req.params.id }))) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    const logs = await MaintenanceLog.find({ equipment: req.params.id })
      .populate('technician', 'name email')
      .sort({ performedOn: -1 });
    res.json(logs);
  } catch (err) { next(err); }
};
