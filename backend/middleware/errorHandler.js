const multer = require('multer');

exports.notFound = (req, res) =>
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
  if (err.message && err.message.startsWith('Only JPEG')) return res.status(400).json({ message: err.message });
  if (err.name === 'ValidationError') return res.status(422).json({ message: err.message });
  if (err.name === 'CastError') return res.status(400).json({ message: `Invalid ${err.path}` });
  if (err.code === 11000) return res.status(409).json({ message: 'Duplicate value: ' + Object.keys(err.keyValue).join(', ') });
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};
