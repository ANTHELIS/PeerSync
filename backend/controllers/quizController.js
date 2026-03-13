const User = require('../models/User');
const { generateQuiz, scoreQuiz } = require('../utils/quizBank');

// ── Skill level thresholds ────────────────────────────────────────────────────
const STRONG_THRESHOLD      = 65;   // score ≥ 65% → this is actually a strong subject
const WEAK_THRESHOLD        = 40;   // score < 40% on a "strong" subject → remove from strong
const DEFINITELY_NEEDS_HELP = 50;   // score < 50% on a "needed" subject → keep in needed

// @desc  Generate a skill quiz for the logged-in user
// @route GET /api/quiz/generate
const getQuiz = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.onboardingComplete) {
    return res.status(400).json({ message: 'Complete onboarding first' });
  }

  if (user.quizCompleted) {
    return res.json({ alreadyCompleted: true, skillScores: user.skillScores });
  }

  const questions = generateQuiz(user.subjectsNeeded, user.subjectsStrong);

  if (questions.length === 0) {
    return res.status(400).json({
      message: 'No subjects selected to quiz on. Please complete onboarding with subjects.',
    });
  }

  // Strip correct answers before sending to frontend!
  const safeQuestions = questions.map(({ correct, ...rest }) => rest);
  res.json({ questions: safeQuestions, total: safeQuestions.length });
};


// @desc  Submit quiz answers, score them, update subjectsNeeded/subjectsStrong/skillScores
// @route POST /api/quiz/submit
const submitQuiz = async (req, res) => {
  const { answers, questions: clientQuestions } = req.body;

  if (!Array.isArray(answers) || !Array.isArray(clientQuestions)) {
    return res.status(400).json({ message: 'answers and questions arrays are required' });
  }

  const user = await User.findById(req.user._id);

  // ── Server-side scoring ───────────────────────────────────────────────────
  // Regenerate correct answers from the bank to validate client submissions
  const { generateQuiz: gen } = require('../utils/quizBank');
  const fullQuestions = gen(user.subjectsNeeded, user.subjectsStrong);
  const idToCorrect = {};
  fullQuestions.forEach(q => { idToCorrect[q.id] = q.correct; });

  const scoredQuestions = clientQuestions.map(q => ({
    ...q,
    correct: idToCorrect[q.id] ?? -99, // -99 → unknown question, will mark wrong
  }));

  const results = scoreQuiz(scoredQuestions, answers);

  // ── Build skill scores map ────────────────────────────────────────────────
  const skillScores = {};
  for (const [subject, data] of Object.entries(results)) {
    skillScores[subject] = {
      score:    data.score,
      level:    data.level,
      correct:  data.correct,
      total:    data.total,
      testedAt: new Date(),
    };
  }

  // ── AI-driven profile update logic ────────────────────────────────────────
  //
  //  For each tested subject:
  //    score ≥ 65%  → promote to "strong" (remove from needed if it was there)
  //    score 40-64% → neutral: keep in whatever list user originally put it
  //    score < 40%  → definitely NOT strong (remove from strong); if it was "needed" keep it there
  //
  // Starting pools from self-reported onboarding:
  let updatedStrong = [...(user.subjectsStrong || [])];
  let updatedNeeded = [...(user.subjectsNeeded || [])];

  const promoted   = [];  // subjects moved needed → strong
  const demoted    = [];  // subjects removed from strong
  const confirmed  = [];  // subjects kept/added in strong because quiz confirmed it

  for (const [subject, data] of Object.entries(results)) {
    const wasStrong = updatedStrong.includes(subject);
    const wasNeeded = updatedNeeded.includes(subject);

    if (data.score >= STRONG_THRESHOLD) {
      // ✅ Quiz confirmed this subject as strong
      if (!updatedStrong.includes(subject)) {
        updatedStrong.push(subject);
        if (wasNeeded) promoted.push(subject);
        else confirmed.push(subject);
      }
      // Remove from "needed" — they don't actually need help here
      updatedNeeded = updatedNeeded.filter(s => s !== subject);

    } else if (data.score < WEAK_THRESHOLD) {
      // ❌ Quiz says NOT actually strong
      if (wasStrong) {
        updatedStrong = updatedStrong.filter(s => s !== subject);
        demoted.push(subject);
        // If they scored very low, add to "needed" (they need help) unless already there
        if (!updatedNeeded.includes(subject)) {
          updatedNeeded.push(subject);
        }
      }
      // If it was already "needed", keep it there — they definitely need help
    }
    // score 40-64%: leave the subject in whatever bucket the user originally put it
  }

  // Save everything back to DB
  await User.findByIdAndUpdate(req.user._id, {
    skillScores,
    quizCompleted: true,
    subjectsStrong: updatedStrong,
    subjectsNeeded: updatedNeeded,
  });

  // ── Build a human-readable summary ───────────────────────────────────────
  const overallAccuracy = Math.round(
    Object.values(results).reduce((sum, r) => sum + r.score, 0) / Object.values(results).length
  );

  res.json({
    success: true,
    results,
    // Profile change summary for the frontend
    profileUpdate: {
      promoted,    // weak → strong
      demoted,     // strong → weak (removed from strong)
      confirmed,   // newly confirmed strong (was neither before)
      updatedStrong,
      updatedNeeded,
    },
    overallAccuracy,
    message: 'Skill profile updated! Your subjects and ML matches are now based on verified data.',
  });
};


// @desc  Reset quiz (allow retake)
// @route DELETE /api/quiz/reset
const resetQuiz = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    quizCompleted: false,
    skillScores: {},
  });
  res.json({ message: 'Quiz reset. You can retake the assessment.' });
};

module.exports = { getQuiz, submitQuiz, resetQuiz };
