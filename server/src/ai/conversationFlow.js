const { analyzeSentiment } = require('./sentiment');
const { classifyEmotion, detectIssues } = require('./emotionClassifier');
const { classifyRisk, RISK_LEVELS } = require('./riskClassifier');

const GREETINGS = [
  "Welcome back. How are you feeling today?",
  "Good to see you. How has your day been so far?",
  "Hello. I'm here to listen. How are things going?",
  "Hi there. Take a moment — how are you doing right now?",
];

const CHECKIN_QUESTIONS = [
  "On a scale of 1 to 10, how would you rate your overall mood today?",
  "How well did you sleep last night?",
  "Have you been able to focus on your studies recently?",
  "How are things going socially — are you connecting with people around you?",
];

const FOLLOW_UP = {
  academic_pressure: [
    "It sounds like academics are weighing on you. What specifically is causing the most pressure?",
    "Are there upcoming exams or deadlines that are adding to this stress?",
    "Have you been able to keep up with your coursework, or does it feel like too much?",
  ],
  placement_stress: [
    "Placement season can be really intense. What part of it is affecting you the most?",
    "Are you preparing for specific companies, or is the uncertainty itself the challenge?",
    "How do you feel when you compare your progress with your peers?",
  ],
  financial_stress: [
    "Financial concerns can add a lot of weight. Would you like to talk about what's going on?",
    "Is this something that's been ongoing, or is it a recent change?",
  ],
  relationship_issues: [
    "Relationships can deeply affect how we feel. Would you like to share more about what happened?",
    "How long has this been on your mind?",
  ],
  sleep_issues: [
    "Sleep has a huge impact on everything else. How many hours have you been getting?",
    "Is there something specific keeping you up at night — thoughts, worries, habits?",
  ],
  social_isolation: [
    "Feeling disconnected from others is really difficult. Has it been hard to make connections here?",
    "Is there anyone you feel comfortable reaching out to?",
  ],
  homesickness: [
    "Being away from home can be really tough. How often do you get to talk to your family?",
    "What do you miss the most about home?",
  ],
  self_esteem: [
    "It sounds like you're being quite hard on yourself. What's driving those feelings?",
    "When did you start feeling this way about yourself?",
  ],
  family_issues: [
    "Family situations can be complicated. Would you feel comfortable sharing what's going on?",
    "How is this affecting your daily life and studies?",
  ],
  substance_use: [
    "Thank you for being open about this. How often has this been happening?",
    "Do you feel like it's something you can control, or has it become a pattern?",
  ],
};

const GUIDANCE = {
  low: [
    "It sounds like you're managing things reasonably well. Remember, it's okay to have off days too.",
    "You seem to be in a good place. Keep doing what works for you, and don't hesitate to check in anytime.",
    "It's great that you're staying aware of your feelings. That self-awareness is a real strength.",
  ],
  medium: [
    "I can sense that things aren't entirely easy right now. You don't have to handle everything alone.",
    "What you're going through is valid. Sometimes talking to someone who understands can make a real difference.",
    "Would you be open to connecting with a mentor anonymously? They're trained to listen and help, and your identity stays completely private.",
  ],
  high: [
    "I want you to know that what you're feeling is important, and there are people who genuinely want to help.",
    "It might be a good time to speak with a professional counsellor at your university. They're there for exactly these moments.",
    "You deserve support. I'd strongly encourage reaching out to your university's counselling services. You don't have to face this alone.",
  ],
  critical: [
    "I hear you, and I want you to know that your life matters. What you're feeling right now is temporary, even if it doesn't feel that way.",
    "Please consider reaching out to someone you trust — a friend, family member, or your university's emergency counselling line.",
    "If you're in immediate distress, please contact: iCall: 9152987821, Vandrevala Foundation: 1860-2662-345 (24/7), or your university's student helpline.",
  ],
};

