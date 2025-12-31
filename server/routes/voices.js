const express = require('express');
const axios = require('axios');

const router = express.Router();

// Fallback voices configuration (used if ElevenLabs API fails)
const FALLBACK_VOICES = {
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

// Fetch voices from ElevenLabs
const fetchElevenLabsVoices = async () => {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.warn('⚠️  ElevenLabs API key not configured, using fallback voices');
    return null;
  }

  try {
    console.log('🎙️ Fetching available voices from ElevenLabs...');
    
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.data && response.data.voices) {
      const voices = response.data.voices;
      
      // Filter for multilingual voices (better for Haitian Creole)
      const multilingualVoices = voices.filter(voice => 
        voice.labels?.language === 'multilingual' || 
        voice.name.toLowerCase().includes('multilingual')
      );

      console.log(`✅ Found ${voices.length} voices (${multilingualVoices.length} multilingual)`);
      
      // If no multilingual voices, use all voices
      const recommended = multilingualVoices.length > 0 
        ? multilingualVoices.slice(0, 10) 
        : voices.slice(0, 10); // Top 10 voices
      
      return {
        all: voices,
        multilingual: multilingualVoices,
        recommended: recommended,
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to fetch ElevenLabs voices:', error.message);
    return null;
  }
};

// Get all available voices
router.get('/', async (req, res) => {
  try {
    const elevenLabsVoices = await fetchElevenLabsVoices();
    
    if (elevenLabsVoices) {
      // Return ElevenLabs voices
      res.json({
        voices: elevenLabsVoices.all,
        multilingualVoices: elevenLabsVoices.multilingual,
        recommended: elevenLabsVoices.recommended,
        source: 'elevenlabs',
      });
    } else {
      // Return fallback voices
      res.json({
        voices: Object.values(FALLBACK_VOICES),
        source: 'fallback',
        message: 'Using fallback voices. Configure ELEVENLABS_API_KEY for more options.',
      });
    }
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({
      error: 'Failed to fetch voices',
      voices: Object.values(FALLBACK_VOICES),
      source: 'fallback',
    });
  }
});

// Get voices by language
router.get('/:language', async (req, res) => {
  const { language } = req.params;
  
  if (!['en', 'ht'].includes(language)) {
    return res.status(400).json({
      error: 'Invalid language',
      message: 'Only English (en) and Haitian Creole (ht) are supported'
    });
  }

  try {
    const elevenLabsVoices = await fetchElevenLabsVoices();
    
    if (elevenLabsVoices) {
      // For ElevenLabs, return multilingual voices (they work for all languages)
      res.json({
        voices: elevenLabsVoices.recommended,
        language,
        source: 'elevenlabs',
        note: 'Multilingual voices support both English and Haitian Creole',
      });
    } else {
      // Return fallback voices filtered by language
      const filteredVoices = Object.values(FALLBACK_VOICES).filter(voice => voice.language === language);
      res.json({
        voices: filteredVoices,
        language,
        source: 'fallback',
      });
    }
  } catch (error) {
    console.error('Error fetching voices by language:', error);
    const filteredVoices = Object.values(FALLBACK_VOICES).filter(voice => voice.language === language);
    res.json({
      voices: filteredVoices,
      language,
      source: 'fallback',
    });
  }
});

// Get voice by ID
router.get('/voice/:voiceId', (req, res) => {
  const { voiceId } = req.params;
  
  const voice = FALLBACK_VOICES[voiceId];
  
  if (!voice) {
    return res.status(404).json({
      error: 'Voice not found',
      message: 'The requested voice does not exist'
    });
  }

  res.json({
    voice
  });
});

module.exports = router;
