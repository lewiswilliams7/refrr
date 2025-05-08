import { Document } from 'mongoose';
import { Campaign } from './campaign.types';

export interface IPopulatedReferral extends Document {
  campaignId: Campaign & {
    title: string;
    description: string;
    rewardType: 'percentage' | 'fixed';
    rewardValue: number;
    rewardDescription: string;
  };
  businessId: string;
  referrerEmail: string;
  referredEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  code: string;
}
