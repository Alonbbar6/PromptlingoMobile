// Text-to-Speech Service using Backend API (ElevenLabs)
import { audioManager } from './audioManager';

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender?: 'male' | 'female';
  description?: string;
}

export interface TTSOptions {
  voiceId?: string;
  language?: string;
}

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  currentText?: string;
  progress: number; // 0 to 1
}

interface SynthesizeResponse {
  audioUrl: string;
  characterCount: number;
  voiceId: string;
  originalLanguage: string;
  elevenLabsLanguage: string;
  synthesisTime: number;
}

export class TextToSpeechService {
  private onStateChange?: (state: TTSState) => void;
  private currentAudio: HTMLAudioElement | null = null;
  private state: TTSState = {
    isPlaying: false,
    isPaused: false,
    isSupported: true, // Backend API is always available
    progress: 0
  };

  constructor(onStateChange?: (state: TTSState) => void) {
    this.onStateChange = onStateChange;
    this.updateState();
  }

  private getApiUrl(endpoint = 'synthesize'): string {
    // Get base URL and remove trailing slashes
    let baseUrl = process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL.replace(/\/+$/, '')
      : '';

    // If no endpoint specified, return base URL
    if (!endpoint) {
      return baseUrl || '/api';
    }

    // Construct full URL with endpoint
    if (baseUrl) {
      return `${baseUrl}/api/${endpoint}`;
    }

    // For local development
    return `/api/${endpoint}`;
  }

  private updateState(updates?: Partial<TTSState>) {
    this.state = { ...this.state, ...updates };
    this.onStateChange?.(this.state);
  }

  /**
   * Get all available voices from backend
   */
  async getAvailableVoices(): Promise<TTSVoice[]> {
    try {
      const response = await fetch(this.getApiUrl('voices'));
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('❌ Failed to fetch voices:', error);
      return [];
    }
  }

  /**
   * Get voices for a specific language
   */
  async getVoicesForLanguage(languageCode: string): Promise<TTSVoice[]> {
    const voices = await this.getAvailableVoices();
    return voices.filter(voice => voice.language === languageCode);
  }

  /**
   * Get the best voice for a language
   */
  async getBestVoiceForLanguage(languageCode: string): Promise<TTSVoice | null> {
    const voices = await this.getVoicesForLanguage(languageCode);
    return voices.length > 0 ? voices[0] : null;
  }

  /**
   * Speak the given text using backend ElevenLabs API
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!text || typeof text !== 'string') {
      throw new Error('No text provided for speech synthesis');
    }

    // Stop any currently playing audio
    this.stop();

    try {
      this.updateState({ isPlaying: true, currentText: text, progress: 0 });
      console.log('🔊 [TTS] Requesting speech synthesis from backend...');

      // Determine voice ID
      let voiceId = options.voiceId;
      if (!voiceId && options.language) {
        // Get default voice for language
        const voice = await this.getBestVoiceForLanguage(options.language);
        voiceId = voice?.id || 'male-1'; // Fallback to male-1
      }
      voiceId = voiceId || 'male-1'; // Default fallback

      // Call backend API
      const apiUrl = this.getApiUrl();
      console.log('📡 API URL:', apiUrl); // Debug log

      // Headers for request (auth via HttpOnly cookies)
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        credentials: 'include', // Send HttpOnly cookies with request
        body: JSON.stringify({
          text,
          voiceId,
          language: options.language || 'en'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to synthesize speech');
      }

      const data: SynthesizeResponse = await response.json();
      console.log('✅ [TTS] Received audio from backend');

      // Play the audio
      await this.playAudio(data.audioUrl);

    } catch (error) {
      console.error('❌ [TTS] Speech synthesis failed:', error);
      this.updateState({ isPlaying: false, currentText: undefined, progress: 0 });
      throw error;
    }
  }

  /**
   * Play audio from a data URL
   */
  private async playAudio(audioUrl: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.currentAudio = new Audio(audioUrl);

      this.currentAudio.onplay = () => {
        console.log('🔊 [TTS] Audio playback started');
        this.updateState({ isPlaying: true, isPaused: false });
      };

      this.currentAudio.onended = () => {
        console.log('✅ [TTS] Audio playback completed');
        this.updateState({ isPlaying: false, currentText: undefined, progress: 1 });
        this.currentAudio = null;
        resolve();
      };

      this.currentAudio.onerror = (error) => {
        console.error('❌ [TTS] Audio playback error:', error);
        this.updateState({ isPlaying: false, currentText: undefined, progress: 0 });
        this.currentAudio = null;
        reject(new Error('Audio playback failed'));
      };

      this.currentAudio.ontimeupdate = () => {
        if (this.currentAudio) {
          const progress = this.currentAudio.currentTime / this.currentAudio.duration;
          this.updateState({ progress });
        }
      };

      // Use audioManager to ensure only one audio plays at a time
      try {
        await audioManager.play(this.currentAudio, 'tts-service');
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.updateState({ isPaused: true });
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
      this.updateState({ isPaused: false });
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.updateState({
      isPlaying: false,
      isPaused: false,
      currentText: undefined,
      progress: 0
    });
  }

  /**
   * Get current state
   */
  getState(): TTSState {
    return { ...this.state };
  }

  /**
   * Check if TTS is supported
   */
  isSupported(): boolean {
    return this.state.isSupported;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
  }
}

// Singleton instance
let ttsInstance: TextToSpeechService | null = null;

/**
 * Get the singleton TTS service instance
 */
export function getTTSService(onStateChange?: (state: TTSState) => void): TextToSpeechService {
  if (!ttsInstance) {
    ttsInstance = new TextToSpeechService(onStateChange);
  }
  return ttsInstance;
}

/**
 * Quick speak function for simple use cases
 */
export async function quickSpeak(text: string, language?: string): Promise<void> {
  const tts = getTTSService();
  return tts.speak(text, { language });
}

/**
 * Check if TTS is supported
 * Always returns true since backend API is always available
 */
export function isTTSSupported(): boolean {
  return true;
}
