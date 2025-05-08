import { Request, Response } from 'express';
import { Referral, IReferral } from '../models/referral.model';
import { Campaign } from '../models/campaign.model';
import { AuthRequest } from '../middleware/auth';
import { generateReferralCode } from '../utils/codeGenerator';
import { validateEmail } from '../utils/validators';
import { IPopulatedReferral } from '../types/referral.types';
import { User } from '../models/user.model';
import { sendEmail } from '../utils/email';
import mongoose, { Types } from 'mongoose';
import { Business } from '../models/business.model';
import { asyncHandler } from '../middleware/asyncHandler';

interface ReferralDocument extends IReferral {
  _id: Types.ObjectId;
  businessId: Types.ObjectId;
  campaignId: Types.ObjectId;
  referrerEmail: string;
  code: string;
  referredEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  trackingData?: {
    lastViewed: Date;
    viewCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const referralController = {
  // Create new referral
  createReferral: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const { campaignId, referrerEmail, referredEmail } = req.body;

      const campaign = await Campaign.findOne({
        _id: campaignId,
        businessId: business._id
      });

      if (!campaign) {
        res.status(404).json({ message: 'Campaign not found' });
        return;
      }

      const referral = new Referral({
        campaignId,
        businessId: business._id,
        referrerEmail,
        referredEmail,
        status: 'pending'
      });

      await referral.save();

      res.status(201).json(referral);
    } catch (error) {
      console.error('Create referral error:', error);
      res.status(500).json({ message: 'Error creating referral' });
    }
  },

