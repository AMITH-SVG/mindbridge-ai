const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

async function sendOTPEmail(to, otp, purpose = 'verification') {
  if (!transporter) {
    console.log(`[EMAIL-DEV] OTP for ${to}: ${otp} (Purpose: ${purpose})`);
    return true;
  }
  const subjects = {
    verification: 'MindBridge AI - Email Verification',
    password_reset: 'MindBridge AI - Password Reset',
    login: 'MindBridge AI - Login Verification',
  };
  await transporter.sendMail({
    from: `"MindBridge AI" <${env.SMTP_USER}>`,
    to,
    subject: subjects[purpose] || subjects.verification,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fafafa;">
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <h1 style="font-size: 20px; font-weight: 600; color: #111; margin: 0 0 8px;">MindBridge AI</h1>
          <p style="color: #666; font-size: 14px; margin: 0 0 24px;">Your verification code</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 13px; margin: 0;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      </div>
    `,
  });
  return true;
}

module.exports = { sendOTPEmail };
