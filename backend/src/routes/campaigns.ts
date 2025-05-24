import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { Campaign } from '../models/Campaign';
import { User } from '../models/User';

const router = express.Router();

// Get campaigns for a customer
router.get('/customer', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get campaigns where the user is a participant
    const campaigns = await Campaign.find({
      participants: user._id
    }).populate('business', 'businessName');

    // Format the response
    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign._id,
      name: campaign.name,
      description: campaign.description,
      businessName: campaign.business.businessName,
      reward: campaign.reward,
      status: campaign.status
    }));

    res.json(formattedCampaigns);
  } catch (error) {
    console.error('Error fetching customer campaigns:', error);
    res.status(500).json({ message: 'Error fetching campaigns' });
  }
});

export default router; 