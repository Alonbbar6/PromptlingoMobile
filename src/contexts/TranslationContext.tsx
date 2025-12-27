import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, TranslationHistoryItem, Language, Tone, Speaker, TranscriptSegment } from '../types';
import { useAuth } from './AuthContext';
import secureStorage from '../utils/secureStorage';

// Privacy Settings
const HISTORY_EXPIRATION_DAYS = 30; // Auto-delete history older than 30 days
const MAX_HISTORY_ITEMS = 50; // Maximum items to keep

// Helper functions for user-specific encrypted storage
const getHistoryKey = (userId: string | undefined): string => {
  return userId ? `translationHistory_${userId}` : 'translationHistory_guest';
};

const getUserId = (userId: string | undefined): string => {
  return userId || 'guest-user';
};

/**
 * Filter out expired history items
 */
const filterExpiredHistory = (history: TranslationHistoryItem[]): TranslationHistoryItem[] => {
  const now = Date.now();
  const expirationMs = HISTORY_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

  return history.filter(item => {
    const itemDate = new Date(item.timestamp).getTime();
    const age = now - itemDate;
    return age < expirationMs;
  });
};

/**
 * Load history from encrypted storage
 */
const loadHistoryFromStorage = async (userId: string | undefined): Promise<TranslationHistoryItem[]> => {
  try {
    const key = getHistoryKey(userId);
    const userIdForKey = getUserId(userId);

    // Try to load from encrypted storage
    const savedHistory = await secureStorage.getItem<TranslationHistoryItem[]>(key, userIdForKey);

    if (savedHistory && Array.isArray(savedHistory)) {
      // Filter out expired items
      const validHistory = filterExpiredHistory(savedHistory);

      // If items were filtered out, save the cleaned history
      if (validHistory.length < savedHistory.length) {
        console.log(`🧹 Removed ${savedHistory.length - validHistory.length} expired history items`);
        await saveHistoryToStorage(validHistory, userId);
      }

      return validHistory;
    }
  } catch (error) {
    console.error('Failed to load translation history:', error);
  }
  return [];
};

/**
 * Save history to encrypted storage
 */
const saveHistoryToStorage = async (history: TranslationHistoryItem[], userId: string | undefined): Promise<void> => {
  try {
    const key = getHistoryKey(userId);
    const userIdForKey = getUserId(userId);

    // Filter expired items before saving
    const validHistory = filterExpiredHistory(history);

    // Save to encrypted storage
    await secureStorage.setItem(key, validHistory, userIdForKey);
  } catch (error) {
    console.error('Failed to save translation history:', error);
  }
};

// Initial state
const initialState: AppState = {
  sourceLanguage: 'ht', // Default to Haitian Creole as source
  targetLanguage: 'en', // Default to English as target
  translationDirection: 'to-english', // Default to translating TO English
  selectedTone: 'casual',
  translationProvider: 'openai', // Default to OpenAI (NLLB temporarily disabled)
  audioRecorder: {
    isRecording: false,
    isPaused: false,
    duration: 0,
  },
  continuousRecording: {
    isEnabled: false,
    isRecording: false,
    isPaused: false,
    currentSpeaker: null,
    speakers: [],
    segments: [],
    sessionStartTime: null,
    totalDuration: 0,
  },
  audioPlayer: {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
  },
  isTranslating: false,
  translationHistory: [],
  autoPlay: true,
  showHistory: false,
};

// Action types
type Action =
  | { type: 'SET_SOURCE_LANGUAGE'; payload: string }
  | { type: 'SET_TARGET_LANGUAGE'; payload: string }
  | { type: 'SET_TRANSLATION_DIRECTION'; payload: 'to-english' | 'from-english' }
  | { type: 'SWAP_LANGUAGES' }
  | { type: 'SET_TONE'; payload: string }
  | { type: 'SET_TRANSLATION_PROVIDER'; payload: 'openai' | 'nllb' }
  | { type: 'SET_TRANSLATION_DIRECTION'; payload: 'to-english' | 'from-english' }
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING'; payload: { audioBlob: Blob; audioUrl: string } }
  | { type: 'PAUSE_RECORDING' }
  | { type: 'RESUME_RECORDING' }
  | { type: 'UPDATE_RECORDING_DURATION'; payload: number }
  | { type: 'START_TRANSLATION' }
  | { type: 'SET_TRANSLATION'; payload: TranslationHistoryItem }
  | { type: 'SET_TRANSLATION_ERROR'; payload: string }
  | { type: 'CLEAR_TRANSLATION_ERROR' }
  | { type: 'ADD_TO_HISTORY'; payload: { item: TranslationHistoryItem; userId?: string } }
  | { type: 'CLEAR_HISTORY'; payload: { userId?: string } }
  | { type: 'TOGGLE_AUTO_PLAY' }
  | { type: 'TOGGLE_HISTORY' }
  | { type: 'SET_AUDIO_PLAYER_STATE'; payload: Partial<AppState['audioPlayer']> }
  | { type: 'LOAD_HISTORY_FROM_STORAGE'; payload: TranslationHistoryItem[] }
  | { type: 'TOGGLE_CONTINUOUS_MODE' }
  | { type: 'START_CONTINUOUS_RECORDING' }
  | { type: 'STOP_CONTINUOUS_RECORDING' }
  | { type: 'PAUSE_CONTINUOUS_RECORDING' }
  | { type: 'RESUME_CONTINUOUS_RECORDING' }
  | { type: 'ADD_SPEAKER'; payload: Speaker }
  | { type: 'SET_CURRENT_SPEAKER'; payload: Speaker }
  | { type: 'RENAME_SPEAKER'; payload: { speakerId: string; newLabel: string } }
  | { type: 'ADD_TRANSCRIPT_SEGMENT'; payload: TranscriptSegment }
  | { type: 'UPDATE_CONTINUOUS_DURATION'; payload: number }
  | { type: 'CLEAR_CONTINUOUS_SESSION' };

