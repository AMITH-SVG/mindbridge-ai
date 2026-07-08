const Sentiment = require('sentiment');
const sentimentAnalyzer = new Sentiment();

/**
 * Extended keyword dictionaries for mental wellness context.
 * Weighted scoring beyond the default AFINN lexicon.
 */
const CUSTOM_LABELS = {
  // Positive extensions
  'grateful': 3, 'hopeful': 3, 'motivated': 3, 'confident': 3,
  'accomplished': 3, 'productive': 2, 'focused': 2, 'relaxed': 3,
  'calm': 2, 'peaceful': 3, 'excited': 2, 'proud': 3,
  // Negative extensions (academic/student context)
  'overwhelmed': -3, 'burnout': -4, 'burned out': -4, 'burnt out': -4,
  'stressed': -3, 'anxious': -3, 'lonely': -3, 'isolated': -3,
  'homesick': -3, 'homesickness': -3, 'exhausted': -3,
  'pressured': -2, 'deadline': -1, 'exam': -1, 'backlog': -2,
  'failed': -3, 'failing': -3, 'dropped': -2,
  'worthless': -4, 'hopeless': -4, 'helpless': -4, 'useless': -4,
  'depressed': -4, 'suicidal': -5, 'self-harm': -5, 'end it': -5,
  'give up': -3, 'can\'t take it': -4, 'no point': -3, 'no purpose': -4,
  'panic': -3, 'panic attack': -4, 'crying': -2, 'can\'t sleep': -3,
  'insomnia': -3, 'nightmares': -3, 'no friends': -3,
  'placement': -1, 'unemployed': -2, 'rejected': -3,
  'financial': -1, 'debt': -2, 'money problems': -3,
  'breakup': -2, 'heartbreak': -3, 'relationship': -1,
};

/**
 * Crisis keywords that immediately trigger critical risk level.
 */
const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'self-harm', 'self harm', 'cutting myself', 'hurt myself',
  'no reason to live', 'better off dead', 'end it all',
  'can\'t go on', 'not worth living', 'give up on life',
];

/**
 * Analyze sentiment of a text message.
 * Returns score, comparative score, and detected keywords.
 */
function analyzeSentiment(text) {
  const result = sentimentAnalyzer.analyze(text, { extras: CUSTOM_LABELS });
  return {
    score: result.score,
    comparative: result.comparative,
    positive: result.positive,
    negative: result.negative,
    tokens: result.tokens,
  };
}

/**
 * Check if text contains crisis-level keywords.
 */
function containsCrisisKeywords(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/**
 * Calculate a rolling sentiment average from conversation history.
 */
function calculateTrendScore(messages) {
  if (!messages || messages.length === 0) return 0;
  const studentMessages = messages.filter((m) => m.role === 'student');
  if (studentMessages.length === 0) return 0;
  const total = studentMessages.reduce((sum, m) => sum + (m.sentiment?.comparative || 0), 0);
  return total / studentMessages.length;
}

module.exports = {
  analyzeSentiment,
  containsCrisisKeywords,
  calculateTrendScore,
  CRISIS_KEYWORDS,
};
