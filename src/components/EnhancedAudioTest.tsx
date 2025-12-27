import React, { useState, useRef } from 'react';
import { 
  ChunkedAudioRecorder, 
  RecordingTimer, 
  RecordingState,
  getOptimizedAudioStream 
} from '../services/chunkedAudioRecorder';
import { processChunkedAudio } from '../services/audioProcessing';
import RecordingIndicator from './RecordingIndicator';
import { Mic, Square } from 'lucide-react';

/**
 * Test component for the enhanced audio recording system
 * This can be used to validate the new chunked recording and speech rate detection
 */
const EnhancedAudioTest: React.FC = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    volume: 0,
    speechRate: 'normal',
    chunksProcessed: 0,
    warning: null,
    wordsPerMinute: 0,
  });
  
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const chunkedRecorderRef = useRef<ChunkedAudioRecorder>(new ChunkedAudioRecorder());
  const recordingTimerRef = useRef<RecordingTimer>(new RecordingTimer());
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      setError('');
      setResult('');
      
      // Get optimized audio stream
      const stream = await getOptimizedAudioStream();
      streamRef.current = stream;
      
      // Start chunked recording with speech rate detection
      chunkedRecorderRef.current.startRecording(
        stream,
        (rate, wpm) => {
          setRecordingState(prev => ({
            ...prev,
            speechRate: rate,
            wordsPerMinute: wpm,
          }));
        }
      );
      
      // Start recording timer
      recordingTimerRef.current.start(
        (timeLeft) => {
          setRecordingState(prev => ({
            ...prev,
            warning: `Recording will auto-stop in ${Math.ceil(timeLeft / 1000)}s`,
          }));
        },
        () => {
          stopRecording();
          setError('Maximum recording duration reached (2 minutes).');
        }
      );

      // Update duration every second
      durationIntervalRef.current = setInterval(() => {
        const duration = recordingTimerRef.current.getElapsedSeconds();
        setRecordingState(prev => ({ ...prev, duration }));
      }, 1000);

      // Update state
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0,
        warning: null,
      }));

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    if (!recordingState.isRecording) return;
    
    // Stop the chunked recorder and get all chunks
    const audioChunks = chunkedRecorderRef.current.stopRecording();
    recordingTimerRef.current.stop();
    
    // Clean up intervals
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    // Clean up stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Update recording state
    setRecordingState(prev => ({
      ...prev,
      isRecording: false,
      chunksProcessed: audioChunks.length,
    }));
    
    // Process the audio chunks
    if (audioChunks.length > 0) {
      setProcessing(true);
      try {
        const processResult = await processChunkedAudio(
          audioChunks,
          'en', // Source language
          'ht', // Target language (Haitian Creole)
          'casual', // Tone
          (progress, stage) => {
            console.log(`Processing: ${progress}% - ${stage}`);
          }
        );
        
        setResult(`
✅ Processing Complete!
📝 Transcription: ${processResult.transcription}
🔄 Translation: ${processResult.translation}
📦 Chunks processed: ${processResult.chunks.length}
        `);
        
      } catch (error) {
        console.error('Processing failed:', error);
        setError(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setProcessing(false);
      }
    } else {
      setError('No audio chunks recorded');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">🎤 Enhanced Audio Recording Test</h2>
      
      {/* Recording Indicator */}
      <RecordingIndicator state={recordingState} />
      
      {/* Controls */}
      <div className="flex justify-center space-x-4 my-6">
        {!recordingState.isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            disabled={processing}
          >
            <Mic className="h-5 w-5" />
            <span>Start Test Recording</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
          >
            <Square className="h-5 w-5" />
            <span>Stop & Process</span>
          </button>
        )}
      </div>
      
      {/* Processing State */}
      {processing && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Processing audio chunks...</p>
        </div>
      )}
      
      {/* Results */}
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Test Results:</h3>
          <pre className="text-sm text-green-700 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
      
      {/* Errors */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click "Start Test Recording" to begin</li>
          <li>• Try speaking at different speeds to test speech rate detection</li>
          <li>• The system will show real-time feedback on your speech rate</li>
          <li>• Recording automatically chunks every 30 seconds</li>
          <li>• Maximum recording time is 2 minutes</li>
          <li>• Click "Stop & Process" to transcribe and translate</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedAudioTest;
