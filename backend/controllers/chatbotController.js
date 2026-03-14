const axios   = require('axios');
const Message = require('../models/Message');
const Session = require('../models/Session');

// ── Azure OpenAI configuration ──────────────────────────────────────────────
const AZURE_ENDPOINT   = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_API_KEY    = process.env.AZURE_OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are PeerSync AI Tutor — a friendly, concise study-buddy embedded inside a peer-mentoring chat session.

Guidelines:
• Keep answers SHORT (2-4 sentences) unless the user explicitly asks for a detailed explanation.
• Use simple language appropriate for students.
• When explaining concepts, use analogies and examples.
• You may use markdown formatting: **bold**, *italic*, \`code\`, bullet lists.
• If you don't know the answer, be honest and suggest the student ask their mentor.
• Never generate harmful, biased, or off-topic content.
• Always be encouraging and supportive.`;

/**
 * POST /api/chatbot/ask
 * Body: { sessionId, question, conversationHistory? }
 * Returns the AI answer and saves it as an 'ai' message in the session.
 */
const askChatbot = async (req, res) => {
  const { sessionId, question, conversationHistory } = req.body;

  if (!sessionId || !question?.trim()) {
    return res.status(400).json({ message: 'sessionId and question are required' });
  }

  // Verify session exists and user is a participant
  const session = await Session.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  const userId = req.user._id.toString();
  const isParticipant =
    session.studentId.toString() === userId ||
    session.mentorId.toString()  === userId;

  if (!isParticipant) {
    return res.status(403).json({ message: 'Not authorized for this session' });
  }

  // Build messages array for Azure OpenAI
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

  // Include recent conversation history for context (last 10 messages)
  if (conversationHistory && Array.isArray(conversationHistory)) {
    const recent = conversationHistory.slice(-10);
    for (const msg of recent) {
      if (msg.type === 'ai') {
        messages.push({ role: 'assistant', content: msg.content });
      } else {
        messages.push({ role: 'user', content: msg.content });
      }
    }
  }

  // Add the current question
  messages.push({
    role: 'user',
    content: `[Subject: ${session.subject}] ${question}`,
  });

  try {
    const response = await axios.post(
      AZURE_ENDPOINT,
      {
        messages,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_API_KEY,
        },
        timeout: 30000,
      }
    );

    const aiAnswer = response.data.choices?.[0]?.message?.content?.trim()
                     || 'Sorry, I could not generate a response right now.';

    // Save the AI message to the database
    const aiMessage = await Message.create({
      sessionId,
      senderId: null,
      content: aiAnswer,
      type: 'ai',
    });

    // Broadcast to all participants via Socket.IO
    const io = req.app.locals.io;
    if (io) {
      io.to(sessionId).emit('receive_message', {
        _id:       aiMessage._id,
        sessionId: aiMessage.sessionId,
        senderId:  { _id: 'ai-tutor', name: '🤖 AI Tutor' },
        content:   aiMessage.content,
        type:      'ai',
        createdAt: aiMessage.createdAt,
        reactions: [],
      });
    }

    res.json({
      answer: aiAnswer,
      messageId: aiMessage._id,
    });
  } catch (error) {
    console.error('❌ Azure OpenAI Error:', error.response?.data || error.message);
    res.status(502).json({
      message: 'AI service temporarily unavailable. Please try again.',
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

module.exports = { askChatbot };
