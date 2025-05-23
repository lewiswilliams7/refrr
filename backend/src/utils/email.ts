import nodemailer from 'nodemailer';
import { Schema } from 'mongoose';

const emailUser = 'verify.refrr@gmail.com';
// Replace this with your new app password from Google
const emailPass = 'nuyy kvfe jhhc ytur';

// Log email configuration (without sensitive data)
console.log('Email configuration:', {
  service: 'gmail',
  user: emailUser,
  frontendUrl: process.env.FRONTEND_URL || 'not configured'
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
    console.error('Email configuration:', {
      service: 'gmail',
      user: emailUser,
      pass: emailPass ? 'configured' : 'not configured'
    });
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

export const sendEmail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  date?: string;
}): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    date: options.date ? new Date(options.date).toISOString() : undefined
  };

  await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async (email: string, token: string, expiresAt: string): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
    <p>This link will expire in 24 hours.</p>
  `;
  await sendEmail({
    to: email,
    subject: 'Verify Your Email',
    html,
    date: expiresAt
  });
};

export const sendPasswordResetEmail = async (email: string, token: string, expiresAt: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
    <h1>Reset Your Password</h1>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 24 hours.</p>
  `;
  await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html,
    date: expiresAt
  });
}; 