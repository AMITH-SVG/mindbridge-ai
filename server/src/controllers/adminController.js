const { User, Conversation, MoodEntry, AnonymousSession, AuditLog } = require('../models');

exports.getDashboard = async (req, res, next) => {
  try {
    const uid = req.tenantId;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [studentCount, mentorCount, activeSessionCount, conversationCount, riskDistribution, moodDistribution, recentLogs] = await Promise.all([
      User.countDocuments({ universityId: uid, role: 'student', isActive: true }),
      User.countDocuments({ universityId: uid, role: { $in: ['mentor', 'counsellor'] }, isActive: true }),
      AnonymousSession.countDocuments({ universityId: uid, status: 'active' }),
      Conversation.countDocuments({ universityId: uid, createdAt: { $gte: thirtyDaysAgo } }),
      Conversation.aggregate([{ $match: { universityId: uid, createdAt: { $gte: thirtyDaysAgo } } }, { $group: { _id: '$riskLevel', count: { $sum: 1 } } }]),
      MoodEntry.aggregate([{ $match: { universityId: uid, date: { $gte: thirtyDaysAgo } } }, { $group: { _id: '$mood', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditLog.find({ universityId: uid }).sort({ createdAt: -1 }).limit(20).select('action resource userId createdAt severity'),
    ]);
    const dailyCheckins = await MoodEntry.aggregate([
      { $match: { universityId: uid, date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 }, avgStress: { $avg: '$scores.stress' } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({
      success: true, data: {
        stats: {
          studentCount,
          mentorCount,
          activeSessionCount,
          conversationCount,
          totalStudents: studentCount,
          totalMentors: mentorCount,
          activeSessions: activeSessionCount,
          criticalRiskCount: riskDistribution.find(r => r._id === 'critical')?.count || 0,
        },
        riskDistribution, moodDistribution, dailyCheckins, recentLogs,
        recentAuditLogs: recentLogs,
      }
    });
  } catch (error) { next(error); }
};

exports.getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, department, search } = req.query;
    const filter = { universityId: req.tenantId, role: 'student' };
    if (department) filter.department = department;
    if (search) filter.$or = [{ firstName: new RegExp(search, 'i') }, { lastName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { registrationNumber: new RegExp(search, 'i') }];
    const students = await User.find(filter).select('firstName lastName email registrationNumber department isActive isVerified createdAt lastLogin')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ success: true, data: { students, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

exports.getMentors = async (req, res, next) => {
  try {
    const mentors = await User.find({ universityId: req.tenantId, role: { $in: ['mentor', 'counsellor'] } })
      .select('firstName lastName email staffId department role isActive isVerified createdAt lastLogin');
    const mentorStats = await Promise.all(mentors.map(async m => {
      const sessionCount = await AnonymousSession.countDocuments({ universityId: req.tenantId, mentorId: m._id });
      const activeCount = await AnonymousSession.countDocuments({ universityId: req.tenantId, mentorId: m._id, status: 'active' });
      return { ...m.toObject(), stats: { totalSessions: sessionCount, activeSessions: activeCount } };
    }));
    res.json({ success: true, data: { mentors: mentorStats } });
  } catch (error) { next(error); }
};

exports.getReports = async (req, res, next) => {
  try {
    const { startDate, endDate, type = 'summary' } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    const [moodData, riskData, sessionData] = await Promise.all([
      MoodEntry.aggregate([
        { $match: { universityId: req.tenantId, date: { $gte: start, $lte: end } } },
        { $group: { _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, mood: '$mood' }, count: { $sum: 1 }, avgStress: { $avg: '$scores.stress' }, avgAnxiety: { $avg: '$scores.anxiety' } } },
        { $sort: { '_id.date': 1 } },
      ]),
      Conversation.aggregate([
        { $match: { universityId: req.tenantId, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      ]),
      AnonymousSession.aggregate([
        { $match: { universityId: req.tenantId, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);
    await AuditLog.create({ universityId: req.tenantId, userId: req.user._id, action: 'EXPORT_DATA', resource: 'Report', ipAddress: req.ip, metadata: { type, startDate: start, endDate: end } });
    res.json({ success: true, data: { period: { start, end }, moodData, riskData, sessionData } });
  } catch (error) { next(error); }
};

exports.exportCSV = async (req, res, next) => {
  try {
    const { type = 'mood' } = req.query;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let csv = '';
    if (type === 'mood') {
      const entries = await MoodEntry.find({ universityId: req.tenantId, date: { $gte: thirtyDaysAgo } }).sort({ date: -1 });
      csv = 'Date,Mood,Stress,Anxiety,Burnout,Motivation,Confidence,Sleep Quality\n';
      entries.forEach(e => { csv += `${e.date.toISOString().split('T')[0]},${e.mood},${e.scores.stress},${e.scores.anxiety},${e.scores.burnout},${e.scores.motivation},${e.scores.confidence},${e.scores.sleepQuality}\n`; });
    } else if (type === 'students') {
      const students = await User.find({ universityId: req.tenantId, role: 'student' }).select('firstName lastName email registrationNumber department isActive createdAt');
      csv = 'Name,Email,Registration Number,Department,Active,Joined\n';
      students.forEach(s => { csv += `${s.firstName} ${s.lastName},${s.email},${s.registrationNumber || ''},${s.department || ''},${s.isActive},${s.createdAt.toISOString().split('T')[0]}\n`; });
    }
    await AuditLog.create({ universityId: req.tenantId, userId: req.user._id, action: 'EXPORT_DATA', resource: 'CSV', ipAddress: req.ip, metadata: { type } });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=mindbridge-${type}-export.csv`);
    res.send(csv);
  } catch (error) { next(error); }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, severity } = req.query;
    const filter = { universityId: req.tenantId };
    if (action) filter.action = action;
    if (severity) filter.severity = severity;
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).populate('userId', 'firstName lastName email role');
    const total = await AuditLog.countDocuments(filter);
    res.json({ success: true, data: { logs, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};
