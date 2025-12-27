import React from 'react';
import { RecordingState } from '../services/chunkedAudioRecorder';

interface RecordingIndicatorProps {
    state: RecordingState;
}

const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({ state }) => {
    const { isRecording, duration, warning, chunksProcessed, speechRate, wordsPerMinute } = state;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressColor = () => {
        if (duration > 90) return 'bg-red-500';
        if (duration > 60) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getSpeechRateIndicator = () => {
        switch (speechRate) {
            case 'too-fast':
                return {
                    color: 'text-red-600 bg-red-100 border-red-300',
                    icon: '🔴',
                    message: 'SLOW DOWN - Speaking too fast!',
                    animate: 'animate-pulse'
                };
            case 'fast':
                return {
                    color: 'text-orange-600 bg-orange-100 border-orange-300',
                    icon: '🟠',
                    message: 'Please slow down a bit',
                    animate: 'animate-bounce'
                };
            case 'normal':
                return {
                    color: 'text-green-600 bg-green-100 border-green-300',
                    icon: '🟢',
                    message: 'Perfect pace - keep going!',
                    animate: ''
                };
            case 'slow':
                return {
                    color: 'text-blue-600 bg-blue-100 border-blue-300',
                    icon: '🔵',
                    message: 'Good - clear and steady',
                    animate: ''
                };
        }
    };

    const rateInfo = getSpeechRateIndicator();

    if (!isRecording) {
        return null;
    }

    return (
        <div className="recording-indicator p-6 rounded-lg bg-white shadow-lg border-2 border-gray-200">
            {/* Recording pulse animation */}
            <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                    <div className={`w-4 h-4 ${getProgressColor()} rounded-full animate-pulse`} />
                    <div className={`absolute inset-0 ${getProgressColor()} rounded-full animate-ping opacity-75`} />
                </div>
                <span className="text-lg font-semibold">Recording</span>
            </div>

            {/* Speech Rate Indicator - PROMINENT DISPLAY */}
            <div className={`mb-4 p-4 rounded-lg border-2 ${rateInfo.color} ${rateInfo.animate} transition-all`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="text-3xl">{rateInfo.icon}</span>
                        <div>
                            <div className="font-bold text-lg">{rateInfo.message}</div>
                            <div className="text-sm opacity-75">{wordsPerMinute} words/min</div>
                        </div>
                    </div>
                    
                    {/* Visual speech meter */}
                    <div className="flex flex-col items-end">
                        <div className="text-xs mb-1">Speech Rate</div>
                        <div className="flex space-x-1">
                            <div className={`w-2 h-8 rounded ${speechRate !== 'slow' ? 'bg-green-400' : 'bg-gray-300'}`} />
                            <div className={`w-2 h-8 rounded ${speechRate === 'normal' ? 'bg-green-400' : 'bg-gray-300'}`} />
                            <div className={`w-2 h-8 rounded ${speechRate === 'fast' ? 'bg-orange-400' : 'bg-gray-300'}`} />
                            <div className={`w-2 h-8 rounded ${speechRate === 'too-fast' ? 'bg-red-400' : 'bg-gray-300'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Duration display */}
            <div className="text-4xl font-mono mb-3 text-center">
                {formatDuration(duration)}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                    className={`h-3 rounded-full transition-all ${getProgressColor()}`}
                    style={{ width: `${(duration / 120) * 100}%` }}
                />
            </div>

            {/* Chunks info */}
            {chunksProcessed > 0 && (
                <div className="text-sm text-gray-600 mb-3 text-center">
                    Processing in chunks: {chunksProcessed} segments
                </div>
            )}

            {/* Warning message */}
            {warning && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                    <div className="flex items-start">
                        <span className="text-yellow-600 mr-2">⚠️</span>
                        <div className="text-sm text-yellow-800">{warning}</div>
                    </div>
                </div>
            )}

            {/* Enhanced tips with speech rate guidance */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="text-xs font-semibold text-blue-900 mb-2">📖 Speech Tips:</div>
                <ul className="text-xs text-blue-800 space-y-1">
                    <li>• <strong>Normal pace:</strong> 150-180 words/minute 🟢</li>
                    <li>• <strong>Pause</strong> between sentences for clarity</li>
                    <li>• <strong>Enunciate</strong> clearly, especially with names</li>
                    <li>• Watch the speech meter above to maintain optimal speed</li>
                </ul>
            </div>
        </div>
    );
};

export default RecordingIndicator;
