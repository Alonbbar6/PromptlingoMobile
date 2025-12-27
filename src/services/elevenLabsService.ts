import { ELEVENLABS_CONFIG, ELEVENLABS_VOICES, ELEVENLABS_VOICE_SETTINGS } from '../config/elevenLabs';
import { audioManager } from './audioManager';

interface ElevenLabsOptions {
  text: string;
  language: 'english' | 'spanish' | 'haitian';
  voiceGender?: 'male' | 'female';
  stability?: number;
  similarityBoost?: number;
}

export const generateSpeech = async (options: ElevenLabsOptions): Promise<Blob> => {
  const {
    text,
    language,
    voiceGender = 'male',
    stability = ELEVENLABS_VOICE_SETTINGS.stability,
    similarityBoost = ELEVENLABS_VOICE_SETTINGS.similarityBoost,
  } = options;

  // Get appropriate voice ID
  const voiceId = ELEVENLABS_VOICES[language]?.[voiceGender] || ELEVENLABS_VOICES.english.male;

  console.log('🎤 [ELEVENLABS] Generating speech with ElevenLabs API...');
  console.log(`   - Language: ${language}`);
  console.log(`   - Voice: ${voiceGender}`);
  console.log(`   - Voice ID: ${voiceId}`);
  console.log(`   - Text length: ${text.length} characters`);

  try {
    const response = await fetch(
      `${ELEVENLABS_CONFIG.apiUrl}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_CONFIG.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Supports multiple languages
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style: ELEVENLABS_VOICE_SETTINGS.style,
            use_speaker_boost: ELEVENLABS_VOICE_SETTINGS.useSpeakerBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [ELEVENLABS] API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    console.log('✅ [ELEVENLABS] Audio generated successfully');
    console.log(`   - Audio size: ${audioBlob.size} bytes`);
    console.log(`   - Audio type: ${audioBlob.type}`);
    
    return audioBlob;
  } catch (error) {
    console.error('❌ [ELEVENLABS] API failed:', error);
    throw error;
  }
};

// Play audio from blob
export const playAudioBlob = (audioBlob: Blob): void => {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  console.log('🔊 [ELEVENLABS] Playing audio from blob...');

  // Use audioManager to ensure only one audio plays at a time
  audioManager.play(audio, 'elevenlabs-blob').then(() => {
    console.log('✅ Audio played using ElevenLabs AI');
  }).catch(error => {
    console.error('❌ Audio playback failed:', error);
  });
  
  // Clean up URL after playing
  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
    console.log('🧹 [ELEVENLABS] Audio playback ended, cleaned up URL');
  };
};

// Check if ElevenLabs API key is configured
export const isElevenLabsConfigured = (): boolean => {
  const hasValidKey = Boolean(ELEVENLABS_CONFIG.apiKey && 
                           ELEVENLABS_CONFIG.apiKey.length > 0 &&
                           ELEVENLABS_CONFIG.apiKey !== 'YOUR_ELEVENLABS_API_KEY_HERE');
  
  if (!hasValidKey) {
    console.error('❌ ElevenLabs API key is not properly configured');
  }
  
  return hasValidKey;
};

// Get available voices for a language
export const getElevenLabsVoices = (language: 'english' | 'spanish' | 'haitian') => {
  return ELEVENLABS_VOICES[language] || ELEVENLABS_VOICES.english;
};

// Convert language code to ElevenLabs language format
export const getElevenLabsLanguage = (languageCode: string): 'english' | 'spanish' | 'haitian' => {
  const languageMap: { [key: string]: 'english' | 'spanish' | 'haitian' } = {
    'en': 'english',
    'es': 'spanish',
    'ht': 'haitian',
    'english': 'english',
    'spanish': 'spanish',
    'haitian': 'haitian',
  };
  
  return languageMap[languageCode.toLowerCase()] || 'english';
};

// Generate and play speech in one function
export const generateAndPlaySpeech = async (options: ElevenLabsOptions): Promise<{ success: boolean; error?: string }> => {
  if (!isElevenLabsConfigured()) {
    const errorMsg = 'ElevenLabs API key not configured — cannot proceed with TTS.';
    console.error('❌ ' + errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    console.log('🎵 [ELEVENLABS] Generating and playing speech...');
    const audioBlob = await generateSpeech(options);
    
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Received empty audio response from ElevenLabs');
    }
    
    playAudioBlob(audioBlob);
    return { success: true };
  } catch (error: any) {
    const errorMsg = `ElevenLabs TTS failed: ${error.message || 'Unknown error'}`;
    console.error('❌ [ELEVENLABS]', errorMsg);
    return { 
      success: false, 
      error: errorMsg
    };
  }
};
