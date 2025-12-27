// ElevenLabs API Configuration
export const ELEVENLABS_CONFIG = {
  apiKey: process.env.REACT_APP_ELEVENLABS_API_KEY || '', // This should be set in your environment variables
  apiUrl: 'https://api.elevenlabs.io/v1',
};

// Validate API key on import
if (!ELEVENLABS_CONFIG.apiKey || ELEVENLABS_CONFIG.apiKey === 'YOUR_ELEVENLABS_API_KEY_HERE') {
  const errorMessage = 'ElevenLabs API key not configured — cannot proceed with TTS.';
  console.error('❌ ' + errorMessage);
  throw new Error(errorMessage);
}

// Available voices (you can customize these)
export const ELEVENLABS_VOICES = {
  english: {
    male: 'TxGEqnHWrfWFTfGW9XjX', // Josh
    female: 'EXAVITQu4vr4xnSDxMaL', // Bella
  },
  spanish: {
    male: 'VR6AewLTigWG4xSOukaG', // Arnold (multilingual)
    female: 'pNInz6obpgDQGcFmaJgB', // Adam (multilingual)
  },
  haitian: {
    // ElevenLabs may not have native Haitian voices
    // Use French voices as fallback since Haitian Creole is French-based
    male: 'yoZ06aMxZJJ28mfd3POQ', // Sam (multilingual)
    female: '21m00Tcm4TlvDq8ikWAM', // Rachel (multilingual)
  },
};

// Voice settings for quality
export const ELEVENLABS_VOICE_SETTINGS = {
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.0,
  useSpeakerBoost: true
};
