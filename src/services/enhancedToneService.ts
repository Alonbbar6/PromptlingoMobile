/**
 * Enhanced Tone Service with Translation Pipeline
 * Handles text translation TO the selected target language with tone enhancement
 */

import { translateText } from './api';
import { sanitizeInput } from '../utils/contentFilter';
import { getLanguageConfig, isLanguageSupported } from '../config/languages.config';
// WASM disabled - using JavaScript-only language detection

export interface ToneOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  example: string;
}

export interface EnhancedToneResult {
  originalText: string;
  detectedLanguage: string;
  targetLanguage: string; // The language we're translating TO
  translatedText?: string; // Only present if translation was needed
  enhancedText: string;
  toneApplied: string;
  transformationsApplied: string[];
  wasTranslated: boolean;
  languageConfidence: number;
}

export const TONE_OPTIONS: ToneOption[] = [
  {
    id: 'professional',
    name: 'Professional/Formal',
    description: 'Clear, business-like delivery with formal language',
    icon: '💼',
    example: 'Good morning. I would like to discuss the proposal with you.'
  },
  {
    id: 'friendly',
    name: 'Friendly/Casual',
    description: 'Warm, conversational tone with approachable language',
    icon: '😊',
    example: 'Hi there! I\'d love to chat about the proposal with you.'
  },
  {
    id: 'enthusiastic',
    name: 'Enthusiastic/Energetic',
    description: 'Upbeat and lively with energetic vocabulary',
    icon: '⚡',
    example: 'Hello! I\'m excited to discuss this amazing proposal with you!'
  },
  {
    id: 'calm',
    name: 'Calm/Soothing',
    description: 'Gentle and relaxed with reassuring phrases',
    icon: '🕊️',
    example: 'Hello. I\'d like to gently walk through the proposal together.'
  },
  {
    id: 'authoritative',
    name: 'Authoritative/Confident',
    description: 'Strong and commanding with decisive language',
    icon: '👑',
    example: 'Good morning. We need to review this proposal immediately.'
  }
];

/**
 * Enhanced Tone Service with Translation Pipeline
 */
export class EnhancedToneService {
  
  /**
   * Detect language using JavaScript pattern matching
   * (WASM disabled - using JavaScript-only implementation)
   */
  private async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    // JavaScript-only pattern-based detection
    const textLower = text.toLowerCase();
    
    // Spanish patterns
    const spanishPatterns = [
      /\b(hola|como|estan|que|tal|buenos|dias|noches|gracias|por|favor|si|no|muy|bien)\b/g,
      /\b(el|la|los|las|un|una|y|o|pero|en|de|a|para|con|por)\b/g,
      /\b(yo|tú|él|ella|nosotros|vosotros|ellos|soy|eres|es|somos|son)\b/g
    ];
    
    // Haitian Creole patterns
    const creolePatterns = [
      /\b(kijan|ou|ye|mwen|nou|yo|li|ak|nan|pou|ki|sa|gen|pa|te|ap|va)\b/g,
      /\b(bonjou|bonswa|mesi|tanpri|wi|non|byen|mal|gwo|ti|bel)\b/g
    ];
    
    // English patterns
    const englishPatterns = [
      /\b(hello|hi|how|are|you|what|the|and|or|but|in|on|at|to|for|of|with|by)\b/g,
      /\b(I|you|he|she|it|we|they|am|is|are|was|were|have|has|had)\b/g
    ];
    
    let spanishMatches = 0;
    let creoleMatches = 0;
    let englishMatches = 0;
    
    spanishPatterns.forEach(pattern => {
      spanishMatches += (textLower.match(pattern) || []).length;
    });
    
    creolePatterns.forEach(pattern => {
      creoleMatches += (textLower.match(pattern) || []).length;
    });
    
    englishPatterns.forEach(pattern => {
      englishMatches += (textLower.match(pattern) || []).length;
    });
    
    const totalWords = text.split(/\s+/).length;
    const totalMatches = spanishMatches + creoleMatches + englishMatches;
    
    if (totalMatches === 0) {
      return { language: 'unknown', confidence: 0 };
    }
    
    let detectedLanguage = 'english';
    let maxMatches = englishMatches;
    
