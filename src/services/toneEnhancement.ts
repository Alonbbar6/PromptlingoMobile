// Tone Enhancement Service for Text-to-Speech
// Transforms text to match different speaking tones and styles

import { sanitizeInput } from '../utils/contentFilter';

export interface ToneOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  example: string;
}

export interface ToneEnhancementResult {
  originalText: string;
  enhancedText: string;
  toneApplied: string;
  transformationsApplied: string[];
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
 * Tone Enhancement Service for transforming text before TTS
 */
export class ToneEnhancementService {
  
  /**
   * Get AI prompt for tone transformation
   */
  private getTonePrompt(tone: string, text: string): string {
    const toneOption = TONE_OPTIONS.find(t => t.id === tone);
    const toneName = toneOption?.name || tone;
    
    return `You are a text enhancement assistant specializing in tone transformation for speech synthesis.

TASK: Rewrite the following text to match the specified tone while preserving the core message and meaning.

TARGET TONE: ${toneName}

TONE-SPECIFIC GUIDELINES:
${this.getToneGuidelines(tone)}

GENERAL RULES:
- Preserve the original meaning completely
- Maintain the same information and intent
- Keep the text length reasonable for speech
- Use natural, speakable language
- Avoid overly complex or pretentious wording
- Ensure the result flows well when spoken aloud

ORIGINAL TEXT: "${text}"

Provide ONLY the rewritten text with the specified tone. No explanations, quotes, or additional commentary.`;
  }

  /**
   * Get specific guidelines for each tone
   */
  private getToneGuidelines(tone: string): string {
    const guidelines = {
      professional: `
- Use formal business language and complete sentences
- Replace casual expressions with professional equivalents
- Add appropriate business courtesy phrases
- Use precise, clear vocabulary
- Maintain respectful and dignified tone
- Structure sentences for clarity and authority`,

      friendly: `
- Add warmth and approachability to the language
- Use conversational connectors and transitions
- Include friendly expressions and positive language
- Use contractions naturally (I'll, you'll, we'll)
- Add welcoming phrases and inclusive language
- Keep tone upbeat but not overly casual`,

      enthusiastic: `
- Add energetic vocabulary and positive expressions
- Use exclamation points strategically (but not excessively)
- Include words that convey excitement and energy
- Add superlatives and positive adjectives
- Use dynamic verbs and action-oriented language
- Convey genuine excitement about the topic`,

      calm: `
- Use gentle, soothing language and soft expressions
- Add reassuring phrases and calming words
- Use slower-paced sentence structures
- Include words that convey peace and tranquility
- Avoid harsh or abrupt language
- Create a sense of comfort and ease`,

      authoritative: `
- Use strong, decisive language and direct statements
- Replace tentative language with confident assertions
- Add commanding vocabulary and leadership phrases
- Use active voice and powerful verbs
- Structure sentences for maximum impact
- Convey expertise and control over the subject`
    };

    return guidelines[tone as keyof typeof guidelines] || guidelines.professional;
  }

  /**
   * Apply rule-based tone transformation (fallback method)
   */
  private applyRuleBasedToneTransformation(text: string, tone: string): ToneEnhancementResult {
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
      originalText: text,
      enhancedText: enhanced.trim(),
      toneApplied: tone,
      transformationsApplied: transformations
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
      { from: /\bwhats up\b/gi, to: 'how are you', desc: 'Casual inquiry → Professional inquiry' },
      { from: /\byeah\b/gi, to: 'yes', desc: 'Casual affirmation → Professional affirmation' },
      { from: /\bnah\b/gi, to: 'no', desc: 'Casual negation → Professional negation' },
      { from: /\bgonna\b/gi, to: 'going to', desc: 'Contraction → Full form' },
      { from: /\bwanna\b/gi, to: 'would like to', desc: 'Casual desire → Professional expression' },
      { from: /\bkinda\b/gi, to: 'somewhat', desc: 'Casual qualifier → Professional qualifier' },
      { from: /\bthanks\b/gi, to: 'thank you', desc: 'Casual thanks → Professional thanks' },
      { from: /\bdude\b/gi, to: '', desc: 'Removed casual address' },
      { from: /\bman\b(?=\s|$)/gi, to: '', desc: 'Removed casual address' },
      { from: /\bwhat is going on\b/gi, to: 'what is happening', desc: 'Casual inquiry → Professional inquiry' },
      { from: /\bgoing on\b/gi, to: 'happening', desc: 'Casual expression → Professional expression' },
      { from: /\bis crazy\b/gi, to: 'is quite unusual', desc: 'Casual expression → Professional expression' },
      { from: /\bis nuts\b/gi, to: 'is quite unusual', desc: 'Casual expression → Professional expression' },
      { from: /\bis wild\b/gi, to: 'is quite remarkable', desc: 'Casual expression → Professional expression' }
    ];

    replacements.forEach(({ from, to, desc }) => {
      if (from.test(enhanced)) {
        enhanced = enhanced.replace(from, to);
        transformations.push(desc);
      }
    });

