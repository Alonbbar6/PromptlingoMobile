/**
 * Language Configuration
 * Defines supported languages with detailed translation prompts and cultural context
 */

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  translationPrompt: string;
  culturalContext: string;
  grammarRules: string[];
  toneGuidelines: {
    professional: string;
    friendly: string;
    enthusiastic: string;
    calm: string;
    authoritative: string;
  };
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    translationPrompt: 'Translate and enhance the following text to natural, fluent English.',
    culturalContext: 'Use American English conventions with clear, direct communication.',
    grammarRules: [
      'Use proper subject-verb agreement',
      'Maintain consistent tense throughout',
      'Use articles (a, an, the) appropriately',
      'Follow standard punctuation rules'
    ],
    toneGuidelines: {
      professional: 'Use formal business English with complete sentences and professional courtesy',
      friendly: 'Use warm, conversational English with natural contractions',
      enthusiastic: 'Use energetic vocabulary with positive expressions',
      calm: 'Use gentle, reassuring language with soft expressions',
      authoritative: 'Use strong, decisive language with confident assertions'
    }
  },

  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    translationPrompt: `Translate and enhance the following text to natural, fluent Spanish.
CRITICAL: Your response must be ENTIRELY in Spanish. Do not include any English words or phrases.
Use proper Spanish grammar, accents, and punctuation (¿? ¡!).`,
    culturalContext: 'Use Latin American Spanish conventions with appropriate formality levels (tú/usted).',
    grammarRules: [
      'Use proper gender agreement (masculine/feminine)',
      'Apply correct verb conjugations for tense and person',
      'Use inverted question marks (¿?) and exclamation marks (¡!)',
      'Include proper accent marks (á, é, í, ó, ú, ñ)',
      'Use appropriate articles (el, la, los, las, un, una)',
      'Follow Spanish word order (adjectives typically after nouns)'
    ],
    toneGuidelines: {
      professional: 'Use formal "usted" form with professional courtesy phrases like "Buenos días", "Le saluda atentamente"',
      friendly: 'Use informal "tú" form with warm expressions like "¡Hola!", "¿Qué tal?"',
      enthusiastic: 'Use energetic expressions like "¡Qué emocionante!", "¡Fantástico!", "¡Increíble!"',
      calm: 'Use gentle phrases like "Con calma", "Tranquilamente", "Sin prisa"',
      authoritative: 'Use commanding language with strong verbs and direct statements'
    }
  },

  ht: {
    code: 'ht',
    name: 'Haitian Creole',
    nativeName: 'Kreyòl Ayisyen',
    flag: '🇭🇹',
    translationPrompt: `Translate and enhance the following text to natural, fluent Haitian Creole (Kreyòl Ayisyen).
CRITICAL: Your response must be ENTIRELY in Haitian Creole. Do not include any English, French, or other language words.
Use proper Kreyòl orthography and grammar as standardized by the Haitian Academy.`,
    culturalContext: 'Use authentic Haitian Creole expressions with appropriate cultural references and respect for Haitian communication styles.',
    grammarRules: [
      'Use proper Kreyòl orthography (not French-based spelling)',
      'Apply correct verb markers (ap, te, pral, etc.)',
      'Use proper pronouns (mwen, ou, li, nou, yo)',
      'Follow Kreyòl word order (subject-verb-object)',
      'Use appropriate particles (a, la, yo for definiteness)',
      'Include proper negation (pa, pat, pap)'
    ],
    toneGuidelines: {
      professional: 'Use respectful Kreyòl with formal greetings like "Bonjou", "Bonswa", "Mèsi anpil"',
      friendly: 'Use warm Kreyòl expressions like "Kijan ou ye?", "Sa k ap fèt?", "Zanmi mwen"',
      enthusiastic: 'Use energetic Kreyòl like "Ekselan!", "Bèl bagay!", "Mwen kontan anpil!"',
      calm: 'Use gentle Kreyòl phrases like "Dousman", "Ak kalm", "Pa prese"',
      authoritative: 'Use strong Kreyòl with commanding verbs and direct statements'
    }
  },

  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    translationPrompt: `Translate and enhance the following text to natural, fluent French.
CRITICAL: Your response must be ENTIRELY in French. Do not include any English words.
Use proper French grammar, accents, and punctuation.`,
    culturalContext: 'Use standard French with appropriate formality levels (tu/vous).',
    grammarRules: [
      'Use proper gender agreement (masculine/feminine)',
      'Apply correct verb conjugations',
      'Include proper accent marks (é, è, ê, à, ù, ç)',
      'Use appropriate articles (le, la, les, un, une, des)',
      'Follow French word order and liaison rules'
    ],
    toneGuidelines: {
      professional: 'Use formal "vous" with professional courtesy like "Bonjour", "Cordialement"',
      friendly: 'Use informal "tu" with warm expressions like "Salut!", "Ça va?"',
      enthusiastic: 'Use energetic expressions like "Formidable!", "Génial!", "Fantastique!"',
      calm: 'Use gentle phrases like "Calmement", "Doucement", "Sans hâte"',
      authoritative: 'Use commanding language with strong verbs and direct statements'
    }
  },

  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    translationPrompt: `Translate and enhance the following text to natural, fluent Portuguese (Brazilian).
CRITICAL: Your response must be ENTIRELY in Portuguese. Do not include any English words.
Use proper Portuguese grammar and accents.`,
    culturalContext: 'Use Brazilian Portuguese conventions with appropriate formality.',
    grammarRules: [
      'Use proper gender agreement',
      'Apply correct verb conjugations',
      'Include proper accent marks (á, â, ã, é, ê, í, ó, ô, õ, ú, ç)',
      'Use appropriate articles (o, a, os, as, um, uma)',
      'Follow Portuguese word order'
    ],
    toneGuidelines: {
      professional: 'Use formal "você" or "senhor/senhora" with professional courtesy',
      friendly: 'Use informal "você" with warm expressions like "Oi!", "Tudo bem?"',
      enthusiastic: 'Use energetic expressions like "Que legal!", "Incrível!", "Maravilhoso!"',
      calm: 'Use gentle phrases like "Com calma", "Tranquilamente", "Sem pressa"',
      authoritative: 'Use commanding language with strong verbs'
    }
  },

  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    translationPrompt: `Translate and enhance the following text to natural, fluent German.
CRITICAL: Your response must be ENTIRELY in German. Do not include any English words.
Use proper German grammar, capitalization, and umlauts.`,
    culturalContext: 'Use standard German with appropriate formality (du/Sie).',
    grammarRules: [
      'Capitalize all nouns',
      'Use proper gender (der, die, das)',
      'Apply correct case endings (nominative, accusative, dative, genitive)',
      'Include umlauts (ä, ö, ü) and ß where appropriate',
      'Follow German word order rules'
    ],
    toneGuidelines: {
      professional: 'Use formal "Sie" with professional courtesy like "Guten Tag", "Mit freundlichen Grüßen"',
      friendly: 'Use informal "du" with warm expressions like "Hallo!", "Wie geht\'s?"',
      enthusiastic: 'Use energetic expressions like "Fantastisch!", "Toll!", "Wunderbar!"',
      calm: 'Use gentle phrases like "Ruhig", "Gelassen", "Ohne Eile"',
      authoritative: 'Use commanding language with strong verbs'
    }
  }
};

/**
 * Get language configuration by code
 */
export function getLanguageConfig(code: string): LanguageConfig | undefined {
  return SUPPORTED_LANGUAGES[code];
}

/**
 * Get all supported language codes
 */
export function getSupportedLanguageCodes(): string[] {
  return Object.keys(SUPPORTED_LANGUAGES);
}

/**
 * Get language display name with flag
 */
export function getLanguageDisplayName(code: string): string {
  const config = getLanguageConfig(code);
  if (!config) return code;
  return `${config.flag} ${config.nativeName}`;
}

/**
 * Validate if language is supported
 */
export function isLanguageSupported(code: string): boolean {
  return code in SUPPORTED_LANGUAGES;
}
