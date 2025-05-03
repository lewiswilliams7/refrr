"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const router = express_1.default.Router();
// Public routes
router.post('/register', (0, asyncHandler_1.default)(auth_controller_1.authController.register));
router.post('/register/customer', (0, asyncHandler_1.default)(auth_controller_1.authController.registerCustomer));
router.post('/login', (0, asyncHandler_1.default)(auth_controller_1.authController.login));
router.post('/forgot-password', (0, asyncHandler_1.default)(auth_controller_1.authController.forgotPassword));
router.post('/reset-password', (0, asyncHandler_1.default)(auth_controller_1.authController.resetPassword));
// Protected routes
router.use(auth_1.authenticateToken);
router.get('/me', (0, asyncHandler_1.default)(auth_controller_1.authController.getProfile));
router.patch('/me', (0, asyncHandler_1.default)(auth_controller_1.authController.updateProfile));
router.patch('/me/password', (0, asyncHandler_1.default)(auth_controller_1.authController.changePassword));
exports.default = router;
