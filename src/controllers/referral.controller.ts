import { Request, Response } from 'express';
import Referral from '../models/referrals';
import { Campaign } from '../models/campaign.model';
import { AuthRequest } from '../types/types';
import { generateReferralCode } from '../utils/codeGenerator';
import { validateEmail } from '../utils/validators';
import { IPopulatedReferral } from '../types/referral.types';
import { User } from '../models/user.model';
import { sendEmail } from '../utils/email';

export const referralController = {
  // Create new referral
  create: async (req: AuthRequest, res: Response) => {
    try {
      console.log('Received referral creation request:', req.body); // Debug log
      const { campaignId, referrerEmail } = req.body;
      
      // Validate required fields
      if (!campaignId || !referrerEmail) {
        console.log('Missing required fields:', { campaignId, referrerEmail }); // Debug log
        return res.status(400).json({ 
          message: 'Required fields missing: campaignId, referrerEmail' 
        });
      }

      // Validate email format
      if (!validateEmail(referrerEmail)) {
        return res.status(400).json({ 
          message: 'Invalid email format' 
        });
      }

      // Check if campaign exists and belongs to the business
      const campaign = await Campaign.findOne({ 
        _id: campaignId,
        businessId: req.user?.userId
      });

      if (!campaign) {
        return res.status(404).json({ 
          message: 'Campaign not found or not authorized' 
        });
      }

      // Generate unique referral code
      const code = await generateReferralCode();

      const referral = new Referral({
        campaignId,
        businessId: req.user?.userId,
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
        businessId: req.user?.userId 
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
  getReferral: async (req: AuthRequest, res: Response) => {
    try {
      const referral = await Referral.findById(req.params.id)
        .populate('campaignId', 'title rewardType rewardValue');
      
      if (!referral) {
        return res.status(404).json({ message: 'Referral not found' });
      }

      // Check if user owns this referral
      if (referral.businessId.toString() !== req.user?.userId) {
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

      const referral = await Referral.findById(req.params.id);
      
      if (!referral) {
        return res.status(404).json({ message: 'Referral not found' });
      }

      // Check if user owns this referral
      if (referral.businessId.toString() !== req.user?.userId) {
        return res.status(403).json({ message: 'Not authorized to update this referral' });
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
  getReferralByCode: async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      console.log('Fetching referral for code:', code);

      const referral = await Referral.findOne({ code })
        .populate({
          path: 'campaignId',
          select: 'title description rewardType rewardValue rewardDescription'
        }) as IPopulatedReferral | null;

      if (!referral) {
        return res.status(404).json({ message: 'Referral not found' });
      }

      if (referral.referredEmail) {
        return res.status(400).json({ message: 'This referral has already been used' });
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

  completeReferral: async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const { referredEmail } = req.body;
      console.log('Completing referral:', { code, referredEmail });

      if (!validateEmail(referredEmail)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      const referral = await Referral.findOne({ code });
      
      if (!referral) {
        return res.status(404).json({ message: 'Referral not found' });
      }

      if (referral.referredEmail) {
        return res.status(400).json({ message: 'This referral has already been used' });
      }

      if (referral.referrerEmail.toLowerCase() === referredEmail.toLowerCase()) {
        return res.status(400).json({ message: 'You cannot refer yourself' });
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
  generateReferralLink: async (req: AuthRequest, res: Response) => {
    try {
      const { campaignId } = req.params;
      const { referrerEmail } = req.body;
      
      console.log('Generating referral link for campaign:', {
        campaignId,
        referrerEmail,
        userId: req.user?.userId,
        headers: req.headers,
        body: req.body
      });

      if (!referrerEmail) {
        console.log('Missing referrer email');
        return res.status(400).json({ 
          message: 'Referrer email is required' 
        });
      }

      // Check if campaign exists and is active
      const campaign = await Campaign.findOne({ 
        _id: campaignId,
        status: 'active'
      });

      if (!campaign) {
        console.log('Campaign not found or not active:', campaignId);
        return res.status(404).json({ 
          message: 'Campaign not found or not active' 
        });
      }

      // Generate unique referral code
      const code = await generateReferralCode();

      // Create referral record
      const referral = new Referral({
        campaignId,
        businessId: campaign.businessId,
        referrerEmail,
        code,
        status: 'pending'
      });

      await referral.save();
      
      console.log('Referral created successfully:', {
        code,
        campaignId,
        referrerEmail,
        businessId: campaign.businessId
      });

      res.status(201).json({
        code,
        referrerEmail,
        campaignId
      });
    } catch (error) {
      console.error('Error generating referral link:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({ 
        message: 'Error generating referral link',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
};