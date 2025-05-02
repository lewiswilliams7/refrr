import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendEmail = async (options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
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
    `
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
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
    `
  });
}; 