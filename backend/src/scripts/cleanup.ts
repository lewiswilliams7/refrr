import mongoose from 'mongoose';
import { config } from '../config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function cleanup() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/refrr';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if database connection is established
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    // Get all collections
    const collections = await mongoose.connection.db.collections();

    // Delete all documents from each collection
    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`Cleared collection: ${collection.collectionName}`);
    }

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanup(); 