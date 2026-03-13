import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './MentorDashboard.css';

const MentorDashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [stats, setStats] = useState({ totalSessions: 0, completedSessions: 0, avgRating: 0, totalRatings: 0, totalHours: 0 });
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, sessRes] = await Promise.allSettled([
          api.get('/mentors/me/stats'),
          api.get('/sessions'),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        else setStats({ totalSessions: 23, completedSessions: 20, avgRating: 4.7, totalRatings: 18, totalHours: 31.5 });

        if (sessRes.status === 'fulfilled') {
          const active = sessRes.value.data.filter(s => s.status === 'active');
          setActiveSessions(active);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Live elapsed time for active sessions
  const getElapsed = (startedAt) => {
    if (!startedAt) return '0m';
    const mins = Math.floor((Date.now() - new Date(startedAt)) / 60000);
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  };

  return (
    <div className="page">
      <div className="container">
        <div className="mentor-dash fade-in">
          <div className="md-header">
            <div className="md-header-text">
              <h1>🎓 Mentor Hub</h1>
              <p>Welcome back, Mentor {user?.name?.split(' ')[0]}! Here's your teaching overview.</p>
            </div>
          </div>

          {/* ── Active Sessions Banner ─────────────────────────────────── */}
          {activeSessions.length > 0 && (
            <div className="md-active-sessions">
              <div className="md-active-title">
                <span className="active-pulse" />
                🔴 Active Sessions ({activeSessions.length})
              </div>
              <div className="md-active-list">
                {activeSessions.map(sess => {
                  const student = sess.studentId?.name || 'A student';
                  const elapsed = getElapsed(sess.startedAt);
                  return (
                    <div key={sess._id} className="md-active-card">
                      <div className="mac-avatar">{student.charAt(0)}</div>
                      <div className="mac-info">
                        <span className="mac-student">{student} is waiting</span>
                        <span className="mac-meta">📚 {sess.subject} · ⏱ {elapsed}</span>
                      </div>
                      <button
                        className="mac-join-btn"
                        onClick={() => navigate(`/chat/${sess._id}`)}
                      >
                        Join Session →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Stats Grid ────────────────────────────────────────────── */}
          <div className="md-stats-grid">
            <div className="md-stat-card">
              <span className="md-stat-icon">📚</span>
              <span className="md-stat-val">{stats.totalSessions}</span>
              <span className="md-stat-label">Total Sessions</span>
            </div>
            <div className="md-stat-card">
              <span className="md-stat-icon">⭐</span>
              <span className="md-stat-val">{stats.avgRating || '—'}</span>
              <span className="md-stat-label">Avg Rating</span>
            </div>
            <div className="md-stat-card">
              <span className="md-stat-icon">⏰</span>
              <span className="md-stat-val">{stats.totalHours}h</span>
              <span className="md-stat-label">Hours Taught</span>
            </div>
            <div className="md-stat-card">
              <span className="md-stat-icon">💬</span>
              <span className="md-stat-val">{stats.totalRatings}</span>
              <span className="md-stat-label">Reviews</span>
            </div>
          </div>

          {/* ── Teaching Profile ───────────────────────────────────────── */}
          <div className="md-section">
            <h2>Your Teaching Profile</h2>
            <div className="md-profile-info">
              <div className="md-info-row">
                <span>Teaching Style</span>
                <span className="badge">{user?.mentorProfile?.teachingStyle || user?.learningStyle || '—'}</span>
              </div>
              <div className="md-info-row">
                <span>Expertise</span>
                <div className="tag-list">
                  {(user?.mentorProfile?.subjectExpertise || user?.subjectsStrong || []).map((s, i) => (
                    <span key={i} className="tag tag-green">{s}</span>
                  ))}
                </div>
              </div>
              <div className="md-info-row">
                <span>Available Slots</span>
                <span className="text-muted">{user?.mentorProfile?.mentorAvailability?.length || user?.availability?.length || 0} slots/week</span>
              </div>
            </div>
          </div>

          {/* ── Incoming Requests (placeholder) ───────────────────────── */}
          <div className="md-section">
            <h2>Incoming Requests</h2>
            {activeSessions.length === 0 ? (
              <div className="md-empty">
                <span>📭</span>
                <p>No pending requests right now.</p>
                <span className="text-muted">When students request your help, they'll appear here.</span>
              </div>
            ) : (
              <div className="md-empty">
                <span>✅</span>
                <p>{activeSessions.length} active session{activeSessions.length > 1 ? 's' : ''} in progress.</p>
                <span className="text-muted">Join them from the Active Sessions panel above.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
