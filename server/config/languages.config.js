/**
 * Language Configuration for Backend Translation
 * Defines supported languages with detailed translation prompts and cultural context
 */

const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    translationPrompt: 'Translate the following text to natural, fluent English while adjusting the tone as specified. PRESERVE THE EXACT MEANING AND INTENT: If the speaker is asking a question, keep it as a question. If making a statement, keep it as a statement. Only change the formality/tone, NOT the message content or purpose.',
    culturalContext: 'Use American English conventions with clear, direct communication.',
    grammarRules: [
      'Use proper subject-verb agreement',
      'Maintain consistent tense throughout',
      'Use articles (a, an, the) appropriately',
      'Follow standard punctuation rules',
      'Maintain the speaker\'s perspective: if they say "yo" (I), use "I"; if "tú" (you), use "you"'
    ]
  },

  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    translationPrompt: `Translate the following text to natural, fluent Spanish while adjusting the tone as specified.
CRITICAL: Your response must be ENTIRELY in Spanish. Do not include any English words or phrases.
Use proper Spanish grammar, accents, and punctuation (¿? ¡!).
PRESERVE THE EXACT MEANING AND INTENT: If the speaker is asking a question, keep it as a question. If making a statement, keep it as a statement. Only change the formality/tone, NOT the message content or purpose.
PRESERVE PERSPECTIVE: Keep the same point of view (yo/I, tú/you, él-ella/he-she) as the original speaker.`,
    culturalContext: 'Use Latin American Spanish conventions with appropriate formality levels (tú/usted).',
    grammarRules: [
      'Use proper gender agreement (masculine/feminine)',
      'Apply correct verb conjugations for tense and person',
      'Use inverted question marks (¿?) and exclamation marks (¡!)',
      'Include proper accent marks (á, é, í, ó, ú, ñ)',
      'Use appropriate articles (el, la, los, las, un, una)',
      'Follow Spanish word order (adjectives typically after nouns)',
      'Maintain the speaker\'s perspective: if they say "I", use "yo" forms; if "you", use "tú/usted" forms'
    ]
  },

  ht: {
    code: 'ht',
    name: 'Haitian Creole',
    nativeName: 'Kreyòl Ayisyen',
    flag: '🇭🇹',
    translationPrompt: `Translate the following text to natural, fluent Haitian Creole (Kreyòl Ayisyen) while adjusting the tone as specified.
CRITICAL: Your response must be ENTIRELY in Haitian Creole. Do not include any English, French, or other language words.
Use proper Kreyòl orthography and grammar as standardized by the Haitian Academy.
PRESERVE THE EXACT MEANING AND INTENT: If the speaker is asking a question, keep it as a question. If making a statement, keep it as a statement. Only change the formality/tone, NOT the message content or purpose.
PRESERVE PERSPECTIVE: Keep the same point of view (mwen/I, ou/you, li/he-she) as the original speaker.`,
    culturalContext: 'Use authentic Haitian Creole expressions with appropriate cultural references and respect for Haitian communication styles.',
    grammarRules: [
      'Use proper Kreyòl orthography (not French-based spelling)',
      'Apply correct verb markers (ap, te, pral, etc.)',
      'Use proper pronouns (mwen, ou, li, nou, yo)',
      'Follow Kreyòl word order (subject-verb-object)',
      'Use appropriate particles (a, la, yo for definiteness)',
      'Include proper negation (pa, pat, pap)',
      'Maintain the speaker\'s perspective: if they say "I", use "mwen"; if "you", use "ou"'
    ]
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
    ]
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
    ]
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
    ]
  }
};

/**
 * Get language configuration by code
 */
function getLanguageConfig(code) {
  return SUPPORTED_LANGUAGES[code];
}

/**
 * Get all supported language codes
 */
function getSupportedLanguageCodes() {
  return Object.keys(SUPPORTED_LANGUAGES);
}

/**
 * Validate if language is supported
 */
function isLanguageSupported(code) {
  return code in SUPPORTED_LANGUAGES;
}

/**
 * Get translation system prompt for a specific language and tone
 */
function getTranslationPrompt(sourceLang, targetLang, tone) {
  const targetConfig = getLanguageConfig(targetLang);
  const sourceConfig = getLanguageConfig(sourceLang);

  if (!targetConfig || !sourceConfig) {
    throw new Error(`Unsupported language: ${!sourceConfig ? sourceLang : targetLang}`);
  }

  const toneInstructions = getToneInstructions(tone, targetLang);

  return `You are a professional translator specializing in ${sourceConfig.name} to ${targetConfig.name} translation.

IMPORTANT: You are a TRANSLATOR, not a conversational AI. Do NOT respond to questions, do NOT provide answers, do NOT engage in conversation. Your ONLY job is to translate and adjust tone.

${targetConfig.translationPrompt}

CULTURAL CONTEXT:
${targetConfig.culturalContext}

GRAMMAR REQUIREMENTS:
${targetConfig.grammarRules.map(rule => `- ${rule}`).join('\n')}

TONE REQUIREMENTS:
${toneInstructions}

CRITICAL RULES - READ CAREFULLY:
1. Your ENTIRE response must be in ${targetConfig.nativeName} (${targetConfig.name})
2. Do NOT include ANY words from ${sourceConfig.name} or any other language
3. Do NOT add explanations, notes, or commentary
4. Provide ONLY the translated text with adjusted tone
5. Ensure the translation sounds natural to native ${targetConfig.name} speakers
6. Maintain the EXACT meaning and intent of the original text
7. Apply the specified tone throughout the translation
8. PRESERVE THE SPEAKER'S PERSPECTIVE: If the original uses "I" (first person), translate with "I". If it uses "you" (second person), translate with "you". Do NOT change the point of view or perspective of the speaker
9. ⚠️ CRITICAL: If the input is a QUESTION, your output MUST be a QUESTION. If the input is a STATEMENT, your output MUST be a STATEMENT. Do NOT convert questions into answers or statements into questions.
10. ⚠️ DO NOT RESPOND TO THE USER - You are translating their words, not having a conversation with them

EXAMPLES OF WHAT NOT TO DO:
❌ Input: "Can you help me?" → Output: "Sure, I can help!" (This is WRONG - you responded instead of translating)
✅ Input: "Can you help me?" → Output: "Could you please assist me?" (This is CORRECT - same question, adjusted tone)

❌ Input: "I'm feeling sick" → Output: "You should see a doctor" (This is WRONG - you gave advice instead of translating)
✅ Input: "I'm feeling sick" → Output: "I am experiencing illness" (This is CORRECT - same statement, adjusted tone)

Translate the following text with the specified tone. Remember: DO NOT RESPOND, ONLY TRANSLATE AND ADJUST TONE:`;
}

