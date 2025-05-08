import { Request, Response } from 'express';
import Referral from '../models/referrals';
import { Campaign, ICampaign } from '../models/campaign.model';
import { AuthRequest } from '../middleware/auth';
import { generateReferralCode } from '../utils/codeGenerator';
import { validateEmail } from '../utils/validators';
import { IPopulatedReferral } from '../types/referral.types';
import { User } from '../models/user.model';
import { sendEmail } from '../utils/email';
import mongoose from 'mongoose';
import Business from '../models/business';
import { asyncHandler } from '../middleware/asyncHandler';

export const referralController = {
  // Create new referral
  create: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('Received referral creation request:', req.body); // Debug log
      const { campaignId, referrerEmail } = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      // Validate required fields
      if (!campaignId || !referrerEmail) {
        console.log('Missing required fields:', { campaignId, referrerEmail }); // Debug log
        res.status(400).json({ 
          message: 'Required fields missing: campaignId, referrerEmail' 
        });
        return;
      }

      // Validate email format
      if (!validateEmail(referrerEmail)) {
        res.status(400).json({ 
          message: 'Invalid email format' 
        });
        return;
      }

      // Check if campaign exists and belongs to the business
      const campaign = await Campaign.findOne({ 
        _id: campaignId,
        businessId: userId
      });

      if (!campaign) {
        res.status(404).json({ 
          message: 'Campaign not found or not authorized' 
        });
        return;
      }

      // Generate unique referral code
      const code = await generateReferralCode();

      const referral = new Referral({
        campaignId,
        businessId: userId,
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
  getBusinessReferrals: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const referrals = await Referral.find({ 
        businessId: userId 
      })
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 });
      
      res.json(referrals);
    } catch (error) {
      console.error('Referral fetch error:', error);
      res.status(500).json({ message: 'Error fetching referrals', error });
    }
  },

  // Get single referral
  getReferral: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const referral = await Referral.findById(req.params.id)
        .populate('campaignId', 'title rewardType rewardValue');
      
      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      // Check if user owns this referral
      if (referral.businessId.toString() !== userId.toString()) {
        res.status(403).json({ message: 'Not authorized to view this referral' });
        return;
      }

      res.json(referral);
    } catch (error) {
      console.error('Referral fetch error:', error);
      res.status(500).json({ message: 'Error fetching referral', error });
    }
  },

  // Update referral status
  updateStatus: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { status } = req.body;
      
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        res.status(400).json({ 
          message: 'Invalid status. Must be pending, approved, or rejected' 
        });
        return;
      }

      const referral = await Referral.findById(req.params.id);
      
      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      // Check if user owns this referral
      if (referral.businessId.toString() !== userId.toString()) {
        res.status(403).json({ message: 'Not authorized to update this referral' });
        return;
      }

      referral.status = status;
      await referral.save();

      // TODO: Send status update email notifications
      
      res.json(referral);
    } catch (error) {
      console.error('Referral status update error:', error);
      res.status(500).json({ message: 'Error updating referral status', error });
    }
  },

  // Public endpoints
  getReferralByCode: async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      console.log('Fetching referral for code:', code);

      const referral = await Referral.findOne({ code })
        .populate({
          path: 'campaignId',
          select: 'title description rewardType rewardValue rewardDescription'
        }) as unknown as IPopulatedReferral | null;

      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      if (referral.referredEmail) {
        res.status(400).json({ message: 'This referral has already been used' });
        return;
      }

      res.json({
        campaignDetails: {
          title: referral.campaignId.title,
          description: referral.campaignId.description,
          rewardType: referral.campaignId.rewardType,
          rewardValue: referral.campaignId.rewardValue,
          rewardDescription: referral.campaignId.rewardDescription
        }
      });
    } catch (error) {
      console.error('Error fetching referral:', error);
      res.status(500).json({ message: 'Error fetching referral details' });
    }
  },

  completeReferral: async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const { referredEmail } = req.body;
      console.log('Completing referral:', { code, referredEmail });

      if (!validateEmail(referredEmail)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }

      const referral = await Referral.findOne({ code });
      
      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      if (referral.referredEmail) {
        res.status(400).json({ message: 'This referral has already been used' });
        return;
      }

      if (referral.referrerEmail.toLowerCase() === referredEmail.toLowerCase()) {
        res.status(400).json({ message: 'You cannot refer yourself' });
        return;
      }

      referral.referredEmail = referredEmail;
      await referral.save();

      res.json({ 
        message: 'Referral completed successfully',
        referral: {
          code: referral.code,
          referrerEmail: referral.referrerEmail,
          referredEmail: referral.referredEmail,
          status: referral.status
        }
      });
    } catch (error) {
      console.error('Error completing referral:', error);
      res.status(500).json({ message: 'Error completing referral' });
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
  },

  // Track referral
  trackReferral: async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;

      // Find referral by code
      const referral = await Referral.findOne({ code })
        .populate('campaignId')
        .populate('businessId', 'businessName');

      if (!referral) {
        res.status(404).json({ message: 'Referral not found' });
        return;
      }

      // Update tracking data
      referral.trackingData = {
        ...referral.trackingData,
        lastViewed: new Date(),
        viewCount: (referral.trackingData?.viewCount || 0) + 1
      };

      await referral.save();

      res.json({
        referral: {
          code: referral.code,
          status: referral.status,
          campaign: referral.campaignId,
          business: referral.businessId
        }
      });
    } catch (error) {
      console.error('Error tracking referral:', error);
      res.status(500).json({ message: 'Error tracking referral' });
    }
  },

  // Create referral
  createReferral: asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { campaignId, referredEmail } = req.body;
    const referrerId = req.user?.userId;

    if (!referrerId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!campaignId || !referredEmail) {
      res.status(400).json({ message: 'Missing required fields: campaignId, referredEmail' });
      return;
    }

    if (!validateEmail(referredEmail)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    const business = await Business.findOne({ userId: referrerId });
    if (!business) {
      res.status(404).json({ message: 'Business not found' });
      return;
    }

    const campaign = await Campaign.findOne({
      _id: campaignId,
      businessId: business._id
    });

    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }

    const code = await generateReferralCode();

    const referral = await Referral.create({
      businessId: business._id,
      campaignId,
      referrerEmail: referrerId,
      referredEmail,
      code,
      status: 'pending'
    });

    res.status(201).json(referral);
  }),

  // Get all referrals
  getReferrals: asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const business = await Business.findOne({ userId: userId });
    if (!business) {
      res.status(404).json({ message: 'Business not found' });
      return;
    }

    const referrals = await Referral.find({ businessId: business._id });
    res.json(referrals);
  }),

  // Get referral by ID
  getReferralById: asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const business = await Business.findOne({ userId: userId });
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
  }),

  // Delete referral
  deleteReferral: asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { referralId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const business = await Business.findOne({ userId: userId });
    if (!business) {
      res.status(404).json({ message: 'Business not found' });
      return;
    }

    const referral = await Referral.findOneAndDelete({
      _id: referralId,
      businessId: business._id
    });

    if (!referral) {
      res.status(404).json({ message: 'Referral not found' });
      return;
    }

    res.json({ message: 'Referral deleted successfully' });
  })
};