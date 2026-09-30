const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve(process.env.UPLOAD_PATH || 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

module.exports = { uploadDir };
