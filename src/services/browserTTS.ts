/**
 * Browser Text-to-Speech Service
 * Free fallback using Web Speech API when ElevenLabs is not available
 */

export interface BrowserVoice {
  voice_id: string;
  name: string;
  language: string;
  isBrowser: true;
}

/**
 * Synthesize speech using browser's built-in TTS
 */
export const synthesizeSpeechBrowser = (text: string, language: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser does not support text-to-speech'));
      return;
    }

    console.log('🔊 [BROWSER TTS] Starting synthesis...');
    console.log(`   - Text length: ${text.length} characters`);
    console.log(`   - Language: ${language}`);

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language - use French as fallback for Haitian Creole
    utterance.lang = language === 'ht' ? 'fr-FR' : 'en-US';
    
    // Set voice properties for better quality
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = utterance.lang.substring(0, 2);
    
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(langPrefix) && !voice.localService
    ) || voices.find(voice => 
      voice.lang.startsWith(langPrefix)
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log(`   - Using voice: ${preferredVoice.name} (${preferredVoice.lang})`);
    } else {
      console.log(`   - Using default voice`);
    }

    utterance.onstart = () => {
      console.log('▶️ [BROWSER TTS] Speech started');
    };

    utterance.onend = () => {
      console.log('✅ [BROWSER TTS] Speech completed');
      resolve();
    };

    utterance.onerror = (error) => {
      console.error('❌ [BROWSER TTS] Speech error:', error);
      reject(error);
    };

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Get available browser voices for a specific language
 */
export const getBrowserVoices = (language: string): BrowserVoice[] => {
  const voices = window.speechSynthesis.getVoices();
  
  // Use French voices for Haitian Creole
  const langPrefix = language === 'ht' ? 'fr' : language;
  
  const filteredVoices = voices
    .filter(voice => voice.lang.startsWith(langPrefix))
    .map(voice => ({
      voice_id: voice.name,
      name: voice.name,
      language: voice.lang,
      isBrowser: true as const,
    }));

  console.log(`🎙️ Found ${filteredVoices.length} browser voices for ${language}`);
  
  return filteredVoices;
};

/**
 * Check if browser TTS is available
 */
export const isBrowserTTSAvailable = (): boolean => {
  return 'speechSynthesis' in window;
};

/**
 * Wait for voices to be loaded (some browsers load them asynchronously)
 */
export const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      resolve(loadedVoices);
    };

    // Timeout after 3 seconds
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 3000);
  });
};

const browserTTS = {
  synthesizeSpeechBrowser,
  getBrowserVoices,
  isBrowserTTSAvailable,
  waitForVoices,
};

export default browserTTS;
