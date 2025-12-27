import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { Download, Trash2, Clock } from 'lucide-react';

const ContinuousTranscriptView: React.FC = () => {
  const { state, dispatch } = useTranslation();
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new segments are added
  useEffect(() => {
    if (state.continuousRecording.isRecording) {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.continuousRecording.segments.length, state.continuousRecording.isRecording]);

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExportTranscript = () => {
    const { segments, sessionStartTime } = state.continuousRecording;

    if (segments.length === 0) {
      alert('No transcript to export');
      return;
    }

    // Create formatted transcript text
    let transcriptText = '# Conversation Transcript\n\n';
    transcriptText += `Session Start: ${sessionStartTime ? formatTime(sessionStartTime) : 'N/A'}\n`;
    transcriptText += `Total Segments: ${segments.length}\n\n`;
    transcriptText += '---\n\n';

    segments.forEach((segment, index) => {
      transcriptText += `[${formatTime(segment.timestamp)}] ${segment.speaker.label}:\n`;
      transcriptText += `${segment.text}\n\n`;
    });

    // Create downloadable file
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearSession = () => {
    if (state.continuousRecording.isRecording) {
      alert('Please stop recording before clearing the session');
      return;
    }

    if (state.continuousRecording.segments.length > 0) {
      const confirmed = window.confirm('Are you sure you want to clear this session? This cannot be undone.');
      if (!confirmed) return;
    }

    dispatch({ type: 'CLEAR_CONTINUOUS_SESSION' });
  };

  if (!state.continuousRecording.isEnabled) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          Live Transcript
        </label>

        <div className="flex items-center space-x-2">
          {/* Duration indicator */}
          {state.continuousRecording.isRecording && (
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(state.continuousRecording.totalDuration)}</span>
            </div>
          )}

          {/* Export button */}
          <button
            onClick={handleExportTranscript}
            disabled={state.continuousRecording.segments.length === 0}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export transcript"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Clear button */}
          <button
            onClick={handleClearSession}
            disabled={state.continuousRecording.isRecording}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear session"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Transcript display */}
      <div className="border-2 border-gray-200 rounded-lg bg-white">
        {/* Transcript content */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {state.continuousRecording.segments.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              {state.continuousRecording.isRecording ? (
                <p>Listening... speak to start transcribing</p>
              ) : (
                <p>No transcript yet. Start recording to begin.</p>
              )}
            </div>
          ) : (
            <>
              {state.continuousRecording.segments.map((segment) => (
                <div key={segment.id} className="flex space-x-3">
                  {/* Speaker color indicator */}
                  <div
                    className="w-1 flex-shrink-0 rounded"
                    style={{ backgroundColor: segment.speaker.color }}
                  />

                  {/* Segment content */}
                  <div className="flex-1 min-w-0">
                    {/* Speaker name and timestamp */}
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: segment.speaker.color }}
                      >
                        {segment.speaker.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(segment.timestamp)}
                      </span>
                    </div>

                    {/* Transcribed text */}
                    <p className="text-sm text-gray-700 break-words">
                      {segment.text}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </>
          )}
        </div>

        {/* Recording status bar */}
        {state.continuousRecording.isRecording && (
          <div className="border-t-2 border-gray-200 px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-gray-600 font-medium">
                  {state.continuousRecording.isPaused ? 'Paused' : 'Recording'}
                </span>
              </div>
              <span className="text-gray-500">
                {state.continuousRecording.segments.length} segment{state.continuousRecording.segments.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Session info */}
      {state.continuousRecording.sessionStartTime && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          Session started at {formatTime(state.continuousRecording.sessionStartTime)}
        </p>
      )}
    </div>
  );
};

export default ContinuousTranscriptView;
