const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://refrr.onrender.com';
const EMAILS_TO_DELETE = [
  'lewiswilliams077@outlook.com',
  'lewisljw07@gmail.com',
  // Add the email address you want to delete here
  // 'your-email@example.com'
];

async function deleteUsers() {
  console.log('=== Deleting Specific Users ===\n');
  console.log('Emails to delete:', EMAILS_TO_DELETE.join(', '));
  console.log('\nStarting deletion process...\n');
  
  for (const email of EMAILS_TO_DELETE) {
    try {
      console.log(`Attempting to delete user: ${email}`);
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/delete-user`, {
        email: email
      });
      
      console.log(`✅ Successfully deleted user: ${email}`);
      console.log('Response:', response.data);
      
    } catch (error) {
      console.error(`❌ Failed to delete user: ${email}`);
      console.error('Error:', error.response?.data || error.message);
    }
    
    console.log('---');
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\nUser deletion process completed!');
}

// Run the script
deleteUsers().catch(console.error); 