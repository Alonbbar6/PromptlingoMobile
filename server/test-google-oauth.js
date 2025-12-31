/**
 * Test Google OAuth Configuration
 * This script helps diagnose Google OAuth issues
 */

require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

console.log('🔍 Testing Google OAuth Configuration\n');

// Check environment variables
console.log('1️⃣ Checking environment variables...');
console.log(`   GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`   GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);

if (GOOGLE_CLIENT_ID) {
  console.log(`   Client ID: ${GOOGLE_CLIENT_ID.substring(0, 20)}...`);
}
console.log('');

// Check OAuth2Client initialization
console.log('2️⃣ Testing OAuth2Client initialization...');
try {
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  console.log('   ✅ OAuth2Client initialized successfully\n');

  // Show what we're checking
  console.log('3️⃣ Configuration Details:');
  console.log(`   - Client ID ends with: ${GOOGLE_CLIENT_ID?.slice(-30)}`);
  console.log(`   - Client Secret set: ${!!GOOGLE_CLIENT_SECRET}`);
  console.log('');

  console.log('4️⃣ Next Steps to Fix:');
  console.log('   Go to: https://console.cloud.google.com/apis/credentials');
  console.log(`   Find your OAuth 2.0 Client ID: ${GOOGLE_CLIENT_ID?.substring(0, 20)}...`);
  console.log('');
  console.log('   ✓ Verify it\'s a "Web application" type');
  console.log('   ✓ Under "Authorized JavaScript origins", add:');
  console.log('     → http://localhost:3000');
  console.log('');
  console.log('   ✓ Under "Authorized redirect URIs", you may need:');
  console.log('     → http://localhost:3000');
  console.log('');
  console.log('   ✓ Enable Google+ API or People API:');
  console.log('     https://console.cloud.google.com/apis/library');
  console.log('');
  console.log('   ✓ Check OAuth Consent Screen:');
  console.log('     https://console.cloud.google.com/apis/credentials/consent');
  console.log('     - Set to "Testing" mode');
  console.log('     - Add your email as a test user');
  console.log('');

  console.log('5️⃣ Common Issues:');
  console.log('   ❌ Client ID mismatch between frontend and backend');
  console.log('   ❌ OAuth Client Type is not "Web application"');
  console.log('   ❌ JavaScript origins not configured');
  console.log('   ❌ Google APIs not enabled');
  console.log('   ❌ OAuth Consent Screen not configured properly');
  console.log('   ❌ Your email not added to test users');
  console.log('');

} catch (error) {
  console.log('   ❌ Failed to initialize OAuth2Client');
  console.error('   Error:', error.message);
  console.log('');
}

console.log('✅ Diagnostic complete!\n');
