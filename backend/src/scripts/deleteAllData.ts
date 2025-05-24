import { MongoClient } from 'mongodb';

async function deleteAllData() {
  const uri = 'mongodb+srv://lewiswilliams077:YS9XaEpwNtaGJ5rl@cluster0.pxooejq.mongodb.net/refrr?retryWrites=true&w=majority';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('refrr');
    const collections = ['users', 'businesses', 'customers', 'campaigns', 'referrals'];

    for (const collectionName of collections) {
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`Deleted ${result.deletedCount} documents from ${collectionName}`);
    }

    console.log('All data deleted successfully');
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
deleteAllData().catch(console.error); 