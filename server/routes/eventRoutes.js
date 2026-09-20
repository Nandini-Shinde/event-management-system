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
  authorizeRoles('admin'),
  createEvent
);

router.put(
  '/:id',
  auth,
  authorizeRoles('admin'),
  updateEvent
);

router.delete(
  '/:id',
  auth,
  authorizeRoles('admin'),
  deleteEvent
);

module.exports = router;
