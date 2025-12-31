#!/usr/bin/env node
/**
 * Test script to verify ElevenLabs API key
 * Run this on Render to debug API key issues
 * 
 * Usage: node server/utils/testApiKey.js
 */

require('dotenv').config();
const axios = require('axios');

async function testElevenLabsApiKey() {
  console.log('🔍 Testing ElevenLabs API Key...\n');
  
  // Check if API key exists
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  console.log('1️⃣ Environment Variable Check:');
  console.log(`   - ELEVENLABS_API_KEY exists: ${!!apiKey}`);
  console.log(`   - Key length: ${apiKey ? apiKey.length : 0} characters`);
  console.log(`   - Key preview: ${apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET'}`);
  console.log(`   - Has whitespace: ${apiKey ? /\s/.test(apiKey) : 'N/A'}`);
  console.log(`   - Trimmed length: ${apiKey ? apiKey.trim().length : 0}`);
  
  if (!apiKey) {
    console.error('\n❌ ELEVENLABS_API_KEY is not set in environment variables!');
    console.log('\n📋 To fix this on Render:');
    console.log('   1. Go to your Render dashboard');
    console.log('   2. Select your backend service');
    console.log('   3. Go to "Environment" tab');
    console.log('   4. Add/update ELEVENLABS_API_KEY');
    console.log('   5. Click "Save Changes" and wait for redeploy');
    process.exit(1);
  }
  
  // Test API key by fetching voices
  console.log('\n2️⃣ Testing API Key with ElevenLabs API:');
  console.log('   - Endpoint: https://api.elevenlabs.io/v1/voices');
  
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey.trim(), // Trim whitespace
      },
      timeout: 10000,
    });
    
    console.log('   - Status:', response.status);
    console.log('   - Voices found:', response.data.voices?.length || 0);
    
    if (response.data.voices && response.data.voices.length > 0) {
      console.log('\n✅ SUCCESS! API Key is valid and working!');
      console.log('\n📋 Available Voices:');
      response.data.voices.slice(0, 5).forEach(voice => {
        console.log(`   - ${voice.name} (${voice.voice_id})`);
      });
      if (response.data.voices.length > 5) {
        console.log(`   ... and ${response.data.voices.length - 5} more`);
      }
    } else {
      console.warn('\n⚠️  API key works but no voices returned');
    }
    
  } catch (error) {
    console.error('\n❌ API Key Test FAILED!');
    
    if (error.response) {
      console.error(`   - Status: ${error.response.status}`);
      console.error(`   - Error: ${JSON.stringify(error.response.data, null, 2)}`);
      
      if (error.response.status === 401) {
        console.log('\n🔧 This is an AUTHENTICATION ERROR. Possible causes:');
        console.log('   1. API key is incorrect or expired');
        console.log('   2. API key has leading/trailing whitespace');
        console.log('   3. API key was copied incorrectly');
        console.log('\n📋 To fix:');
        console.log('   1. Go to https://elevenlabs.io/app/settings/api-keys');
        console.log('   2. Copy your API key (or create a new one)');
        console.log('   3. Update ELEVENLABS_API_KEY in Render environment variables');
        console.log('   4. Make sure there are NO spaces before or after the key');
      }
    } else {
      console.error(`   - Error: ${error.message}`);
    }
    
    process.exit(1);
  }
  
  // Test a simple synthesis request
  console.log('\n3️⃣ Testing Speech Synthesis:');
  try {
    const testVoiceId = '2EiwWnXFnvU5JabPnv8n'; // Clyde voice
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${testVoiceId}`,
      {
        text: 'Hello, this is a test.',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey.trim(),
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      }
    );
    
    console.log('   - Status:', response.status);
    console.log('   - Audio size:', response.data.length, 'bytes');
    console.log('\n✅ Speech synthesis test PASSED!');
    
  } catch (error) {
    console.error('\n❌ Speech synthesis test FAILED!');
    if (error.response) {
      console.error(`   - Status: ${error.response.status}`);
      console.error(`   - Error: ${error.response.data?.toString() || 'Unknown error'}`);
    } else {
      console.error(`   - Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ All tests completed!');
}

// Run the test
testElevenLabsApiKey().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
