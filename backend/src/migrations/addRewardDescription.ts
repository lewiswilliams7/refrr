import { Campaign } from '../models/campaign.model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://lewiswilliams077:YS9XaEpwNtaGJ5rl@cluster0.pxooejq.mongodb.net/refrr?retryWrites=true&w=majority';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // First, update the schema to include the new field
    await Campaign.updateMany(
      { rewardDescription: { $exists: false } },
      { $set: { rewardDescription: '' } }
    );

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

export const up = async () => {
  try {
    await Campaign.updateMany(
      { rewardDescription: { $exists: false } },
      { $set: { rewardDescription: '' } }
    );
    console.log('Added rewardDescription field to campaigns');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

export const down = async () => {
  try {
    await Campaign.updateMany(
      { rewardDescription: { $exists: true } },
      { $unset: { rewardDescription: 1 } }
    );
    console.log('Removed rewardDescription field from campaigns');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

migrate();
