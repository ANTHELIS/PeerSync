import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Feedback.css';

const Feedback = () => {
  const { sessionId } = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();

  const [session,       setSession]       = useState(null);
  const [overallRating, setOverallRating] = useState(0);
  const [helpfulness,   setHelpfulness]   = useState(0);
  const [clarity,       setClarity]       = useState(0);
  const [styleMatch,    setStyleMatch]    = useState('');
  const [wouldRepeat,   setWouldRepeat]   = useState('');
  const [comment,       setComment]       = useState('');
  const [loading,       setLoading]       = useState(false);
  const [submitted,     setSubmitted]     = useState(false);

  // Load session to get the mentor ID and name
  useEffect(() => {
    api.get(`/sessions/${sessionId}`)
      .then(res => setSession(res.data))
      .catch(err => console.error('Failed to load session:', err.message));
  }, [sessionId]);

  const mentorId   = session?.mentorId?._id || session?.mentorId;
  const mentorName = session?.mentorId?.name || 'your mentor';
  const subject    = session?.subject || 'your session';

  // ── Sub-components ────────────────────────────────────────────────────────
  const StarRow = ({ label, value, setter }) => (
    <div className="rating-row">
      <span className="rating-label">{label}</span>
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className={`star ${star <= value ? 'active' : ''}`}
            onClick={() => setter(star)}
          >
            {star <= value ? '★' : '☆'}
          </button>
        ))}
      </div>
    </div>
  );

  const ToggleRow = ({ label, options, value, setter }) => (
    <div className="toggle-row">
      <span className="rating-label">{label}</span>
      <div className="toggle-btns">
        {options.map(opt => (
          <button
            key={opt.value}
            className={`toggle-btn ${value === opt.value ? 'active' : ''}`}
            onClick={() => setter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (overallRating === 0) return alert('Please rate the session first.');
    setLoading(true);
    try {
      await api.post('/feedback', {
        sessionId,
        mentorId,
        overallRating,
        helpfulnessRating: helpfulness || 3,
        clarityRating:     clarity     || 3,
        styleMatch:        styleMatch  || 'somewhat',
        wouldRepeat:       wouldRepeat || 'maybe',
        comment,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Feedback error:', err.message);
      setSubmitted(true); // still show success screen; ML retraining is non-blocking
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page">
        <div className="container">
          <div className="feedback-success fade-in">
            <span className="success-icon">🎉</span>
            <h2>Thank you for your feedback!</h2>
            <p>Your rating helps our AI make smarter matches for everyone.</p>
            <button className="btn-primary" onClick={() => navigate('/find-mentor')}>
              🔍 Find Another Mentor →
            </button>
            <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="container">
        <div className="feedback-card fade-in">
          <div className="feedback-header">
            <h1>⭐ Rate Your Session</h1>
            <p>
              How was your session with <strong>{mentorName}</strong> on <strong>{subject}</strong>?<br />
              Your feedback trains PeerSync AI to make even better matches.
            </p>
          </div>

          <div className="feedback-body">
            <StarRow label="Overall Experience"        value={overallRating} setter={setOverallRating} />
            <StarRow label="Helpfulness"               value={helpfulness}   setter={setHelpfulness} />
            <StarRow label="Clarity of Explanation"    value={clarity}       setter={setClarity} />

            <ToggleRow
              label="Did the teaching style match your learning style?"
              value={styleMatch} setter={setStyleMatch}
              options={[
                { value: 'yes',      label: '✓ Yes' },
                { value: 'somewhat', label: '~ Somewhat' },
                { value: 'no',       label: '✗ No' },
              ]}
            />

            <ToggleRow
              label="Would you study with this mentor again?"
              value={wouldRepeat} setter={setWouldRepeat}
              options={[
                { value: 'yes',   label: '✓ Yes' },
                { value: 'maybe', label: '~ Maybe' },
                { value: 'no',    label: '✗ No' },
              ]}
            />

            <div className="comment-group">
              <label>Any additional thoughts? (optional)</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What went well? What could be improved?"
                rows={3}
              />
            </div>

            <button
              className="btn-submit-feedback"
              onClick={handleSubmit}
              disabled={loading || overallRating === 0}
            >
              {loading ? '⏳ Submitting...' : 'Submit Feedback →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
