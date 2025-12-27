// Fixed AudioRecorder with comprehensive diagnostics and error handling

import { requestMicrophonePermission, MicrophonePermissionResult } from './microphonePermissions';

export interface DiagnosticInfo {
    microphonePermission: string;
    mediaRecorderState: string;
    audioTracksCount: number;
    chunksCollected: number;
    totalBytesRecorded: number;
    supportedMimeTypes: string[];
    currentAudioLevel: number;
    streamActive: boolean;
    recordingDuration: number;
}

export interface RecordingResult {
    success: boolean;
    audioBlob?: Blob;
    error?: string;
    diagnostics: DiagnosticInfo;
}

export class AudioRecorderFixed {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private stream: MediaStream | null = null;
    private isRecording: boolean = false;
    private startTime: number = 0;
    private onDiagnosticsUpdate?: (diagnostics: DiagnosticInfo) => void;

    constructor(onDiagnosticsUpdate?: (diagnostics: DiagnosticInfo) => void) {
        this.onDiagnosticsUpdate = onDiagnosticsUpdate;
    }

    async startRecording(): Promise<boolean> {
        console.log('🎙️ Starting recording with comprehensive diagnostics...');
        
        try {
            // Get microphone stream with permission handling
            const permissionResult: MicrophonePermissionResult = await requestMicrophonePermission();
            
            if (!permissionResult.success || !permissionResult.stream) {
                console.error('❌ Failed to get audio stream:', permissionResult.error);
                this.updateDiagnostics();
                return false;
            }

            this.stream = permissionResult.stream;
            console.log('✅ Audio stream obtained successfully');

            // Reset chunks and state
            this.audioChunks = [];
            this.startTime = Date.now();

            // Find supported MIME type
            const mimeType = this.getSupportedMimeType();
            console.log('🎵 Using MIME type:', mimeType);

            // Create MediaRecorder with optimal settings
            const options: MediaRecorderOptions = {
                audioBitsPerSecond: 128000, // High quality
            };

            if (mimeType) {
                options.mimeType = mimeType;
            }

            this.mediaRecorder = new MediaRecorder(this.stream, options);
            console.log('📹 MediaRecorder created with options:', options);

            // CRITICAL: Set up ALL event handlers BEFORE starting
            this.setupMediaRecorderEvents();

            // Verify stream is still active before starting
            const audioTracks = this.stream.getAudioTracks();
            if (audioTracks.length === 0 || audioTracks[0].readyState !== 'live') {
                throw new Error('Audio stream became inactive before recording could start');
            }

            // Start recording with small timeslice for frequent data events
            console.log('▶️ Starting MediaRecorder...');
            this.mediaRecorder.start(100); // CRITICAL: 100ms timeslice for frequent ondataavailable events
            this.isRecording = true;

            console.log('✅ MediaRecorder started successfully');
            console.log('📊 Initial state:', this.mediaRecorder.state);
            
            // Start diagnostics updates
            this.startDiagnosticsUpdates();
            
            return true;

        } catch (error: any) {
            console.error('❌ Failed to start MediaRecorder:', error);
            this.cleanup();
            this.updateDiagnostics();
            return false;
        }
    }

    private setupMediaRecorderEvents(): void {
        if (!this.mediaRecorder) return;

        // CRITICAL: Data collection event - must be set up before start()
        this.mediaRecorder.ondataavailable = (event) => {
            const chunkSize = event.data ? event.data.size : 0;
            console.log('📦 Data available event:', chunkSize, 'bytes');
            
            if (event.data && event.data.size > 0) {
                this.audioChunks.push(event.data);
                console.log(`✅ Chunk ${this.audioChunks.length} added:`, chunkSize, 'bytes');
                console.log('📊 Total chunks:', this.audioChunks.length);
                console.log('📊 Total bytes:', this.getTotalBytes());
            } else {
                console.warn('⚠️ Received empty or null data chunk');
            }
            
            this.updateDiagnostics();
        };

        this.mediaRecorder.onstop = () => {
            console.log('🛑 MediaRecorder stopped');
            console.log('📊 Final statistics:');
            console.log('  - Total chunks collected:', this.audioChunks.length);
            console.log('  - Total size:', this.getTotalBytes(), 'bytes');
            console.log('  - Recording duration:', this.getRecordingDuration(), 'seconds');
            
            this.updateDiagnostics();
        };

        this.mediaRecorder.onerror = (event: any) => {
            console.error('❌ MediaRecorder error:', event);
            console.error('Error details:', event.error);
            this.updateDiagnostics();
        };

        this.mediaRecorder.onstart = () => {
            console.log('▶️ MediaRecorder started event fired');
            console.log('📊 State after start:', this.mediaRecorder?.state);
            this.updateDiagnostics();
        };

        this.mediaRecorder.onpause = () => {
            console.log('⏸️ MediaRecorder paused');
            this.updateDiagnostics();
        };

        this.mediaRecorder.onresume = () => {
            console.log('▶️ MediaRecorder resumed');
            this.updateDiagnostics();
        };

        console.log('🔧 All MediaRecorder event handlers set up');
    }

