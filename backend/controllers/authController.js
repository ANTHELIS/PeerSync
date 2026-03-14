const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const signup = async (req, res) => {
  try {
    const {
      name, email, password,
      college, semester,
      userType, institution, grade,
      marksType, marksValue,
      role,   // 'mentor' or 'student' — chosen at registration, permanent
    } = req.body;

    // ── Validate role ────────────────────────────────────────────────────
    if (!role || !['mentor', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Please choose a role: mentor or student' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const isMentor = role === 'mentor';

    const user = await User.create({
      name,
      email,
      password,
      role,                                         // permanent
      isMentor,                                     // derived
      college:      college      || '',
      semester:     semester     || 1,
      userType:     userType     || 'college_student',
      institution:  institution  || '',
      grade:        grade        || '',
      marksType:    marksType    || '',
      marksValue:   marksValue   != null ? Number(marksValue) : null,
      // If registering as mentor, pre-populate mentorProfile shell
      ...(isMentor && {
        mentorProfile: {
          teachingStyle: '',
          subjectExpertise: [],
          mentorAvailability: [],
          patienceScore: 4.0,
          totalSessions: 0,
          avgRating: 0,
          totalRatings: 0,
        },
      }),
    });

    res.status(201).json({
      _id:               user._id,
      name:              user.name,
      email:             user.email,
      role:              user.role,
      isMentor:          user.isMentor,
      college:           user.college,
      semester:          user.semester,
      userType:          user.userType,
      institution:       user.institution,
      grade:             user.grade,
      marksType:         user.marksType,
      marksValue:        user.marksValue,
      onboardingComplete:user.onboardingComplete,
      token:             generateToken(user._id),
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isMentor: user.isMentor,
      college: user.college,
      semester: user.semester,
      learningStyle: user.learningStyle,
      onboardingComplete: user.onboardingComplete,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id:               user._id,
      name:              user.name,
      email:             user.email,
      role:              user.role,
      isMentor:          user.isMentor,
      college:           user.college,
      semester:          user.semester,
      learningStyle:     user.learningStyle,
      subjectsNeeded:    user.subjectsNeeded,
      subjectsStrong:    user.subjectsStrong,
      availability:      user.availability,
      gpa:               user.gpa,
      mentorProfile:     user.mentorProfile,
      onboardingComplete:user.onboardingComplete,
      quizCompleted:     user.quizCompleted,
      skillScores:       user.skillScores,
      profilePicture:    user.profilePicture,
    });
  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = { signup, login, getMe };