  // Get all referrals for a business
  getBusinessReferrals: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const referrals = await Referral.find({ businessId: business._id });
      res.json(referrals);
    } catch (error) {
      console.error('Get business referrals error:', error);
      res.status(500).json({ message: 'Error fetching referrals' });
    }
  },

  // Get referral by ID
  getReferralById: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const referral = await Referral.findOne({
        _id: req.params.id,
        businessId: business._id
      });

      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      res.json(referral);
    } catch (error) {
      console.error('Get referral error:', error);
      res.status(500).json({ message: 'Error fetching referral' });
    }
  },

  // Update referral status
  updateReferralStatus: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const referral = await Referral.findOne({
        _id: req.params.id,
        businessId: business._id
      });

      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      const { status } = req.body;
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }

      referral.status = status;
      await referral.save();

      res.json(referral);
    } catch (error) {
      console.error('Update referral status error:', error);
      res.status(500).json({ message: 'Error updating referral status' });
    }
  },

  // Delete referral
  deleteReferral: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const referral = await Referral.findOne({
        _id: req.params.id,
        businessId: business._id
      });

      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      await referral.deleteOne();

      res.json({ message: 'Referral deleted successfully' });
    } catch (error) {
      console.error('Delete referral error:', error);
      res.status(500).json({ message: 'Error deleting referral' });
    }
  },

  // Public endpoints
  getReferralByCode: async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const referral = await Referral.findOne({ code })
        .populate('campaignId', 'title rewardType rewardValue rewardDescription');

      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      res.json(referral);
    } catch (error) {
      console.error('Error fetching referral by code:', error);
      res.status(500).json({ message: 'Error fetching referral' });
    }
  },

  completeReferral: async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const { referredEmail } = req.body;

      if (!referredEmail || !validateEmail(referredEmail)) {
        res.status(400).json({ message: 'Valid referred email is required' });
        return;
      }

      const referral = await Referral.findOne({ code });
      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      if (referral.status !== 'pending') {
        res.status(400).json({ message: 'Referral has already been processed' });
        return;
      }

      referral.referredEmail = referredEmail;
      referral.status = 'approved';
      await referral.save();

      // TODO: Send completion notifications

      res.json({ message: 'Referral completed successfully' });
    } catch (error) {
      console.error('Error completing referral:', error);
      res.status(500).json({ message: 'Error completing referral' });
    }
  },

  trackReferral: async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const referral = await Referral.findOne({ code }) as ReferralDocument;

      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      const trackingData = {
        lastViewed: new Date(),
        viewCount: (referral.trackingData?.viewCount || 0) + 1
      };

      await Referral.findByIdAndUpdate(referral._id, {
        $set: { trackingData }
      });

      res.json({ message: 'Referral tracked successfully' });
    } catch (error) {
      console.error('Track referral error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Generate referral link for a campaign
  generateReferralLink: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { campaignId } = req.params;
      const { referrerEmail } = req.body;

      if (!req.user?.userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      // Check if campaign exists and belongs to the business
      const campaign = await Campaign.findOne({
        _id: campaignId,
        businessId: business._id
      });

      if (!campaign) {
        res.status(404).json({ message: 'Campaign not found' });
        return;
      }

      // Generate unique referral code
      const code = await generateReferralCode();

      // Create referral record
      const referral = await Referral.create({
        businessId: business._id,
        campaignId,
        referrerEmail,
        code,
        status: 'pending'
      });

      // Send email to referrer with the referral link
      try {
        await sendEmail({
          to: referrerEmail,
          subject: 'Your Referral Link',
          text: `Here's your referral link: ${process.env.FRONTEND_URL}/refer/${code}`
        });
      } catch (emailError) {
        console.error('Error sending referral email:', emailError);
      }

      res.status(201).json({
        code,
        referralLink: `${process.env.FRONTEND_URL}/refer/${code}`
      });
    } catch (error) {
      console.error('Error generating referral link:', error);
      res.status(500).json({ message: 'Error generating referral link' });
    }
  },

  // Submit referral
  submitReferral: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const { referredEmail } = req.body;

      if (!req.user?.userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      // Find referral by code
      const referral = await Referral.findOne({
        code,
        businessId: business._id
      });

      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      // Update referral with referred email
      referral.referredEmail = referredEmail;
      await referral.save();

      res.json(referral);
    } catch (error) {
      console.error('Error submitting referral:', error);
      res.status(500).json({ message: 'Error submitting referral' });
    }
  },

  // Approve referral
  approveReferral: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.user?.userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const referral = await Referral.findOne({
        _id: id,
        businessId: business._id
      });

      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      // Check ownership
      if (referral.businessId.toString() !== business._id.toString()) {
        res.status(403).json({ message: 'Not authorized to approve this referral' });
        return;
      }

      // Update referral status
      referral.status = 'approved';
      await referral.save();

      // Send email notifications
      try {
        await sendEmail({
          to: referral.referrerEmail,
          subject: 'Referral Approved',
          text: 'Your referral has been approved!'
        });

        if (referral.referredEmail) {
          await sendEmail({
            to: referral.referredEmail,
            subject: 'Welcome to Our Platform',
            text: 'Your referral has been approved. Welcome aboard!'
          });
        }
      } catch (emailError) {
        console.error('Error sending approval emails:', emailError);
      }

      res.json(referral);
    } catch (error) {
      console.error('Error approving referral:', error);
      res.status(500).json({ message: 'Error approving referral' });
    }
  },

  // Reject referral
  rejectReferral: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.user?.userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const referral = await Referral.findOne({
        _id: id,
        businessId: business._id
      });

      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      // Check ownership
      if (referral.businessId.toString() !== business._id.toString()) {
        res.status(403).json({ message: 'Not authorized to reject this referral' });
        return;
      }

      // Update referral status
      referral.status = 'rejected';
      await referral.save();

      // Send email notification
      try {
        await sendEmail({
          to: referral.referrerEmail,
          subject: 'Referral Status Update',
          text: 'Unfortunately, your referral has been rejected.'
        });
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
      }

      res.json(referral);
    } catch (error) {
      console.error('Error rejecting referral:', error);
      res.status(500).json({ message: 'Error rejecting referral' });
    }
  }
};