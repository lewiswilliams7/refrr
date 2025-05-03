"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const campaign_controller_1 = require("../controllers/campaign.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Protected routes (require authentication)
router.use(auth_1.authenticateToken);
// Campaign routes
router.post('/', campaign_controller_1.campaignController.createCampaign);
router.get('/', campaign_controller_1.campaignController.getCampaigns);
router.get('/:id', campaign_controller_1.campaignController.getCampaignById);
router.patch('/:id', campaign_controller_1.campaignController.updateCampaign);
router.delete('/:id', campaign_controller_1.campaignController.deleteCampaign);
// Public routes (no authentication required)
router.get('/public', campaign_controller_1.campaignController.getPublicCampaigns);
router.get('/public/:id', campaign_controller_1.campaignController.getPublicCampaign);
exports.default = router;
