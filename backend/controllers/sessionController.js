const Session = require('../models/Session');
const Message = require('../models/Message');

// @desc    Start a session
// @route   POST /api/sessions/start
const startSession = async (req, res) => {
  const { mentorId, subject, matchScore } = req.body;

  if (!mentorId || !subject) {
    return res.status(400).json({ message: 'mentorId and subject are required' });
  }

  // Check if there's already an active session between this student and mentor
  const existing = await Session.findOne({
    studentId: req.user._id,
    mentorId,
    status: 'active',
  }).populate('studentId', 'name email').populate('mentorId', 'name email mentorProfile');

  if (existing) {
    return res.status(200).json({ ...existing.toObject(), resumed: true });
  }

  const session = await Session.create({
    studentId:  req.user._id,
    mentorId,
    subject,
    matchScore: matchScore || 0,
    status:     'active',
    startedAt:  new Date(),
  });

  const populated = await Session.findById(session._id)
    .populate('studentId', 'name email')
    .populate('mentorId', 'name email mentorProfile');

  res.status(201).json(populated);
};


// @desc    End a session — emit 'session_ended' to both participants via Socket
// @route   PUT /api/sessions/:id/end
const endSession = async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  const isParticipant =
    session.studentId.toString() === req.user._id.toString() ||
    session.mentorId.toString()  === req.user._id.toString();

  if (!isParticipant) {
    return res.status(403).json({ message: 'Not authorized to end this session' });
  }

  session.status          = 'completed';
  session.endedAt         = new Date();
  session.durationMinutes = Math.round((session.endedAt - session.startedAt) / 60000);
  await session.save();

  // Broadcast to everyone in the session room so the other participant gets redirected
  const io = req.app.locals.io;
  if (io) {
    io.to(session._id.toString()).emit('session_ended', {
      sessionId:   session._id.toString(),
      endedBy:     req.user._id.toString(),
      endedByName: req.user.name || 'Your partner',
    });
  }

  res.json(session);
};


// @desc    Get my sessions
// @route   GET /api/sessions
const getMySessions = async (req, res) => {
  const sessions = await Session.find({
    $or: [{ studentId: req.user._id }, { mentorId: req.user._id }],
  })
    .populate('studentId', 'name email')
    .populate('mentorId', 'name email mentorProfile')
    .sort('-createdAt');

  res.json(sessions);
};


// @desc    Get messages for a session
// @route   GET /api/sessions/:id/messages
const getSessionMessages = async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  const isParticipant =
    session.studentId.toString() === req.user._id.toString() ||
    session.mentorId.toString()  === req.user._id.toString();

  if (!isParticipant) {
    return res.status(403).json({ message: 'Not authorized to view this session' });
  }

  const messages = await Message.find({ sessionId: req.params.id })
    .populate('senderId', 'name')
    .sort('createdAt');

  res.json(messages);
};


// @desc    Get a single session by ID
// @route   GET /api/sessions/:id
const getSession = async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('mentorId', 'name email mentorProfile');

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  // Safe participant check (handles both populated object and raw ObjectId)
  const studentId = session.studentId?._id?.toString() || session.studentId?.toString();
  const mentorId  = session.mentorId?._id?.toString()  || session.mentorId?.toString();

  if (studentId !== req.user._id.toString() && mentorId !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  res.json(session);
};

module.exports = { startSession, endSession, getMySessions, getSessionMessages, getSession };