    if (spanishMatches > maxMatches) {
      detectedLanguage = 'spanish';
      maxMatches = spanishMatches;
    }
    
    if (creoleMatches > maxMatches) {
      detectedLanguage = 'creole';
      maxMatches = creoleMatches;
    }
      
    const confidence = Math.min(maxMatches / totalWords, 1.0);
    
    return { language: detectedLanguage, confidence };
  }

  /**
   * Map detected language to translation service language codes
   */
  private mapLanguageCode(detectedLanguage: string): string {
    const languageMap: { [key: string]: string } = {
      'spanish': 'es',
      'creole': 'ht',
      'english': 'en',
      'unknown': 'auto'
    };
    
    return languageMap[detectedLanguage] || 'auto';
  }

  /**
   * Apply tone enhancement to English text
   */
  private applyToneTransformation(text: string, tone: string): { enhancedText: string; transformations: string[] } {
    let enhanced = text;
    const transformations: string[] = [];

    switch (tone) {
      case 'professional':
        enhanced = this.applyProfessionalTone(enhanced, transformations);
        break;
      case 'friendly':
        enhanced = this.applyFriendlyTone(enhanced, transformations);
        break;
      case 'enthusiastic':
        enhanced = this.applyEnthusiasticTone(enhanced, transformations);
        break;
      case 'calm':
        enhanced = this.applyCalmTone(enhanced, transformations);
        break;
      case 'authoritative':
        enhanced = this.applyAuthoritativeTone(enhanced, transformations);
        break;
      default:
        enhanced = this.applyProfessionalTone(enhanced, transformations);
    }

    return {
      enhancedText: this.cleanupEnhancedText(enhanced),
      transformations
    };
  }

  /**
   * Apply professional tone transformations
   */
  private applyProfessionalTone(text: string, transformations: string[]): string {
    let enhanced = text;

    // Casual to professional replacements
    const replacements = [
      { from: /\bhey\b/gi, to: 'Hello', desc: 'Casual greeting → Professional greeting' },
      { from: /\bhi\b/gi, to: 'Hello', desc: 'Casual greeting → Professional greeting' },
      { from: /\bwhat's up\b/gi, to: 'how are you', desc: 'Casual inquiry → Professional inquiry' },
      { from: /\byeah\b/gi, to: 'yes', desc: 'Casual affirmation → Professional affirmation' },
      { from: /\bgonna\b/gi, to: 'going to', desc: 'Contraction → Full form' },
      { from: /\bwanna\b/gi, to: 'would like to', desc: 'Casual desire → Professional expression' },
      { from: /\bthanks\b/gi, to: 'thank you', desc: 'Casual thanks → Professional thanks' }
    ];

    replacements.forEach(({ from, to, desc }) => {
      if (from.test(enhanced)) {
        enhanced = enhanced.replace(from, to);
        transformations.push(desc);
      }
    });

    // Add professional greeting if needed
    if (!enhanced.match(/^(Hello|Good morning|Good afternoon|Good evening)/i)) {
      enhanced = 'Hello. ' + enhanced;
      transformations.push('Added professional greeting');
    }

    return enhanced;
  }

  /**
   * Apply friendly tone transformations
   */
  private applyFriendlyTone(text: string, transformations: string[]): string {
    let enhanced = text;

    // Add friendly greeting
    if (!enhanced.match(/^(Hi|Hello|Hey)/i)) {
      enhanced = 'Hi there! ' + enhanced;
      transformations.push('Added friendly greeting');
    }

    // Add friendly expressions
    enhanced = enhanced.replace(/\bI want to\b/gi, 'I\'d love to');
    enhanced = enhanced.replace(/\bI need to\b/gi, 'I\'d like to');

    if (enhanced !== text) {
      transformations.push('Added friendly expressions');
    }

    return enhanced;
  }

  /**
   * Apply enthusiastic tone transformations
   */
  private applyEnthusiasticTone(text: string, transformations: string[]): string {
    let enhanced = text;

    // Add enthusiastic vocabulary
    enhanced = enhanced.replace(/\bgood\b/gi, 'great');
    enhanced = enhanced.replace(/\bnice\b/gi, 'fantastic');

    // Add exclamation for enthusiasm
    if (!enhanced.match(/[!]/) && enhanced.length < 100) {
      enhanced = enhanced.replace(/\.$/, '!');
      transformations.push('Added enthusiastic punctuation');
    }

    // Add energetic greeting
    if (!enhanced.match(/^(Hello|Hi|Hey)/i)) {
      enhanced = 'Hello! ' + enhanced;
      transformations.push('Added enthusiastic greeting');
    }

    return enhanced;
  }

  /**
   * Apply calm tone transformations
   */
  private applyCalmTone(text: string, transformations: string[]): string {
    let enhanced = text;

    // Add calming words
    enhanced = enhanced.replace(/\bneed to\b/gi, 'gently need to');
    enhanced = enhanced.replace(/\bshould\b/gi, 'might want to');

    // Add gentle greeting
    if (!enhanced.match(/^(Hello|Hi)/i)) {
      enhanced = 'Hello. ' + enhanced;
      transformations.push('Added gentle greeting');
    }

    if (enhanced !== text) {
      transformations.push('Added calming language');
    }

    return enhanced;
  }

  /**
   * Apply authoritative tone transformations
   */
  private applyAuthoritativeTone(text: string, transformations: string[]): string {
    let enhanced = text;

    // Strengthen language
    enhanced = enhanced.replace(/\bI think\b/gi, 'I believe');
    enhanced = enhanced.replace(/\bmaybe\b/gi, 'certainly');
    enhanced = enhanced.replace(/\bmight\b/gi, 'will');

    // Add authoritative greeting
    if (!enhanced.match(/^(Good morning|Good afternoon|Hello)/i)) {
      enhanced = 'Good morning. ' + enhanced;
      transformations.push('Added authoritative greeting');
    }

    if (enhanced !== text) {
      transformations.push('Strengthened language for authority');
    }

    return enhanced;
  }

  /**
   * Clean up enhanced text
   */
  private cleanupEnhancedText(text: string): string {
    let cleaned = text.trim();
    
    // Fix spacing issues
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\s+([.!?])/g, '$1');
    cleaned = cleaned.replace(/([.!?])\s*([A-Z])/g, '$1 $2');
    
    // Ensure proper sentence ending
    if (cleaned && !cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }
    
    return cleaned;
  }

  /**
   * Main method: Enhanced tone processing with translation pipeline
   * @param text - The input text to enhance
   * @param tone - The tone to apply (professional, friendly, etc.)
   * @param targetLanguage - The language to translate TO (e.g., 'es', 'ht', 'en')
   * @param userTier - User tier for content filtering
   */
  async enhanceTextWithTone(
    text: string, 
    tone: string, 
    targetLanguage: string = 'en',
    userTier: 'free' | 'paid-uncensored' = 'free'
  ): Promise<EnhancedToneResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for tone enhancement');
    }

    console.log('🎭 [ENHANCED TONE] Starting enhanced tone processing...');
    console.log('🎭 Original text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));

    try {
      // STEP 1: Content filtering
      console.log('🛡️ [ENHANCED TONE] Applying content filter...');
      const { filteredText, wasFiltered, detectedIssues } = sanitizeInput(text, userTier);
      
      if (wasFiltered) {
        console.log('🛡️ Content was filtered:', detectedIssues);
      }

      // STEP 2: Language detection
      console.log('🔍 [ENHANCED TONE] Detecting language...');
      const { language: detectedLanguage, confidence: languageConfidence } = await this.detectLanguage(filteredText);
      
      console.log(`🔍 Detected language: ${detectedLanguage} (confidence: ${(languageConfidence * 100).toFixed(1)}%)`);

      let textForToneEnhancement = filteredText;
      let translatedText: string | undefined;
      let wasTranslated = false;
      const transformationsApplied: string[] = [];

      // Add content filtering info to transformations
      if (wasFiltered) {
        transformationsApplied.push(`Content filtered: ${detectedIssues.join(', ')}`);
      }

      // STEP 3: Translation TO target language
      const needsTranslation = targetLanguage !== 'en' || (detectedLanguage !== 'english' && detectedLanguage !== 'unknown');
      
      if (needsTranslation) {
        console.log(`🌐 [ENHANCED TONE] Translation needed to ${targetLanguage}...`);
        
        // Validate target language is supported
        if (!isLanguageSupported(targetLanguage)) {
          console.warn(`⚠️ Target language '${targetLanguage}' not supported, defaulting to English`);
          targetLanguage = 'en';
        }
        
        try {
          const sourceLangCode = this.mapLanguageCode(detectedLanguage);
          const languageConfig = getLanguageConfig(targetLanguage);
          
          console.log(`🌐 Translating from ${sourceLangCode} to ${targetLanguage}`);
          console.log(`🌐 Using language config: ${languageConfig?.nativeName || targetLanguage}`);
          
          // Translate to target language with tone
          const translationResult = await translateText(
            filteredText, 
            sourceLangCode, 
            targetLanguage, 
            tone, 
            userTier
          );
          
          translatedText = translationResult.translation;
          textForToneEnhancement = translatedText;
          wasTranslated = true;
          
          const targetLangName = languageConfig?.nativeName || targetLanguage;
          transformationsApplied.push(`Translated to ${targetLangName} with ${tone} tone`);
          
          console.log('✅ [ENHANCED TONE] Translation completed');
          console.log('🌐 Translated text:', translatedText.substring(0, 100) + (translatedText.length > 100 ? '...' : ''));
          
        } catch (translationError) {
          console.error('❌ [ENHANCED TONE] Translation failed:', translationError);
          
          // Fallback: Apply tone enhancement to original text
          console.log('🔄 [ENHANCED TONE] Using original text for tone enhancement');
          transformationsApplied.push('Translation failed, using original text');
        }
      } else {
        console.log('🔄 [ENHANCED TONE] Text is already in target language, proceeding with tone enhancement');
      }

      // STEP 4: Apply tone enhancement
      console.log(`🎭 [ENHANCED TONE] Applying ${tone} tone enhancement...`);
      const { enhancedText, transformations } = this.applyToneTransformation(textForToneEnhancement, tone);
      
      transformationsApplied.push(...transformations);

      const result: EnhancedToneResult = {
        originalText: text,
        detectedLanguage,
        targetLanguage,
        translatedText,
        enhancedText,
        toneApplied: tone,
        transformationsApplied,
        wasTranslated,
        languageConfidence
      };

      console.log('✅ [ENHANCED TONE] Processing completed successfully');
      console.log('🎭 Final enhanced text:', result.enhancedText.substring(0, 100) + (result.enhancedText.length > 100 ? '...' : ''));
      console.log('🎭 Transformations applied:', result.transformationsApplied);

      return result;

    } catch (error) {
      console.error('❌ [ENHANCED TONE] Processing failed:', error);
      
      // Fallback: return original text with minimal processing
      return {
        originalText: text,
        detectedLanguage: 'unknown',
        targetLanguage: targetLanguage || 'en',
        enhancedText: text,
        toneApplied: tone,
        transformationsApplied: ['Fallback: Processing failed, using original text'],
        wasTranslated: false,
        languageConfidence: 0
      };
    }
  }

  /**
   * Get available tone options
   */
  getAvailableTones(): ToneOption[] {
    return TONE_OPTIONS;
  }

  /**
   * Get tone option by ID
   */
  getToneOption(toneId: string): ToneOption | undefined {
    return TONE_OPTIONS.find(tone => tone.id === toneId);
  }
}

// Singleton instance
let enhancedToneService: EnhancedToneService | null = null;

/**
 * Get the singleton enhanced tone service
 */
export function getEnhancedToneService(): EnhancedToneService {
  if (!enhancedToneService) {
    enhancedToneService = new EnhancedToneService();
  }
  return enhancedToneService;
}

/**
 * Quick enhanced tone processing function
 */
export async function enhanceTextWithTone(
  text: string, 
  tone: string,
  targetLanguage: string = 'en',
  userTier: 'free' | 'paid-uncensored' = 'free'
): Promise<EnhancedToneResult> {
  const service = getEnhancedToneService();
  return service.enhanceTextWithTone(text, tone, targetLanguage, userTier);
}

/**
 * Get all available tone options
 */
export function getAvailableTones(): ToneOption[] {
  return TONE_OPTIONS;
}
