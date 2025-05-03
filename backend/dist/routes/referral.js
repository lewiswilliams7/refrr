"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const referral_controller_1 = require("../controllers/referral.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Debug logging middleware
router.use((req, res, next) => {
    console.log(`[Referral Routes] ${req.method} ${req.url}`);
    next();
});
// Public routes (no authentication required)
router.get('/code/:code', referral_controller_1.referralController.getReferralByCode);
router.post('/complete/:code', referral_controller_1.referralController.completeReferral);
// Protected routes (require authentication)
router.use(auth_1.authenticateToken); // Authentication middleware for routes below this line
// These routes require authentication
router.post('/', referral_controller_1.referralController.create);
router.get('/', referral_controller_1.referralController.getBusinessReferrals);
router.post('/generate/:campaignId', referral_controller_1.referralController.generateReferralLink);
router.get('/:id', referral_controller_1.referralController.getReferral);
router.patch('/:id/status', referral_controller_1.referralController.updateStatus);
// 404 handler for referral routes
router.use((req, res) => {
    console.log(`[Referral Routes] 404: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Referral route not found' });
});
exports.default = router;
