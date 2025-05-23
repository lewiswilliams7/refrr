import nodemailer from 'nodemailer';
import { Schema } from 'mongoose';

// Validate required environment variables
const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'FRONTEND_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Log email configuration (without sensitive data)
console.log('Email configuration:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  from: process.env.SMTP_FROM,
  frontendUrl: process.env.FRONTEND_URL
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
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  date?: string | Date | Schema.Types.Date;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      date: options.date ? new Date(options.date.toString()).toISOString() : undefined
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (email: string, token: string, expiresAt: string | Date | Schema.Types.Date): Promise<void> => {
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

export const sendPasswordResetEmail = async (email: string, token: string, expiresAt: string | Date | Schema.Types.Date): Promise<void> => {
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