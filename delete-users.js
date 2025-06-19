const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://refrr.onrender.com';
const EMAILS_TO_DELETE = [
  // Add the email addresses you want to delete here
  'test@example.com',
  'user@example.com',
  // Add more emails as needed
];

async function deleteUsers() {
  console.log('Starting user deletion process...');
  
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
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('User deletion process completed!');
}

// Run the script
deleteUsers().catch(console.error); 