const User = require('../models/User');

// @desc    Complete onboarding quiz
// @route   PUT /api/students/onboarding
const completeOnboarding = async (req, res) => {
  const { learningStyle, subjectsNeeded, subjectsStrong, availability, gpa } = req.body;

  // If the user is a mentor, also populate mentorProfile fields
  const user = await User.findById(req.user._id);
  const updateData = {
    learningStyle,
    subjectsNeeded,
    subjectsStrong: subjectsStrong || [],
    availability: availability || [],
    gpa: gpa || 0,
    onboardingComplete: true,
  };

  // If user is a mentor, sync their mentorProfile with onboarding data
  if (user.role === 'mentor' || user.isMentor) {
    updateData['mentorProfile.teachingStyle'] = learningStyle || '';
    updateData['mentorProfile.subjectExpertise'] = subjectsStrong || [];
    updateData['mentorProfile.mentorAvailability'] = availability || [];
  }

  const updated = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
  res.json({ message: 'Onboarding complete', profile: updated });
};

// @desc    Get student profile
// @route   GET /api/students/profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
};

// @desc    Update student profile
// @route   PUT /api/students/profile
const updateProfile = async (req, res) => {
  const updates = req.body;

  // Prevent role changes via profile update
  delete updates.role;
  delete updates.isMentor;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json(user);
};

module.exports = { completeOnboarding, getProfile, updateProfile };
