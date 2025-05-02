import { Document } from 'mongoose';
import { ICampaign } from './campaign.types';

export interface IPopulatedReferral extends Document {
  campaignId: ICampaign & {
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
