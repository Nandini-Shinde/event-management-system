const express = require('express');

const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations
} = require('../controllers/registrationController');

const auth = require('../middleware/auth');

const router = express.Router();

// Authenticated user
router.post('/:eventId', auth, registerForEvent);

// Authenticated user
router.get('/my', auth, getMyRegistrations);

// Authenticated user; controller verifies ownership
router.delete('/:registrationId', auth, cancelRegistration);

// Authenticated organizer/admin; controller verifies permissions
router.get('/event/:eventId', auth, getEventRegistrations);

module.exports = router;