    async stopRecording(): Promise<RecordingResult> {
        console.log('⏹️ Stopping recording...');

        if (!this.mediaRecorder) {
            const error = 'No MediaRecorder instance found';
            console.error('❌', error);
            return {
                success: false,
                error,
                diagnostics: this.getDiagnostics()
            };
        }

        if (this.mediaRecorder.state === 'inactive') {
            const error = 'MediaRecorder is already inactive';
            console.warn('⚠️', error);
            return {
                success: false,
                error,
                diagnostics: this.getDiagnostics()
            };
        }

        // Stop the recorder
        this.mediaRecorder.stop();
        this.isRecording = false;

        // Stop all audio tracks
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                console.log('🛑 Stopping track:', track.kind, track.label);
                track.stop();
            });
        }

        // Wait for final chunks to be processed
        console.log('⏳ Waiting for final chunks...');
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms for any final chunks

        console.log('📊 Final chunk count:', this.audioChunks.length);
        
        if (this.audioChunks.length === 0) {
            const error = `No audio chunks collected during recording.

Possible causes:
• Microphone not working or disconnected
• Speaking too quietly (no audio signal detected)
• Browser blocking audio recording
• Microphone being used by another application
• Audio drivers not working properly

Please check your microphone and try again.`;
            
            console.error('❌ No audio chunks collected!');
            this.cleanup();
            return {
                success: false,
                error,
                diagnostics: this.getDiagnostics()
            };
        }

        // Create blob from chunks
        const mimeType = this.getSupportedMimeType();
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        
        console.log('✅ Audio blob created:');
        console.log('  - Size:', audioBlob.size, 'bytes');
        console.log('  - Type:', audioBlob.type);
        console.log('  - Chunks used:', this.audioChunks.length);

        if (audioBlob.size === 0) {
            const error = `Audio recording is empty (0 bytes).

This usually means:
• No sound was detected during recording
• Microphone volume is too low
• Audio input is muted
• Technical issue with audio processing

Please check your microphone settings and try speaking louder.`;
            
            console.error('❌ Audio blob is empty!');
            this.cleanup();
            return {
                success: false,
                error,
                diagnostics: this.getDiagnostics()
            };
        }

        // Validate minimum size (should be at least a few KB for any meaningful audio)
        const minSize = 1024; // 1KB minimum
        if (audioBlob.size < minSize) {
            console.warn('⚠️ Audio blob is very small:', audioBlob.size, 'bytes');
            console.warn('This may indicate: very short recording, quiet audio, or microphone issues');
            // Don't fail for small files, but warn the user
        }

        const diagnostics = this.getDiagnostics();
        this.cleanup();
        
        return {
            success: true,
            audioBlob,
            diagnostics
        };
    }

    private getSupportedMimeType(): string {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg',
            'audio/mp4',
            'audio/mpeg',
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log('✅ Supported MIME type found:', type);
                return type;
            }
        }

        console.warn('⚠️ No preferred MIME type supported, using default');
        return '';
    }

    getSupportedMimeTypes(): string[] {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg',
            'audio/mp4',
            'audio/mpeg',
        ];

        return types.filter(type => MediaRecorder.isTypeSupported(type));
    }

    private startDiagnosticsUpdates(): void {
        if (!this.onDiagnosticsUpdate) return;

        const updateInterval = setInterval(() => {
            if (!this.isRecording) {
                clearInterval(updateInterval);
                return;
            }
            this.updateDiagnostics();
        }, 500); // Update every 500ms
    }

    private updateDiagnostics(): void {
        if (this.onDiagnosticsUpdate) {
            this.onDiagnosticsUpdate(this.getDiagnostics());
        }
    }

    getDiagnostics(): DiagnosticInfo {
        return {
            microphonePermission: this.stream ? 'granted' : 'denied',
            mediaRecorderState: this.mediaRecorder?.state || 'inactive',
            audioTracksCount: this.stream?.getAudioTracks().length || 0,
            chunksCollected: this.audioChunks.length,
            totalBytesRecorded: this.getTotalBytes(),
            supportedMimeTypes: this.getSupportedMimeTypes(),
            currentAudioLevel: 0, // Will be updated by AudioLevelMonitor
            streamActive: this.isStreamActive(),
            recordingDuration: this.getRecordingDuration()
        };
    }

    private isStreamActive(): boolean {
        if (!this.stream) return false;
        const audioTracks = this.stream.getAudioTracks();
        return audioTracks.length > 0 && audioTracks[0].readyState === 'live';
    }

    getRecordingDuration(): number {
        if (!this.startTime) return 0;
        return (Date.now() - this.startTime) / 1000;
    }

    getTotalBytes(): number {
        return this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    }

    getChunkCount(): number {
        return this.audioChunks.length;
    }

    getRecordingState(): boolean {
        return this.isRecording && this.mediaRecorder?.state === 'recording';
    }

    getStream(): MediaStream | null {
        return this.stream;
    }

    private cleanup(): void {
        console.log('🧹 Cleaning up AudioRecorder resources...');
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                console.log('🛑 Stopping track:', track.kind);
                track.stop();
            });
            this.stream = null;
        }
        
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.startTime = 0;
        
        console.log('✅ Cleanup complete');
    }

    // Force cleanup (for component unmount)
    destroy(): void {
        this.cleanup();
    }
}
