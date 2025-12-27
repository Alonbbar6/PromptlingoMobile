import React, { useEffect, useState } from 'react';
import { Volume2, AlertCircle, Info } from 'lucide-react';
import { getBrowserVoices, waitForVoices, isBrowserTTSAvailable } from '../services/browserTTS';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels?: {
    gender?: string;
    age?: string;
    accent?: string;
    description?: string;
    use_case?: string;
  };
}

interface FallbackVoice {
  id: string;
  name: string;
  gender: string;
  language: string;
  description?: string;
}

type Voice = ElevenLabsVoice | FallbackVoice;

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  language?: string;
}

const isElevenLabsVoice = (voice: Voice): voice is ElevenLabsVoice => {
  return 'voice_id' in voice;
};

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ 
  selectedVoice, 
  onVoiceChange,
  language = 'en'
}) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'elevenlabs' | 'browser' | 'fallback'>('fallback');

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch ElevenLabs voices first
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        try {
          const response = await fetch(`${API_BASE_URL}/api/voices/${language}`);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.voices && data.voices.length > 0 && data.source === 'elevenlabs') {
              console.log('✅ Using ElevenLabs voices');
              setVoices(data.voices.slice(0, 10)); // Limit to 10 voices
              setSource('elevenlabs');
              
              // Set default voice if none selected
              if (!selectedVoice && data.voices[0]) {
                const voiceId = isElevenLabsVoice(data.voices[0]) ? data.voices[0].voice_id : data.voices[0].id;
                onVoiceChange(voiceId);
              }
              setLoading(false);
              return;
            }
          }
        } catch (elevenLabsError) {
          console.warn('⚠️ ElevenLabs not available:', elevenLabsError);
        }
        
        // Fallback to browser TTS
        console.log('🔄 Falling back to browser TTS voices...');
        
        if (!isBrowserTTSAvailable()) {
          throw new Error('Browser does not support text-to-speech');
        }
        
        // Wait for browser voices to load
        await waitForVoices();
        
        const browserVoices = getBrowserVoices(language);
        
        if (browserVoices.length > 0) {
          console.log(`✅ Using ${browserVoices.length} browser voices`);
          setVoices(browserVoices);
          setSource('browser');
          
          // Set default voice if none selected
          if (!selectedVoice) {
            onVoiceChange(browserVoices[0].voice_id);
          }
        } else {
          throw new Error('No browser voices available for this language');
        }
        
      } catch (err) {
        console.error('Failed to load voices:', err);
        setError(err instanceof Error ? err.message : 'Failed to load voices');
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, [language, selectedVoice, onVoiceChange]);

  if (loading) {
    return (
      <div className="voice-selector">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Volume2 className="inline h-4 w-4 mr-1" />
          Voice Selection
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
          Loading voices...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="voice-selector">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Volume2 className="inline h-4 w-4 mr-1" />
          Voice Selection
        </label>
        <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="voice-selector">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Volume2 className="inline h-4 w-4 mr-1" />
        Voice Selection
        {source === 'elevenlabs' && (
          <span className="ml-2 text-xs text-green-600 font-normal">
            (ElevenLabs AI)
          </span>
        )}
        {source === 'browser' && (
          <span className="ml-2 text-xs text-blue-600 font-normal">
            (Browser TTS - Free)
          </span>
        )}
      </label>
      
      {source === 'browser' && (
        <div className="flex items-start gap-2 mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Using free browser voices</p>
            <p className="mt-0.5">Add an ElevenLabs API key for higher quality AI voices</p>
          </div>
        </div>
      )}
      
      <select
        value={selectedVoice}
        onChange={(e) => onVoiceChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
      >
        {voices.length === 0 && (
          <option value="">No voices available</option>
        )}
        {voices.map((voice) => {
          const voiceId = isElevenLabsVoice(voice) ? voice.voice_id : voice.id;
          const voiceName = voice.name;
          const gender = isElevenLabsVoice(voice) 
            ? voice.labels?.gender 
            : voice.gender;
          
          return (
            <option key={voiceId} value={voiceId}>
              {voiceName}
              {gender && ` (${gender})`}
            </option>
          );
        })}
      </select>
      
      {source === 'fallback' && (
        <p className="text-xs text-gray-500 mt-1">
          Configure ELEVENLABS_API_KEY for AI voice options
        </p>
      )}
    </div>
  );
};

export default VoiceSelector;
