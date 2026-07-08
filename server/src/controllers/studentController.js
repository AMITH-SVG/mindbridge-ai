const { Conversation, MoodEntry, AnonymousSession } = require('../models');
const { processMessage, generateWellnessScores } = require('../ai/conversationFlow');

exports.getDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const universityId = req.tenantId;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [moodEntries, recentConversations, activeSessions] = await Promise.all([
      MoodEntry.find({ universityId, studentId, date: { $gte: thirtyDaysAgo } }).sort({ date: -1 }).limit(30),
      Conversation.find({ universityId, studentId }).sort({ createdAt: -1 }).limit(5).select('sessionEmotion riskLevel createdAt flowState'),
      AnonymousSession.find({ universityId, studentId, status: { $in: ['pending', 'active'] } }).countDocuments(),
    ]);
    const wellnessScores = generateWellnessScores(moodEntries);
    const moodTrend = moodEntries.map(e => ({ date: e.date, mood: e.mood, scores: e.scores })).reverse();
    const todayCheckin = moodEntries.find(e => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return new Date(e.date) >= today;
    });
    res.json({
      success: true, data: {
        wellnessScores, moodTrend, recentConversations, activeSessions,
        hasCheckedInToday: !!todayCheckin, todayMood: todayCheckin?.mood || null,
        stats: { totalConversations: recentConversations.length, totalCheckins: moodEntries.length }
      }
    });
  } catch (error) { next(error); }
};

exports.checkin = async (req, res, next) => {
  try {
    const { mood, scores, notes } = req.body;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let entry = await MoodEntry.findOne({ universityId: req.tenantId, studentId: req.user._id, date: { $gte: today } });
    if (entry) {
      entry.mood = mood;
      entry.scores = { ...entry.scores, ...scores };
      entry.notes = notes || entry.notes;
      await entry.save();
    } else {
      entry = await MoodEntry.create({
        universityId: req.tenantId, studentId: req.user._id,
        date: new Date(), mood, scores: scores || {}, notes: notes || '', source: 'checkin',
      });
    }
    res.json({ success: true, message: 'Check-in recorded.', data: { entry } });
  } catch (error) { next(error); }
};

exports.getMoodHistory = async (req, res, next) => {
  try {
    const { period = '30', page = 1, limit = 30 } = req.query;
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);
    const entries = await MoodEntry.find({ universityId: req.tenantId, studentId: req.user._id, date: { $gte: daysAgo } })
      .sort({ date: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await MoodEntry.countDocuments({ universityId: req.tenantId, studentId: req.user._id, date: { $gte: daysAgo } });
    res.json({ success: true, data: { entries, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

exports.sendAIMessage = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, universityId: req.tenantId, studentId: req.user._id, isActive: true });
    }
    if (!conversation) {
      conversation = new Conversation({ universityId: req.tenantId, studentId: req.user._id, messages: [], flowState: 'greeting', context: { detectedIssues: [], askedQuestions: [], emotionHistory: [], questionCount: 0 } });
      const greeting = processMessage('', conversation);
      conversation.messages.push({ role: 'ai', content: greeting.response, emotion: null, sentiment: { score: 0, comparative: 0 }, timestamp: new Date() });
      conversation.flowState = greeting.nextState;
    }
    const result = processMessage(message, conversation);
    conversation.messages.push({ role: 'student', content: message, emotion: result.emotion, sentiment: result.sentiment, timestamp: new Date() });
    conversation.messages.push({ role: 'ai', content: result.response, emotion: null, sentiment: { score: 0, comparative: 0 }, timestamp: new Date() });
    conversation.sessionEmotion = result.emotion;
    conversation.riskLevel = result.risk.level;
    conversation.flowState = result.nextState;
    conversation.context = result.context;
    if (result.nextState === 'complete') conversation.isActive = false;
    await conversation.save();
    if (result.emotion && result.emotion !== 'neutral') {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const existing = await MoodEntry.findOne({ universityId: req.tenantId, studentId: req.user._id, date: { $gte: today }, source: 'ai_detected' });
      if (!existing) {
        const moodScores = { stress: 50, anxiety: 50, burnout: 50, motivation: 50, confidence: 50, sleepQuality: 50 };
        if (['anxious', 'overwhelmed'].includes(result.emotion)) { moodScores.stress = 75; moodScores.anxiety = 75; }
        if (result.emotion === 'burnout') { moodScores.burnout = 80; moodScores.motivation = 30; }
        if (['sad', 'depressed', 'lonely'].includes(result.emotion)) { moodScores.motivation = 25; moodScores.confidence = 30; }
        if (['happy', 'hopeful'].includes(result.emotion)) { moodScores.motivation = 80; moodScores.confidence = 75; moodScores.stress = 25; }
        await MoodEntry.create({ universityId: req.tenantId, studentId: req.user._id, date: new Date(), mood: result.emotion, scores: moodScores, source: 'ai_detected' });
      }
    }
    res.json({
      success: true, data: {
        conversationId: conversation._id,
        aiResponse: result.response,
        emotion: result.emotion, emotionConfidence: result.emotionConfidence,
        riskLevel: result.risk.level, flowState: result.nextState,
        isComplete: result.nextState === 'complete',
      }
    });
  } catch (error) { next(error); }
};

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ universityId: req.tenantId, studentId: req.user._id })
      .sort({ createdAt: -1 }).limit(20).select('sessionEmotion riskLevel flowState createdAt isActive messages');
    res.json({ success: true, data: { conversations } });
  } catch (error) { next(error); }
};

exports.getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, universityId: req.tenantId, studentId: req.user._id });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });
    res.json({ success: true, data: { conversation } });
  } catch (error) { next(error); }
};
