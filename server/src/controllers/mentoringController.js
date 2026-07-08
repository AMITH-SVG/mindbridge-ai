const { AnonymousSession, User } = require('../models');
const { generateAnonId } = require('../utils/helpers');

exports.requestSession = async (req, res, next) => {
  try {
    const activeSessions = await AnonymousSession.countDocuments({ universityId: req.tenantId, studentId: req.user._id, status: { $in: ['pending', 'active'] } });
    if (activeSessions >= 3) return res.status(400).json({ success: false, message: 'You already have active mentoring sessions. Please complete them first.' });
    const availableMentor = await User.findOne({ universityId: req.tenantId, role: { $in: ['mentor', 'counsellor'] }, isActive: true, isVerified: true });
    if (!availableMentor) return res.status(404).json({ success: false, message: 'No mentors available at this time. Please try again later.' });
    const session = await AnonymousSession.create({
      universityId: req.tenantId,
      studentAnonId: generateAnonId('Student'),
      mentorAnonId: generateAnonId('Mentor'),
      studentId: req.user._id,
      mentorId: availableMentor._id,
      status: 'active',
      riskLevel: req.body.riskLevel || 'medium',
    });
    res.status(201).json({ success: true, message: 'Anonymous mentoring session created.', data: { sessionId: session._id, yourAnonId: session.studentAnonId, mentorAnonId: session.mentorAnonId, status: session.status } });
  } catch (error) { next(error); }
};

exports.getStudentSessions = async (req, res, next) => {
  try {
    const sessions = await AnonymousSession.find({ universityId: req.tenantId, studentId: req.user._id })
      .sort({ createdAt: -1 }).select('studentAnonId mentorAnonId status riskLevel messages createdAt closedAt');
    res.json({ success: true, data: { sessions } });
  } catch (error) { next(error); }
};

exports.getMentorSessions = async (req, res, next) => {
  try {
    const sessions = await AnonymousSession.find({ universityId: req.tenantId, mentorId: req.user._id })
      .sort({ createdAt: -1 }).select('studentAnonId mentorAnonId status riskLevel messages createdAt closedAt')
      .select('+mentorNotes');
    res.json({ success: true, data: { sessions } });
  } catch (error) { next(error); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const session = await AnonymousSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.status !== 'active') return res.status(400).json({ success: false, message: 'Session is not active.' });
    let senderId;
    if (req.user._id.toString() === session.studentId?.toString()) senderId = session.studentAnonId;
    else if (req.user._id.toString() === session.mentorId?.toString()) senderId = session.mentorAnonId;
    else return res.status(403).json({ success: false, message: 'You are not part of this session.' });
    session.messages.push({ senderId, content: req.body.message, timestamp: new Date() });
    await session.save();
    res.json({ success: true, message: 'Message sent.', data: { messageCount: session.messages.length } });
  } catch (error) { next(error); }
};

exports.closeSession = async (req, res, next) => {
  try {
    const session = await AnonymousSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    session.status = 'closed';
    session.closedAt = new Date();
    session.studentAnonId = 'REDACTED-' + generateAnonId('X');
    session.mentorAnonId = 'REDACTED-' + generateAnonId('X');
    await session.save();
    res.json({ success: true, message: 'Session closed. Anonymous IDs have been destroyed.' });
  } catch (error) { next(error); }
};

exports.addMentorNotes = async (req, res, next) => {
  try {
    const session = await AnonymousSession.findById(req.params.id).select('+mentorNotes +mentorId');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (req.user._id.toString() !== session.mentorId?.toString()) return res.status(403).json({ success: false, message: 'Only the assigned mentor can add notes.' });
    session.mentorNotes = req.body.notes;
    await session.save();
    res.json({ success: true, message: 'Notes updated.' });
  } catch (error) { next(error); }
};

exports.getSessionMessages = async (req, res, next) => {
  try {
    const session = await AnonymousSession.findById(req.params.id).select('studentAnonId mentorAnonId messages status');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    res.json({ success: true, data: { messages: session.messages, status: session.status } });
  } catch (error) { next(error); }
};
