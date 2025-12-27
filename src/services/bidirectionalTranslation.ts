import { translateText as originalTranslateText } from './api';
import { TranslationResponse } from '../types';

export interface BidirectionalTranslationOptions {
  text: string;
  direction: 'to-english' | 'from-english';
  language: string; // The non-English language
  tone: string;
  userTier?: 'free' | 'paid-uncensored';
  provider?: 'openai' | 'nllb';
}

export interface BidirectionalTranslationResult extends TranslationResponse {
  direction: 'to-english' | 'from-english';
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * Language name mapping
 */
const languageNames = {
  'ht': 'Haitian Creole',
  'es': 'Spanish',
  'en': 'English'
};

/**
 * Get the appropriate translation prompt based on direction
 */
function getTranslationPrompt(
  direction: 'to-english' | 'from-english',
  language: string,
  tone: string
): string {
  const sourceLanguageName = direction === 'to-english' ? languageNames[language as keyof typeof languageNames] : 'English';
  const targetLanguageName = direction === 'to-english' ? 'English' : languageNames[language as keyof typeof languageNames];

  if (direction === 'to-english') {
    // Translate FROM Haitian Creole/Spanish TO English
    return `You are a professional translator. Translate the following ${sourceLanguageName} text to formal, professional English.

Instructions:
- Apply proper grammar and punctuation
- Use ${tone.toLowerCase()} tone
- Recognize colloquialisms and slang
- Maintain the emotional tone of the message
- Make the translation sound natural and fluent in English

${sourceLanguageName} text to translate:
`;
  } else {
    // Translate FROM English TO Haitian Creole/Spanish
    return `You are a professional translator. Translate the following English text to natural, fluent ${targetLanguageName}.

Instructions:
- Use natural ${targetLanguageName} expressions and idioms
- Maintain proper grammar in ${targetLanguageName}
- Keep the ${tone.toLowerCase()} tone
- Make it sound like a native speaker wrote it
- Do NOT translate proper names
- Use appropriate cultural context for ${targetLanguageName}

English text to translate:
`;
  }
}

/**
 * Get tone-specific instructions
 */
function getToneInstructions(tone: string): string {
  const toneInstructions = {
    casual: 'Use warm, approachable language while maintaining professionalism. Include friendly but appropriate expressions.',
    business: 'Use formal business language and terminology. Maintain professional distance and respect.',
    formal: 'Use the highest level of formal language. Employ sophisticated vocabulary and complex sentence structures.',
    informal: 'Keep language relaxed but still grammatically correct. Use everyday vocabulary while maintaining clarity.',
    medical: 'Use precise medical and healthcare terminology. Maintain professional medical communication standards.'
  };

  return toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.business;
}

/**
 * Perform bidirectional translation
 */
export async function translateBidirectional(
  options: BidirectionalTranslationOptions
): Promise<BidirectionalTranslationResult> {
  const {
    text,
    direction,
    language,
    tone,
    userTier = 'free',
    provider = 'openai'
  } = options;

  console.log('🔄 [BIDIRECTIONAL TRANSLATION] Starting translation...');
  console.log(`   - Direction: ${direction}`);
  console.log(`   - Language: ${language}`);
  console.log(`   - Tone: ${tone}`);
  console.log(`   - Provider: ${provider}`);
  console.log(`   - Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

  // Determine source and target languages
  const sourceLanguage = direction === 'to-english' ? language : 'en';
  const targetLanguage = direction === 'to-english' ? 'en' : language;

  // Get the appropriate prompt
  const basePrompt = getTranslationPrompt(direction, language, tone);
  const toneInstructions = getToneInstructions(tone);
  const fullPrompt = `${basePrompt}

TONE REQUIREMENTS:
${toneInstructions}

"${text}"

Provide ONLY the ${direction === 'to-english' ? 'English' : languageNames[language as keyof typeof languageNames]} translation. No explanations or notes.`;

  try {
    // For NLLB: Send only the raw text (no prompts)
    // For OpenAI: Use the full prompt for better quality
    const textToTranslate = provider === 'nllb' ? text : fullPrompt;

    const result = await originalTranslateText(
      textToTranslate,
      sourceLanguage,
      targetLanguage,
      tone,
      userTier,
      provider
    );

    const bidirectionalResult: BidirectionalTranslationResult = {
      ...result,
      direction,
      sourceLanguage,
      targetLanguage
    };

    console.log('✅ [BIDIRECTIONAL TRANSLATION] Translation completed');
    console.log(`   - Source: ${sourceLanguage} → Target: ${targetLanguage}`);
    console.log(`   - Result: ${result.translation.substring(0, 50)}...`);

    return bidirectionalResult;

  } catch (error) {
    console.error('❌ [BIDIRECTIONAL TRANSLATION] Translation failed:', error);
    throw error;
  }
}

/**
 * Quick bidirectional translation function
 */
export async function quickBidirectionalTranslate(
  text: string,
  direction: 'to-english' | 'from-english',
  language: string,
  tone: string = 'business'
): Promise<string> {
  const result = await translateBidirectional({
    text,
    direction,
    language,
    tone
  });
  
  return result.translation;
}
