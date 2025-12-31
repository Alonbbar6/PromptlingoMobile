/**
 * Quick test to verify Sentry initialization
 */
require('dotenv').config();
const Sentry = require("@sentry/node");

console.log('🔍 Testing Sentry Configuration...\n');

if (!process.env.SENTRY_DSN) {
  console.log('❌ SENTRY_DSN not found in environment variables');
  process.exit(1);
}

console.log('✅ SENTRY_DSN found in environment');
console.log('   DSN:', process.env.SENTRY_DSN.substring(0, 50) + '...\n');

try {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });

  console.log('✅ Sentry initialized successfully!');
  console.log('   Environment:', process.env.NODE_ENV || 'development');

  // Test capturing an error
  console.log('\n🧪 Testing error capture...');
  Sentry.captureMessage('Test message from PromptLingo setup', 'info');

  // Give Sentry time to send the event
  setTimeout(() => {
    console.log('✅ Test message sent to Sentry dashboard');
    console.log('\n📊 Check your Sentry dashboard at: https://sentry.io');
    console.log('   You should see a test message within 30 seconds\n');
    process.exit(0);
  }, 2000);

} catch (error) {
  console.log('❌ Sentry initialization failed:', error.message);
  process.exit(1);
}
