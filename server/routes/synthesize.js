const express = require('express');
const axios = require('axios');
const { validateSynthesize } = require('../middleware/validation');

const router = express.Router();

/**
 * Maps language codes to ElevenLabs-supported languages
 * Haitian Creole (ht) → French (fr) since they're linguistically similar
 * and ElevenLabs doesn't directly support Haitian Creole
 */
function getElevenLabsLanguageCode(languageCode) {
  const languageMap = {
    'ht': 'fr',  // Haitian Creole → French
    'en': 'en',  // English
    'es': 'es',  // Spanish
    'fr': 'fr',  // French
    'de': 'de',  // German
    'it': 'it',  // Italian
    'pt': 'pt',  // Portuguese
    'pl': 'pl',  // Polish
    'nl': 'nl',  // Dutch
    'sv': 'sv',  // Swedish
    'hi': 'hi',  // Hindi
    'ja': 'ja',  // Japanese
    'ko': 'ko',  // Korean
    'zh': 'zh',  // Chinese
    'ar': 'ar',  // Arabic
  };

  const mappedLanguage = languageMap[languageCode] || 'en';
  
  if (languageCode !== mappedLanguage) {
    console.log(`🗣️ Language mapping: ${languageCode} → ${mappedLanguage}`);
  }
  
  return mappedLanguage;
}

// Available voices configuration
const VOICES = {
  'male-1': {
    id: 'male-1',
    name: 'Jean-Pierre',
    gender: 'male',
    language: 'ht',
    description: 'Male Haitian Creole voice - warm and professional'
  },
  'female-1': {
    id: 'female-1',
    name: 'Marie-Claire',
    gender: 'female',
    language: 'ht',
    description: 'Female Haitian Creole voice - clear and friendly'
  },
  'male-en': {
    id: 'male-en',
    name: 'David',
    gender: 'male',
    language: 'en',
    description: 'Male English voice - clear and professional'
  },
  'female-en': {
    id: 'female-en',
    name: 'Sarah',
    gender: 'female',
    language: 'en',
    description: 'Female English voice - warm and articulate'
  }
};

// ElevenLabs voice mapping - UPDATED with real voice IDs from your account
const ELEVENLABS_VOICE_IDS = {
  'male-1': '2EiwWnXFnvU5JabPnv8n',   // Clyde - American male, middle-aged
  'female-1': 'EXAVITQu4vr4xnSDxMaL', // Sarah - American female, young
  'male-en': 'CwhRBWXzGAHq8TQ4Fs17',  // Roger - American male, conversational
  'female-en': 'cgSgspJ2msm6clMCkdW9' // Jessica - American female, conversational
};

// Default fallback voice if mapping fails
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - reliable American female voice

