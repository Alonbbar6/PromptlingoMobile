import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, TranslationHistoryItem, Language, Tone } from '../types';

// Initial state
const initialState: AppState = {
  sourceLanguage: 'ht', // Default to Haitian Creole as source
  targetLanguage: 'en', // Default to English as target
  translationDirection: 'to-english', // Default to translating TO English
  selectedTone: 'casual',
  audioRecorder: {
    isRecording: false,
    isPaused: false,
    duration: 0,
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
  | { type: 'ADD_TO_HISTORY'; payload: TranslationHistoryItem }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'TOGGLE_AUTO_PLAY' }
  | { type: 'TOGGLE_HISTORY' }
  | { type: 'SET_AUDIO_PLAYER_STATE'; payload: Partial<AppState['audioPlayer']> }
  | { type: 'LOAD_HISTORY_FROM_STORAGE'; payload: TranslationHistoryItem[] };

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
      const newHistory = [action.payload, ...state.translationHistory];
      // Keep only last 50 translations
      const limitedHistory = newHistory.slice(0, 50);
      localStorage.setItem('translationHistory', JSON.stringify(limitedHistory));
      return {
        ...state,
        translationHistory: limitedHistory,
      };

    case 'CLEAR_HISTORY':
      localStorage.removeItem('translationHistory');
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

  // Load history from localStorage on mount
  React.useEffect(() => {
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        dispatch({ type: 'LOAD_HISTORY_FROM_STORAGE', payload: parsedHistory });
      } catch (error) {
        console.error('Failed to load translation history:', error);
      }
    }
  }, []);

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
