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

// Log missing environment variables but don't exit
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.warn('Missing email environment variables:', missingEnvVars);
  console.warn('Email functionality will be disabled');
}

// Log email configuration (without sensitive data)
console.log('Email configuration:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  from: process.env.SMTP_FROM,
  frontendUrl: process.env.FRONTEND_URL,
  isConfigured: missingEnvVars.length === 0
});

// Create a mock transporter for development or when email is not configured
const createMockTransporter = () => {
  console.log('Using mock email transporter');
  return {
    sendMail: async (options: any) => {
      console.log('Mock email would be sent:', {
        to: options.to,
        subject: options.subject,
        // Don't log the full HTML content
        hasHtml: !!options.html
      });
      return { messageId: 'mock-message-id' };
    },
    verify: async () => true
  };
};

// Create real or mock transporter based on environment and configuration
const transporter = (process.env.NODE_ENV === 'production' && missingEnvVars.length === 0)
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : createMockTransporter();

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
  date?: string | Date;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      date: options.date ? new Date(options.date).toISOString() : undefined
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  const html = `
    <h1>Welcome to Refrr!</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
  `;
  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    html
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const html = `
    <h1>Password Reset</h1>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `;
  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html
  });
}; 