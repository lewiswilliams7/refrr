"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const admin_controller_1 = require("../controllers/admin.controller");
const router = express_1.default.Router();
// Apply authentication and admin check to all admin routes
router.use((req, res, next) => {
    (0, auth_1.authenticateToken)(req, res, () => {
        (0, auth_1.isAdmin)(req, res, next);
    });
});
// Admin routes
router.get('/campaigns', admin_controller_1.adminController.getAllCampaigns);
router.delete('/campaigns/:id', admin_controller_1.adminController.deleteCampaign);
router.patch('/campaigns/:id/status', admin_controller_1.adminController.updateCampaignStatus);
router.get('/companies', admin_controller_1.adminController.getAllCompanies);
router.delete('/companies/:id', admin_controller_1.adminController.deleteCompany);
router.patch('/companies/:id/status', admin_controller_1.adminController.updateCompanyStatus);
router.get('/users', admin_controller_1.adminController.getAllUsers);
router.delete('/users/:id', admin_controller_1.adminController.deleteUser);
router.patch('/users/:id/status', admin_controller_1.adminController.updateUserStatus);
exports.default = router;
