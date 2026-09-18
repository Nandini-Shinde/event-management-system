const express = require('express');

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post(
  '/',
  auth,
  authorizeRoles('organizer', 'admin'),
  createEvent
);

router.put(
  '/:id',
  auth,
  authorizeRoles('organizer', 'admin'),
  updateEvent
);

router.delete(
  '/:id',
  auth,
  authorizeRoles('organizer', 'admin'),
  deleteEvent
);

module.exports = router;