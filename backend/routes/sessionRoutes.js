const express = require('express');
const router = express.Router();
const {
  startSession,
  endSession,
  getMySessions,
  getSessionMessages,
  getSession,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.post('/start',           protect, startSession);
router.get('/',                 protect, getMySessions);
router.get('/:id',              protect, getSession);
router.put('/:id/end',          protect, endSession);
router.get('/:id/messages',     protect, getSessionMessages);

module.exports = router;