    // Clean up extra spaces and punctuation
    enhanced = enhanced.replace(/\s+/g, ' ').trim();
    enhanced = enhanced.replace(/\s+\./g, '.');
    enhanced = enhanced.replace(/\.\s*\./g, '.');

    // Add professional courtesy if needed
    if (!enhanced.match(/^(Hello|Good morning|Good afternoon|Good evening)/i)) {
      enhanced = 'Hello. ' + enhanced;
      transformations.push('Added professional greeting');
    }

    // Ensure proper sentence structure
    if (enhanced && !enhanced.match(/[.!?]$/)) {
      enhanced += '.';
      transformations.push('Added proper sentence ending');
    }

    // Convert to proper case for first letter after periods
    enhanced = enhanced.replace(/(\. )([a-z])/g, (match, period, letter) => period + letter.toUpperCase());

    return enhanced;
  }

  /**
   * Apply friendly tone transformations
   */
  private applyFriendlyTone(text: string, transformations: string[]): string {
    let enhanced = text;

    // Add friendly connectors
    if (!enhanced.match(/^(Hi|Hello|Hey)/i)) {
      enhanced = 'Hi there! ' + enhanced;
      transformations.push('Added friendly greeting');
    }

    // Add friendly expressions
    enhanced = enhanced.replace(/\bI want to\b/gi, 'I\'d love to');
    enhanced = enhanced.replace(/\bI need to\b/gi, 'I\'d like to');
    enhanced = enhanced.replace(/\bWe should\b/gi, 'We could');

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
    enhanced = enhanced.replace(/\bokay\b/gi, 'perfect');

    // Add exclamation for enthusiasm (but not too many)
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
    enhanced = enhanced.replace(/\bmust\b/gi, 'should');

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
    enhanced = enhanced.replace(/\bshould\b/gi, 'must');

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
    
    // Remove empty words
    cleaned = cleaned.replace(/\s+\.\s+/g, '. ');
    cleaned = cleaned.replace(/\s+,\s+/g, ', ');
    
    // Ensure proper sentence ending
    if (cleaned && !cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }
    
    return cleaned;
  }

  /**
   * Enhance text with specified tone (main method)
   */
  async enhanceTextWithTone(text: string, tone: string): Promise<ToneEnhancementResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for tone enhancement');
    }

    console.log('🎭 Enhancing text with tone:', tone);
    console.log('🎭 Original text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));

    try {
      // STEP 1: Apply content filtering FIRST (remove profanity and normalize slang)
      console.log('🛡️ Applying content filter...');
      const { filteredText, wasFiltered, detectedIssues } = sanitizeInput(text, 'free');
      
      if (wasFiltered) {
        console.log('🛡️ Content was filtered:', detectedIssues);
      }
      
      console.log('🛡️ Sanitized text:', filteredText.substring(0, 100) + (filteredText.length > 100 ? '...' : ''));
      
      // STEP 2: Apply tone transformation to the sanitized text
      const result = this.applyRuleBasedToneTransformation(filteredText, tone);
      
      // STEP 3: Clean up the enhanced text
      result.enhancedText = this.cleanupEnhancedText(result.enhancedText);
      
      // STEP 4: Update result to show original text but use sanitized for processing
      result.originalText = text; // Keep original for display
      
      // Add content filtering info to transformations
      if (wasFiltered) {
        result.transformationsApplied.unshift(`Content filtered: ${detectedIssues.join(', ')}`);
      }
      
      console.log('✅ Tone enhancement completed');
      console.log('🎭 Enhanced text:', result.enhancedText.substring(0, 100) + (result.enhancedText.length > 100 ? '...' : ''));
      console.log('🎭 Transformations applied:', result.transformationsApplied);
      
      return result;

    } catch (error) {
      console.error('❌ Tone enhancement failed:', error);
      
      // Fallback: return original text
      return {
        originalText: text,
        enhancedText: text,
        toneApplied: tone,
        transformationsApplied: ['Fallback: No transformations applied due to error']
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

  /**
   * Preview tone transformation without applying
   */
  async previewToneTransformation(text: string, tone: string): Promise<ToneEnhancementResult> {
    return this.enhanceTextWithTone(text, tone);
  }
}

// Singleton instance
let toneEnhancementService: ToneEnhancementService | null = null;

/**
 * Get the singleton tone enhancement service
 */
export function getToneEnhancementService(): ToneEnhancementService {
  if (!toneEnhancementService) {
    toneEnhancementService = new ToneEnhancementService();
  }
  return toneEnhancementService;
}

/**
 * Quick tone enhancement function
 */
export async function enhanceTextWithTone(text: string, tone: string): Promise<ToneEnhancementResult> {
  const service = getToneEnhancementService();
  return service.enhanceTextWithTone(text, tone);
}

/**
 * Get all available tone options
 */
export function getAvailableTones(): ToneOption[] {
  return TONE_OPTIONS;
}
