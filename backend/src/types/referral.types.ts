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

export type ReferralStatus = 'pending' | 'approved' | 'rejected';

export interface ReferralTrackingData {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: Date;
}

export interface ReferralCreateInput {
  businessId: string;
  campaignId: string;
  referrerEmail: string;
  referredEmail?: string;
  code: string;
  trackingData?: ReferralTrackingData;
}

export interface ReferralUpdateInput {
  status?: ReferralStatus;
  referredEmail?: string;
  trackingData?: ReferralTrackingData;
}
