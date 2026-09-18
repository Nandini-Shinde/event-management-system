const express = require('express');
const { createOrganizer } = require('../controllers/devController');

const router = express.Router();

router.post('/create-organizer', createOrganizer);

module.exports = router;