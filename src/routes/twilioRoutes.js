const express = require('express');
const router = express.Router();
const { twilioController } = require('../controllers');

router.post('/incoming-call', twilioController.incomingCall);
router.post('/timeout', twilioController.timeout);

module.exports = router;
