// Language Detection Service
// Uses a lightweight client-side language detection library

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  isReliable: boolean;
}

export interface LanguageDetectionError {
  message: string;
  code: 'TEXT_TOO_SHORT' | 'UNCERTAIN_DETECTION' | 'UNSUPPORTED_LANGUAGE';
}

// Simple language detection patterns for common words and phrases
const LANGUAGE_PATTERNS = {
  en: {
    patterns: [
      /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi,
      /\b(is|are|was|were|have|has|had|will|would|could|should)\b/gi,
      /\b(this|that|these|those|what|where|when|why|how)\b/gi,
      /\b(hello|hi|thank|thanks|please|sorry|yes|no)\b/gi,
    ],
    commonWords: ['the', 'and', 'or', 'is', 'are', 'have', 'has', 'will', 'can', 'do', 'does', 'did'],
  },
  es: {
    patterns: [
      /\b(el|la|los|las|un|una|y|o|pero|en|de|a|para|con|por)\b/gi,
      /\b(es|son|está|están|tiene|tienen|será|puede|hacer)\b/gi,
      /\b(este|esta|estos|estas|qué|dónde|cuándo|por qué|cómo)\b/gi,
      /\b(hola|gracias|por favor|perdón|sí|no|muy|bien)\b/gi,
    ],
    commonWords: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le'],
  },
  ht: {
    patterns: [
      /\b(ak|ak|men|nan|pou|sou|kote|ki|kisa|kijan)\b/gi,
      /\b(mwen|ou|li|nou|yo|se|gen|pa|te|ap)\b/gi,
      /\b(bonjou|bonswa|mèsi|tanpri|wi|non|bon|mal)\b/gi,
      /\b(kay|moun|bagay|tan|kote|lè|poukisa)\b/gi,
    ],
    commonWords: ['mwen', 'ou', 'li', 'nou', 'yo', 'ak', 'nan', 'pou', 'se', 'gen', 'pa', 'te', 'ap'],
  },
};

/**
 * Detects the language of the given text using pattern matching
 * @param text - The text to analyze
 * @param minConfidence - Minimum confidence threshold (0-1)
 * @returns Language detection result or error
 */
export function detectLanguage(
  text: string, 
  minConfidence: number = 0.6
): LanguageDetectionResult | LanguageDetectionError {
  
  // Validate input
  if (!text || text.trim().length === 0) {
    return {
      message: 'Text is empty or contains only whitespace',
      code: 'TEXT_TOO_SHORT'
    };
  }

  const cleanText = text.trim().toLowerCase();
  
  // Check minimum length
  if (cleanText.length < 10) {
    return {
      message: 'Text is too short for reliable language detection (minimum 10 characters)',
      code: 'TEXT_TOO_SHORT'
    };
  }

  const scores: { [key: string]: number } = {};
  const languages = Object.keys(LANGUAGE_PATTERNS);

  // Calculate scores for each language
  for (const lang of languages) {
    const patterns = LANGUAGE_PATTERNS[lang as keyof typeof LANGUAGE_PATTERNS];
    let score = 0;
    let totalMatches = 0;

    // Check pattern matches
    for (const pattern of patterns.patterns) {
      const matches = cleanText.match(pattern);
      if (matches) {
        score += matches.length * 2; // Weight pattern matches higher
        totalMatches += matches.length;
      }
    }

    // Check common words
    const words = cleanText.split(/\s+/);
    for (const word of words) {
      if (patterns.commonWords.includes(word)) {
        score += 1;
        totalMatches += 1;
      }
    }

    // Normalize score by text length
    scores[lang] = totalMatches > 0 ? score / words.length : 0;
  }

  // Find the language with highest score
  const sortedLanguages = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);

  const [topLanguage, topScore] = sortedLanguages[0];
  const [, secondScore] = sortedLanguages[1] || ['', 0];

  // Calculate confidence based on score difference
  const confidence = topScore > 0 ? Math.min(1, topScore / 0.5) : 0;
  const scoreDifference = topScore - secondScore;

  // Check if detection is reliable
  const isReliable = confidence >= minConfidence && scoreDifference > 0.1;

  if (!isReliable || confidence < minConfidence) {
    return {
      message: `Language detection uncertain (confidence: ${(confidence * 100).toFixed(1)}%). Please verify the text is in the expected language.`,
      code: 'UNCERTAIN_DETECTION'
    };
  }

  return {
    language: topLanguage,
    confidence,
    isReliable: true
  };
}

/**
 * Validates if the detected language matches the expected language
 * @param text - Text to analyze
 * @param expectedLanguage - Expected language code
 * @param minConfidence - Minimum confidence threshold
 * @returns Validation result
 */
export function validateLanguage(
  text: string,
  expectedLanguage: string,
  minConfidence: number = 0.6
): { isValid: boolean; detectedLanguage?: string; confidence?: number; error?: string } {
  
  const result = detectLanguage(text, minConfidence);
  
  if ('code' in result) {
    // Detection failed
    return {
      isValid: false,
      error: result.message
    };
  }

  const isValid = result.language === expectedLanguage;
  
  return {
    isValid,
    detectedLanguage: result.language,
    confidence: result.confidence,
    error: isValid ? undefined : `Expected ${expectedLanguage} but detected ${result.language}`
  };
}

/**
 * Gets a user-friendly language name from language code
 */
export function getLanguageName(code: string): string {
  const names: { [key: string]: string } = {
    'en': 'English',
    'es': 'Spanish',
    'ht': 'Haitian Creole'
  };
  return names[code] || code;
}

/**
 * Suggests the correct language setting based on detected language
 */
export function suggestLanguageSwitch(detectedLanguage: string, currentLanguage: string): string {
  const detectedName = getLanguageName(detectedLanguage);
  const currentName = getLanguageName(currentLanguage);
  
  return `The text appears to be in ${detectedName}, but you have ${currentName} selected. Would you like to switch to ${detectedName}?`;
}

/**
 * Enhanced language detection with multiple validation layers
 */
export function enhancedLanguageDetection(
  text: string,
  expectedLanguage: string
): {
  isValid: boolean;
  detectedLanguage?: string;
  confidence?: number;
  suggestion?: string;
  error?: string;
} {
  
  const validation = validateLanguage(text, expectedLanguage, 0.5);
  
  if (!validation.isValid && validation.detectedLanguage) {
    return {
      ...validation,
      suggestion: suggestLanguageSwitch(validation.detectedLanguage, expectedLanguage)
    };
  }
  
  return validation;
}
