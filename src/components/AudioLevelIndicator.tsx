import React from 'react';

interface AudioLevelIndicatorProps {
    level: number;
    isRecording?: boolean;
}

const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({ 
    level, 
    isRecording = false 
}) => {
    const barCount = 10;
    const activeBars = Math.ceil((level / 100) * barCount);
    
    // Color coding based on level
    const getBarColor = (index: number) => {
        if (index >= activeBars) return 'bg-gray-300';
        
        if (index < 3) return 'bg-green-500';      // Low levels - green
        if (index < 7) return 'bg-yellow-500';    // Medium levels - yellow  
        return 'bg-red-500';                      // High levels - red
    };

    const getLevelStatus = () => {
        if (level === 0) return { text: 'No audio detected', color: 'text-red-600', icon: '🔇' };
        if (level < 10) return { text: 'Very quiet', color: 'text-orange-600', icon: '🔉' };
        if (level < 30) return { text: 'Good level', color: 'text-green-600', icon: '🔊' };
        if (level < 70) return { text: 'Strong signal', color: 'text-blue-600', icon: '📢' };
        return { text: 'Very loud', color: 'text-purple-600', icon: '📯' };
    };

    const status = getLevelStatus();

    return (
        <div className="audio-level-indicator p-4 bg-gray-50 border border-gray-200 rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <span className="text-lg">🎤</span>
                    <span className="font-semibold text-gray-700">Audio Level</span>
                    {isRecording && (
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-red-600 font-medium">REC</span>
                        </div>
                    )}
                </div>
                <div className="text-sm text-gray-500">
                    {level.toFixed(0)}%
                </div>
            </div>

            {/* Level bars */}
            <div className="flex items-center space-x-1 mb-3">
                {Array.from({ length: barCount }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-4 h-8 rounded transition-all duration-100 ${getBarColor(i)}`}
                        style={{
                            transform: i < activeBars ? 'scaleY(1)' : 'scaleY(0.3)',
                        }}
                    />
                ))}
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 ${status.color}`}>
                    <span>{status.icon}</span>
                    <span className="text-sm font-medium">{status.text}</span>
                </div>
                
                {level === 0 && isRecording && (
                    <div className="text-xs text-red-600 animate-pulse">
                        Check microphone!
                    </div>
                )}
            </div>

            {/* Troubleshooting for no audio */}
            {level === 0 && isRecording && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-xs">
                    <div className="font-semibold text-red-800 mb-1">⚠️ No Audio Detected</div>
                    <div className="text-red-700 space-y-1">
                        <div>• Check microphone connection</div>
                        <div>• Speak closer to the microphone</div>
                        <div>• Check browser permissions</div>
                        <div>• Increase microphone volume</div>
                    </div>
                </div>
            )}

            {/* Tips for optimal recording */}
            {level > 0 && level < 20 && isRecording && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="font-semibold text-yellow-800 mb-1">💡 Tip</div>
                    <div className="text-yellow-700">
                        Audio level is low. Try speaking louder or moving closer to the microphone.
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioLevelIndicator;
