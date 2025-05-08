import mongoose from 'mongoose';
import Campaign, { ICampaign } from '../models/campaign.model';
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
      [{
        $set: {
          rewardDescription: {
            $concat: [
              { $toString: "$rewardValue" },
              { 
                $cond: {
                  if: { $eq: ["$rewardType", "percentage"] },
                  then: "% discount",
                  else: " points reward"
                }
              }
            ]
          }
        }
      }]
    );

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
