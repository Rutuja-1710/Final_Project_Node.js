const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const { uploadDir } = require('../config/paths');

// Remove an uploaded file (used when a request is rejected after Multer already saved it)
const discardUpload = (req) => {
  if (req.file) fs.unlink(path.join(uploadDir, req.file.filename), () => {});
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  discardUpload(req);
  res.status(422).json({
    message: 'Validation failed',
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

module.exports = { validate, discardUpload };
