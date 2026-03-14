const Message  = require('../models/Message');
const User     = require('../models/User');

const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Join a session room ─────────────────────────────────────────────────
    socket.on('join_session', async ({ sessionId, userId }) => {
      socket.join(sessionId);
      console.log(`👤 ${socket.id} joined session: ${sessionId}`);

      // Fetch joining user's name and broadcast to other room participants
      try {
        const user = await User.findById(userId).select('name').lean();
        if (user) {
          // Broadcast to everyone else in the room (not the joiner themselves)
          socket.to(sessionId).emit('peer_joined', {
            userId,
            userName: user.name,
          });
        }
      } catch (err) {
        console.error('peer_joined lookup error:', err.message);
      }
    });

    // ── Send a message ──────────────────────────────────────────────────────
    socket.on('send_message', async (data) => {
      const { sessionId, senderId, content, type } = data;

      try {
        const message = await Message.create({
          sessionId,
          senderId,
          content,
          type: type || 'text',
        });

        const sender = await User.findById(senderId).select('name').lean();

        io.to(sessionId).emit('receive_message', {
          _id:       message._id,
          sessionId: message.sessionId,
          senderId:  { _id: senderId, name: sender?.name || 'Unknown' },
          content:   message.content,
          type:      message.type,
          createdAt: message.createdAt,
          reactions: [],
        });
      } catch (error) {
        console.error('❌ Message save error:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── Emoji Reaction ──────────────────────────────────────────────────────
    socket.on('react_message', async ({ messageId, emoji, userId, sessionId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        // Toggle: if user already reacted with this emoji, remove it; otherwise add it
        const existingIdx = message.reactions.findIndex(
          r => r.emoji === emoji && r.userId?.toString() === userId
        );

        if (existingIdx > -1) {
          message.reactions.splice(existingIdx, 1);
        } else {
          message.reactions.push({ emoji, userId });
        }

        await message.save();

        // Broadcast updated reactions to the session room
        io.to(sessionId).emit('message_reaction_updated', {
          messageId,
          reactions: message.reactions,
        });
      } catch (err) {
        console.error('Reaction error:', err.message);
      }
    });

    // ── Typing indicators ───────────────────────────────────────────────────
    socket.on('typing', ({ sessionId, userId, userName }) => {
      socket.to(sessionId).emit('user_typing', { userId, userName });
    });

    socket.on('stop_typing', ({ sessionId, userId }) => {
      socket.to(sessionId).emit('user_stop_typing', { userId });
    });

    // ── Leave session ────────────────────────────────────────────────────────
    socket.on('leave_session', (sessionId) => {
      socket.leave(sessionId);
      console.log(`👤 ${socket.id} left session: ${sessionId}`);
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupChatSocket;

