import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface TranscriptionChunk {
  id: string;
  text: string;
  translatedText?: string;
  timestamp: Date;
  language: string;
  targetLanguage?: string;
  confidence?: number;
}

export interface LiveTranscriptionConfig {
  language: string;
  targetLanguage?: string;
  chunkDuration: number; // milliseconds
  onChunkTranscribed: (chunk: TranscriptionChunk) => void;
  onError: (error: Error) => void;
  onStatusChange: (status: 'idle' | 'recording' | 'processing' | 'error') => void;
}

export class LiveTranscriptionService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private chunkTimer: NodeJS.Timeout | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private config: LiveTranscriptionConfig;
  private chunkCounter: number = 0;
  private processingQueue: Promise<void> = Promise.resolve();
  private audioContext: AudioContext | null = null;
  private silenceThreshold: number = 0.01; // Volume threshold for silence detection

  constructor(config: LiveTranscriptionConfig) {
    this.config = config;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  /**
   * Start live transcription
   */
  async start(): Promise<void> {
    try {
      this.config.onStatusChange('recording');

      // Create audio context for volume analysis
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Get microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      // Create MediaRecorder
      const options = { mimeType: 'audio/webm;codecs=opus' };
      this.mediaRecorder = new MediaRecorder(this.audioStream, options);

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        console.log(`📼 Data available: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log(`📚 Total chunks collected: ${this.audioChunks.length}`);
        }
      };

      // Add error handler
      this.mediaRecorder.onerror = (event: any) => {
        console.error('❌ MediaRecorder error:', event);
        this.config.onError(new Error('MediaRecorder error'));
      };

      // Start recording
      console.log('🎙️ Starting MediaRecorder...');
      this.mediaRecorder.start();
      this.isRecording = true;
      console.log(`✅ MediaRecorder started. State: ${this.mediaRecorder.state}`);

      // Set up chunk timer
      this.scheduleNextChunk();

      console.log(`✅ Live transcription started. Chunk duration: ${this.config.chunkDuration}ms`);
    } catch (error) {
      console.error('❌ Failed to start live transcription:', error);
      this.config.onStatusChange('error');
      this.config.onError(error as Error);
      throw error;
    }
  }

  /**
   * Schedule next chunk processing
   */
  private scheduleNextChunk(): void {
    console.log(`⏰ Scheduling next chunk in ${this.config.chunkDuration}ms`);
    this.chunkTimer = setTimeout(() => {
      console.log('⏰ Chunk timer fired!');
      this.processCurrentChunk();
      if (this.isRecording) {
        this.scheduleNextChunk();
      }
    }, this.config.chunkDuration);
  }

  /**
   * Process current audio chunk
   */
  private async processCurrentChunk(): Promise<void> {
    console.log(`🔄 Processing chunk. MediaRecorder: ${!!this.mediaRecorder}, Chunks: ${this.audioChunks.length}, State: ${this.mediaRecorder?.state}`);

    if (!this.mediaRecorder) {
      console.log('⏭️ No MediaRecorder available');
      return;
    }

    // Stop current recording segment to collect data
    if (this.mediaRecorder.state === 'recording') {
      console.log('🛑 Stopping MediaRecorder to collect data...');
      this.mediaRecorder.stop();
    } else {
      console.log(`⏭️ MediaRecorder not recording (state: ${this.mediaRecorder.state})`);
      return;
    }

    // Wait for all data to be collected
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get audio blob
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    this.audioChunks = [];

    console.log(`📦 Chunk size: ${audioBlob.size} bytes`);

    // Skip only if truly empty (no audio data at all)
    if (audioBlob.size === 0) {
      console.log('⏭️  Skipping empty chunk');
      // Restart recording for next chunk
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.start();
      }
      return;
    }

    // Queue this chunk for processing
    this.processingQueue = this.processingQueue.then(async () => {
      await this.transcribeChunk(audioBlob);
    });

    // Restart recording for next chunk
    if (this.mediaRecorder && this.isRecording && this.mediaRecorder.state !== 'recording') {
      console.log('🎙️ Restarting MediaRecorder for next chunk...');
      this.mediaRecorder.start();
    } else {
      console.log(`⚠️ Not restarting. Recording: ${this.isRecording}, State: ${this.mediaRecorder?.state}`);
    }
  }

  /**
   * Analyze audio volume to detect silence
   */
  private async analyzeAudioVolume(audioBlob: Blob): Promise<number> {
    try {
      if (!this.audioContext) return 1; // Skip check if no context

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Get audio data from first channel
      const channelData = audioBuffer.getChannelData(0);

      // Calculate RMS (Root Mean Square) volume
      let sum = 0;
      for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
      }
      const rms = Math.sqrt(sum / channelData.length);

      console.log(`🔊 Audio volume: ${rms.toFixed(4)}`);
      return rms;
    } catch (error) {
      console.error('❌ Failed to analyze audio volume:', error);
      return 1; // Return high volume on error to allow transcription
    }
  }

  /**
   * Translate text using backend API
   */
  private async translateText(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/translate`, {
        text,
        sourceLang,
        targetLang,
      }, {
        withCredentials: true,
      });

      return response.data.translation || null;
    } catch (error) {
      console.error('❌ Translation failed:', error);
      return null;
    }
  }

  /**
   * Send chunk to backend for transcription
   */
  private async transcribeChunk(audioBlob: Blob): Promise<void> {
    const chunkId = `chunk-${++this.chunkCounter}-${Date.now()}`;

    try {
      this.config.onStatusChange('processing');

      // Check audio volume to detect silence
      const volume = await this.analyzeAudioVolume(audioBlob);
      if (volume < this.silenceThreshold) {
        console.log(`🔇 Chunk ${this.chunkCounter}: Silence detected (volume: ${volume.toFixed(4)}), skipping transcription`);
        this.config.onStatusChange('recording');
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, 'chunk.webm');
      formData.append('language', this.config.language);

      console.log(`🎤 Sending chunk ${this.chunkCounter} (${audioBlob.size} bytes, volume: ${volume.toFixed(4)})`);

      // Send to backend
      const response = await axios.post(`${API_BASE_URL}/api/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      // Extract transcription
      const transcription = response.data.transcription || response.data.text || '';

      if (transcription && transcription.trim()) {
        const chunk: TranscriptionChunk = {
          id: chunkId,
          text: transcription.trim(),
          timestamp: new Date(),
          language: this.config.language,
          confidence: response.data.confidence,
        };

        // Translate if target language is set
        if (this.config.targetLanguage && this.config.targetLanguage !== this.config.language) {
          console.log(`🌐 Translating from ${this.config.language} to ${this.config.targetLanguage}...`);
          const translated = await this.translateText(
            chunk.text,
            this.config.language,
            this.config.targetLanguage
          );

          if (translated) {
            chunk.translatedText = translated;
            chunk.targetLanguage = this.config.targetLanguage;
            console.log(`✅ Translated: "${translated}"`);
          }
        }

        console.log(`✅ Chunk ${this.chunkCounter}: "${chunk.text}"`);
        this.config.onChunkTranscribed(chunk);
      } else {
        console.log(`⏭️  Chunk ${this.chunkCounter}: No speech detected`);
      }

      this.config.onStatusChange('recording');
    } catch (error) {
      console.error(`❌ Failed to transcribe chunk ${this.chunkCounter}:`, error);
      // Don't call onError for individual chunk failures - continue recording
      this.config.onStatusChange('recording');
    }
  }

  /**
   * Stop live transcription
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping live transcription');

    this.isRecording = false;

    // Clear chunk timer
    if (this.chunkTimer) {
      clearTimeout(this.chunkTimer);
      this.chunkTimer = null;
    }

    // Process any remaining audio
    if (this.audioChunks.length > 0) {
      await this.processCurrentChunk();
    }

    // Wait for processing queue to complete
    await this.processingQueue;

    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    // Stop audio stream
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.config.onStatusChange('idle');

    console.log('✅ Live transcription stopped');
  }

  /**
   * Check if currently recording
   */
  isActive(): boolean {
    return this.isRecording;
  }
}
