const express = require('express');

const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations
} = require('../controllers/registrationController');

const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

const router = express.Router();

router.post('/:eventId', auth, registerForEvent);
router.get('/my', auth, getMyRegistrations);
router.delete('/:registrationId', auth, cancelRegistration);

router.get(
  '/event/:eventId',
  auth,
  authorizeRoles('admin'),
  getEventRegistrations
);

module.exports = router;
