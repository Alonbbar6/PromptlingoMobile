// Enhanced Translation Service with Formality and Grammar Enhancement
import { translateText as originalTranslateText } from './api';
import { TranslationResponse } from '../types';

export interface EnhancedTranslationOptions {
  text: string;
  sourceLang: string;
  targetLang: string;
  tone: string;
  enhanceFormality?: boolean;
  preserveOriginal?: boolean;
  userTier?: 'free' | 'paid-uncensored';
}

export interface EnhancedTranslationResult extends TranslationResponse {
  originalTranslation?: string;
  enhancedTranslation: string;
  formalityApplied: boolean;
  grammarEnhanced: boolean;
}

/**
 * Enhanced translation with proper formality and grammar enhancement
 * This service transforms casual/informal input into professional, well-formatted output
 */
export class EnhancedTranslationService {
  
  /**
   * Get language-specific formality enhancement prompt
   */
  private getFormalityPrompt(sourceLang: string, targetLang: string, tone: string): string {
    const sourceLanguageName = this.getLanguageName(sourceLang);
    const targetLanguageName = this.getLanguageName(targetLang);
    
    // Check if this is reverse translation (English to other languages)
    const isReverseTranslation = sourceLang === 'en' && (targetLang === 'ht' || targetLang === 'es');
    
    if (isReverseTranslation) {
      return `You are a professional translator and language enhancement specialist.

CRITICAL TRANSLATION & ENHANCEMENT INSTRUCTIONS:

PRIMARY TASK:
1. Translate the following English text to natural, fluent ${targetLanguageName}
2. Apply ADVANCED formality and grammar enhancement to create professional output

TRANSLATION REQUIREMENTS:
- Use natural ${targetLanguageName} expressions and idioms
- Maintain proper grammar in ${targetLanguageName}
- Make it sound like a native speaker wrote it
- Do NOT translate proper names
- Use appropriate cultural context for ${targetLanguageName}

FORMALITY ENHANCEMENT RULES:
- Transform casual/informal English into professional, formal ${targetLanguageName}
- Convert slang, colloquialisms, and casual expressions to appropriate formal equivalents in ${targetLanguageName}
- Apply proper grammar, punctuation, and sentence structure in ${targetLanguageName}
- Break run-on sentences into clear, well-structured sentences
- Add appropriate conjunctions and transitions for flow
- Use complete sentences with proper capitalization
- Replace casual greetings with professional alternatives in ${targetLanguageName}
- Maintain natural, readable flow while elevating language quality

TONE APPLICATION (${tone}):
${this.getToneInstructions(tone)}

GRAMMAR ENHANCEMENT:
- Correct all grammatical errors
- Ensure proper subject-verb agreement in ${targetLanguageName}
- Use appropriate tenses consistently
- Add missing articles where needed in ${targetLanguageName}
- Fix punctuation and capitalization
- Ensure parallel structure in lists or series

FORMATTING REQUIREMENTS:
- Each sentence should be complete and properly punctuated in ${targetLanguageName}
- Use appropriate paragraph breaks for longer text
- Maintain logical flow and coherence
- Preserve the original meaning and intent completely

QUALITY STANDARDS:
- Output must be business/professional appropriate in ${targetLanguageName}
- Language should be clear, concise, and polished
- Maintain warmth and human connection while being formal
- Avoid overly complex or pretentious language

Input English text to translate and enhance:`;
    } else {
      return `You are a professional translator and language enhancement specialist.

CRITICAL TRANSLATION & ENHANCEMENT INSTRUCTIONS:

PRIMARY TASK:
1. Translate the following text from ${sourceLanguageName} to ${targetLanguageName}
2. Apply ADVANCED formality and grammar enhancement to create professional output

FORMALITY ENHANCEMENT RULES:
- Transform casual/informal language into professional, formal ${targetLanguageName}
- Convert slang, colloquialisms, and casual expressions to appropriate formal equivalents
- Apply proper grammar, punctuation, and sentence structure
- Break run-on sentences into clear, well-structured sentences
- Add appropriate conjunctions and transitions for flow
- Use complete sentences with proper capitalization
- Replace casual greetings with professional alternatives
- Maintain natural, readable flow while elevating language quality

TONE APPLICATION (${tone}):
${this.getToneInstructions(tone)}

GRAMMAR ENHANCEMENT:
- Correct all grammatical errors
- Ensure proper subject-verb agreement
- Use appropriate tenses consistently
- Add missing articles (a, an, the) where needed
- Fix punctuation and capitalization
- Ensure parallel structure in lists or series

FORMATTING REQUIREMENTS:
- Each sentence should be complete and properly punctuated
- Use appropriate paragraph breaks for longer text
- Maintain logical flow and coherence
- Preserve the original meaning and intent completely

QUALITY STANDARDS:
- Output must be business/professional appropriate
- Language should be clear, concise, and polished
- Maintain warmth and human connection while being formal
- Avoid overly complex or pretentious language

Input text to translate and enhance:`;
    }
  }

