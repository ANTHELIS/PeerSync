/**
 * PeerSync — AI Quiz Generator using Google Gemini
 *
 * Generates unique, unpredictable MCQ questions for each subject
 * using the Gemini API. Falls back to the static bank if the API fails.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const { generateQuiz: staticGenerateQuiz } = require('./quizBank');

// ── Init Gemini ──────────────────────────────────────────────────────────────
let genAI = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return null;
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// ── Prompt builder ───────────────────────────────────────────────────────────
function buildPrompt(subjects, questionsPerSubject = 5) {
  const subjectList = subjects.map(s => `"${s}"`).join(', ');

  return `You are an expert quiz generator for a peer-to-peer tutoring platform for college and school students.

Generate exactly ${questionsPerSubject} multiple-choice questions for EACH of these subjects: ${subjectList}.

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Exactly ONE option must be correct
- Mix difficulty levels: include 2 basic, 2 intermediate, and 1 advanced question per subject
- Questions should test conceptual understanding, not just definitions
- Make each question unique and creative — avoid common textbook questions
- Options should be plausible (no obviously wrong distractors)
- Keep questions concise (under 120 characters)
- Keep options concise (under 60 characters each)

IMPORTANT: Respond with ONLY a valid JSON array, no explanation text. Each element must have this exact structure:
[
  {
    "subject": "Subject Name",
    "question": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "level": "basic"
  }
]

Where "correct" is the 0-based index of the correct option (0-3), and "level" is one of "basic", "intermediate", or "advanced".

Generate the questions now:`;
}

// ── Parse and validate Gemini response ───────────────────────────────────────
function parseGeminiResponse(text, expectedSubjects) {
  // Extract JSON from the response (handle markdown code blocks)
  let jsonStr = text.trim();

  // Remove markdown code fence if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const questions = JSON.parse(jsonStr);

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Gemini returned empty or invalid array');
  }

  // Validate each question
  const validated = [];
  for (const q of questions) {
    if (
      typeof q.subject !== 'string' ||
      typeof q.question !== 'string' ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      typeof q.correct !== 'number' ||
      q.correct < 0 || q.correct > 3 ||
      typeof q.level !== 'string'
    ) {
      console.warn('⚠️ Skipping invalid question:', JSON.stringify(q).substring(0, 100));
      continue;
    }

    // Normalize level
    const level = q.level.toLowerCase();
    const normalizedLevel = ['basic', 'intermediate', 'advanced'].includes(level) ? level : 'intermediate';

    validated.push({
      subject:  q.subject.trim(),
      question: q.question.trim(),
      options:  q.options.map(o => String(o).trim()),
      correct:  q.correct,
      level:    normalizedLevel,
    });
  }

  if (validated.length === 0) {
    throw new Error('No valid questions after parsing');
  }

  return validated;
}

// ── Shuffle utility ──────────────────────────────────────────────────────────
function secureRandom() {
  return crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF;
}

function secureShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Main generator ───────────────────────────────────────────────────────────
/**
 * Generate quiz questions using Gemini AI.
 * Falls back to static question bank if Gemini is unavailable.
 *
 * @param {string[]} subjectsNeeded - Subjects the user needs help with
 * @param {string[]} subjectsStrong - Subjects the user is strong at
 * @returns {Promise<{questions: Array, source: 'gemini'|'static'}>}
 */
async function generateAIQuiz(subjectsNeeded = [], subjectsStrong = []) {
  const allSubjects = [...new Set([...subjectsNeeded, ...subjectsStrong])];

  if (allSubjects.length === 0) {
    return { questions: [], source: 'static' };
  }

  const ai = getGenAI();

  // If no API key configured, fall back to static
  if (!ai) {
    console.log('ℹ️ No Gemini API key — using static question bank');
    const questions = staticGenerateQuiz(subjectsNeeded, subjectsStrong);
    return { questions, source: 'static' };
  }

  try {
    console.log(`🤖 Generating AI quiz for subjects: ${allSubjects.join(', ')}`);

    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 1.0,       // higher = more creative/varied
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    const prompt = buildPrompt(allSubjects, 5);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const rawQuestions = parseGeminiResponse(text, allSubjects);

    // Transform into our quiz format with IDs and shuffled options
    const quiz = rawQuestions.map((q, idx) => {
      // Shuffle options and track correct answer
      const optionIndices = secureShuffle([0, 1, 2, 3]);
      const shuffledOpts = optionIndices.map(i => q.options[i]);
      const newCorrectIdx = optionIndices.indexOf(q.correct);

      return {
        id:       `ai_${q.subject.replace(/\s+/g, '_')}_${idx}_${crypto.randomBytes(3).toString('hex')}`,
        subject:  q.subject,
        question: q.question,
        options:  shuffledOpts,
        correct:  newCorrectIdx,
        level:    q.level,
        type:     subjectsNeeded.includes(q.subject) ? 'weak' : 'strong',
      };
    });

    // Final shuffle across all subjects
    const shuffled = secureShuffle(quiz);

    console.log(`✅ Gemini generated ${shuffled.length} questions across ${allSubjects.length} subjects`);
    return { questions: shuffled, source: 'gemini' };

  } catch (error) {
    console.error('❌ Gemini quiz generation failed:', error.message);
    console.log('↩️ Falling back to static question bank');

    // Fallback to static
    const questions = staticGenerateQuiz(subjectsNeeded, subjectsStrong);
    return { questions, source: 'static' };
  }
}

module.exports = { generateAIQuiz };
