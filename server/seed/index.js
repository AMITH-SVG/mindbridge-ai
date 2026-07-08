require('dotenv').config();
const mongoose = require('mongoose');
const { University, User, MoodEntry, Conversation, AnonymousSession } = require('../src/models');
const env = require('../src/config/env');
const { generateAnonId } = require('../src/utils/helpers');

async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB. Clearing existing data...');
    await Promise.all([
      University.deleteMany({}), User.deleteMany({}),
      MoodEntry.deleteMany({}), Conversation.deleteMany({}),
      AnonymousSession.deleteMany({})
    ]);

    console.log('Seeding University...');
    const university = await University.create({
      name: 'Demo University',
      slug: 'demo-university',
      allowedDomains: ['demo.edu', 'gmail.com'], // gmail allowed for easy testing
      contactEmail: 'admin@demo.edu',
      isActive: true,
      isApproved: true,
      branding: { primaryColor: '#4F46E5', secondaryColor: '#7C3AED' }
    });

    console.log('Seeding Users...');
    const superAdmin = await User.create({
      universityId: university._id, role: 'super_admin', email: 'superadmin@demo.edu', passwordHash: 'Password123',
      firstName: 'Super', lastName: 'Admin', isVerified: true, isActive: true
    });
    
    const admin = await User.create({
      universityId: university._id, role: 'university_admin', email: 'admin@demo.edu', passwordHash: 'Password123',
      firstName: 'University', lastName: 'Admin', isVerified: true, isActive: true
    });

    const mentor = await User.create({
      universityId: university._id, role: 'mentor', email: 'mentor@demo.edu', passwordHash: 'Password123',
      firstName: 'John', lastName: 'Doe', staffId: 'FAC001', department: 'Computer Science', isVerified: true, isActive: true
    });

    const student = await User.create({
      universityId: university._id, role: 'student', email: 'student@demo.edu', passwordHash: 'Password123',
      firstName: 'Jane', lastName: 'Smith', registrationNumber: 'STU001', department: 'Computer Science', isVerified: true, isActive: true
    });

    console.log('Seeding Wellness Data...');
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      await MoodEntry.create({
        universityId: university._id, studentId: student._id, date,
        mood: ['happy', 'neutral', 'anxious', 'tired'][Math.floor(Math.random() * 4)] || 'neutral',
        scores: { stress: Math.floor(Math.random() * 40) + 30, motivation: Math.floor(Math.random() * 40) + 50 },
        source: 'checkin'
      });
    }

    console.log('Seeding Anonymous Sessions...');
    await AnonymousSession.create({
      universityId: university._id, studentId: student._id, mentorId: mentor._id,
      studentAnonId: generateAnonId('Student'), mentorAnonId: generateAnonId('Mentor'),
      status: 'active', riskLevel: 'medium',
      messages: [{ senderId: generateAnonId('Student'), content: 'I am feeling overwhelmed with exams.', timestamp: new Date() }]
    });

    console.log('Seeding complete!');
    console.log('\n--- Test Accounts ---');
    console.log('Super Admin: superadmin@demo.edu / Password123');
    console.log('Admin:       admin@demo.edu / Password123');
    console.log('Mentor:      mentor@demo.edu / Password123');
    console.log('Student:     student@demo.edu / Password123');
    console.log('---------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