// Reducer
const translationReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_SOURCE_LANGUAGE':
      return {
        ...state,
        sourceLanguage: action.payload,
        // Keep current target language if it's different from source
        targetLanguage: action.payload === state.targetLanguage 
          ? (action.payload === 'en' ? 'ht' : 'en') 
          : state.targetLanguage,
      };

    case 'SET_TARGET_LANGUAGE':
      return {
        ...state,
        targetLanguage: action.payload,
        // Keep current source language if it's different from target
        sourceLanguage: action.payload === state.sourceLanguage 
          ? (action.payload === 'en' ? 'ht' : 'en') 
          : state.sourceLanguage,
      };

    case 'SWAP_LANGUAGES':
      return {
        ...state,
        sourceLanguage: state.targetLanguage,
        targetLanguage: state.sourceLanguage,
      };

    case 'SET_TONE':
      return {
        ...state,
        selectedTone: action.payload,
      };

    case 'SET_TRANSLATION_PROVIDER':
      return {
        ...state,
        translationProvider: action.payload,
      };

    case 'SET_TRANSLATION_DIRECTION':
      return {
        ...state,
        translationDirection: action.payload,
        // When direction changes, swap languages appropriately
        sourceLanguage: action.payload === 'to-english' ? 'ht' : 'en',
        targetLanguage: action.payload === 'to-english' ? 'en' : 'ht',
      };

    case 'START_RECORDING':
      return {
        ...state,
        audioRecorder: {
          ...state.audioRecorder,
          isRecording: true,
          isPaused: false,
          duration: 0,
        },
      };

    case 'STOP_RECORDING':
      return {
        ...state,
        audioRecorder: {
          ...state.audioRecorder,
          isRecording: false,
          isPaused: false,
          audioBlob: action.payload.audioBlob,
          audioUrl: action.payload.audioUrl,
        },
      };

    case 'PAUSE_RECORDING':
      return {
        ...state,
        audioRecorder: {
          ...state.audioRecorder,
          isPaused: true,
        },
      };

    case 'RESUME_RECORDING':
      return {
        ...state,
        audioRecorder: {
          ...state.audioRecorder,
          isPaused: false,
        },
      };

    case 'UPDATE_RECORDING_DURATION':
      return {
        ...state,
        audioRecorder: {
          ...state.audioRecorder,
          duration: action.payload,
        },
      };

    case 'START_TRANSLATION':
      return {
        ...state,
        isTranslating: true,
        translationError: undefined,
      };

    case 'SET_TRANSLATION':
      return {
        ...state,
        isTranslating: false,
        currentTranslation: action.payload,
        translationError: undefined,
      };

    case 'SET_TRANSLATION_ERROR':
      return {
        ...state,
        isTranslating: false,
        translationError: action.payload,
      };

    case 'CLEAR_TRANSLATION_ERROR':
      return {
        ...state,
        translationError: undefined,
      };

    case 'ADD_TO_HISTORY':
      const newHistory = [action.payload.item, ...state.translationHistory];
      // Keep only last MAX_HISTORY_ITEMS translations
      const limitedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
      // Save to user-specific encrypted storage (async, fire-and-forget)
      saveHistoryToStorage(limitedHistory, action.payload.userId);
      return {
        ...state,
        translationHistory: limitedHistory,
      };

    case 'CLEAR_HISTORY':
      // Remove from user-specific encrypted storage
      try {
        const key = getHistoryKey(action.payload.userId);
        secureStorage.removeItem(key);
        console.log('🗑️  Translation history cleared');
      } catch (error) {
        console.error('Failed to clear history:', error);
      }
      return {
        ...state,
        translationHistory: [],
      };

    case 'TOGGLE_AUTO_PLAY':
      return {
        ...state,
        autoPlay: !state.autoPlay,
      };

    case 'TOGGLE_HISTORY':
      return {
        ...state,
        showHistory: !state.showHistory,
      };

    case 'SET_AUDIO_PLAYER_STATE':
      return {
        ...state,
        audioPlayer: {
          ...state.audioPlayer,
          ...action.payload,
        },
      };

    case 'LOAD_HISTORY_FROM_STORAGE':
      return {
        ...state,
        translationHistory: action.payload,
      };

    case 'TOGGLE_CONTINUOUS_MODE':
      return {
        ...state,
        continuousRecording: {
          ...state.continuousRecording,
          isEnabled: !state.continuousRecording.isEnabled,
        },
      };

    case 'START_CONTINUOUS_RECORDING':
      return {
        ...state,
        continuousRecording: {
          ...state.continuousRecording,
          isRecording: true,
          isPaused: false,
          sessionStartTime: state.continuousRecording.sessionStartTime || new Date(),
        },
      };

    case 'STOP_CONTINUOUS_RECORDING':
      return {
        ...state,
        continuousRecording: {
          ...state.continuousRecording,
          isRecording: false,
          isPaused: false,
        },
      };

    case 'PAUSE_CONTINUOUS_RECORDING':
      return {
        ...state,
        continuousRecording: {
          ...state.continuousRecording,
          isPaused: true,
        },
      };

    case 'RESUME_CONTINUOUS_RECORDING':
      return {
        ...state,
        continuousRecording: {
          ...state.continuousRecording,
          isPaused: false,
        },
      };

    case 'ADD_SPEAKER':
      return {
        ...state,
        continuousRecording: {
          ...state.continuousRecording,
          speakers: [...state.continuousRecording.speakers, action.payload],
          currentSpeaker: state.continuousRecording.currentSpeaker || action.payload,
        },
      };

    case 'SET_CURRENT_SPEAKER':
      return {
        ...state,
        continuousRecording: {
          ...state.continuousRecording,
          currentSpeaker: action.payload,
        },
      };

    case 'RENAME_SPEAKER':
      return {
        ...state,
        continuousRecording: {
          ...state.continuousRecording,
          speakers: state.continuousRecording.speakers.map(speaker =>
            speaker.id === action.payload.speakerId
              ? { ...speaker, label: action.payload.newLabel }
              : speaker
          ),
          currentSpeaker: state.continuousRecording.currentSpeaker?.id === action.payload.speakerId
            ? { ...state.continuousRecording.currentSpeaker, label: action.payload.newLabel }
            : state.continuousRecording.currentSpeaker,
          segments: state.continuousRecording.segments.map(segment =>
            segment.speaker.id === action.payload.speakerId
              ? { ...segment, speaker: { ...segment.speaker, label: action.payload.newLabel } }
              : segment
          ),
        },
      };

    case 'ADD_TRANSCRIPT_SEGMENT':
      return {
        ...state,
        continuousRecording: {
          ...state.continuousRecording,
          segments: [...state.continuousRecording.segments, action.payload],
        },
      };

    case 'UPDATE_CONTINUOUS_DURATION':
      return {
        ...state,
        continuousRecording: {
          ...state.continuousRecording,
          totalDuration: action.payload,
        },
      };

    case 'CLEAR_CONTINUOUS_SESSION':
      return {
        ...state,
        continuousRecording: {
          isEnabled: state.continuousRecording.isEnabled,
          isRecording: false,
          isPaused: false,
          currentSpeaker: null,
          speakers: [],
          segments: [],
          sessionStartTime: null,
          totalDuration: 0,
        },
      };

    default:
      return state;
  }
};

