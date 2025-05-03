import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Business from '../models/business';
import { User } from '../models/user.model';
import { Campaign, ICampaign } from '../models/campaign';
import { Referral } from '../models/referrals';
import mongoose from 'mongoose';

interface IBusiness {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  businessName: string;
  businessType: string;
  description: string;
  location: {
    address: string;
    city: string;
    postcode: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  analytics: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalReferrals: number;
    completedReferrals: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const businessController = {
  // Create new business
  create: async (req: AuthRequest, res: Response) => {
    try {
      const { 
        businessName, 
        businessType, 
        description, 
        location, 
        contact 
      } = req.body;

      if (!businessName || !businessType || !description || !location || !contact) {
        return res.status(400).json({ 
          message: 'Required fields missing: businessName, businessType, description, location, contact' 
        });
      }

      if (!location.address || !location.city || !location.postcode || !location.country) {
        return res.status(400).json({ 
          message: 'Location must include address, city, postcode, and country' 
        });
      }

      if (!contact.email || !contact.phone) {
        return res.status(400).json({ 
          message: 'Contact must include email and phone' 
        });
      }

      const business = new Business({
        userId: req.user?._id,
        businessName,
        businessType,
        description,
        location,
        contact,
        status: 'active',
        analytics: {
          totalCampaigns: 0,
          activeCampaigns: 0,
          totalReferrals: 0,
          completedReferrals: 0
        }
      });

      await business.save();
      res.status(201).json(business);
    } catch (error) {
      console.error('Business creation error:', error);
      res.status(500).json({ 
        message: 'Error creating business',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Get all businesses for a user
  getUserBusinesses: async (req: AuthRequest, res: Response) => {
    try {
      const businesses = await Business.find({ 
        userId: req.user?._id 
      }).sort({ createdAt: -1 });
      
      res.json(businesses);
    } catch (error) {
      console.error('Business fetch error:', error);
      res.status(500).json({ message: 'Error fetching businesses', error });
    }
  },

  // Get single business
  getBusiness: async (req: AuthRequest, res: Response) => {
    try {
      const business = await Business.findOne({
        _id: req.params.id,
        userId: req.user?._id
      });
      
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      res.json(business);
    } catch (error) {
      console.error('Business fetch error:', error);
      res.status(500).json({ message: 'Error fetching business', error });
    }
  },

  // Update business
  update: async (req: AuthRequest, res: Response) => {
    try {
      const { 
        businessName, 
        businessType, 
        description, 
        location, 
        contact,
        status 
      } = req.body;

      const business = await Business.findOne({
        _id: req.params.id,
        userId: req.user?._id
      });
      
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      if (businessName) business.businessName = businessName;
      if (businessType) business.businessType = businessType;
      if (description) business.description = description;
      if (location) {
        if (!location.address || !location.city || !location.postcode || !location.country) {
          return res.status(400).json({ 
            message: 'Location must include address, city, postcode, and country' 
          });
        }
        business.location = location;
      }
      if (contact) {
        if (!contact.email || !contact.phone) {
          return res.status(400).json({ 
            message: 'Contact must include email and phone' 
          });
        }
        business.contact = contact;
      }
      if (status) {
        if (!['active', 'inactive', 'suspended'].includes(status)) {
          return res.status(400).json({ 
            message: 'Invalid status. Must be active, inactive, or suspended' 
          });
        }
        business.status = status;
      }

      await business.save();
      res.json(business);
    } catch (error) {
      console.error('Business update error:', error);
      res.status(500).json({ message: 'Error updating business', error });
    }
  },

  // Delete business
  delete: async (req: AuthRequest, res: Response) => {
    try {
      const business = await Business.findOne({
        _id: req.params.id,
        userId: req.user?._id
      });
      
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      // Check if business has any campaigns
      const hasCampaigns = await Campaign.exists({ businessId: business._id });
      if (hasCampaigns) {
        return res.status(400).json({ 
          message: 'Cannot delete business with existing campaigns' 
        });
      }

      await business.deleteOne();
      res.json({ message: 'Business deleted successfully' });
    } catch (error) {
      console.error('Business deletion error:', error);
      res.status(500).json({ message: 'Error deleting business', error });
    }
  },

  // Get business analytics
  getAnalytics: async (req: AuthRequest, res: Response) => {
    try {
      const business = await Business.findOne({
        _id: req.params.id,
        userId: req.user?._id
      });
      
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      const campaigns = await Campaign.find({ businessId: business._id });
      const referrals = await Referral.find({ businessId: business._id });
      
      const analytics = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalReferrals: referrals.length,
        completedReferrals: referrals.filter(r => r.status === 'completed').length
      };

      res.json(analytics);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      res.status(500).json({ message: 'Error fetching analytics', error });
    }
  },

  // Get public businesses
  getPublicBusinesses: async (req: Request, res: Response) => {
    try {
      const businesses = await Business.find({ 
        status: 'active'
      })
      .select('businessName businessType description location contact analytics')
      .sort({ createdAt: -1 });
      
      res.json(businesses);
    } catch (error) {
      console.error('Public businesses fetch error:', error);
      res.status(500).json({ message: 'Error fetching public businesses', error });
    }
  }
};
