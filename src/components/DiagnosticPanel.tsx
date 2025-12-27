import React from 'react';
import { DiagnosticInfo } from '../services/audioRecorderFixed';

interface DiagnosticPanelProps {
    info: DiagnosticInfo;
    isVisible?: boolean;
}

const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ info, isVisible = true }) => {
    if (!isVisible) return null;

    const getStatusIcon = (condition: boolean) => condition ? '✅' : '❌';
    const getStatusColor = (condition: boolean) => condition ? 'text-green-600' : 'text-red-600';

    return (
        <div className="diagnostic-panel p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-xs border border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">🔍</span>
                <span className="font-bold text-white">Recording Diagnostics</span>
                <div className="flex-1"></div>
                <div className="text-xs text-gray-400">
                    {new Date().toLocaleTimeString()}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column - Core Status */}
                <div className="space-y-2">
                    <div className="text-gray-300 font-semibold mb-2">Core Status</div>
                    
                    <div className={`flex items-center justify-between ${getStatusColor(info.microphonePermission === 'granted')}`}>
                        <span>Microphone Permission:</span>
                        <span className="flex items-center space-x-1">
                            <span>{getStatusIcon(info.microphonePermission === 'granted')}</span>
                            <span>{info.microphonePermission}</span>
                        </span>
                    </div>
                    
                    <div className={`flex items-center justify-between ${getStatusColor(info.mediaRecorderState === 'recording')}`}>
                        <span>MediaRecorder State:</span>
                        <span className="flex items-center space-x-1">
                            <span>{getStatusIcon(info.mediaRecorderState === 'recording')}</span>
                            <span>{info.mediaRecorderState}</span>
                        </span>
                    </div>
                    
                    <div className={`flex items-center justify-between ${getStatusColor(info.audioTracksCount > 0)}`}>
                        <span>Audio Tracks:</span>
                        <span className="flex items-center space-x-1">
                            <span>{getStatusIcon(info.audioTracksCount > 0)}</span>
                            <span>{info.audioTracksCount}</span>
                        </span>
                    </div>
                    
                    <div className={`flex items-center justify-between ${getStatusColor(info.streamActive)}`}>
                        <span>Stream Active:</span>
                        <span className="flex items-center space-x-1">
                            <span>{getStatusIcon(info.streamActive)}</span>
                            <span>{info.streamActive ? 'Yes' : 'No'}</span>
                        </span>
                    </div>
                </div>

                {/* Right Column - Recording Data */}
                <div className="space-y-2">
                    <div className="text-gray-300 font-semibold mb-2">Recording Data</div>
                    
                    <div className={`flex items-center justify-between ${getStatusColor(info.chunksCollected > 0)}`}>
                        <span>Chunks Collected:</span>
                        <span className="flex items-center space-x-1">
                            <span>{getStatusIcon(info.chunksCollected > 0)}</span>
                            <span>{info.chunksCollected}</span>
                        </span>
                    </div>
                    
                    <div className={`flex items-center justify-between ${getStatusColor(info.totalBytesRecorded > 0)}`}>
                        <span>Data Recorded:</span>
                        <span className="flex items-center space-x-1">
                            <span>{getStatusIcon(info.totalBytesRecorded > 0)}</span>
                            <span>{(info.totalBytesRecorded / 1024).toFixed(2)} KB</span>
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-blue-400">
                        <span>Recording Duration:</span>
                        <span>{info.recordingDuration.toFixed(1)}s</span>
                    </div>
                    
                    <div className={`flex items-center justify-between ${getStatusColor(info.currentAudioLevel > 0)}`}>
                        <span>Audio Level:</span>
                        <span className="flex items-center space-x-1">
                            <span>{getStatusIcon(info.currentAudioLevel > 0)}</span>
                            <span>{info.currentAudioLevel.toFixed(0)}%</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Supported MIME Types */}
            <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="text-gray-300 font-semibold mb-2">Supported Audio Formats</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {info.supportedMimeTypes.length > 0 ? (
                        info.supportedMimeTypes.map(type => (
                            <div key={type} className="text-green-400 text-xs">
                                ✓ {type}
                            </div>
                        ))
                    ) : (
                        <div className="text-red-400 text-xs">
                            ❌ No supported MIME types found
                        </div>
                    )}
                </div>
            </div>

            {/* Health Status Summary */}
            <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="text-gray-300 font-semibold mb-2">Health Status</div>
                <div className="flex items-center space-x-4">
                    {/* Overall Health Indicator */}
                    {(() => {
                        const isHealthy = info.microphonePermission === 'granted' && 
                                        info.mediaRecorderState === 'recording' && 
                                        info.audioTracksCount > 0 && 
                                        info.streamActive;
                        
                        const isRecordingData = info.chunksCollected > 0 && info.totalBytesRecorded > 0;
                        const hasAudio = info.currentAudioLevel > 0;

                        if (isHealthy && isRecordingData && hasAudio) {
                            return (
                                <div className="flex items-center space-x-2 text-green-400">
                                    <span className="text-lg">🟢</span>
                                    <span className="font-semibold">All Systems Operational</span>
                                </div>
                            );
                        } else if (isHealthy && isRecordingData) {
                            return (
                                <div className="flex items-center space-x-2 text-yellow-400">
                                    <span className="text-lg">🟡</span>
                                    <span className="font-semibold">Recording but No Audio Signal</span>
                                </div>
                            );
                        } else if (isHealthy) {
                            return (
                                <div className="flex items-center space-x-2 text-orange-400">
                                    <span className="text-lg">🟠</span>
                                    <span className="font-semibold">Ready but No Data Yet</span>
                                </div>
                            );
                        } else {
                            return (
                                <div className="flex items-center space-x-2 text-red-400">
                                    <span className="text-lg">🔴</span>
                                    <span className="font-semibold">System Issues Detected</span>
                                </div>
                            );
                        }
                    })()}
                </div>
            </div>

            {/* Troubleshooting Hints */}
            {(() => {
                const issues = [];
                
                if (info.microphonePermission !== 'granted') {
                    issues.push('Grant microphone permission in browser');
                }
                if (info.audioTracksCount === 0) {
                    issues.push('No audio input device detected');
                }
                if (!info.streamActive) {
                    issues.push('Audio stream is not active');
                }
                if (info.mediaRecorderState !== 'recording' && info.mediaRecorderState !== 'inactive') {
                    issues.push('MediaRecorder in unexpected state');
                }
                if (info.chunksCollected === 0 && info.recordingDuration > 2) {
                    issues.push('No audio data being captured');
                }
                if (info.currentAudioLevel === 0 && info.recordingDuration > 1) {
                    issues.push('No audio signal detected - check microphone');
                }

                if (issues.length > 0) {
                    return (
                        <div className="mt-4 pt-3 border-t border-gray-700">
                            <div className="text-red-300 font-semibold mb-2">⚠️ Issues Detected</div>
                            <div className="space-y-1">
                                {issues.map((issue, index) => (
                                    <div key={index} className="text-red-400 text-xs">
                                        • {issue}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }
                return null;
            })()}
        </div>
    );
};

export default DiagnosticPanel;
