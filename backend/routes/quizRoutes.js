const express = require('express');
const router  = express.Router();
const { getQuiz, submitQuiz, resetQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.get('/generate', protect, getQuiz);
router.post('/submit',  protect, submitQuiz);
router.delete('/reset', protect, resetQuiz);

module.exports = router;
