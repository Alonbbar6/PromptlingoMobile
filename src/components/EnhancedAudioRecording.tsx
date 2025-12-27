import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Settings, Eye, EyeOff } from 'lucide-react';
import { AudioRecorderFixed, DiagnosticInfo, RecordingResult } from '../services/audioRecorderFixed';
import { AudioLevelMonitor } from '../services/audioLevelMonitor';
import { checkMicrophoneSupport } from '../services/microphonePermissions';
import AudioLevelIndicator from './AudioLevelIndicator';
import DiagnosticPanel from './DiagnosticPanel';

interface EnhancedAudioRecordingProps {
    onRecordingComplete?: (audioBlob: Blob) => void;
    onError?: (error: string) => void;
    showDiagnostics?: boolean;
}

const EnhancedAudioRecording: React.FC<EnhancedAudioRecordingProps> = ({
    onRecordingComplete,
    onError,
    showDiagnostics = false
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [error, setError] = useState<string>('');
    const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);
    const [showDiagnosticsPanel, setShowDiagnosticsPanel] = useState(showDiagnostics);
    const [browserSupport, setBrowserSupport] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const recorderRef = useRef<AudioRecorderFixed | null>(null);
    const monitorRef = useRef<AudioLevelMonitor | null>(null);

    // Check browser support on mount
    useEffect(() => {
        checkMicrophoneSupport().then(setBrowserSupport);
    }, []);

    // Initialize recorder with diagnostics callback
    useEffect(() => {
        recorderRef.current = new AudioRecorderFixed((diagnosticsInfo) => {
            setDiagnostics(prev => ({
                ...diagnosticsInfo,
                currentAudioLevel: prev?.currentAudioLevel || 0 // Preserve audio level from monitor
            }));
        });

        return () => {
            if (recorderRef.current) {
                recorderRef.current.destroy();
            }
            if (monitorRef.current) {
                monitorRef.current.cleanup();
            }
        };
    }, []);

    const handleStartRecording = async () => {
        if (!recorderRef.current) return;

        setError('');
        setIsProcessing(true);

        try {
            console.log('🎙️ Starting enhanced audio recording...');
            
            const success = await recorderRef.current.startRecording();
            
            if (!success) {
                setError('Failed to start recording. Please check the diagnostics panel for details.');
                setIsProcessing(false);
                return;
            }

            // Start audio level monitoring
            const stream = recorderRef.current.getStream();
            if (stream) {
                monitorRef.current = new AudioLevelMonitor();
                const monitorSuccess = await monitorRef.current.initialize(stream, (level) => {
                    setAudioLevel(level);
                    
                    // Update diagnostics with current audio level
                    setDiagnostics(prev => prev ? {
                        ...prev,
                        currentAudioLevel: level
                    } : null);
                });

                if (!monitorSuccess) {
                    console.warn('⚠️ Audio level monitoring failed to start');
                }
            }

            setIsRecording(true);
            setIsProcessing(false);
            console.log('✅ Recording started successfully');

        } catch (error: any) {
            console.error('❌ Failed to start recording:', error);
            setError(`Failed to start recording: ${error.message}`);
            setIsProcessing(false);
            onError?.(error.message);
        }
    };

    const handleStopRecording = async () => {
        if (!recorderRef.current) return;

        setIsProcessing(true);
        console.log('⏹️ Stopping enhanced audio recording...');

        try {
            // Stop audio level monitoring
            if (monitorRef.current) {
                monitorRef.current.cleanup();
                monitorRef.current = null;
            }

            // Stop recording and get result
            const result: RecordingResult = await recorderRef.current.stopRecording();
            
            setIsRecording(false);
            setAudioLevel(0);
            setIsProcessing(false);

            // Update final diagnostics
            setDiagnostics(result.diagnostics);

            if (!result.success || !result.audioBlob) {
                const errorMessage = result.error || 'Unknown recording error occurred';
                console.error('❌ Recording failed:', errorMessage);
                setError(errorMessage);
                onError?.(errorMessage);
                return;
            }

            console.log('✅ Recording completed successfully:', result.audioBlob.size, 'bytes');
            setError(''); // Clear any previous errors
            
            // Call success callback
            onRecordingComplete?.(result.audioBlob);

        } catch (error: any) {
            console.error('❌ Error stopping recording:', error);
            setError(`Error stopping recording: ${error.message}`);
            setIsRecording(false);
            setIsProcessing(false);
            onError?.(error.message);
        }
    };

    // Show browser compatibility warning if needed
    if (browserSupport && !browserSupport.supported) {
        return (
            <div className="enhanced-audio-recording p-6 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Browser Not Supported
                    </h3>
                    <p className="text-red-700 mb-4">
                        Your browser doesn't support audio recording. Please use a modern browser.
                    </p>
                    <div className="text-sm text-red-600 space-y-1">
                        <div>getUserMedia: {browserSupport.features.getUserMedia ? '✅' : '❌'}</div>
                        <div>MediaRecorder: {browserSupport.features.mediaRecorder ? '✅' : '❌'}</div>
                        <div>Web Audio API: {browserSupport.features.webAudio ? '✅' : '❌'}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="enhanced-audio-recording space-y-6">
            {/* Header with diagnostics toggle */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">🎤 Audio Recording</h2>
                <button
                    onClick={() => setShowDiagnosticsPanel(!showDiagnosticsPanel)}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    {showDiagnosticsPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{showDiagnosticsPanel ? 'Hide' : 'Show'} Diagnostics</span>
                </button>
            </div>

            {/* Audio Level Indicator */}
            {(isRecording || audioLevel > 0) && (
                <AudioLevelIndicator level={audioLevel} isRecording={isRecording} />
            )}

            {/* Recording Controls */}
            <div className="flex justify-center">
                {!isRecording ? (
                    <button
                        onClick={handleStartRecording}
                        disabled={isProcessing}
                        className={`flex items-center space-x-3 px-8 py-4 rounded-lg font-semibold transition-all ${
                            isProcessing
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                                <span>Initializing...</span>
                            </>
                        ) : (
                            <>
                                <Mic className="h-6 w-6" />
                                <span>Start Recording</span>
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleStopRecording}
                        disabled={isProcessing}
                        className={`flex items-center space-x-3 px-8 py-4 rounded-lg font-semibold transition-all ${
                            isProcessing
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl animate-pulse'
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Square className="h-6 w-6" />
                                <span>Stop Recording</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <span className="text-red-600 text-2xl flex-shrink-0">⚠️</span>
                        <div className="flex-1">
                            <h4 className="font-semibold text-red-800 mb-2">Recording Error</h4>
                            <div className="text-red-700 whitespace-pre-line text-sm leading-relaxed">
                                {error}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {!error && !isRecording && diagnostics && diagnostics.totalBytesRecorded > 0 && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <span className="text-green-600 text-2xl">✅</span>
                        <div>
                            <h4 className="font-semibold text-green-800">Recording Successful!</h4>
                            <p className="text-green-700 text-sm">
                                Recorded {(diagnostics.totalBytesRecorded / 1024).toFixed(2)} KB 
                                in {diagnostics.recordingDuration.toFixed(1)} seconds
                                ({diagnostics.chunksCollected} chunks)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Diagnostic Panel */}
            {diagnostics && (
                <DiagnosticPanel info={diagnostics} isVisible={showDiagnosticsPanel} />
            )}

            {/* Recording Tips */}
            {!isRecording && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <span className="text-blue-600 text-xl flex-shrink-0">💡</span>
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-2">Recording Tips</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• <strong>Position:</strong> Hold microphone 6-12 inches from your mouth</li>
                                <li>• <strong>Environment:</strong> Record in a quiet room to reduce background noise</li>
                                <li>• <strong>Speech:</strong> Speak clearly at normal pace (150-180 words/minute)</li>
                                <li>• <strong>Volume:</strong> Watch the audio level bars - they should move when you speak</li>
                                <li>• <strong>Duration:</strong> Keep recordings under 2 minutes for best results</li>
                                <li>• <strong>Troubleshooting:</strong> If bars don't move, check microphone permissions</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedAudioRecording;
