import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Quiz.css';

const QUESTION_TIME = 30; // seconds per question

const LEVEL_CONFIG = {
  Expert:       { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: '🏆' },
  Advanced:     { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  icon: '⚡' },
  Intermediate: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  icon: '📈' },
  Beginner:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  icon: '🌱' },
};

const SUBJECT_EMOJIS = {
  'Data Structures':  '🌳', 'Machine Learning': '🤖', 'Web Development': '🌐',
  'Calculus':         '∫',  'Database Systems':  '🗄️', 'Operating Systems': '⚙️',
  'Computer Networks':'🔌', 'Python':            '🐍', 'Java':             '☕',
  'Statistics':       '📊',
};

const Quiz = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [phase, setPhase]         = useState('loading');   // loading|intro|quiz|results
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers]     = useState([]);
  const [selected, setSelected]   = useState(null);       // selected option for current Q
  const [timeLeft, setTimeLeft]   = useState(QUESTION_TIME);
  const [results, setResults]     = useState(null);
  const [profileUpdate, setProfileUpdate] = useState(null); // { promoted, demoted, confirmed, updatedStrong, updatedNeeded }
  const [submitting, setSubmitting] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [animating, setAnimating] = useState(false);

  const timerRef = useRef(null);

  // ── Load Quiz ──────────────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/quiz/generate')
      .then(res => {
        if (res.data.alreadyCompleted) {
          setAlreadyDone(true);
          setResults(res.data.skillScores);
          setPhase('results');
        } else {
          setQuestions(res.data.questions);
          setAnswers(new Array(res.data.total).fill(-1));
          setPhase('intro');
        }
      })
      .catch(err => {
        console.error('Quiz load error:', err.message);
        navigate('/dashboard');
      });
  }, []);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const advanceQuestion = useCallback(() => {
    clearInterval(timerRef.current);
    setAnimating(true);
    setTimeout(() => {
      const next = currentIdx + 1;
      if (next >= questions.length) {
        handleSubmit();
      } else {
        setCurrentIdx(next);
        setSelected(null);
        setTimeLeft(QUESTION_TIME);
        setAnimating(false);
      }
    }, 350);
  }, [currentIdx, questions.length, answers]);

  useEffect(() => {
    if (phase !== 'quiz') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          advanceQuestion();
          return QUESTION_TIME;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, currentIdx, advanceQuestion]);

  // ── Select Answer ──────────────────────────────────────────────────────────
  const selectAnswer = (optIdx) => {
    if (selected !== null) return; // already answered
    setSelected(optIdx);
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optIdx;
    setAnswers(newAnswers);

    // Auto-advance after 1.2s
    setTimeout(() => advanceQuestion(), 1200);
  };

  // ── Submit Quiz ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    setPhase('loading');

    try {
      const res = await api.post('/quiz/submit', { questions, answers });
      setResults(res.data.results);
      setProfileUpdate(res.data.profileUpdate || null);

      // Update AuthContext so navbar/profile reflect the AI-corrected subjects
      updateUser({
        quizCompleted:  true,
        subjectsStrong: res.data.profileUpdate?.updatedStrong || [],
        subjectsNeeded: res.data.profileUpdate?.updatedNeeded || [],
      });

      setPhase('results');
    } catch (err) {
      console.error('Submit error:', err);
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const groupedResults = results
    ? Object.entries(results instanceof Map ? Object.fromEntries(results) : results)
    : [];

  const currentQ   = questions[currentIdx];
  const progress   = questions.length > 0 ? ((currentIdx) / questions.length) * 100 : 0;
  const timerPct   = (timeLeft / QUESTION_TIME) * 100;
  const subjectsDone = [...new Set(answers.slice(0, currentIdx).map((_, i) => questions[i]?.subject).filter(Boolean))];

  // ── PHASE: Loading ─────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div className="quiz-page">
      <div className="quiz-loading">
        <div className="quiz-spinner"></div>
        <p>{submitting ? '🧠 AI is analyzing your answers...' : 'Loading your assessment...'}</p>
      </div>
    </div>
  );

  // ── PHASE: Intro ───────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div className="quiz-page">
      <div className="quiz-intro fade-in">
        <div className="qi-badge">🎯 Skill Assessment</div>
        <h1>Let's verify your skills!</h1>
        <p className="qi-subtitle">
          Answer <strong>{questions.length} questions</strong> across{' '}
          <strong>{[...new Set(questions.map(q => q.subject))].length} subjects</strong> to build your verified skill profile.
          This helps us match you with the right mentors — and certify you as a mentor in your strong areas.
        </p>

        <div className="qi-subjects">
          {[...new Set(questions.map(q => q.subject))].map(subj => (
            <div key={subj} className="qi-subject-pill">
              <span>{SUBJECT_EMOJIS[subj] || '📚'}</span>
              <span>{subj}</span>
            </div>
          ))}
        </div>

        <div className="qi-rules">
          <div className="qi-rule">⏱️ <strong>30 seconds</strong> per question</div>
          <div className="qi-rule">🔄 Questions advance automatically on answer</div>
          <div className="qi-rule">🤖 AI judges your skill level: Beginner → Expert</div>
          <div className="qi-rule">✅ Results update your profile & improve matches</div>
        </div>

        <button className="btn-start-quiz" onClick={() => { setPhase('quiz'); setTimeLeft(QUESTION_TIME); }}>
          🚀 Start Assessment
        </button>
      </div>
    </div>
  );

  // ── PHASE: Quiz ────────────────────────────────────────────────────────────
  if (phase === 'quiz' && currentQ) return (
    <div className="quiz-page">
      <div className={`quiz-container ${animating ? 'fade-out' : 'fade-in-fast'}`}>

        {/* Top bar */}
        <div className="qz-topbar">
          <div className="qz-progress-info">
            <span className="qz-subject-tag">
              {SUBJECT_EMOJIS[currentQ.subject] || '📚'} {currentQ.subject}
            </span>
            <span className="qz-count">{currentIdx + 1} / {questions.length}</span>
          </div>
          <div className="qz-progress-bar">
            <div className="qz-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Timer ring */}
        <div className="qz-timer-wrap">
          <svg className="qz-timer-ring" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
            <circle
              cx="30" cy="30" r="26" fill="none"
              stroke={timeLeft <= 8 ? '#f87171' : timeLeft <= 15 ? '#fbbf24' : '#4ade80'}
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - timerPct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              transform="rotate(-90 30 30)"
            />
          </svg>
          <span className={`qz-timer-num ${timeLeft <= 8 ? 'urgent' : ''}`}>{timeLeft}</span>
        </div>

        {/* Question */}
        <div className="qz-question">
          <div className="qz-level-badge" style={{ background: LEVEL_CONFIG[currentQ.level === 'advanced' ? 'Advanced' : currentQ.level === 'intermediate' ? 'Intermediate' : 'Beginner']?.bg || '' }}>
            {currentQ.level}
          </div>
          <h2>{currentQ.question}</h2>
        </div>

        {/* Options */}
        <div className="qz-options">
          {currentQ.options.map((opt, i) => {
            let cls = 'qz-option';
            if (selected !== null) {
              if (i === selected) cls += ' selected';
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => selectAnswer(i)}
                disabled={selected !== null}
              >
                <span className="qz-opt-letter">{String.fromCharCode(65 + i)}</span>
                <span className="qz-opt-text">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Skip */}
        {selected === null && (
          <button className="qz-skip" onClick={advanceQuestion}>Skip →</button>
        )}
      </div>
    </div>
  );

  // ── PHASE: Results ─────────────────────────────────────────────────────────
  if (phase === 'results') {
    const overallScore = groupedResults.length > 0
      ? Math.round(groupedResults.reduce((sum, [, v]) => sum + (v?.score ?? 0), 0) / groupedResults.length)
      : 0;

    return (
      <div className="quiz-page">
        <div className="qr-container fade-in">
          <div className="qr-header">
            <div className="qr-trophy">{overallScore >= 75 ? '🏆' : overallScore >= 50 ? '⭐' : '📈'}</div>
            <h1>Your Skill Profile is Ready!</h1>
            <p>AI has analyzed your answers and built your verified skill certificate.</p>
            <div className="qr-overall">
              <span className="qr-overall-label">Overall Accuracy</span>
              <span className="qr-overall-score">{alreadyDone ? '—' : `${overallScore}%`}</span>
            </div>
          </div>

          <div className="qr-subjects">
            {groupedResults.map(([subject, data]) => {
              const score = data?.score ?? 0;
              const level = data?.level ?? 'Beginner';
              const cfg = LEVEL_CONFIG[level];
              return (
                <div key={subject} className="qr-subject-card" style={{ borderColor: cfg.color + '44' }}>
                  <div className="qrs-top">
                    <div className="qrs-icon">{SUBJECT_EMOJIS[subject] || '📚'}</div>
                    <div className="qrs-info">
                      <h3>{subject}</h3>
                      <div className="qrs-level-badge" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.icon} {level}
                      </div>
                    </div>
                    <div className="qrs-score" style={{ color: cfg.color }}>{score}%</div>
                  </div>
                  {!alreadyDone && (
                    <div className="qrs-bar">
                      <div className="qrs-bar-fill" style={{ width: `${score}%`, background: cfg.color }}></div>
                    </div>
                  )}
                  {data?.correct !== undefined && (
                    <div className="qrs-meta">{data.correct}/{data.total} correct</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="qr-actions">
            {!alreadyDone && profileUpdate && (
              <div className="qr-profile-changes">
                <div className="qrpc-title">🤖 AI Profile Changes</div>

                {profileUpdate.promoted?.length > 0 && (
                  <div className="qrpc-group">
                    <span className="qrpc-label promoted">⬆️ Promoted to Strong</span>
                    <div className="qrpc-pills">
                      {profileUpdate.promoted.map(s => (
                        <span key={s} className="qrpc-pill promoted">{s}</span>
                      ))}
                    </div>
                    <p className="qrpc-note">You scored ≥65% on these — the AI moved them to your strong subjects!</p>
                  </div>
                )}

                {profileUpdate.demoted?.length > 0 && (
                  <div className="qrpc-group">
                    <span className="qrpc-label demoted">⬇️ Removed from Strong</span>
                    <div className="qrpc-pills">
                      {profileUpdate.demoted.map(s => (
                        <span key={s} className="qrpc-pill demoted">{s}</span>
                      ))}
                    </div>
                    <p className="qrpc-note">You scored {'<'}40% on these — added to subjects needing help.</p>
                  </div>
                )}

                {profileUpdate.promoted?.length === 0 && profileUpdate.demoted?.length === 0 && (
                  <div className="qrpc-no-change">✅ Your self-reported subjects matched your quiz performance.</div>
                )}
              </div>
            )}

            {!alreadyDone && (
              <div className="qr-note">
                ✅ subjectsStrong and subjectsNeeded updated. ML matching now uses verified scores.
              </div>
            )}
            <button className="btn-primary qr-btn" onClick={() => navigate('/find-mentor')}>
              🔍 Find My Best Mentors
            </button>
            <button className="btn-secondary qr-btn" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
            {!alreadyDone && (
              <button className="qr-retake" onClick={async () => {
                await api.delete('/quiz/reset');
                updateUser({ quizCompleted: false });
                window.location.reload();
              }}>
                🔄 Retake Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Quiz;
