const express = require('express');

const {
  createOrganizer,
  promoteAdmin,
  transferEvent
} = require('../controllers/devController');

const router = express.Router();

router.post('/create-organizer', createOrganizer);
router.post('/promote-admin', promoteAdmin);
router.post('/transfer-event', transferEvent);

module.exports = router;