"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});
exports.sendEmail = sendEmail;
const sendVerificationEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    yield (0, exports.sendEmail)({
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
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    yield (0, exports.sendEmail)({
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
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
