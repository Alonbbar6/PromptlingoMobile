const axios = require('axios');
require('dotenv').config();

/**
 * Utility script to list all available ElevenLabs voices
 * Run with: node server/utils/listVoices.js
 */
async function listElevenLabsVoices() {
  try {
    console.log('🎤 Fetching ElevenLabs voices...\n');
    
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('❌ ELEVENLABS_API_KEY not found in environment variables');
      process.exit(1);
    }

    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    console.log(`✅ Found ${response.data.voices.length} voices:\n`);
    console.log('=' .repeat(80));
    
    response.data.voices.forEach((voice, index) => {
      console.log(`\n${index + 1}. ${voice.name}`);
      console.log(`   ID: ${voice.voice_id}`);
      console.log(`   Category: ${voice.category || 'N/A'}`);
      console.log(`   Gender: ${voice.labels?.gender || 'N/A'}`);
      console.log(`   Age: ${voice.labels?.age || 'N/A'}`);
      console.log(`   Accent: ${voice.labels?.accent || 'N/A'}`);
      console.log(`   Use Case: ${voice.labels?.use_case || 'N/A'}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📋 Copy these voice IDs to use in your app:\n');
    
    // Suggest some common voices
    const maleVoices = response.data.voices.filter(v => v.labels?.gender === 'male');
    const femaleVoices = response.data.voices.filter(v => v.labels?.gender === 'female');
    
    if (maleVoices.length > 0) {
      console.log(`Male voice example: '${maleVoices[0].voice_id}' (${maleVoices[0].name})`);
    }
    if (femaleVoices.length > 0) {
      console.log(`Female voice example: '${femaleVoices[0].voice_id}' (${femaleVoices[0].name})`);
    }

    console.log('\n💡 Update your VOICE_IDS mapping in server/routes/synthesize.js with these IDs\n');

  } catch (error) {
    console.error('❌ Error fetching voices:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message:`, error.response.data);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

listElevenLabsVoices();
