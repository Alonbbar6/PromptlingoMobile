/**
 * Global Audio Manager - Ensures only one audio plays at a time
 *
 * This singleton prevents multiple audio sources from playing simultaneously,
 * avoiding confusing overlapping audio.
 */

class AudioManager {
  private static instance: AudioManager;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioId: string | null = null;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Play audio, stopping any currently playing audio first
   * @param audio - The audio element to play
   * @param id - Optional identifier for this audio (for logging)
   */
  async play(audio: HTMLAudioElement, id?: string): Promise<void> {
    // Stop currently playing audio
    this.stopCurrent();

    // Set as current audio
    this.currentAudio = audio;
    this.currentAudioId = id || 'unknown';

    console.log(`🎵 AudioManager: Playing audio (${this.currentAudioId})`);

    // Listen for when audio ends
    const handleEnded = () => {
      if (this.currentAudio === audio) {
        console.log(`✅ AudioManager: Audio ended (${this.currentAudioId})`);
        this.currentAudio = null;
        this.currentAudioId = null;
      }
      audio.removeEventListener('ended', handleEnded);
    };

    const handlePause = () => {
      if (this.currentAudio === audio) {
        console.log(`⏸️ AudioManager: Audio paused (${this.currentAudioId})`);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    // Play the audio
    try {
      await audio.play();
    } catch (error) {
      console.error(`❌ AudioManager: Failed to play audio (${this.currentAudioId}):`, error);
      this.currentAudio = null;
      this.currentAudioId = null;
      throw error;
    }
  }

  /**
   * Stop the currently playing audio
   */
  stopCurrent(): void {
    if (this.currentAudio) {
      console.log(`⏹️ AudioManager: Stopping current audio (${this.currentAudioId})`);
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.currentAudioId = null;
    }
  }

  /**
   * Pause the currently playing audio (without resetting)
   */
  pauseCurrent(): void {
    if (this.currentAudio) {
      console.log(`⏸️ AudioManager: Pausing current audio (${this.currentAudioId})`);
      this.currentAudio.pause();
    }
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Get the currently playing audio element
   */
  getCurrentAudio(): HTMLAudioElement | null {
    return this.currentAudio;
  }

  /**
   * Get the ID of the currently playing audio
   */
  getCurrentAudioId(): string | null {
    return this.currentAudioId;
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();
