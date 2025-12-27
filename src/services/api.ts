import axios from 'axios';
import { TranscriptionResponse, TranslationResponse, SynthesisResponse, Voice } from '../types';
import { sanitizeInput } from '../utils/contentFilter';
import { apiClient } from './apiClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for first Hugging Face model loading
  headers: {
    'Content-Type': 'application/json',
  },
  // SECURITY: Send HttpOnly cookies with requests
  withCredentials: true,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      throw new Error(data.message || `Server error: ${status}`);
    } else if (error.request) {
      // Request was made but no response received
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. If this is your first request, the model is loading (30-60 seconds). Please try again.');
      }
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Make sure backend is running and accessible.`);
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Call counter for tracking duplicate calls
let transcriptionCallCount = 0;

// Transcription API
export const transcribeAudio = async (audioFile: File, language?: string): Promise<TranscriptionResponse> => {
  const callId = ++transcriptionCallCount;
  const startTime = Date.now();
  
  console.log(`📤 [CALL #${callId}] Transcription request starting`);
  console.log('🎤 [FRONTEND] Starting transcription...');
  console.log(`   - File: ${audioFile.name} (${audioFile.size} bytes)`);
  console.log(`   - Language: ${language || 'auto'}`);
  
  // Log call stack to see where this is being called from
  if (transcriptionCallCount > 1) {
    console.warn(`⚠️ WARNING: Multiple transcription calls detected (Call #${callId})`);
    console.trace('📍 Call stack:');
  }

  const formData = new FormData();
  formData.append('audio', audioFile);
  if (language) {
    formData.append('language', language);
  }

  try {
    // Use regular api for transcription (no auth required for free NLLB model)
    const response = await api.post('/api/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [CALL #${callId}] Transcription completed in ${duration}ms`);
    console.log(`   - Result: ${response.data.transcription?.substring(0, 50)}...`);

    return response.data;
  } catch (error: any) {
    console.error(`❌ [CALL #${callId}] Transcription failed:`, error);

    // Handle quota exceeded error (429)
    if (error.response?.status === 429) {
      throw new Error(error.response.data?.message || 'Monthly translation limit exceeded. Please upgrade to Pro for unlimited translations.');
    }

    throw error;
  }
};

// Translation API with content filtering
export const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string,
  tone: string,
  userTier: 'free' | 'paid-uncensored' = 'free',
  provider: 'openai' | 'nllb' = 'openai'
): Promise<TranslationResponse> => {
  const startTime = Date.now();
  console.log('🔄 [FRONTEND] Starting translation with content filtering...');
  console.log(`   - Source: ${sourceLang} → Target: ${targetLang}`);
  console.log(`   - Provider: ${provider}`);
  console.log(`   - Tone: ${tone}`);
  console.log(`   - Text length: ${text.length} characters`);
  console.log(`   - User tier: ${userTier}`);

  // STEP 1: Sanitize input BEFORE sending to AI
  const filterResult = sanitizeInput(text, userTier);

  console.log(`   - Filter result: ${filterResult.wasFiltered ? 'FILTERED' : 'CLEAN'}`);
  if (filterResult.wasFiltered) {
    console.log(`   - Detected issues: ${filterResult.detectedIssues.join(', ')}`);
    console.log(`   - Severity: ${filterResult.severityLevel}`);
  }

  // STEP 2: Check if should block translation
  if (filterResult.shouldBlock) {
    console.error('❌ [FRONTEND] Translation blocked due to severe content violations');
    throw new Error('Content contains severe violations and cannot be translated. Please revise your input.');
  }

  // STEP 3: Use filtered text for translation
  const textToTranslate = filterResult.filteredText;

  try {
    // Use regular api for NLLB (no auth required), apiClient for OpenAI (auth required)
    let response;
    if (provider === 'nllb') {
      response = await api.post('/api/translate', {
        text: textToTranslate,
        sourceLang,
        targetLang,
        tone,
        provider,
      });
    } else {
      response = await apiClient.post('/api/translate', {
        text: textToTranslate,
        sourceLang,
        targetLang,
        tone,
        provider,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [FRONTEND] Translation completed in ${duration}ms`);
    console.log(`   - Result: ${response.data.translation?.substring(0, 50)}...`);

    // STEP 4: Return enhanced response with filter information
    return {
      ...response.data,
      wasFiltered: filterResult.wasFiltered,
      detectedIssues: filterResult.detectedIssues,
      severityLevel: filterResult.severityLevel,
      originalText: text,
      filteredText: textToTranslate
    };
  } catch (error: any) {
    // Handle authentication error (401)
    if (error.response?.status === 401) {
      throw new Error('Please sign in to use this feature. Sign up for free to get 15 translations per month.');
    }

    // Handle quota exceeded error (429)
    if (error.response?.status === 429) {
      throw new Error(error.response.data?.message || 'Monthly translation limit exceeded. Please upgrade to Pro for unlimited translations.');
    }

    // Handle content policy errors that might still occur
    if (error.message?.includes('content policy') || error.message?.includes('policy violation')) {
      console.error('❌ [FRONTEND] Content policy error despite filtering:', error.message);
      throw new Error('Unable to translate: content requires additional review. Please try rephrasing your input.');
    }
    throw error;
  }
};

// Synthesis API
export const synthesizeSpeech = async (
  text: string,
  voiceId: string,
  language: string
): Promise<SynthesisResponse> => {
  const startTime = Date.now();
  console.log('🔊 [FRONTEND] Starting synthesis...');
  console.log(`   - Text length: ${text.length} characters`);
  console.log(`   - Voice ID: ${voiceId}`);
  console.log(`   - Language: ${language}`);

  const response = await apiClient.post('/api/synthesize', {
    text,
    voiceId,
    language,
  });

  const duration = Date.now() - startTime;
  console.log(`✅ [FRONTEND] Synthesis completed in ${duration}ms`);
  console.log(`   - Audio size: ${response.data.characterCount} characters processed`);

  return response.data;
};

// Get available voices
export const getVoices = async (): Promise<Voice[]> => {
  const response = await api.get('/api/voices');
  return response.data.voices;
};

// Get voices by language
export const getVoicesByLanguage = async (language: string): Promise<Voice[]> => {
  const response = await api.get(`/api/voices/${language}`);
  return response.data.voices;
};

// Get available tones
export const getTones = async () => {
  const response = await api.get('/api/translate/tones');
  return response.data.tones;
};

// Get available languages
export const getLanguages = async () => {
  const response = await api.get('/api/translate/languages');
  return response.data.languages;
};

// Health check
export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;
