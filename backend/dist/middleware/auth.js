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
exports.isAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
// Debug logging utility
const debug = (message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 ${message}`, data ? JSON.stringify(data, null, 2) : '');
};
// Error logging utility
const error = (message, err) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ${message}`, {
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        raw: err
    });
};
// JWT secret with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'YS9XaEpwNtaGJ5rl';
debug('Using JWT secret:', { hasEnvSecret: !!process.env.JWT_SECRET });
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Access token is required' });
        }
        // Get the authorization header as a string
        let authToken;
        if (typeof authHeader === 'string') {
            authToken = authHeader;
        }
        else if (Array.isArray(authHeader)) {
            authToken = authHeader[0] || '';
        }
        else {
            return res.status(401).json({ message: 'Invalid authorization header' });
        }
        if (!authToken) {
            return res.status(401).json({ message: 'Access token is required' });
        }
        // Split the token and validate format
        const [bearer, token] = authToken.split(' ');
        if (bearer !== 'Bearer' || !token) {
            return res.status(401).json({ message: 'Invalid token format' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded._id) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = yield user_model_1.User.findById(decoded._id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});
exports.authenticateToken = authenticateToken;
const isAdmin = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};
exports.isAdmin = isAdmin;
