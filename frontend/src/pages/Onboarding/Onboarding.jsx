import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Onboarding.css';

const VARK_STYLES = ['Visual', 'Auditory', 'Read-Write', 'Kinesthetic'];
const SUBJECTS = ['Data Structures', 'Machine Learning', 'Web Development', 'Calculus', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Python', 'Java', 'Statistics'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOTS = ['Morning', 'Afternoon', 'Evening'];

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const isMentor = user?.isMentor;

  // Mentors skip Step 2 (subjectsNeeded), so steps are: 1,3,4 → mapped to 1,2,3
  const totalSteps = isMentor ? 3 : 4;

  const [step, setStep] = useState(1);
  const [learningStyle, setLearningStyle] = useState('');
  const [subjectsNeeded, setSubjectsNeeded] = useState([]);
  const [subjectsStrong, setSubjectsStrong] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [gpa, setGpa] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleSubject = (subject, type) => {
    const setter = type === 'needed' ? setSubjectsNeeded : setSubjectsStrong;
    const current = type === 'needed' ? subjectsNeeded : subjectsStrong;
    setter(current.includes(subject) ? current.filter(s => s !== subject) : [...current, subject]);
  };

  const toggleSlot = (slot) => {
    setAvailability(availability.includes(slot) ? availability.filter(s => s !== slot) : [...availability, slot]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.put('/students/onboarding', {
        learningStyle,
        subjectsNeeded: isMentor ? [] : subjectsNeeded,
        subjectsStrong,
        availability,
        gpa: parseFloat(gpa) || 0,
      });
      updateUser({ ...res.data.profile, onboardingComplete: true });
      navigate('/quiz');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  // ── Map logical step to content ────────────────────────────────────────────
  // For mentors: step 1 = style, step 2 = availability, step 3 = expertise + GPA
  // For students: step 1 = style, step 2 = subjects needed, step 3 = availability, step 4 = strong + GPA
  const getContentStep = () => {
    if (isMentor) {
      if (step === 1) return 'style';
      if (step === 2) return 'availability';
      if (step === 3) return 'expertise';
    } else {
      if (step === 1) return 'style';
      if (step === 2) return 'needed';
      if (step === 3) return 'availability';
      if (step === 4) return 'expertise';
    }
  };

  const content = getContentStep();

  return (
    <div className="onboarding-page">
      <div className="onboarding-card fade-in">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
        <p className="step-label">Step {step} of {totalSteps}</p>

        {/* ── Learning/Teaching Style ──────────────────────────────────── */}
        {content === 'style' && (
          <div className="step-content">
            <h2>{isMentor ? "What's your teaching style?" : 'How do you learn best?'}</h2>
            <p className="step-desc">{isMentor ? 'Select how you prefer to teach' : 'Select your primary learning style'}</p>
            <div className="style-grid">
              {VARK_STYLES.map(style => (
                <button key={style} className={`style-btn ${learningStyle === style ? 'active' : ''}`} onClick={() => setLearningStyle(style)}>
                  <span className="style-emoji">{style === 'Visual' ? '👁️' : style === 'Auditory' ? '👂' : style === 'Read-Write' ? '📖' : '🤲'}</span>
                  <span>{style}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Subjects Needed (students only) ─────────────────────────── */}
        {content === 'needed' && (
          <div className="step-content">
            <h2>Subjects I need help with</h2>
            <p className="step-desc">Select the subjects you're struggling with</p>
            <div className="subject-grid">
              {SUBJECTS.map(subj => (
                <button key={subj} className={`subject-btn ${subjectsNeeded.includes(subj) ? 'active' : ''}`} onClick={() => toggleSubject(subj, 'needed')}>
                  {subj}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Availability ────────────────────────────────────────────── */}
        {content === 'availability' && (
          <div className="step-content">
            <h2>My availability</h2>
            <p className="step-desc">{isMentor ? 'When are you available to mentor?' : 'When are you free to study?'}</p>
            <div className="availability-grid">
              <div className="avail-header"><div></div>{DAYS.map(d => <div key={d} className="avail-day">{d}</div>)}</div>
              {SLOTS.map(slot => (
                <div key={slot} className="avail-row">
                  <div className="avail-slot">{slot}</div>
                  {DAYS.map(day => {
                    const key = `${day}_${slot}`;
                    return (
                      <div key={key} className={`avail-cell ${availability.includes(key) ? 'active' : ''}`} onClick={() => toggleSlot(key)}></div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Expert/Strong Subjects + GPA ────────────────────────────── */}
        {content === 'expertise' && (
          <div className="step-content">
            <h2>Almost done!</h2>
            <p className="step-desc">Optional: Tell us more about yourself</p>
            <div className="form-group" style={{ maxWidth: 300 }}>
              <label>GPA (on 4.0 scale)</label>
              <input type="number" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="e.g. 3.2" min="0" max="4" step="0.1" />
            </div>
            <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: '1rem' }}>
              {isMentor ? 'Subjects I can teach' : "Subjects I'm strong at (optional)"}
            </h3>
            <p className="step-desc" style={{ marginBottom: 12 }}>
              {isMentor ? 'Select the subjects you can mentor students in' : 'Help us identify you as a future mentor!'}
            </p>
            <div className="subject-grid">
              {SUBJECTS.filter(s => !subjectsNeeded.includes(s)).map(subj => (
                <button key={subj} className={`subject-btn green ${subjectsStrong.includes(subj) ? 'active' : ''}`} onClick={() => toggleSubject(subj, 'strong')}>
                  {subj}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="step-actions">
          {step > 1 && <button className="btn-back" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < totalSteps ? (
            <button className="btn-next" onClick={() => setStep(step + 1)} disabled={step === 1 && !learningStyle}>Next →</button>
          ) : (
            <button className="btn-next" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Complete Setup ✓'}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
