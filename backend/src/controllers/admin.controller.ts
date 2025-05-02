import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Campaign } from '../models/campaign';
import { User } from '../models/user.model';
import Business from '../models/business';

export const adminController = {
  // Campaign management
  getAllCampaigns: async (req: AuthRequest, res: Response) => {
    try {
      const campaigns = await Campaign.find()
        .populate('businessId', 'businessName email')
        .sort({ createdAt: -1 });
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ message: 'Error fetching campaigns' });
    }
  },

  deleteCampaign: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await Campaign.findByIdAndDelete(id);
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({ message: 'Error deleting campaign' });
    }
  },

  updateCampaignStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const campaign = await Campaign.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      res.json(campaign);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      res.status(500).json({ message: 'Error updating campaign status' });
    }
  },

  // Company management
  getAllCompanies: async (req: AuthRequest, res: Response) => {
    try {
      const companies = await Business.find()
        .select('businessName email status createdAt')
        .sort({ createdAt: -1 });
      res.json(companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ message: 'Error fetching companies' });
    }
  },

  deleteCompany: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await Business.findByIdAndDelete(id);
      res.json({ message: 'Company deleted successfully' });
    } catch (error) {
      console.error('Error deleting company:', error);
      res.status(500).json({ message: 'Error deleting company' });
    }
  },

  updateCompanyStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const company = await Business.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      res.json(company);
    } catch (error) {
      console.error('Error updating company status:', error);
      res.status(500).json({ message: 'Error updating company status' });
    }
  },

  // User management
  getAllUsers: async (req: AuthRequest, res: Response) => {
    try {
      const users = await User.find()
        .select('firstName lastName email role status createdAt')
        .sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  deleteUser: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await User.findByIdAndDelete(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  },

  updateUserStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = await User.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      res.json(user);
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ message: 'Error updating user status' });
    }
  }
}; 