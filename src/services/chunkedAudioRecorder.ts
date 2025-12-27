// Enhanced audio recording with chunking for long recordings and fast speech

export interface ChunkConfig {
    maxDurationMs: number;
    overlapMs: number;
}

export interface RecordingLimits {
    maxDurationMs: number;
    warningDurationMs: number;
}

export interface RecordingState {
    isRecording: boolean;
    duration: number;
    volume: number;
    speechRate: 'slow' | 'normal' | 'fast' | 'too-fast';
    chunksProcessed: number;
    warning: string | null;
    wordsPerMinute: number;
}

const CHUNK_CONFIG: ChunkConfig = {
    maxDurationMs: 30000, // 30 seconds max per chunk
    overlapMs: 500,       // 500ms overlap to catch split words
};

const RECORDING_LIMITS: RecordingLimits = {
    maxDurationMs: 120000,    // 2 minutes max
    warningDurationMs: 90000, // Warning at 1.5 minutes
};

export class SpeechRateDetector {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
    private lastSpeechTime: number = 0;
    private speechBursts: number[] = [];
    private readonly SPEECH_THRESHOLD = 30; // Volume threshold for speech detection
    private readonly WPM_FAST_THRESHOLD = 180; // Words per minute threshold
    private readonly WPM_TOO_FAST_THRESHOLD = 220;

    initialize(stream: MediaStream) {
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;

        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);

        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        console.log('🎤 Speech rate detector initialized');
    }

    getVolume(): number {
        if (!this.analyser || !this.dataArray) return 0;

        this.analyser.getByteFrequencyData(this.dataArray);
        
        const sum = this.dataArray.reduce((acc, val) => acc + val, 0);
        return sum / this.dataArray.length;
    }

    detectSpeechRate(): { rate: 'slow' | 'normal' | 'fast' | 'too-fast', wpm: number } {
        const volume = this.getVolume();
        const now = Date.now();

        // Detect speech bursts (when volume exceeds threshold)
        if (volume > this.SPEECH_THRESHOLD) {
            if (now - this.lastSpeechTime > 100) { // New burst
                this.speechBursts.push(now);
            }
            this.lastSpeechTime = now;
        }

        // Keep only last 10 seconds of data
        const tenSecondsAgo = now - 10000;
        this.speechBursts = this.speechBursts.filter(time => time > tenSecondsAgo);

        // Calculate words per minute (approximate)
        // Assumes average of 2-3 syllables per burst
        const burstsPerMinute = (this.speechBursts.length / 10) * 60;
        const wordsPerMinute = Math.round(burstsPerMinute * 2.5);

        let rate: 'slow' | 'normal' | 'fast' | 'too-fast' = 'normal';
        if (wordsPerMinute > this.WPM_TOO_FAST_THRESHOLD) {
            rate = 'too-fast';
        } else if (wordsPerMinute > this.WPM_FAST_THRESHOLD) {
            rate = 'fast';
        } else if (wordsPerMinute < 120) {
            rate = 'slow';
        }

        return { rate, wpm: wordsPerMinute };
    }

    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

export class RecordingTimer {
    private startTime: number = 0;
    private warningShown: boolean = false;
    private interval: NodeJS.Timeout | null = null;

    start(
        onWarning: (timeLeft: number) => void,
        onMaxReached: () => void
    ) {
        this.startTime = Date.now();
        this.warningShown = false;

        this.interval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const remaining = RECORDING_LIMITS.maxDurationMs - elapsed;

            // Show warning
            if (elapsed >= RECORDING_LIMITS.warningDurationMs && !this.warningShown) {
                this.warningShown = true;
                onWarning(remaining);
            }

            // Auto-stop at max
            if (elapsed >= RECORDING_LIMITS.maxDurationMs) {
                this.stop();
                onMaxReached();
            }
        }, 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    getElapsedSeconds(): number {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
}

export class FeedbackService {
    private lastFeedbackTime: number = 0;
    private readonly FEEDBACK_COOLDOWN = 3000; // 3 seconds between feedbacks

    provideFeedback(speechRate: 'slow' | 'normal' | 'fast' | 'too-fast') {
        const now = Date.now();
        
        // Avoid feedback spam
        if (now - this.lastFeedbackTime < this.FEEDBACK_COOLDOWN) {
            return;
        }

        this.lastFeedbackTime = now;

        switch (speechRate) {
            case 'too-fast':
                // Vibration pattern: long, short, long
                if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                }
                
                // Optional: Play a gentle "slow down" tone
                this.playTone(800, 0.1, 100); // High pitch, quiet, short
                break;

            case 'fast':
                // Single short vibration
                if ('vibrate' in navigator) {
                    navigator.vibrate(100);
                }
                break;

            case 'normal':
                // No feedback needed - user is doing great
                break;
        }
    }

