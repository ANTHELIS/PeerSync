const axios   = require('axios');
const User    = require('../models/User');
const Session = require('../models/Session');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// @desc    Find mentors using AI
// @route   POST /api/matches/find
const findMentors = async (req, res) => {
  const student = await User.findById(req.user._id);
  const { topN = 3 } = req.body;

  // ── Build subjects_needed for ML payload ────────────────────────────────
  // After a quiz, subjectsNeeded in DB is already AI-corrected.
  // Additionally: if quiz was done, also include subjects where skill < "Advanced"
  //   (i.e. Beginner/Intermediate), as those still need mentor guidance.
  let needsArray = Array.isArray(student.subjectsNeeded) ? [...student.subjectsNeeded] : [];

  if (student.quizCompleted && student.skillScores && student.skillScores.size > 0) {
    // Include quiz-detected weak areas not yet in subjectsNeeded
    for (const [subject, data] of student.skillScores.entries()) {
      if (
        (data.level === 'Beginner' || data.level === 'Intermediate') &&
        !needsArray.includes(subject)
      ) {
        needsArray.push(subject);
      }
    }
  }

  const subjectsNeeded = needsArray.length > 0
    ? needsArray.join('|')
    : 'Data Structures';  // safe fallback

  const learningStyle = student.learningStyle || 'Visual';
  const availability  = Array.isArray(student.availability) && student.availability.length > 0
    ? student.availability.join('|')
    : 'Mon_Morning|Wed_Afternoon';
  const gpa           = student.gpa      || 2.5;
  const semester      = student.semester || 1;

  try {
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/api/ml/recommend`,
      {
        student: {
          student_id:      student._id.toString(),
          learning_style:  learningStyle,
          subjects_needed: subjectsNeeded,    // ← quiz-verified subjects
          availability,
          gpa,
          semester,
        },
        top_n: topN,
      },
      { timeout: 10000 }
    );

    const recommendations = mlResponse.data.recommendations || [];

    if (recommendations.length > 0) {
      return res.json({
        student: student.name,
        recommendations,
        source: 'ai',
        quizVerified: student.quizCompleted,   // flag for frontend to display badge
      });
    }

    console.log('⚠️ ML returned 0 results — using MongoDB fallback');
    throw new Error('ML returned no recommendations');

  } catch (err) {
    console.log(`⚠️ ML Service issue: ${err.message} — using fallback`);

    // ── Fallback: Subject-matched mentors from MongoDB ────────────────────
    // Try to match subjectsNeeded against mentor expertise
    const mentors = await User.find({
      isMentor: true,
      _id: { $ne: student._id },
      ...(needsArray.length > 0
        ? { 'mentorProfile.subjectExpertise': { $in: needsArray } }
        : {}),
    })
      .select('name college semester mentorProfile skillScores')
      .limit(topN * 2);   // fetch more, then rank by overlap

    // Rank by subject overlap count
    const ranked = mentors
      .map(m => {
        const expertise = m.mentorProfile?.subjectExpertise || [];
        const overlap   = expertise.filter(s => needsArray.includes(s));
        return { mentor: m, overlap };
      })
      .sort((a, b) => b.overlap.length - a.overlap.length)
      .slice(0, topN);

    const recommendations = ranked.map(({ mentor: m, overlap }, i) => ({
      mentor_id:        m._id,
      name:             m.name,
      match_percentage: Math.max(60, Math.round(90 - i * 8 + overlap.length * 3)),
      reasons: [
        `${m.mentorProfile?.teachingStyle || 'Adaptive'} teaching approach`,
        overlap.length > 0
          ? `Covers ${overlap.slice(0, 2).join(' & ')}`
          : `Expert in ${m.mentorProfile?.subjectExpertise?.[0] || 'multiple subjects'}`,
        `Patience score: ${m.mentorProfile?.patienceScore || 4.5}/5`,
      ],
      mentor_details: {
        teaching_style:    m.mentorProfile?.teachingStyle,
        subject_expertise: m.mentorProfile?.subjectExpertise,
        semester:          m.semester,
        patience_score:    m.mentorProfile?.patienceScore || 4.5,
      },
    }));

    // If still no mentors (no expertise match), fetch any available mentors
    if (recommendations.length === 0) {
      const anyMentors = await User.find({ isMentor: true, _id: { $ne: student._id } })
        .select('name college semester mentorProfile')
        .limit(topN);

      recommendations.push(...anyMentors.map((m, i) => ({
        mentor_id:        m._id,
        name:             m.name,
        match_percentage: Math.round(80 - i * 7),
        reasons: [
          `${m.mentorProfile?.teachingStyle || 'Adaptive'} teaching approach`,
          `Expert in ${m.mentorProfile?.subjectExpertise?.[0] || 'multiple subjects'}`,
          'Available and ready to help',
        ],
        mentor_details: {
          teaching_style:    m.mentorProfile?.teachingStyle,
          subject_expertise: m.mentorProfile?.subjectExpertise,
          semester:          m.semester,
          patience_score:    m.mentorProfile?.patienceScore || 4.5,
        },
      })));
    }

    res.json({
      student: student.name,
      recommendations,
      source: 'fallback',
      quizVerified: student.quizCompleted,
    });
  }
};

// @desc    Get recent matches
// @route   GET /api/matches/recent
const getRecentMatches = async (req, res) => {
  const sessions = await Session.find({
    $or: [{ studentId: req.user._id }, { mentorId: req.user._id }],
  })
    .populate('studentId', 'name')
    .populate('mentorId', 'name')
    .sort('-createdAt')
    .limit(10);

  res.json(sessions);
};

module.exports = { findMentors, getRecentMatches };