const MOTIVATIONAL = [
  "You've already shown courage by opening up. That takes real strength.",
  "Every day you keep going is a victory. Don't underestimate your resilience.",
  "Progress isn't always linear. Be patient with yourself — you're doing better than you think.",
  "Remember why you started. Your goals are worth pursuing, and setbacks are part of the journey.",
  "The fact that you're here, reflecting on how you feel, shows incredible self-awareness.",
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function processMessage(text, conversation) {
  const sentiment = analyzeSentiment(text);
  const { emotion, confidence } = classifyEmotion(text);
  const issues = detectIssues(text);
  const risk = classifyRisk(text, sentiment, emotion, conversation?.messages || []);
  const state = conversation?.flowState || 'greeting';
  const context = conversation?.context || { detectedIssues: [], askedQuestions: [], emotionHistory: [], questionCount: 0 };

  let response = '';
  let nextState = state;

  context.emotionHistory.push(emotion);
  issues.forEach(i => { if (!context.detectedIssues.includes(i)) context.detectedIssues.push(i); });

  if (risk.level === RISK_LEVELS.CRITICAL) {
    response = getRandomItem(GUIDANCE.critical);
    nextState = 'crisis';
  } else if (state === 'greeting') {
    response = getRandomItem(GREETINGS);
    nextState = 'checkin';
  } else if (state === 'checkin') {
    response = getRandomItem(CHECKIN_QUESTIONS);
    nextState = 'emotion_detection';
  } else if (state === 'emotion_detection' || state === 'dynamic_questions') {
    if (issues.length > 0 && context.questionCount < 4) {
      const issue = issues.find(i => !context.askedQuestions.includes(i)) || issues[0];
      const questions = FOLLOW_UP[issue] || FOLLOW_UP.academic_pressure;
      const q = questions.find(q2 => !context.askedQuestions.includes(q2)) || questions[0];
      response = q;
      context.askedQuestions.push(issue);
      context.questionCount++;
      nextState = 'dynamic_questions';
    } else {
      nextState = 'guidance';
      if (risk.level === RISK_LEVELS.HIGH) {
        response = getRandomItem(GUIDANCE.high);
        nextState = 'counsellor_recommend';
      } else if (risk.level === RISK_LEVELS.MEDIUM) {
        response = getRandomItem(GUIDANCE.medium);
        nextState = 'mentor_offer';
      } else {
        response = getRandomItem(GUIDANCE.low);
        nextState = 'motivation';
      }
    }
  } else if (state === 'guidance' || state === 'motivation') {
    response = getRandomItem(MOTIVATIONAL);
    nextState = 'complete';
  } else if (state === 'mentor_offer') {
    response = "If you'd like, I can connect you with a trained mentor anonymously. Your identity will be completely protected. Would you like that?";
    nextState = 'complete';
  } else if (state === 'counsellor_recommend') {
    response = "I'd strongly recommend scheduling a session with your university's counselling service. They provide a safe, confidential space. Would you like guidance on how to book an appointment?";
    nextState = 'complete';
  } else {
    response = getRandomItem(MOTIVATIONAL) + " Feel free to start a new conversation anytime.";
    nextState = 'complete';
  }

  return {
    response,
    sentiment,
    emotion,
    emotionConfidence: confidence,
    issues,
    risk,
    nextState,
    context,
  };
}

function generateWellnessScores(moodEntries) {
  if (!moodEntries || moodEntries.length === 0) {
    return { stress: 50, anxiety: 50, burnout: 50, motivation: 50, confidence: 50, sleepQuality: 50 };
  }
  const latest = moodEntries.slice(-7);
  const avg = (field) => Math.round(latest.reduce((s, e) => s + (e.scores?.[field] || 50), 0) / latest.length);
  return {
    stress: avg('stress'),
    anxiety: avg('anxiety'),
    burnout: avg('burnout'),
    motivation: avg('motivation'),
    confidence: avg('confidence'),
    sleepQuality: avg('sleepQuality'),
  };
}

module.exports = { processMessage, generateWellnessScores, getRandomItem };
