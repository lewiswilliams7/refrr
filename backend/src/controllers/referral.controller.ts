import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Referral } from '../models/referrals';
import Campaign, { ICampaign } from '../models/campaign.model';
import { User } from '../models/user.model';
import mongoose from 'mongoose';
import { generateReferralCode } from '../utils/codeGenerator';
import { validateEmail } from '../utils/validators';
import { sendEmail } from '../utils/email';

interface PopulatedCampaign {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  rewardDescription: string;
}

interface PopulatedBusiness {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
}

interface PopulatedReferral {
  _id: mongoose.Types.ObjectId;
  campaignId: PopulatedCampaign;
  businessId: PopulatedBusiness;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  referrerEmail?: string;
  code?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export const referralController = {
  // Create new referral
  create: async (req: AuthRequest, res: Response) => {
    try {
      console.log('Received referral creation request:', req.body);
      const { campaignId, referrerEmail } = req.body;
      
      if (!campaignId || !referrerEmail) {
        console.log('Missing required fields:', { campaignId, referrerEmail });
        return res.status(400).json({ 
          message: 'Required fields missing: campaignId, referrerEmail' 
        });
      }

      if (!validateEmail(referrerEmail)) {
        return res.status(400).json({ 
          message: 'Invalid email format' 
        });
      }

      const campaign = await Campaign.findOne({ 
        _id: campaignId,
        businessId: req.user?._id
      });

      if (!campaign) {
        return res.status(404).json({ 
          message: 'Campaign not found or not authorized' 
        });
      }

      const code = await generateReferralCode();

      const referral = new Referral({
        campaignId,
        businessId: req.user?._id,
        referrerEmail,
        code,
        status: 'pending'
      });

      await referral.save();
      
      res.status(201).json({
        code,
        referrerEmail,
        campaignId
      });
    } catch (error) {
      console.error('Referral creation error:', error);
      res.status(500).json({ 
        message: 'Error creating referral',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Get all referrals for a business
  getBusinessReferrals: async (req: AuthRequest, res: Response) => {
    try {
      const referrals = await Referral.find({ 
        businessId: req.user?._id 
      })
      .populate('campaignId', 'title rewardType rewardValue')
      .populate('businessId', 'firstName lastName email')
      .sort({ createdAt: -1 });
      
      res.json(referrals);
    } catch (error) {
      console.error('Referral fetch error:', error);
      res.status(500).json({ message: 'Error fetching referrals', error });
    }
  },

  // Get single referral
  getReferral: async (req: AuthRequest, res: Response) => {
    try {
      const referral = await Referral.findOne({
        _id: req.params.id,
        businessId: req.user?._id
      })
      .populate('campaignId', 'title rewardType rewardValue')
      .populate('businessId', 'firstName lastName email');
      
      if (!referral) {
        return res.status(404).json({ message: 'Referral not found' });
      }

      if (referral.businessId.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this referral' });
      }

      res.json(referral);
    } catch (error) {
      console.error('Referral fetch error:', error);
      res.status(500).json({ message: 'Error fetching referral', error });
    }
  },

  // Update referral status
  updateStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status. Must be pending, approved, or rejected' 
        });
      }

      const referral = await Referral.findOne({
        _id: req.params.id,
        businessId: req.user?._id
      });
      
      if (!referral) {
        return res.status(404).json({ message: 'Referral not found' });
      }

      if (referral.businessId.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this referral' });
      }

      referral.status = status;
      await referral.save();

      res.json(referral);
    } catch (error) {
      console.error('Referral status update error:', error);
      res.status(500).json({ message: 'Error updating referral status', error });
    }
  },

  // Public endpoints
  getReferralByCode: async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      console.log('Fetching referral for code:', code);

      const referral = await Referral.findOne({ code })
        .populate<{ campaignId: PopulatedCampaign, businessId: PopulatedBusiness }>([
          { path: 'campaignId', select: 'title description rewardType rewardValue rewardDescription' },
          { path: 'businessId', select: 'firstName lastName email' }
        ]);

      if (!referral) {
        return res.status(404).json({ message: 'Referral not found' });
      }

      if (referral.referrerEmail) {
        return res.status(400).json({ message: 'This referral has already been used' });
      }

      const populatedReferral = referral as unknown as PopulatedReferral;

      res.json({
        campaignDetails: {
          title: populatedReferral.campaignId.title,
          description: populatedReferral.campaignId.description,
          rewardType: populatedReferral.campaignId.rewardType,
          rewardValue: populatedReferral.campaignId.rewardValue,
          rewardDescription: populatedReferral.campaignId.rewardDescription
        },
        businessDetails: {
          firstName: populatedReferral.businessId.firstName,
          lastName: populatedReferral.businessId.lastName,
          email: populatedReferral.businessId.email
        }
      });
    } catch (error) {
      console.error('Referral fetch error:', error);
      res.status(500).json({ message: 'Error fetching referral', error });
    }
  },

  completeReferral: async (req: AuthRequest, res: Response) => {
    try {
      const referral = await Referral.findOne({
        _id: req.params.id,
        businessId: req.user?._id
      });
      
      if (!referral) {
        return res.status(404).json({ message: 'Referral not found' });
      }

      referral.status = 'completed';
      referral.completedAt = new Date();
      await referral.save();
      res.json(referral);
    } catch (error) {
      console.error('Error completing referral:', error);
      res.status(500).json({ message: 'Error completing referral' });
    }
  },

  // Generate referral link for a campaign
  generateReferralLink: async (req: AuthRequest, res: Response) => {
    try {
      const { campaignId } = req.body;
      
      if (!campaignId) {
        return res.status(400).json({ message: 'Campaign ID is required' });
      }

      const code = await generateReferralCode();
      const referral = new Referral({
        campaignId,
        businessId: req.user?._id,
        code,
        status: 'pending'
      });

      await referral.save();

      const referralLink = `${process.env.FRONTEND_URL}/referral/${code}`;

      res.json({
        code,
        referralLink
      });
    } catch (error) {
      console.error('Error generating referral link:', error);
      res.status(500).json({ message: 'Error generating referral link' });
    }
  }
};