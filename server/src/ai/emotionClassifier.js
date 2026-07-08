/**
 * Emotion Classifier
 *
 * Classifies text into one of 11 emotion categories using
 * weighted keyword matching and contextual patterns.
 */

const EMOTION_KEYWORDS = {
  happy: {
    words: ['happy', 'joy', 'glad', 'great', 'wonderful', 'amazing', 'fantastic', 'excellent', 'good', 'love', 'enjoying', 'cheerful', 'thrilled', 'delighted', 'blessed', 'grateful', 'thankful', 'proud', 'accomplished', 'celebrating'],
    weight: 1,
  },
  hopeful: {
    words: ['hope', 'hopeful', 'optimistic', 'looking forward', 'excited about', 'can\'t wait', 'better tomorrow', 'things will improve', 'getting better', 'positive', 'bright future', 'motivated', 'inspired', 'determined'],
    weight: 1,
  },
  neutral: {
    words: ['okay', 'fine', 'alright', 'normal', 'usual', 'regular', 'nothing special', 'average', 'so-so', 'meh'],
    weight: 0.5,
  },
  sad: {
    words: ['sad', 'unhappy', 'down', 'upset', 'crying', 'tears', 'miss', 'missing', 'heartbroken', 'grief', 'loss', 'mourning', 'disappointed', 'let down', 'hurt', 'pain', 'suffering'],
    weight: 1.2,
  },
  angry: {
    words: ['angry', 'furious', 'mad', 'rage', 'frustrated', 'annoyed', 'irritated', 'pissed', 'hate', 'unfair', 'injustice', 'fed up', 'sick of', 'tired of'],
    weight: 1.2,
  },
  anxious: {
    words: ['anxious', 'anxiety', 'worried', 'nervous', 'scared', 'fear', 'panic', 'tense', 'restless', 'uneasy', 'dread', 'apprehensive', 'overthinking', 'can\'t stop thinking', 'racing thoughts', 'what if'],
    weight: 1.3,
  },
  burnout: {
    words: ['burnout', 'burned out', 'burnt out', 'exhausted', 'drained', 'overwhelmed', 'too much', 'can\'t handle', 'breaking point', 'overloaded', 'no energy', 'tired all the time', 'running on empty', 'stretched thin'],
    weight: 1.4,
  },
  lonely: {
    words: ['lonely', 'alone', 'isolated', 'no friends', 'no one', 'nobody cares', 'left out', 'excluded', 'invisible', 'disconnected', 'don\'t belong', 'outcast', 'homesick', 'missing home', 'miss my family'],
    weight: 1.3,
  },
  depressed: {
    words: ['depressed', 'depression', 'hopeless', 'worthless', 'empty', 'numb', 'meaningless', 'pointless', 'no purpose', 'don\'t care', 'given up', 'can\'t feel', 'dark place', 'no motivation', 'lost interest', 'nothing matters'],
    weight: 1.5,
  },
  confused: {
    words: ['confused', 'lost', 'don\'t know', 'uncertain', 'unsure', 'indecisive', 'stuck', 'torn', 'mixed feelings', 'conflicted', 'directionless', 'what should i do', 'no idea', 'identity crisis'],
    weight: 1,
  },
  overwhelmed: {
    words: ['overwhelmed', 'too much', 'can\'t cope', 'drowning', 'swamped', 'buried', 'pressure', 'deadline', 'assignments', 'exams', 'workload', 'piling up', 'behind schedule', 'falling behind', 'can\'t keep up', 'impossible'],
    weight: 1.3,
  },
};

/**
 * Classify the dominant emotion in a text.
 * Returns the emotion with highest weighted match count.
 */
function classifyEmotion(text) {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [emotion, config] of Object.entries(EMOTION_KEYWORDS)) {
    let matchCount = 0;
    for (const word of config.words) {
      if (lower.includes(word)) {
        matchCount++;
      }
    }
    scores[emotion] = matchCount * config.weight;
  }

  // Find emotion with highest score
  let maxEmotion = 'neutral';
  let maxScore = 0;

  for (const [emotion, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxEmotion = emotion;
    }
  }

  return {
    emotion: maxEmotion,
    confidence: Math.min(maxScore / 3, 1), // Normalize to 0-1
    allScores: scores,
  };
}

/**
 * Detect issues/topics mentioned in the text.
 */
function detectIssues(text) {
  const lower = text.toLowerCase();
  const issues = [];

  const ISSUE_PATTERNS = {
    'academic_pressure': ['exam', 'assignment', 'grade', 'marks', 'cgpa', 'gpa', 'backlog', 'attendance', 'study', 'professor', 'lecture', 'class'],
    'placement_stress': ['placement', 'job', 'interview', 'company', 'career', 'internship', 'resume', 'offer', 'package', 'unemployed', 'hire'],
    'financial_stress': ['money', 'financial', 'fee', 'fees', 'debt', 'loan', 'afford', 'expensive', 'rent', 'scholarship'],
    'relationship_issues': ['relationship', 'breakup', 'partner', 'boyfriend', 'girlfriend', 'ex', 'dating', 'love', 'crush', 'heartbreak'],
    'family_issues': ['family', 'parents', 'father', 'mother', 'sibling', 'home', 'marriage', 'divorce', 'argument', 'expectation'],
    'sleep_issues': ['sleep', 'insomnia', 'nightmare', 'can\'t sleep', 'oversleep', 'tired', 'fatigue', 'restless night'],
    'social_isolation': ['lonely', 'alone', 'no friends', 'isolated', 'excluded', 'bullied', 'ragging', 'outcast'],
    'homesickness': ['homesick', 'miss home', 'miss family', 'hometown', 'far from home'],
    'self_esteem': ['worthless', 'not good enough', 'ugly', 'stupid', 'dumb', 'inferior', 'comparison', 'insecure'],
    'substance_use': ['drinking', 'alcohol', 'smoke', 'smoking', 'drugs', 'addiction', 'habit'],
  };

  for (const [issue, keywords] of Object.entries(ISSUE_PATTERNS)) {
    if (keywords.some((k) => lower.includes(k))) {
      issues.push(issue);
    }
  }

  return issues;
}

module.exports = { classifyEmotion, detectIssues, EMOTION_KEYWORDS };
