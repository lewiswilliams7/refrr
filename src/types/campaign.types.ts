import { Document } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  description: string;
  rewardType: string;
  rewardValue: number;
  rewardDescription: string;
  businessId: string;
}
