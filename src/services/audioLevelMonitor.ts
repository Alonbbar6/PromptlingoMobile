// Audio level monitoring for visual feedback and diagnostics

export class AudioLevelMonitor {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
    private animationFrame: number | null = null;
    private onLevelChange?: (level: number) => void;
    private isMonitoring: boolean = false;

    async initialize(stream: MediaStream, onLevelChange: (level: number) => void): Promise<boolean> {
        try {
            console.log('🎚️ Initializing audio level monitor...');
            
            // Verify stream is active before proceeding
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) {
                console.error('❌ No audio tracks in stream');
                return false;
            }
            
            const audioTrack = audioTracks[0];
            console.log('🎤 Audio track state:', audioTrack.readyState);
            console.log('🎤 Audio track enabled:', audioTrack.enabled);
            
            if (audioTrack.readyState !== 'live') {
                console.error('❌ Audio track is not live');
                return false;
            }
            
            this.onLevelChange = onLevelChange;
            
            // Create audio context
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            console.log('🔊 AudioContext created, state:', this.audioContext.state);
            
            // CRITICAL: Resume AudioContext if suspended (required in many browsers, especially iOS)
            if (this.audioContext.state === 'suspended') {
                console.log('⚠️ AudioContext is suspended, resuming...');
                try {
                    await this.audioContext.resume();
                    console.log('✅ AudioContext resumed, new state:', this.audioContext.state);
                    
                    // Double-check it actually resumed (iOS sometimes needs a moment)
                    if (this.audioContext.state === 'suspended') {
                        console.warn('⚠️ AudioContext still suspended after resume attempt, trying again...');
                        await new Promise(resolve => setTimeout(resolve, 100));
                        await this.audioContext.resume();
                        console.log('✅ Second resume attempt, state:', this.audioContext.state);
                    }
                } catch (error) {
                    console.error('❌ Failed to resume AudioContext:', error);
                    throw new Error('Could not activate audio system. Please try again or check your browser settings.');
                }
            }
            
            // iOS Safari requires user interaction before AudioContext can run
            // If still suspended, it means we need user interaction
            if (this.audioContext.state === 'suspended') {
                console.error('❌ AudioContext remains suspended - user interaction required');
                throw new Error('Audio system requires user interaction. Please tap the record button again.');
            }
            
            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            
            // Connect stream to analyser
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);
            
            console.log('🔗 Audio source connected to analyser');
            
            // Create data array for frequency data
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            // Start monitoring
            this.startMonitoring();
            
            console.log('✅ Audio level monitor initialized successfully');
            console.log('  - AudioContext state:', this.audioContext.state);
            console.log('  - FFT Size:', this.analyser.fftSize);
            console.log('  - Frequency bin count:', this.analyser.frequencyBinCount);
            console.log('  - Smoothing:', this.analyser.smoothingTimeConstant);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize audio level monitor:', error);
            this.cleanup();
            return false;
        }
    }

    private startMonitoring(): void {
        if (!this.analyser || !this.dataArray || !this.onLevelChange) {
            console.error('❌ Cannot start monitoring: missing components');
            return;
        }

        this.isMonitoring = true;
        
        const checkLevel = () => {
            if (!this.isMonitoring || !this.analyser || !this.dataArray || !this.onLevelChange) {
                return;
            }

            // Get frequency data
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // Calculate average level
            const sum = this.dataArray.reduce((a, b) => a + b, 0);
            const average = sum / this.dataArray.length;
            
            // Convert to percentage (0-100)
            const level = Math.min(100, (average / 128) * 100);
            
            // Call the callback with the level
            this.onLevelChange(level);
            
            // Continue monitoring
            this.animationFrame = requestAnimationFrame(checkLevel);
        };

        // Start the monitoring loop
        checkLevel();
        console.log('🎚️ Audio level monitoring started');
    }

    stopMonitoring(): void {
        console.log('⏹️ Stopping audio level monitoring...');
        this.isMonitoring = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    cleanup(): void {
        console.log('🧹 Cleaning up audio level monitor...');
        
        this.stopMonitoring();
        
        if (this.audioContext) {
            this.audioContext.close().catch(error => {
                console.warn('Warning: Failed to close AudioContext:', error);
            });
            this.audioContext = null;
        }
        
        this.analyser = null;
        this.dataArray = null;
        this.onLevelChange = undefined;
        
        console.log('✅ Audio level monitor cleanup complete');
    }

    // Get current audio level without callback (for diagnostics)
    getCurrentLevel(): number {
        if (!this.analyser || !this.dataArray) {
            return 0;
        }

        try {
            this.analyser.getByteFrequencyData(this.dataArray);
            const sum = this.dataArray.reduce((a, b) => a + b, 0);
            const average = sum / this.dataArray.length;
            return Math.min(100, (average / 128) * 100);
        } catch (error) {
            console.warn('Failed to get current audio level:', error);
            return 0;
        }
    }

    // Check if audio is being detected
    isAudioDetected(threshold: number = 1): boolean {
        return this.getCurrentLevel() > threshold;
    }

    // Get detailed audio analysis
    getAudioAnalysis(): {
        level: number;
        isDetected: boolean;
        frequencyData: number[];
        peakFrequency: number;
    } {
        if (!this.analyser || !this.dataArray) {
            return {
                level: 0,
                isDetected: false,
                frequencyData: [],
                peakFrequency: 0
            };
        }

        try {
            this.analyser.getByteFrequencyData(this.dataArray);
            
            const frequencyData = Array.from(this.dataArray);
            const sum = frequencyData.reduce((a, b) => a + b, 0);
            const average = sum / frequencyData.length;
            const level = Math.min(100, (average / 128) * 100);
            
            // Find peak frequency
            const maxIndex = frequencyData.indexOf(Math.max(...frequencyData));
            const peakFrequency = (maxIndex * this.audioContext!.sampleRate) / (2 * this.analyser.fftSize);
            
            return {
                level,
                isDetected: level > 1,
                frequencyData,
                peakFrequency
            };
        } catch (error) {
            console.warn('Failed to get audio analysis:', error);
            return {
                level: 0,
                isDetected: false,
                frequencyData: [],
                peakFrequency: 0
            };
        }
    }
}
