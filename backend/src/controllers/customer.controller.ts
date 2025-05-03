import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/user.model';
import { Campaign } from '../models/campaign';
import { Referral } from '../models/referrals';
import Business from '../models/business';
import mongoose from 'mongoose';

interface CampaignReward {
  _id: mongoose.Types.ObjectId;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
}

interface ReferralDocument {
  _id: mongoose.Types.ObjectId;
  campaignId: CampaignReward;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

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
  businessName: string;
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
}

interface PopulatedReferral {
  _id: mongoose.Types.ObjectId;
  campaignId: PopulatedCampaign;
  businessId: PopulatedBusiness;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export const customerController = {
  getAnalytics: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      const userEmail = req.user?.email;

      if (!userId || !userEmail) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Get total referrals count
      const totalReferrals = await Referral.countDocuments({
        referrerEmail: userEmail
      });

      // Get successful referrals count
      const successfulReferrals = await Referral.countDocuments({
        referrerEmail: userEmail,
        status: 'approved'
      });

      // Get pending referrals count
      const pendingReferrals = await Referral.countDocuments({
        referrerEmail: userEmail,
        status: 'pending'
      });

      // Get total rewards earned
      const completedReferrals = await Referral.find({
        referrerEmail: userEmail,
        status: 'approved'
      }).populate<{ campaignId: CampaignReward }>('campaignId', 'rewardType rewardValue');

      const totalRewards = completedReferrals.reduce((total: number, referral: ReferralDocument) => {
        const campaign = referral.campaignId as CampaignReward;
        if (campaign.rewardType === 'percentage') {
          return total + campaign.rewardValue;
        } else {
          return total + campaign.rewardValue;
        }
      }, 0);

      // Get recent activity (last 5 referrals)
      const recentActivity = await Referral.find({ referrerEmail: userEmail })
        .populate<{ campaignId: PopulatedCampaign, businessId: PopulatedBusiness }>([
          { path: 'campaignId', select: 'title businessName rewardType rewardValue' },
          { path: 'businessId', select: 'businessName contact' }
        ])
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        totalRewards,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      res.status(500).json({ message: 'Error fetching customer analytics' });
    }
  },
  getCustomerProfile: async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findById(req.user?._id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      res.status(500).json({ message: 'Error fetching customer profile' });
    }
  },
  // Create new referral
  createReferral: async (req: Request, res: Response) => {
    try {
      const { 
        code,
        customerName,
        customerEmail,
        customerPhone
      } = req.body;

      if (!code || !customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ 
          message: 'Required fields missing: code, customerName, customerEmail, customerPhone' 
        });
      }

      const referral = await Referral.findOne({ code })
        .populate<{ campaignId: PopulatedCampaign, businessId: PopulatedBusiness }>([
          { path: 'campaignId', select: 'title description rewardType rewardValue rewardDescription' },
          { path: 'businessId', select: 'businessName contact' }
        ]);

      if (!referral) {
        return res.status(404).json({ message: 'Referral code not found' });
      }

      if (referral.status !== 'pending') {
        return res.status(400).json({ message: 'This referral has already been used' });
      }

      referral.customerName = customerName;
      referral.customerEmail = customerEmail;
      referral.customerPhone = customerPhone;
      referral.status = 'approved';
      await referral.save();

      const populatedReferral = referral as unknown as PopulatedReferral;

      res.status(201).json({
        message: 'Referral created successfully',
        referral: {
          id: populatedReferral._id,
          campaign: {
            title: populatedReferral.campaignId.title,
            description: populatedReferral.campaignId.description,
            rewardType: populatedReferral.campaignId.rewardType,
            rewardValue: populatedReferral.campaignId.rewardValue,
            rewardDescription: populatedReferral.campaignId.rewardDescription
          },
          business: {
            name: populatedReferral.businessId.businessName,
            contact: populatedReferral.businessId.contact
          }
        }
      });
    } catch (error) {
      console.error('Referral creation error:', error);
      res.status(500).json({ 
        message: 'Error creating referral',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Get customer's referrals
  getCustomerReferrals: async (req: Request, res: Response) => {
    try {
      const { email } = req.params;

      const referrals = await Referral.find({ 
        customerEmail: email,
        status: { $in: ['approved', 'completed'] }
      })
      .populate<{ campaignId: PopulatedCampaign, businessId: PopulatedBusiness }>([
        { path: 'campaignId', select: 'title description rewardType rewardValue rewardDescription' },
        { path: 'businessId', select: 'businessName contact' }
      ])
      .sort({ createdAt: -1 });

      const populatedReferrals = referrals as unknown as PopulatedReferral[];

      res.json(populatedReferrals.map(referral => ({
        id: referral._id,
        campaign: {
          title: referral.campaignId.title,
          description: referral.campaignId.description,
          rewardType: referral.campaignId.rewardType,
          rewardValue: referral.campaignId.rewardValue,
          rewardDescription: referral.campaignId.rewardDescription
        },
        business: {
          name: referral.businessId.businessName,
          contact: referral.businessId.contact
        },
        status: referral.status,
        createdAt: referral.createdAt,
        completedAt: referral.completedAt
      })));
    } catch (error) {
      console.error('Referral fetch error:', error);
      res.status(500).json({ message: 'Error fetching referrals', error });
    }
  },

  // Get single referral
  getReferral: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const referral = await Referral.findOne({ 
        _id: id,
        status: { $in: ['approved', 'completed'] }
      })
      .populate<{ campaignId: PopulatedCampaign, businessId: PopulatedBusiness }>([
        { path: 'campaignId', select: 'title description rewardType rewardValue rewardDescription' },
        { path: 'businessId', select: 'businessName contact' }
      ]);

      if (!referral) {
        return res.status(404).json({ message: 'Referral not found' });
      }

      const populatedReferral = referral as unknown as PopulatedReferral;

      res.json({
        id: populatedReferral._id,
        campaign: {
          title: populatedReferral.campaignId.title,
          description: populatedReferral.campaignId.description,
          rewardType: populatedReferral.campaignId.rewardType,
          rewardValue: populatedReferral.campaignId.rewardValue,
          rewardDescription: populatedReferral.campaignId.rewardDescription
        },
        business: {
          name: populatedReferral.businessId.businessName,
          contact: populatedReferral.businessId.contact
        },
        status: populatedReferral.status,
        createdAt: populatedReferral.createdAt,
        completedAt: populatedReferral.completedAt
      });
    } catch (error) {
      console.error('Referral fetch error:', error);
      res.status(500).json({ message: 'Error fetching referral', error });
    }
  },

  // Complete referral
  completeReferral: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const referral = await Referral.findOne({ 
        _id: id,
        status: 'approved'
      });

      if (!referral) {
        return res.status(404).json({ message: 'Referral not found or not approved' });
      }

      referral.status = 'completed';
      referral.completedAt = new Date();
      await referral.save();

      res.json({ message: 'Referral completed successfully' });
    } catch (error) {
      console.error('Referral completion error:', error);
      res.status(500).json({ message: 'Error completing referral', error });
    }
  }
}; 