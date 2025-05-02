import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { adminController } from '../controllers/admin.controller';

const router = express.Router();

// Apply authentication and admin check to all admin routes
router.use((req, res, next) => {
  authenticateToken(req, res, () => {
    isAdmin(req, res, next);
  });
});

// Admin routes
router.get('/campaigns', adminController.getAllCampaigns);
router.delete('/campaigns/:id', adminController.deleteCampaign);
router.patch('/campaigns/:id/status', adminController.updateCampaignStatus);

router.get('/companies', adminController.getAllCompanies);
router.delete('/companies/:id', adminController.deleteCompany);
router.patch('/companies/:id/status', adminController.updateCompanyStatus);

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/status', adminController.updateUserStatus);

export default router; 