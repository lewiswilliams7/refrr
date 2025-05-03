export const BUSINESS_TYPES = [
  'Barber',
  'Hair Salon',
  'Beauty Salon',
  'Nail Salon',
  'Spa',
  'Tanning Salon',
  'Gym',
  'Personal Trainer',
  'Restaurant',
  'Cafe',
  'Bar',
  'Retail Store',
  'Other'
] as const;

export type BusinessType = typeof BUSINESS_TYPES[number];

export interface BusinessLocation {
  address: string;
  city: string;
  postcode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Business {
  _id: string;
  businessName: string;
  businessType: BusinessType;
  location: BusinessLocation;
  activeCampaigns: {
    count: number;
    rewards: Array<{
      type: 'percentage' | 'fixed';
      value: number;
      description: string;
      campaignId: string;
    }>;
  };
} 