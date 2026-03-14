import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [sessionsCount, setSessionsCount] = useState(0);
  const [learningHours, setLearningHours] = useState('0h');
  const [sessionsHistory, setSessionsHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Fetch user sessions to dynamically update stats
    api.get('/sessions')
      .then(res => {
        const completed = res.data.filter(s => s.status === 'completed');
        setSessionsCount(completed.length);
        setSessionsHistory(completed);
        
        const totalMins = completed.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
        const hours = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        setLearningHours(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
      })
      .catch(err => console.error('Failed to load sessions for stats', err));
  }, []);

  return (
    <div className="page">
      <div className="container">
        {/* Welcome */}
        <div className="welcome-banner fade-in">
          <div className="welcome-text">
            <h1>👋 Welcome back, {user?.name?.split(' ')[0] || 'there'}!</h1>
            <p>
              {user?.learningStyle
                ? `${user.learningStyle} Learner • Semester ${user.semester}`
                : 'Complete your profile to get started'}
              {user?.isMentor && ' • 🎓 Mentor'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions slide-up">
          {/* Students → Find Mentor */}
          {!user?.isMentor && (
            <Link to="/find-mentor" className="action-card action-primary">
              <span className="action-icon">🔍</span>
              <div>
                <h3>Find a Mentor</h3>
                <p>Get AI-powered mentor recommendations based on your profile</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>
          )}

          {/* Mentors → Mentor Hub */}
          {user?.isMentor && (
            <Link to="/mentor-dashboard" className="action-card action-primary">
              <span className="action-icon">📊</span>
              <div>
                <h3>Mentor Hub</h3>
                <p>Check incoming requests and your mentoring stats</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>
          )}

          {/* Quiz / Skill Assessment for everyone */}
          <Link to="/quiz" className="action-card action-accent">
            <span className="action-icon">🎯</span>
            <div>
              <h3>Skill Assessment</h3>
              <p>{user?.quizCompleted ? 'View your verified skill profile' : 'Take an AI quiz to verify your skills'}</p>
            </div>
            <span className="action-arrow">→</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="dashboard-stats slide-up">
          <div className="stat-card clickable-stat" onClick={() => setShowHistory(!showHistory)}>
            <span className="stat-value">{sessionsCount}</span>
            <span className="stat-label">Sessions 🖱️</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{user?.isMentor ? (user?.mentorProfile?.avgRating || '—') : '—'}</span>
            <span className="stat-label">{user?.isMentor ? 'Avg Rating' : 'Rating'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{learningHours}</span>
            <span className="stat-label">Learning Time</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{user?.isMentor ? (user?.subjectsStrong?.length || 0) : (user?.subjectsNeeded?.length || 0)}</span>
            <span className="stat-label">{user?.isMentor ? 'Expertise' : 'Focus'}</span>
          </div>
        </div>

        {/* Profile completion nudge */}
        {!user?.onboardingComplete && (
          <div className="nudge-card slide-up">
            <div className="nudge-text">
              <h3>📝 Complete Your Profile</h3>
              <p>Take a 2-minute quiz so our AI can find your perfect mentor match.</p>
            </div>
            <Link to="/onboarding" className="btn-primary">Take the Quiz →</Link>
          </div>
        )}

        {/* Learning Profile */}
        {user?.onboardingComplete && (
          <div className="profile-summary slide-up">
            <h2>{user?.isMentor ? 'Your Mentor Profile' : 'Your Learning Profile'}</h2>
            <div className="profile-grid">
              <div className="profile-item">
                <span className="profile-label">{user?.isMentor ? 'Teaching Style' : 'Learning Style'}</span>
                <span className="profile-value badge">{user.learningStyle}</span>
              </div>
              {!user?.isMentor && (
                <div className="profile-item">
                  <span className="profile-label">Subjects Needed</span>
                  <div className="tag-list">
                    {user.subjectsNeeded?.map((s, i) => (
                      <span key={i} className="tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="profile-item">
                <span className="profile-label">{user?.isMentor ? 'Expert Subjects' : 'Strong Subjects'}</span>
                <div className="tag-list">
                  {user.subjectsStrong?.length > 0
                    ? user.subjectsStrong.map((s, i) => <span key={i} className="tag tag-green">{s}</span>)
                    : <span className="text-muted">Not set yet</span>
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session History */}
        {showHistory && (
          <div className="session-history-section slide-up">
            <h2>📜 Session History</h2>
            {sessionsHistory.length === 0 ? (
              <div className="history-empty">No completed sessions yet.</div>
            ) : (
              <div className="history-list">
                {sessionsHistory.map(session => {
                  const partnerName = user?.isMentor 
                    ? session.studentId?.name || 'A student'
                    : session.mentorId?.name || 'A mentor';
                  const date = new Date(session.startedAt).toLocaleDateString([], { 
                    month: 'short', day: 'numeric', year: 'numeric' 
                  });
                  return (
                    <div key={session._id} className="history-card">
                      <div className="hc-header">
                        <span className="hc-subject">{session.subject}</span>
                        <span className="hc-date">{date}</span>
                      </div>
                      <div className="hc-body">
                        <span className="hc-partner">With {partnerName}</span>
                        <span className="hc-duration">⏱️ {session.durationMinutes || 0} mins</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
