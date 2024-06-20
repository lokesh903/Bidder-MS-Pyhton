const express = require('express');
const { chatController } = require('../controllers');
const router = express.Router();

router.post('/handle-query', chatController.handleQuery);

module.exports = router;