/**
 * Get tone-specific instructions for a language
 */
function getToneInstructions(tone, targetLang) {
  const toneMap = {
    professional: {
      en: 'Use formal business English with complete sentences and professional courtesy',
      es: 'Use formal "usted" form with professional courtesy phrases like "Buenos días", "Le saluda atentamente"',
      ht: 'Use respectful Kreyòl with formal greetings like "Bonjou", "Bonswa", "Mèsi anpil"',
      fr: 'Use formal "vous" with professional courtesy like "Bonjour", "Cordialement"',
      pt: 'Use formal "você" or "senhor/senhora" with professional courtesy',
      de: 'Use formal "Sie" with professional courtesy like "Guten Tag", "Mit freundlichen Grüßen"'
    },
    friendly: {
      en: 'Use warm, conversational English with natural contractions',
      es: 'Use informal "tú" form with warm expressions like "¡Hola!", "¿Qué tal?"',
      ht: 'Use warm Kreyòl expressions like "Kijan ou ye?", "Sa k ap fèt?", "Zanmi mwen"',
      fr: 'Use informal "tu" with warm expressions like "Salut!", "Ça va?"',
      pt: 'Use informal "você" with warm expressions like "Oi!", "Tudo bem?"',
      de: 'Use informal "du" with warm expressions like "Hallo!", "Wie geht\'s?"'
    },
    enthusiastic: {
      en: 'Use energetic vocabulary with positive expressions',
      es: 'Use energetic expressions like "¡Qué emocionante!", "¡Fantástico!", "¡Increíble!"',
      ht: 'Use energetic Kreyòl like "Ekselan!", "Bèl bagay!", "Mwen kontan anpil!"',
      fr: 'Use energetic expressions like "Formidable!", "Génial!", "Fantastique!"',
      pt: 'Use energetic expressions like "Que legal!", "Incrível!", "Maravilhoso!"',
      de: 'Use energetic expressions like "Fantastisch!", "Toll!", "Wunderbar!"'
    },
    calm: {
      en: 'Use gentle, reassuring language with soft expressions',
      es: 'Use gentle phrases like "Con calma", "Tranquilamente", "Sin prisa"',
      ht: 'Use gentle Kreyòl phrases like "Dousman", "Ak kalm", "Pa prese"',
      fr: 'Use gentle phrases like "Calmement", "Doucement", "Sans hâte"',
      pt: 'Use gentle phrases like "Com calma", "Tranquilamente", "Sem pressa"',
      de: 'Use gentle phrases like "Ruhig", "Gelassen", "Ohne Eile"'
    },
    authoritative: {
      en: 'Use strong, decisive language with confident assertions',
      es: 'Use commanding language with strong verbs and direct statements',
      ht: 'Use strong Kreyòl with commanding verbs and direct statements',
      fr: 'Use commanding language with strong verbs and direct statements',
      pt: 'Use commanding language with strong verbs',
      de: 'Use commanding language with strong verbs'
    },
    casual: {
      en: 'Use everyday language, contractions welcome, relaxed vocabulary',
      es: 'Use informal "tú" form with everyday expressions',
      ht: 'Use everyday Kreyòl with natural, relaxed expressions',
      fr: 'Use informal "tu" with everyday expressions',
      pt: 'Use informal "você" with everyday expressions',
      de: 'Use informal "du" with everyday expressions'
    },
    neutral: {
      en: 'Use clear, straightforward language without specific tone emphasis',
      es: 'Use neutral Spanish with balanced formality',
      ht: 'Use standard Kreyòl with balanced formality',
      fr: 'Use neutral French with balanced formality',
      pt: 'Use neutral Portuguese with balanced formality',
      de: 'Use neutral German with balanced formality'
    }
  };

  const toneInstructions = toneMap[tone] || toneMap.neutral;
  return toneInstructions[targetLang] || toneInstructions.en;
}

module.exports = {
  SUPPORTED_LANGUAGES,
  getLanguageConfig,
  getSupportedLanguageCodes,
  isLanguageSupported,
  getTranslationPrompt,
  getToneInstructions
};
