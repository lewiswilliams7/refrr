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
exports.authController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const email_1 = require("../utils/email");
const JWT_SECRET = process.env.JWT_SECRET || 'YS9XaEpwNtaGJ5rl';
exports.authController = {
    // Register new user
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password, firstName, lastName, role, businessName, businessType, location, businessDescription } = req.body;
            // Check if user already exists
            const existingUser = yield user_model_1.User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
            // Create new user
            const user = new user_model_1.User({
                email,
                password,
                firstName,
                lastName,
                role,
                businessName,
                businessType,
                location,
                businessDescription
            });
            yield user.save();
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ _id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            res.status(201).json({ token, user: Object.assign(Object.assign({}, user.toObject()), { password: undefined }) });
        }
        catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Error registering user' });
        }
    }),
    // Register new customer
    registerCustomer: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password, firstName, lastName } = req.body;
            // Debug log
            console.log('Customer registration attempt:', {
                email,
                firstName,
                lastName
            });
            // Validate required fields
            if (!email || !password || !firstName || !lastName) {
                console.log('Missing fields:', {
                    email: !!email,
                    password: !!password,
                    firstName: !!firstName,
                    lastName: !!lastName
                });
                return res.status(400).json({
                    message: 'All fields are required: email, password, firstName, lastName'
                });
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            // Validate password length
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters long' });
            }
            // Check if user already exists
            const existingUser = yield user_model_1.User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
            // Create new customer user with explicit role
            const user = new user_model_1.User({
                email,
                password,
                firstName,
                lastName,
                role: 'customer' // Explicitly set role as customer
            });
            // Save the user
            const savedUser = yield user.save();
            console.log('Customer user saved:', savedUser);
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ _id: savedUser._id, email: savedUser.email, role: savedUser.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            res.status(201).json({
                message: 'Customer registered successfully',
                token,
                user: {
                    id: savedUser._id,
                    email: savedUser.email,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    role: savedUser.role
                },
            });
        }
        catch (error) {
            console.error('Customer registration error:', error);
            // Log the full error for debugging
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
            }
            res.status(500).json({
                message: 'Error creating customer',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }),
    // Login user
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            // Find user by email
            const user = yield user_model_1.User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            // Check password
            const isMatch = yield user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ _id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            res.json({ token, user: Object.assign(Object.assign({}, user.toObject()), { password: undefined }) });
        }
        catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Error logging in' });
        }
    }),
    // Get current user
    getProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        }
        catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ message: 'Error fetching profile' });
        }
    }),
    updateProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield user_model_1.User.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, req.body, { new: true, runValidators: true }).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        }
        catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Error updating profile' });
        }
    }),
    changePassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { currentPassword, newPassword } = req.body;
            const user = yield user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Verify current password
            const isMatch = yield user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
            // Update password
            user.password = newPassword;
            yield user.save();
            res.json({ message: 'Password updated successfully' });
        }
        catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({ message: 'Error changing password' });
        }
    }),
    forgotPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            const user = yield user_model_1.User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Generate reset token
            const resetToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
            // Send reset email
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            yield (0, email_1.sendEmail)({
                to: user.email,
                subject: 'Password Reset Request',
                text: `Click this link to reset your password: ${resetUrl}`
            });
            res.json({ message: 'Password reset email sent' });
        }
        catch (error) {
            console.error('Error sending password reset email:', error);
            res.status(500).json({ message: 'Error sending password reset email' });
        }
    }),
    resetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token, newPassword } = req.body;
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = yield user_model_1.User.findById(decoded._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Update password
            user.password = newPassword;
            yield user.save();
            res.json({ message: 'Password reset successfully' });
        }
        catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Error resetting password' });
        }
    }),
    verifyEmail: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // ... existing code ...
    }),
    resendVerificationEmail: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // ... existing code ...
    }),
    // Initialize admin account on startup
    initializeAdmin: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const adminEmail = process.env.ADMIN_EMAIL;
            const adminPassword = process.env.ADMIN_PASSWORD;
            const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
            const adminLastName = process.env.ADMIN_LAST_NAME || 'User';
            if (!adminEmail || !adminPassword) {
                console.log('Admin credentials not provided in environment variables. Skipping admin initialization.');
                return;
            }
            // Check if admin already exists
            const existingAdmin = yield user_model_1.User.findOne({ email: adminEmail });
            if (existingAdmin) {
                console.log('Admin account already exists.');
                return;
            }
            // Create admin user
            const admin = new user_model_1.User({
                email: adminEmail,
                password: adminPassword,
                firstName: adminFirstName,
                lastName: adminLastName,
                role: 'admin'
            });
            yield admin.save();
            console.log('Admin account created successfully');
        }
        catch (error) {
            console.error('Error initializing admin account:', error);
        }
    })
};
