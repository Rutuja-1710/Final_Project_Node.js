const router = require('express').Router();
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validate } = require('../middleware/validate');
const c = require('../controllers/equipmentController');

const idRule = param('id').isMongoId().withMessage('Invalid equipment id');
const intervalRule = body('serviceIntervalDays')
  .isInt({ min: 1, max: 3650 })
  .withMessage('serviceIntervalDays must be a whole number between 1 and 3650')
  .toInt();

router.use(auth);

router.get('/', c.listEquipment);
// /overdue must be declared before /:id, otherwise "overdue" is treated as an id
router.get('/overdue', c.getOverdue);

router.post(
  '/',
  authorizeRoles('supervisor'),
  [body('name').trim().notEmpty().withMessage('Name is required'), intervalRule],
  validate,
  c.createEquipment
);

router.get('/:id', idRule, validate, c.getEquipment);
router.get('/:id/logs', idRule, validate, c.getHistory);

// Supervisor-only: configure the service interval
router.patch('/:id/interval', authorizeRoles('supervisor'), [idRule, intervalRule], validate, c.updateInterval);

module.exports = router;
