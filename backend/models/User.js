const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't return password in queries by default
    },
    college: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },

    // --- Permanent Role (set at registration, never changes) ---
    role: {
      type: String,
      enum: ['mentor', 'student'],
      required: [true, 'Role is required'],
      immutable: true,  // Mongoose will reject any update to this field
    },

    // --- User Classification ---
    userType: {
      type: String,
      enum: ['college_student', 'school_student', 'professor'],
      default: 'college_student',
    },
    institution: {
      // College name, school name, or university for professor
      type: String,
      trim: true,
      default: '',
    },
    grade: {
      // Only for school_students: e.g. 'Class 10', 'Class 12'
      type: String,
      trim: true,
      default: '',
    },
    marksType: {
      // 'sgpa' or 'percentage' — only for college/school students, optional
      type: String,
      enum: ['sgpa', 'percentage', ''],
      default: '',
    },
    marksValue: {
      // The actual numeric value (SGPA: 0-10, Percentage: 0-100)
      type: Number,
      default: null,
    },

    // --- Learning Profile (filled during onboarding) ---
    learningStyle: {
      type: String,
      enum: ['Visual', 'Auditory', 'Read-Write', 'Kinesthetic', ''],
      default: '',
    },
    subjectsNeeded: {
      type: [String], // Subjects the student struggles with
      default: [],
    },
    subjectsStrong: {
      type: [String], // Subjects the student could mentor in
      default: [],
    },
    availability: {
      type: [String], // Array of 'Day_Slot' strings, e.g., ['Mon_Morning', 'Wed_Afternoon']
      default: [],
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },

    // --- Mentor Status (derived from role, kept for queries/seed compat) ---
    isMentor: {
      type: Boolean,
      default: false,
    },
    mentorProfile: {
      teachingStyle: {
        type: String,
        enum: ['Visual', 'Auditory', 'Read-Write', 'Kinesthetic', ''],
        default: '',
      },
      subjectExpertise: {
        type: [String],
        default: [],
      },
      mentorAvailability: {
        type: [String],
        default: [],
      },
      patienceScore: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      totalSessions: {
        type: Number,
        default: 0,
      },
      avgRating: {
        type: Number,
        default: 0,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
    },

    // --- AI Skill Assessment (quiz results) ---
    quizCompleted: {
      type: Boolean,
      default: false,
    },
    lastQuizAt: {
      type: Date,
      default: null,    // null = never taken
    },
    skillScores: {
      // e.g. { 'Data Structures': { score: 80, level: 'Advanced', correct: 4, total: 5, testedAt: Date } }
      type: Map,
      of: new mongoose.Schema({
        score:    { type: Number, default: 0 },   // 0-100
        level:    { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Beginner' },
        correct:  { type: Number, default: 0 },
        total:    { type: Number, default: 0 },
        testedAt: { type: Date, default: Date.now },
      }, { _id: false }),
      default: {},
    },

    // --- Active Quiz (AI-generated, stored server-side for secure scoring) ---
    activeQuiz: {
      type: [new mongoose.Schema({
        id:       String,
        subject:  String,
        question: String,
        options:  [String],
        correct:  Number,      // index of correct option (0-3)
        level:    String,
        type:     String,      // 'weak' or 'strong'
      }, { _id: false })],
      default: [],
      select: false,  // never leak to client by default
    },

    // --- Profile Completion ---
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