router.post('/', validateSynthesize, async (req, res) => {
  const startTime = Date.now();
  console.log('🔊 [SYNTHESIZE] Request received');
  
  // Extract variables outside try block so they're accessible in catch
  const { text, voiceId, language } = req.body;
  
  try {
    
    // Map Haitian Creole to French for ElevenLabs compatibility
    const elevenLabsLanguage = getElevenLabsLanguageCode(language);
    
    console.log(`   - Text length: ${text?.length} characters`);
    console.log(`   - Voice ID: ${voiceId}`);
    console.log(`   - Original language: ${language}`);
    console.log(`   - ElevenLabs language: ${elevenLabsLanguage}`);

    // Validate required fields
    if (!text || !voiceId) {
      console.error('❌ [SYNTHESIZE] Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'text and voiceId are required'
      });
    }

    // Validate API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      const duration = Date.now() - startTime;
      console.error(`❌ [SYNTHESIZE] ElevenLabs API key not configured after ${duration}ms`);
      return res.status(500).json({
        error: 'ElevenLabs API key not configured',
        message: 'Please configure ELEVENLABS_API_KEY in environment variables'
      });
    }
    
    // Log API key status (without exposing the actual key)
    console.log(`   - API Key status: ${apiKey ? '✓ Present' : '✗ Missing'}`);
    console.log(`   - API Key length: ${apiKey ? apiKey.length : 0} characters`);
    console.log(`   - API Key preview: ${apiKey ? apiKey.substring(0, 8) + '...' : 'N/A'}`);
    console.log(`   - Has whitespace: ${apiKey && /\s/.test(apiKey) ? '⚠️  YES (this could cause issues!)' : 'No'}`);

    // Map the voiceId to actual ElevenLabs voice ID
    // If voiceId is already a valid ElevenLabs ID (21+ chars), use it directly
    // Otherwise, look it up in our mapping
    let elevenLabsVoiceId;
    
    if (voiceId && voiceId.length > 20) {
      // Looks like a real ElevenLabs voice ID (they're typically 20+ characters)
      elevenLabsVoiceId = voiceId;
      console.log(`   - Using provided ElevenLabs voice ID: ${voiceId}`);
    } else if (ELEVENLABS_VOICE_IDS[voiceId]) {
      // Map from our friendly name to ElevenLabs ID
      elevenLabsVoiceId = ELEVENLABS_VOICE_IDS[voiceId];
      console.log(`   - Mapped voice '${voiceId}' → '${elevenLabsVoiceId}'`);
    } else {
      // Fallback to default voice
      elevenLabsVoiceId = DEFAULT_VOICE_ID;
      console.warn(`   ⚠️ Unknown voice '${voiceId}', using default: ${DEFAULT_VOICE_ID}`);
    }

    console.log('  → Calling ElevenLabs API...');
    const elevenLabsStart = Date.now();

    // Call ElevenLabs API with language mapping
    const requestBody = {
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    };

    // Add language code for better pronunciation if it's not English
    if (elevenLabsLanguage !== 'en') {
      requestBody.language_code = elevenLabsLanguage;
      console.log(`   - Added language_code: ${elevenLabsLanguage}`);
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      requestBody,
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey.trim() // Trim whitespace from API key
        },
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      }
    );

    const elevenLabsDuration = Date.now() - elevenLabsStart;
    console.log(`  ← ElevenLabs API responded in ${elevenLabsDuration}ms`);

    // Convert audio buffer to base64 for transmission
    const audioBuffer = Buffer.from(response.data);
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    const totalDuration = Date.now() - startTime;
    console.log(`✅ [SYNTHESIZE] Completed in ${totalDuration}ms`);
    console.log(`   - ElevenLabs API: ${elevenLabsDuration}ms`);
    console.log(`   - Audio size: ${audioBuffer.length} bytes`);

    res.json({
      audioUrl,
      characterCount: text.length,
      voiceId,
      originalLanguage: language,
      elevenLabsLanguage: elevenLabsLanguage,
      synthesisTime: totalDuration
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ [SYNTHESIZE] Failed after ${totalDuration}ms:`, error.message);

    if (error.response) {
      const { status, data } = error.response;
      console.error(`   - API Error ${status}:`, data);
      
      // Provide specific error messages based on error type
      let errorMessage = data.detail || 'Failed to synthesize speech';
      let helpText = '';
      
      if (typeof data === 'string' && data.includes('not supported')) {
        errorMessage = `Language issue: ${errorMessage}. Note: Haitian Creole uses French voice models.`;
      } else if (data === 'invalid_uid' || (typeof data === 'object' && data.detail?.includes('invalid_uid'))) {
        errorMessage = 'Invalid voice ID provided';
        helpText = 'Run "node server/utils/listVoices.js" to get valid voice IDs';
      } else if (status === 401) {
        errorMessage = 'Invalid API key';
        helpText = 'Check your ELEVENLABS_API_KEY environment variable';
      } else if (status === 429) {
        errorMessage = 'Rate limit exceeded';
        helpText = 'Too many requests. Please wait a moment and try again.';
      }
      
      return res.status(status).json({
        error: 'Synthesis failed',
        message: errorMessage,
        help: helpText,
        originalLanguage: language,
        mappedLanguage: getElevenLabsLanguageCode(language),
        voiceId: voiceId,
        details: data
      });
    }

    if (error.code === 'ECONNABORTED') {
      console.error('   - Request timeout');
      return res.status(408).json({
        error: 'Request timeout',
        message: 'Synthesis request timed out'
      });
    }

    res.status(500).json({
      error: 'Synthesis failed',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Get available voices
router.get('/', (req, res) => {
  res.json({
    voices: Object.values(VOICES)
  });
});

module.exports = router;
