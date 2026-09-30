const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { uploadDir } = require('../config/paths');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const allowed = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG or WebP images are allowed'));
  },
});

// the optional photo is sent in the multipart field named "photo"
module.exports = upload.single('photo');
