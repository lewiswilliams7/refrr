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
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
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
  text: string;
  html?: string;
  date?: Date;
}) => {
  try {
    console.log('Preparing to send email to:', options.to);
    const mailOptions = {
      from: emailUser,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      date: options.date ? options.date.toISOString() : undefined
    };

    console.log('Sending email with options:', {
      to: options.to,
      subject: options.subject,
      from: emailUser,
      date: mailOptions.date
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (email: string, token: string, expiresAt?: Date) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/#/verify-email/${token}`;
  console.log('Generated verification URL:', verificationUrl);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  
  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    text: `Please click the following link to verify your email: ${verificationUrl}`,
    html: `
      <h1>Verify your email address</h1>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `,
    date: expiresAt
  });
};

export const sendPasswordResetEmail = async (email: string, token: string, expiresAt?: Date) => {
  const resetUrl = `${process.env.FRONTEND_URL}/#/reset-password/${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Reset your password',
    text: `Please click the following link to reset your password: ${resetUrl}`,
    html: `
      <h1>Reset your password</h1>
      <p>Please click the button below to reset your password:</p>
      <a href="${resetUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
    `,
    date: expiresAt
  });
}; 