    private playTone(frequency: number, volume: number, duration: number) {
        try {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            gainNode.gain.value = volume;

            oscillator.start();
            setTimeout(() => {
                oscillator.stop();
                audioContext.close();
            }, duration);
        } catch (error) {
            console.warn('Could not play feedback tone:', error);
        }
    }
}

export function getOptimalRecorderOptions(): MediaRecorderOptions {
    // Try different codecs in order of preference
    const codecPreferences = [
        'audio/webm;codecs=opus',     // Best for speech
        'audio/ogg;codecs=opus',      // Fallback
        'audio/webm',                 // Generic webm
        'audio/mp4',                  // Safari fallback
    ];

    for (const mimeType of codecPreferences) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
            console.log(`✅ Using codec: ${mimeType}`);
            return {
                mimeType,
                audioBitsPerSecond: 128000, // High quality
                bitsPerSecond: 128000,
            };
        }
    }

    console.warn('⚠️ No preferred codec supported, using default');
    return {};
}

export async function getOptimizedAudioStream(): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
        audio: {
            channelCount: 1,              // Mono for speech
            sampleRate: 48000,            // High sample rate
            sampleSize: 16,               // 16-bit audio
            echoCancellation: true,       // Remove echo
            noiseSuppression: true,       // Remove background noise
            autoGainControl: true,        // Normalize volume
        },
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('✅ Optimized audio stream obtained');
        return stream;
    } catch (error) {
        console.error('❌ Failed to get optimized stream, using defaults');
        return navigator.mediaDevices.getUserMedia({ audio: true });
    }
}

export class ChunkedAudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private currentChunk: Blob[] = [];
    private chunkStartTime: number = 0;
    private recordingStartTime: number = 0;
    private speechRateDetector: SpeechRateDetector | null = null;
    private rateCheckInterval: NodeJS.Timeout | null = null;
    private feedbackService: FeedbackService = new FeedbackService();

    startRecording(
        stream: MediaStream, 
        onSpeechRateChange?: (rate: 'slow' | 'normal' | 'fast' | 'too-fast', wpm: number) => void
    ) {
        this.audioChunks = [];
        this.currentChunk = [];
        this.recordingStartTime = Date.now();
        this.chunkStartTime = Date.now();

        // Initialize speech rate detector
        this.speechRateDetector = new SpeechRateDetector();
        this.speechRateDetector.initialize(stream);

        // Check speech rate every 500ms
        this.rateCheckInterval = setInterval(() => {
            if (this.speechRateDetector) {
                const { rate, wpm } = this.speechRateDetector.detectSpeechRate();
                onSpeechRateChange?.(rate, wpm);

                // Provide haptic feedback for fast speech
                this.feedbackService.provideFeedback(rate);

                // Log warnings for too-fast speech
                if (rate === 'too-fast') {
                    console.warn('⚠️ Speech too fast! WPM:', wpm);
                } else if (rate === 'fast') {
                    console.warn('⚠️ Speech rate elevated. WPM:', wpm);
                }
            }
        }, 500);

        // Use optimal codec for better quality
        const options = getOptimalRecorderOptions();
        this.mediaRecorder = new MediaRecorder(stream, options);

        // Collect data every 100ms for smooth chunking
        this.mediaRecorder.start(100);

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.currentChunk.push(event.data);

                // Check if we need to split into a new chunk
                const chunkDuration = Date.now() - this.chunkStartTime;
                if (chunkDuration >= CHUNK_CONFIG.maxDurationMs) {
                    this.finalizeChunk();
                }
            }
        };

        this.mediaRecorder.onstop = () => {
            this.finalizeChunk();
            this.cleanup();
        };
    }

    private finalizeChunk() {
        if (this.currentChunk.length === 0) return;

        const chunkBlob = new Blob(this.currentChunk, { type: 'audio/webm' });
        this.audioChunks.push(chunkBlob);

        console.log(`📦 Chunk finalized: ${chunkBlob.size} bytes`);

        // Reset for next chunk
        this.currentChunk = [];
        this.chunkStartTime = Date.now();
    }

    private cleanup() {
        if (this.rateCheckInterval) {
            clearInterval(this.rateCheckInterval);
            this.rateCheckInterval = null;
        }
        if (this.speechRateDetector) {
            this.speechRateDetector.cleanup();
            this.speechRateDetector = null;
        }
    }

    stopRecording(): Blob[] {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        const totalDuration = (Date.now() - this.recordingStartTime) / 1000;
        console.log(`🎬 Recording stopped: ${totalDuration.toFixed(1)}s, ${this.audioChunks.length} chunks`);

        return this.audioChunks;
    }

    getRecordingDuration(): number {
        return (Date.now() - this.recordingStartTime) / 1000;
    }
}

// Smart transcription combining
export function combineTranscriptions(transcriptions: string[]): string {
    return transcriptions
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .join(' ')
        .replace(/\s+/g, ' ') // Remove extra spaces
        .replace(/\.\s+\./g, '.') // Remove duplicate periods
        .trim();
}
