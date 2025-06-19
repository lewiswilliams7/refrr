const axios = require('axios');
const readline = require('readline');

// Configuration
const API_BASE_URL = 'https://refrr.onrender.com';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function deleteUsers() {
  console.log('=== User Deletion Tool ===\n');
  
  const emails = [];
  
  while (true) {
    const email = await askQuestion('Enter email address to delete (or "done" to finish): ');
    
    if (email.toLowerCase() === 'done') {
      break;
    }
    
    if (email.trim()) {
      emails.push(email.trim());
    }
  }
  
  if (emails.length === 0) {
    console.log('No emails provided. Exiting...');
    rl.close();
    return;
  }
  
  console.log(`\nEmails to delete: ${emails.join(', ')}`);
  const confirm = await askQuestion('\nAre you sure you want to delete these users? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes') {
    console.log('Deletion cancelled.');
    rl.close();
    return;
  }
  
  console.log('\nStarting user deletion process...');
  
  for (const email of emails) {
    try {
      console.log(`\nAttempting to delete user: ${email}`);
      
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
  
  console.log('\nUser deletion process completed!');
  rl.close();
}

// Run the script
deleteUsers().catch(console.error); 