const express = require('express');
const router = express.Router();
const { askChatbot } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

router.post('/ask', protect, askChatbot);

module.exports = router;