// Context
const TranslationContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

// Provider component
export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(translationReducer, initialState);
  const auth = useAuth();
  const userId = auth?.user?.id;

  // Load history from user-specific encrypted storage when user changes
  useEffect(() => {
    const loadHistory = async () => {
      const history = await loadHistoryFromStorage(userId);
      dispatch({ type: 'LOAD_HISTORY_FROM_STORAGE', payload: history });
      console.log(`📚 Loaded ${history.length} encrypted history items for user:`, userId || 'guest');
    };

    loadHistory();
  }, [userId]);

  return (
    <TranslationContext.Provider value={{ state, dispatch }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Hook to use the context
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Available languages
export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
];

// Available tones
export const TONES: Tone[] = [
  {
    id: 'casual',
    name: 'Casual',
    description: 'Everyday conversation',
    prompt: 'Use everyday language, contractions welcome, relaxed vocabulary',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Professional contexts',
    prompt: 'Professional but approachable, industry-appropriate terminology',
  },
  {
    id: 'formal',
    name: 'Formal',
    description: 'Respectful, proper grammar',
    prompt: 'Respectful address, no slang, proper grammatical structures',
  },
  {
    id: 'informal',
    name: 'Informal',
    description: 'Very relaxed, friendly',
    prompt: 'Very relaxed, friendly, conversational style',
  },
  {
    id: 'medical',
    name: 'Medical',
    description: 'Healthcare terminology',
    prompt: 'Use precise medical terminology, clear and professional',
  },
];
