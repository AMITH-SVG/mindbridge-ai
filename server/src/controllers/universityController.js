const { University, User, Conversation, MoodEntry, AnonymousSession } = require('../models');

exports.createUniversity = async (req, res, next) => {
  try {
    const { name, allowedDomains, contactEmail, contactPhone, address } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await University.findOne({ slug });
    if (existing) return res.status(409).json({ success: false, message: 'A university with a similar name already exists.' });
    const university = await University.create({ name, slug, allowedDomains, contactEmail, contactPhone, address, isApproved: false });
    res.status(201).json({ success: true, message: 'University registered. Pending approval.', data: { university } });
  } catch (error) { next(error); }
};

exports.getAllUniversities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status === 'active') { filter.isActive = true; filter.isApproved = true; }
    else if (status === 'pending') filter.isApproved = false;
    else if (status === 'inactive') filter.isActive = false;
    const universities = await University.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await University.countDocuments(filter);
    const withStats = await Promise.all(universities.map(async u => {
      const studentCount = await User.countDocuments({ universityId: u._id, role: 'student' });
      const mentorCount = await User.countDocuments({ universityId: u._id, role: { $in: ['mentor', 'counsellor'] } });
      return { ...u.toObject(), stats: { studentCount, mentorCount } };
    }));
    res.json({ success: true, data: { universities: withStats, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

exports.getUniversity = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).json({ success: false, message: 'University not found.' });
    const [studentCount, mentorCount, conversationCount, sessionCount] = await Promise.all([
      User.countDocuments({ universityId: university._id, role: 'student' }),
      User.countDocuments({ universityId: university._id, role: { $in: ['mentor', 'counsellor'] } }),
      Conversation.countDocuments({ universityId: university._id }),
      AnonymousSession.countDocuments({ universityId: university._id }),
    ]);
    res.json({ success: true, data: { university, stats: { studentCount, mentorCount, conversationCount, sessionCount } } });
  } catch (error) { next(error); }
};

exports.updateUniversity = async (req, res, next) => {
  try {
    const updates = req.body;
    delete updates._id; delete updates.slug;
    const university = await University.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!university) return res.status(404).json({ success: false, message: 'University not found.' });
    res.json({ success: true, message: 'University updated.', data: { university } });
  } catch (error) { next(error); }
};

exports.approveUniversity = async (req, res, next) => {
  try {
    const university = await University.findByIdAndUpdate(req.params.id, { isApproved: true, isActive: true }, { new: true });
    if (!university) return res.status(404).json({ success: false, message: 'University not found.' });
    res.json({ success: true, message: 'University approved.', data: { university } });
  } catch (error) { next(error); }
};

exports.deactivateUniversity = async (req, res, next) => {
  try {
    const current = await University.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: 'University not found.' });
    const university = await University.findByIdAndUpdate(req.params.id, { isActive: !current.isActive }, { new: true });
    if (!university) return res.status(404).json({ success: false, message: 'University not found.' });
    res.json({ success: true, message: `University ${university.isActive ? 'activated' : 'deactivated'}.`, data: { university } });
  } catch (error) { next(error); }
};

exports.getPlatformStats = async (req, res, next) => {
  try {
    const [totalUniversities, activeUniversities, totalStudents, totalMentors, totalConversations, totalSessions] = await Promise.all([
      University.countDocuments(),
      University.countDocuments({ isActive: true, isApproved: true }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: { $in: ['mentor', 'counsellor'] } }),
      Conversation.countDocuments(),
      AnonymousSession.countDocuments(),
    ]);
    res.json({
      success: true,
      data: {
        totalUniversities,
        activeUniversities,
        totalStudents,
        totalMentors,
        totalConversations,
        totalSessions,
        totalUsers: totalStudents + totalMentors,
        activeSubscriptions: activeUniversities,
        pendingApprovals: totalUniversities - activeUniversities,
      }
    });
  } catch (error) { next(error); }
};
