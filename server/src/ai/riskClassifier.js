const { containsCrisisKeywords, calculateTrendScore } = require('./sentiment');

const RISK_LEVELS = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high', CRITICAL: 'critical' };
const HIGH_RISK_EMOTIONS = ['depressed', 'hopeless'];
const MEDIUM_RISK_EMOTIONS = ['anxious', 'burnout', 'lonely', 'overwhelmed'];

function classifyRisk(text, sentiment, emotion, messageHistory = []) {
  const factors = [];
  let riskScore = 0;

  if (containsCrisisKeywords(text)) {
    return { level: RISK_LEVELS.CRITICAL, score: 100, factors: ['Crisis keywords detected'] };
  }

  if (sentiment.comparative < -3) { riskScore += 40; factors.push('Very negative sentiment'); }
  else if (sentiment.comparative < -1.5) { riskScore += 25; factors.push('Negative sentiment'); }
  else if (sentiment.comparative < -0.5) { riskScore += 10; factors.push('Slightly negative'); }

  if (HIGH_RISK_EMOTIONS.includes(emotion)) { riskScore += 30; factors.push(`High-risk emotion: ${emotion}`); }
  else if (MEDIUM_RISK_EMOTIONS.includes(emotion)) { riskScore += 15; factors.push(`Concerning emotion: ${emotion}`); }

  const trendScore = calculateTrendScore(messageHistory);
  if (trendScore < -2) { riskScore += 20; factors.push('Declining trend'); }
  else if (trendScore < -1) { riskScore += 10; factors.push('Slightly declining'); }

  if (text.length < 20 && sentiment.comparative < -1) { riskScore += 10; }

  const recentNeg = messageHistory.filter(m => m.role === 'student').slice(-3).filter(m => (m.sentiment?.comparative || 0) < -0.5);
  if (recentNeg.length >= 3) { riskScore += 15; factors.push('Consistently negative'); }

  let level;
  if (riskScore >= 70) level = RISK_LEVELS.CRITICAL;
  else if (riskScore >= 45) level = RISK_LEVELS.HIGH;
  else if (riskScore >= 20) level = RISK_LEVELS.MEDIUM;
  else level = RISK_LEVELS.LOW;

  return { level, score: Math.min(riskScore, 100), factors };
}

module.exports = { classifyRisk, RISK_LEVELS };
