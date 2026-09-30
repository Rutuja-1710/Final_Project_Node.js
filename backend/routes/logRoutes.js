const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate } = require('../middleware/validate');
const c = require('../controllers/logController');

// Multer runs BEFORE validation so text fields in multipart bodies are parsed.
// validate() deletes the saved file if validation fails.
router.post(
  '/',
  auth,
  upload,
  [
    body('equipment').isMongoId().withMessage('A valid equipment id is required'),
    body('description').trim().isLength({ min: 5 }).withMessage('Description is required (min 5 characters)'),
    body('type').optional().isIn(['preventive', 'corrective', 'inspection']).withMessage('Invalid maintenance type'),
    body('performedOn')
      .optional({ values: 'falsy' })
      .isISO8601().withMessage('performedOn must be a valid date')
      .custom((v) => new Date(v) <= new Date()).withMessage('performedOn cannot be in the future'),
  ],
  validate,
  c.createLog
);

router.get('/', auth, c.listLogs);

module.exports = router;
