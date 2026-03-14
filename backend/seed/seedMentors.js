const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const MENTORS = [
  // --- Data Structures & Algorithms ---
  { name: 'Riya Sharma', email: 'riya.sharma@peersync.com', college: 'IIT Kharagpur', semester: 6, teachingStyle: 'Visual', expertise: ['Data Structures', 'Algorithms'], patience: 4.8, rating: 4.7, sessions: 42, ratings: 35 },
  { name: 'Arjun Patel', email: 'arjun.patel@peersync.com', college: 'NIT Trichy', semester: 5, teachingStyle: 'Read-Write', expertise: ['Data Structures', 'Java'], patience: 4.5, rating: 4.4, sessions: 28, ratings: 22 },
  { name: 'Sneha Roy', email: 'sneha.roy@peersync.com', college: 'BITS Pilani', semester: 7, teachingStyle: 'Kinesthetic', expertise: ['Algorithms', 'Competitive Programming'], patience: 4.9, rating: 4.8, sessions: 55, ratings: 48 },

  // --- Machine Learning & AI ---
  { name: 'Vikram Singh', email: 'vikram.singh@peersync.com', college: 'IIT Bombay', semester: 7, teachingStyle: 'Visual', expertise: ['Machine Learning', 'Python'], patience: 4.6, rating: 4.5, sessions: 38, ratings: 30 },
  { name: 'Priya Menon', email: 'priya.menon@peersync.com', college: 'IIIT Hyderabad', semester: 8, teachingStyle: 'Auditory', expertise: ['Machine Learning', 'Statistics'], patience: 4.7, rating: 4.6, sessions: 33, ratings: 27 },
  { name: 'Rahul Gupta', email: 'rahul.gupta@peersync.com', college: 'IIT Delhi', semester: 6, teachingStyle: 'Read-Write', expertise: ['Deep Learning', 'Machine Learning'], patience: 4.3, rating: 4.2, sessions: 19, ratings: 15 },

  // --- Web Development ---
  { name: 'Ananya Das', email: 'ananya.das@peersync.com', college: 'Jadavpur University', semester: 5, teachingStyle: 'Kinesthetic', expertise: ['Web Development', 'JavaScript'], patience: 4.8, rating: 4.7, sessions: 50, ratings: 44 },
  { name: 'Karthik Nair', email: 'karthik.nair@peersync.com', college: 'VIT Vellore', semester: 6, teachingStyle: 'Visual', expertise: ['Web Development', 'React'], patience: 4.4, rating: 4.3, sessions: 25, ratings: 20 },
  { name: 'Meera Iyer', email: 'meera.iyer@peersync.com', college: 'SRM University', semester: 4, teachingStyle: 'Auditory', expertise: ['Web Development', 'Node.js'], patience: 4.5, rating: 4.4, sessions: 22, ratings: 18 },

  // --- Database Systems ---
  { name: 'Saurav Chatterjee', email: 'saurav.chat@peersync.com', college: 'Heritage Institute', semester: 6, teachingStyle: 'Read-Write', expertise: ['Database Systems', 'SQL'], patience: 4.6, rating: 4.5, sessions: 31, ratings: 25 },
  { name: 'Divya Reddy', email: 'divya.reddy@peersync.com', college: 'CBIT Hyderabad', semester: 5, teachingStyle: 'Visual', expertise: ['Database Systems', 'MongoDB'], patience: 4.7, rating: 4.6, sessions: 27, ratings: 21 },
  { name: 'Amit Kumar', email: 'amit.kumar@peersync.com', college: 'NIT Durgapur', semester: 7, teachingStyle: 'Kinesthetic', expertise: ['Database Systems', 'Data Structures'], patience: 4.2, rating: 4.1, sessions: 15, ratings: 12 },

  // --- Calculus & Math ---
  { name: 'Tanvi Bhatt', email: 'tanvi.bhatt@peersync.com', college: 'IIT Madras', semester: 4, teachingStyle: 'Visual', expertise: ['Calculus', 'Linear Algebra'], patience: 4.9, rating: 4.8, sessions: 60, ratings: 52 },
  { name: 'Rohan Joshi', email: 'rohan.joshi@peersync.com', college: 'DTU Delhi', semester: 5, teachingStyle: 'Auditory', expertise: ['Calculus', 'Statistics'], patience: 4.4, rating: 4.3, sessions: 20, ratings: 16 },
  { name: 'Nisha Agarwal', email: 'nisha.agarwal@peersync.com', college: 'NSUT Delhi', semester: 6, teachingStyle: 'Read-Write', expertise: ['Calculus', 'Discrete Math'], patience: 4.6, rating: 4.5, sessions: 35, ratings: 28 },

  // --- Operating Systems ---
  { name: 'Aditya Verma', email: 'aditya.verma@peersync.com', college: 'IIIT Bangalore', semester: 6, teachingStyle: 'Kinesthetic', expertise: ['Operating Systems', 'Computer Networks'], patience: 4.5, rating: 4.4, sessions: 24, ratings: 19 },
  { name: 'Pooja Mishra', email: 'pooja.mishra@peersync.com', college: 'BIT Mesra', semester: 7, teachingStyle: 'Visual', expertise: ['Operating Systems', 'Linux'], patience: 4.3, rating: 4.2, sessions: 18, ratings: 14 },

  // --- Computer Networks ---
  { name: 'Suresh Rajan', email: 'suresh.rajan@peersync.com', college: 'PSG Tech', semester: 5, teachingStyle: 'Auditory', expertise: ['Computer Networks', 'Cybersecurity'], patience: 4.7, rating: 4.6, sessions: 29, ratings: 23 },
  { name: 'Anjali Sharma', email: 'anjali.sharma@peersync.com', college: 'Brainware University', semester: 6, teachingStyle: 'Read-Write', expertise: ['Computer Networks', 'Cloud Computing'], patience: 4.4, rating: 4.3, sessions: 21, ratings: 17 },

  // --- Python ---
  { name: 'Deepak Chopra', email: 'deepak.chopra@peersync.com', college: 'KIIT Bhubaneswar', semester: 4, teachingStyle: 'Kinesthetic', expertise: ['Python', 'Data Science'], patience: 4.8, rating: 4.7, sessions: 45, ratings: 38 },
  { name: 'Ishita Banerjee', email: 'ishita.ban@peersync.com', college: 'Techno India', semester: 5, teachingStyle: 'Visual', expertise: ['Python', 'Automation'], patience: 4.5, rating: 4.4, sessions: 26, ratings: 20 },

  // --- Java ---
  { name: 'Manish Tiwari', email: 'manish.tiwari@peersync.com', college: 'LNMIIT Jaipur', semester: 6, teachingStyle: 'Auditory', expertise: ['Java', 'Spring Boot'], patience: 4.6, rating: 4.5, sessions: 32, ratings: 26 },
  { name: 'Kavya Rao', email: 'kavya.rao@peersync.com', college: 'RV College', semester: 5, teachingStyle: 'Read-Write', expertise: ['Java', 'Data Structures'], patience: 4.3, rating: 4.2, sessions: 17, ratings: 13 },

  // --- Statistics ---
  { name: 'Siddharth Dey', email: 'siddharth.dey@peersync.com', college: 'ISI Kolkata', semester: 8, teachingStyle: 'Visual', expertise: ['Statistics', 'Probability'], patience: 4.9, rating: 4.9, sessions: 70, ratings: 62 },
  { name: 'Lakshmi Pillai', email: 'lakshmi.pillai@peersync.com', college: 'CMI Chennai', semester: 7, teachingStyle: 'Kinesthetic', expertise: ['Statistics', 'R Programming'], patience: 4.7, rating: 4.6, sessions: 40, ratings: 34 },

  // --- Mixed / Cross-disciplinary ---
  { name: 'Nikhil Saxena', email: 'nikhil.saxena@peersync.com', college: 'MNNIT Allahabad', semester: 6, teachingStyle: 'Visual', expertise: ['Web Development', 'Database Systems'], patience: 4.5, rating: 4.4, sessions: 23, ratings: 18 },
  { name: 'Ritika Jain', email: 'ritika.jain@peersync.com', college: 'IIIT Delhi', semester: 5, teachingStyle: 'Auditory', expertise: ['Machine Learning', 'Python'], patience: 4.6, rating: 4.5, sessions: 30, ratings: 24 },
  { name: 'Gaurav Pandey', email: 'gaurav.pandey@peersync.com', college: 'BHU Varanasi', semester: 7, teachingStyle: 'Kinesthetic', expertise: ['Data Structures', 'Operating Systems'], patience: 4.4, rating: 4.3, sessions: 26, ratings: 21 },
  { name: 'Shreya Ghosh', email: 'shreya.ghosh@peersync.com', college: 'Heritage Institute', semester: 4, teachingStyle: 'Read-Write', expertise: ['Calculus', 'Python'], patience: 4.8, rating: 4.7, sessions: 36, ratings: 30 },
  { name: 'Raj Malhotra', email: 'raj.malhotra@peersync.com', college: 'Thapar University', semester: 6, teachingStyle: 'Visual', expertise: ['Algorithms', 'Machine Learning'], patience: 4.5, rating: 4.4, sessions: 28, ratings: 22 },
];

