const express = require('express');
const router = express.Router();

const chatRoutes = require('./chatRoutes.js');
const twilioRoutes = require('./twilioRoutes.js');

router.use('/', chatRoutes);
router.use('/', twilioRoutes);

module.exports = router;
