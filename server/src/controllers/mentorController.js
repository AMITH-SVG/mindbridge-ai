const { AnonymousSession, Conversation, MoodEntry, User } = require('../models');

exports.getDashboard = async (req, res, next) => {
  try {
    const universityId = req.tenantId;
    const mentorId = req.user._id;
    const [activeSessions, pendingSessions, totalSessions, riskNotifications] = await Promise.all([
      AnonymousSession.countDocuments({ universityId, mentorId, status: 'active' }),
      AnonymousSession.countDocuments({ universityId, mentorId, status: 'pending' }),
      AnonymousSession.countDocuments({ universityId, mentorId }),
      AnonymousSession.find({ universityId, mentorId, riskLevel: { $in: ['high', 'critical'] }, status: 'active' })
        .select('studentAnonId riskLevel createdAt').limit(10),
    ]);
    const recentSessions = await AnonymousSession.find({ universityId, mentorId })
      .sort({ createdAt: -1 }).limit(10)
      .select('studentAnonId mentorAnonId status riskLevel createdAt messages');
    res.json({
      success: true, data: {
        stats: { activeSessions, pendingSessions, totalSessions, highRiskCount: riskNotifications.length },
        riskNotifications, recentSessions,
      }
    });
  } catch (error) { next(error); }
};

exports.getWellnessTrends = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const moodAgg = await MoodEntry.aggregate([
      { $match: { universityId: req.tenantId, date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const riskAgg = await Conversation.aggregate([
      { $match: { universityId: req.tenantId, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { moodDistribution: moodAgg, riskDistribution: riskAgg } });
  } catch (error) { next(error); }
};
