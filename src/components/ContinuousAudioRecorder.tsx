import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { TranscriptSegment } from '../types';
import { Mic, Square, Pause, Play, UserPlus } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CHUNK_DURATION_MS = 30000; // 30 seconds

const ContinuousAudioRecorder: React.FC = () => {
  const { state, dispatch } = useTranslation();
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingChunk, setIsProcessingChunk] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { continuousRecording } = state;

  // Cleanup function
  const cleanup = () => {
    if (chunkTimerRef.current) {
      clearInterval(chunkTimerRef.current);
      chunkTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setAudioLevel(0);
  };

  // Audio level monitoring
  const startAudioLevelMonitoring = (stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);

    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(Math.min(100, (average / 256) * 100));

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  // Process and transcribe audio chunk
  const processAudioChunk = async (audioBlob: Blob) => {
    if (!continuousRecording.currentSpeaker) {
      console.warn('No current speaker selected');
      return;
    }

    setIsProcessingChunk(true);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('language', state.sourceLanguage);

      // Send to API for transcription
      const response = await axios.post(`${API_URL}/api/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, // Send cookies for authentication
      });

      const transcription = response.data.transcription;

      if (transcription && transcription.trim()) {
        // Create new transcript segment
        const segment: TranscriptSegment = {
          id: `segment-${Date.now()}`,
          speaker: continuousRecording.currentSpeaker,
          text: transcription,
          timestamp: new Date(),
        };

        // Add to state
        dispatch({ type: 'ADD_TRANSCRIPT_SEGMENT', payload: segment });
      }
    } catch (err: any) {
      console.error('Error processing audio chunk:', err);
      setError('Failed to transcribe audio chunk');
    } finally {
      setIsProcessingChunk(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    if (continuousRecording.speakers.length === 0) {
      setError('Please add at least one speaker before recording');
      return;
    }

    if (!continuousRecording.currentSpeaker) {
      setError('Please select a speaker before recording');
      return;
    }

    try {
      setError(null);

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Start audio level monitoring
      startAudioLevelMonitoring(stream);

      // Create media recorder
      const options = { mimeType: 'audio/webm' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording
      mediaRecorderRef.current.start();
      dispatch({ type: 'START_CONTINUOUS_RECORDING' });

      // Process chunks every CHUNK_DURATION_MS
      chunkTimerRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          // Stop and restart to get chunk
          mediaRecorderRef.current.stop();

          // Process the chunk
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size > 0) {
            processAudioChunk(audioBlob);
          }

          // Clear chunks and restart
          audioChunksRef.current = [];
          mediaRecorderRef.current.start();
        }
      }, CHUNK_DURATION_MS);

      // Update duration every second
      durationTimerRef.current = setInterval(() => {
        dispatch({
          type: 'UPDATE_CONTINUOUS_DURATION',
          payload: continuousRecording.totalDuration + 1
        });
      }, 1000);

    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone. Please check permissions.');
      cleanup();
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();

      // Process final chunk
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          processAudioChunk(audioBlob);
        }
      }
    }

    cleanup();
    dispatch({ type: 'STOP_CONTINUOUS_RECORDING' });
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      dispatch({ type: 'PAUSE_CONTINUOUS_RECORDING' });
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      dispatch({ type: 'RESUME_CONTINUOUS_RECORDING' });
    }
  };

  // Switch to new speaker
  const handleNewSpeaker = () => {
    // Process current chunk before switching
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();

      // Process the chunk
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      if (audioBlob.size > 0) {
        processAudioChunk(audioBlob);
      }

      // Clear chunks and restart
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
    }

    // Auto-select next speaker or create new one
    const currentIndex = continuousRecording.speakers.findIndex(
      s => s.id === continuousRecording.currentSpeaker?.id
    );
    const nextSpeaker = continuousRecording.speakers[currentIndex + 1];

    if (nextSpeaker) {
      dispatch({ type: 'SET_CURRENT_SPEAKER', payload: nextSpeaker });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  if (!continuousRecording.isEnabled) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Recording controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!continuousRecording.isRecording ? (
          <button
            onClick={startRecording}
            disabled={continuousRecording.speakers.length === 0 || !continuousRecording.currentSpeaker}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic className="h-5 w-5" />
            <span className="font-medium">Start Recording</span>
          </button>
        ) : (
          <>
            <button
              onClick={stopRecording}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Square className="h-5 w-5" />
              <span className="font-medium">Stop</span>
            </button>

            {!continuousRecording.isPaused ? (
              <button
                onClick={pauseRecording}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Pause className="h-5 w-5" />
                <span className="font-medium">Pause</span>
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="h-5 w-5" />
                <span className="font-medium">Resume</span>
              </button>
            )}

            <button
              onClick={handleNewSpeaker}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              <span className="font-medium">New Speaker</span>
            </button>
          </>
        )}
      </div>

      {/* Audio level indicator */}
      {continuousRecording.isRecording && (
        <div className="mt-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs text-gray-600">Audio Level:</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessingChunk && (
        <div className="mt-2 text-sm text-blue-600 text-center">
          Processing audio chunk...
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default ContinuousAudioRecorder;