const AVAILABILITY_SLOTS = [
  'Mon_Morning', 'Mon_Afternoon', 'Mon_Evening',
  'Tue_Morning', 'Tue_Afternoon', 'Tue_Evening',
  'Wed_Morning', 'Wed_Afternoon', 'Wed_Evening',
  'Thu_Morning', 'Thu_Afternoon', 'Thu_Evening',
  'Fri_Morning', 'Fri_Afternoon', 'Fri_Evening',
  'Sat_Morning', 'Sat_Afternoon', 'Sat_Evening',
];

function randomSlots(min = 4, max = 10) {
  const shuffled = [...AVAILABILITY_SLOTS].sort(() => Math.random() - 0.5);
  const count = min + Math.floor(Math.random() * (max - min + 1));
  return shuffled.slice(0, count);
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove old seeded mentors (by email domain)
    const deleted = await User.deleteMany({ email: /@peersync\.com$/ });
    console.log(`🗑️  Removed ${deleted.deletedCount} old seed mentors`);

    const hashedPassword = await bcrypt.hash('mentor123', 10);

    const mentorDocs = MENTORS.map((m) => ({
      name: m.name,
      email: m.email,
      password: hashedPassword,
      role: 'mentor',
      college: m.college,
      semester: m.semester,
      learningStyle: m.teachingStyle,
      subjectsStrong: m.expertise,
      subjectsNeeded: [],
      availability: randomSlots(),
      gpa: +(2.8 + Math.random() * 1.2).toFixed(1),
      onboardingComplete: true,
      isMentor: true,
      mentorProfile: {
        teachingStyle: m.teachingStyle,
        subjectExpertise: m.expertise,
        mentorAvailability: randomSlots(),
        patienceScore: m.patience,
        totalSessions: m.sessions,
        avgRating: m.rating,
        totalRatings: m.ratings,
      },
    }));

    await User.insertMany(mentorDocs);
    console.log(`✅ Seeded ${mentorDocs.length} mentor profiles!`);
    console.log('');
    console.log('📊 Breakdown by subject:');

    const subjectCount = {};
    mentorDocs.forEach((m) => {
      m.mentorProfile.subjectExpertise.forEach((s) => {
        subjectCount[s] = (subjectCount[s] || 0) + 1;
      });
    });
    Object.entries(subjectCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([subj, count]) => console.log(`   ${subj}: ${count} mentors`));

    console.log('');
    console.log('🔑 All mentors use password: mentor123');
    console.log('📧 Emails: <name>@peersync.com');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
