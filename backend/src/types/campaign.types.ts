export interface Campaign {
  name: string;
  description: string;
  reward: {
    type: 'percentage' | 'fixed';
    value: number;
    description: string;
  };
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignCreateInput {
  name: string;
  description: string;
  reward: {
    type: 'percentage' | 'fixed';
    value: number;
    description: string;
  };
  startDate: Date;
  endDate: Date;
}

export interface CampaignUpdateInput {
  name?: string;
  description?: string;
  reward?: {
    type: 'percentage' | 'fixed';
    value: number;
    description: string;
  };
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
} 