  /**
   * Get tone-specific instructions for the AI
   */
  private getToneInstructions(tone: string): string {
    const toneInstructions = {
      casual: `
- Use warm, approachable language while maintaining professionalism
- Include friendly but appropriate expressions
- Keep sentences conversational but well-structured
- Use contractions sparingly and appropriately`,

      business: `
- Use formal business language and terminology
- Maintain professional distance and respect
- Use industry-appropriate vocabulary
- Structure sentences for clarity and authority`,

      formal: `
- Use the highest level of formal language
- Employ sophisticated vocabulary and complex sentence structures
- Maintain respectful and dignified tone throughout
- Use formal greetings and closings`,

      informal: `
- Keep language relaxed but still grammatically correct
- Use everyday vocabulary while maintaining clarity
- Allow for more casual expressions but avoid slang
- Maintain friendly and accessible tone`,

      medical: `
- Use precise medical and healthcare terminology
- Maintain professional medical communication standards
- Ensure clarity for patient safety and understanding
- Use formal but compassionate language`
    };

    return toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.business;
  }

  /**
   * Get human-readable language name
   */
  private getLanguageName(code: string): string {
    const names: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'ht': 'Haitian Creole',
      'fr': 'French'
    };
    return names[code] || code.toUpperCase();
  }

  /**
   * Enhanced translation with formality and grammar improvement
   */
  async translateWithEnhancement(options: EnhancedTranslationOptions): Promise<EnhancedTranslationResult> {
    const { text, sourceLang, targetLang, tone, enhanceFormality = true, preserveOriginal = false, userTier = 'free' } = options;
    
    console.log('🔄 [ENHANCED TRANSLATION] Starting enhanced translation...');
    console.log(`   - Source: ${sourceLang} → Target: ${targetLang}`);
    console.log(`   - Tone: ${tone}`);
    console.log(`   - Enhance Formality: ${enhanceFormality}`);
    console.log(`   - Text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);

    try {
      let originalTranslation: string | undefined;
      let enhancedTranslation: string;
      let formalityApplied = false;
      let grammarEnhanced = false;

      if (preserveOriginal) {
        // Get original translation first
        const originalResult = await originalTranslateText(text, sourceLang, targetLang, tone, userTier);
        originalTranslation = originalResult.translation;
      }

      if (enhanceFormality) {
        // Use enhanced prompting for formality and grammar
        const enhancedPrompt = this.getFormalityPrompt(sourceLang, targetLang, tone);
        const fullPrompt = `${enhancedPrompt}\n\n"${text}"\n\nProvide ONLY the translated and enhanced text. No explanations or notes.`;
        
        // Call the translation API with enhanced prompt
        const enhancedResult = await originalTranslateText(fullPrompt, sourceLang, targetLang, tone, userTier);
        enhancedTranslation = this.cleanupTranslation(enhancedResult.translation);
        formalityApplied = true;
        grammarEnhanced = true;
        
        console.log('✅ [ENHANCED TRANSLATION] Formality and grammar enhancement applied');
      } else {
        // Use standard translation
        const standardResult = await originalTranslateText(text, sourceLang, targetLang, tone, userTier);
        enhancedTranslation = standardResult.translation;
      }

      // Post-process the translation for additional cleanup
      enhancedTranslation = this.postProcessTranslation(enhancedTranslation, targetLang);

      const result: EnhancedTranslationResult = {
        translation: enhancedTranslation,
        enhancedTranslation,
        originalTranslation,
        formalityApplied,
        grammarEnhanced,
        model: 'enhanced-translator',
        tokensUsed: 0 // This would come from the API response
      };

      console.log('✅ [ENHANCED TRANSLATION] Translation completed successfully');
      console.log(`   - Original: ${originalTranslation?.substring(0, 50) || 'N/A'}...`);
      console.log(`   - Enhanced: ${enhancedTranslation.substring(0, 50)}...`);

      return result;

    } catch (error) {
      console.error('❌ [ENHANCED TRANSLATION] Translation failed:', error);
      
      // Fallback to standard translation
      console.log('🔄 [ENHANCED TRANSLATION] Falling back to standard translation...');
      try {
        const fallbackResult = await originalTranslateText(text, sourceLang, targetLang, tone, userTier);
        return {
          translation: fallbackResult.translation,
          enhancedTranslation: fallbackResult.translation,
          formalityApplied: false,
          grammarEnhanced: false,
          model: fallbackResult.model,
          tokensUsed: fallbackResult.tokensUsed
        };
      } catch (fallbackError) {
        console.error('❌ [ENHANCED TRANSLATION] Fallback translation also failed:', fallbackError);
        throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Clean up translation output from AI
   */
  private cleanupTranslation(translation: string): string {
    let cleaned = translation.trim();
    
    // Remove common AI response artifacts
    cleaned = cleaned.replace(/^(Translation:|Translated text:|Here is the translation:|The translation is:)/i, '');
    cleaned = cleaned.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
    cleaned = cleaned.trim();
    
    // Ensure proper sentence ending
    if (cleaned && !cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }
    
    // Fix common spacing issues
    cleaned = cleaned.replace(/\s+/g, ' '); // Multiple spaces to single space
    cleaned = cleaned.replace(/\s+([.!?])/g, '$1'); // Remove space before punctuation
    cleaned = cleaned.replace(/([.!?])\s*([A-Z])/g, '$1 $2'); // Ensure space after sentence endings
    
    return cleaned;
  }

  /**
   * Post-process translation for language-specific improvements
   */
  private postProcessTranslation(translation: string, targetLang: string): string {
    let processed = translation;
    
    // Language-specific post-processing
    switch (targetLang) {
      case 'en':
        // English-specific improvements
        processed = this.improveEnglishFormality(processed);
        break;
      case 'es':
        // Spanish-specific improvements
        processed = this.improveSpanishFormality(processed);
        break;
      case 'ht':
        // Haitian Creole-specific improvements
        processed = this.improveHaitianCreoleFormality(processed);
        break;
    }
    
    return processed;
  }

  /**
   * Improve English formality and grammar
   */
  private improveEnglishFormality(text: string): string {
    let improved = text;
    
    // Common casual to formal replacements
    const replacements = [
      { casual: /\bhey\b/gi, formal: 'Hello' },
      { casual: /\bhi\b/gi, formal: 'Hello' },
      { casual: /\bwhat's up\b/gi, formal: 'how are you' },
      { casual: /\bhow you doing\b/gi, formal: 'how are you doing' },
      { casual: /\byeah\b/gi, formal: 'yes' },
      { casual: /\bnah\b/gi, formal: 'no' },
      { casual: /\bgonna\b/gi, formal: 'going to' },
      { casual: /\bwanna\b/gi, formal: 'want to' },
      { casual: /\bkinda\b/gi, formal: 'somewhat' },
      { casual: /\bsorta\b/gi, formal: 'somewhat' },
      { casual: /\bdude\b/gi, formal: '' },
      { casual: /\bman\b(?=\s|$)/gi, formal: '' },
      { casual: /\bguys\b/gi, formal: 'everyone' }
    ];
    
    replacements.forEach(({ casual, formal }) => {
      improved = improved.replace(casual, formal);
    });
    
    // Clean up extra spaces
    improved = improved.replace(/\s+/g, ' ').trim();
    
    // Ensure proper capitalization at sentence starts
    improved = improved.replace(/(^|[.!?]\s+)([a-z])/g, (match, prefix, letter) => {
      return prefix + letter.toUpperCase();
    });
    
    return improved;
  }

  /**
   * Improve Spanish formality
   */
  private improveSpanishFormality(text: string): string {
    let improved = text;
    
    // Spanish casual to formal replacements
    const replacements = [
      { casual: /\bhola\b/gi, formal: 'Buenos días' }, // Context-dependent
      { casual: /\bqué tal\b/gi, formal: 'cómo está usted' },
      { casual: /\bvale\b/gi, formal: 'de acuerdo' },
      { casual: /\btío\b/gi, formal: '' },
      { casual: /\btía\b/gi, formal: '' }
    ];
    
    replacements.forEach(({ casual, formal }) => {
      improved = improved.replace(casual, formal);
    });
    
    return improved.replace(/\s+/g, ' ').trim();
  }

  /**
   * Improve Haitian Creole formality
   */
  private improveHaitianCreoleFormality(text: string): string {
    let improved = text;
    
    // Haitian Creole casual to formal replacements
    const replacements = [
      { casual: /\bsak pase\b/gi, formal: 'kijan ou ye' },
      { casual: /\bwi\b/gi, formal: 'wi, mèsi' }
    ];
    
    replacements.forEach(({ casual, formal }) => {
      improved = improved.replace(casual, formal);
    });
    
    return improved.replace(/\s+/g, ' ').trim();
  }

  /**
   * Quick translation with default enhancement
   */
  async quickTranslate(text: string, sourceLang: string, targetLang: string, tone: string = 'business'): Promise<string> {
    const result = await this.translateWithEnhancement({
      text,
      sourceLang,
      targetLang,
      tone,
      enhanceFormality: true
    });
    
    return result.enhancedTranslation;
  }
}

// Singleton instance
let enhancedTranslationService: EnhancedTranslationService | null = null;

/**
 * Get the singleton enhanced translation service
 */
export function getEnhancedTranslationService(): EnhancedTranslationService {
  if (!enhancedTranslationService) {
    enhancedTranslationService = new EnhancedTranslationService();
  }
  return enhancedTranslationService;
}

/**
 * Quick enhanced translation function
 */
export async function translateWithFormality(
  text: string, 
  sourceLang: string, 
  targetLang: string, 
  tone: string = 'business',
  userTier: 'free' | 'paid-uncensored' = 'free'
): Promise<EnhancedTranslationResult> {
  const service = getEnhancedTranslationService();
  return service.translateWithEnhancement({
    text,
    sourceLang,
    targetLang,
    tone,
    enhanceFormality: true,
    preserveOriginal: true,
    userTier
  });
}
