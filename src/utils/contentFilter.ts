/**
 * Content Filtering & Intelligent Sanitization System
 * 
 * This module provides client-side content filtering to prevent "Content Policy Blocked" errors
 * by sanitizing inappropriate content BEFORE sending to AI APIs.
 */

// Profanity detection and replacement mappings
const profanityList = [
  // F-word variants (most common)
  'fuck', 'f*ck', 'f**k', 'fck', 'fuk', 'f***', 'f****',
  'fucking', 'f*cking', 'f**king', 'fcking', 'fuking',
  'fucker', 'f*cker', 'f**ker', 'fcker',
  'fucked', 'f*cked', 'f**ked', 'fcked',
  
  // S-word variants
  'shit', 'sh*t', 'sh1t', 'sht', 's**t', 'shite', 'shitty',
  
  // Common mild profanity
  'damn', 'd*mn', 'd**n', 'dang', 'darn',
  'hell', 'h*ll', 'h**l', 'heck',
  'crap', 'cr*p', 'cr**', 'crappy',
  
  // Body parts / insults
  'ass', 'a**', 'a$$', 'arse', 'asshole', 'a**hole',
  'bitch', 'b*tch', 'b1tch', 'btch', 'bitchy',
  'bastard', 'b*stard', 'b**tard',
  'dick', 'd*ck', 'd1ck',
  
  // Other profanity
  'piss', 'p*ss', 'p1ss', 'pissed', 'pissing',
  'wtf', 'what the f*ck', 'what the fuck', 'what the hell',
  'bullshit', 'bull shit', 'bs',
  'goddamn', 'god damn', 'goddam',
  
  // Additional common profanity
  'bloody', 'christ', 'jesus christ', 'motherfucker', 'son of a bitch'
];

// Replacement words that maintain emotional tone
const replacements: Record<string, string> = {
  // F-word replacements
  'fuck': '',
  'f*ck': '',
  'f**k': '',
  'fck': '',
  'fuk': '',
  'f***': '',
  'f****': '',
  'fucking': 'extremely',
  'f*cking': 'extremely',
  'f**king': 'extremely',
  'fcking': 'extremely',
  'fuking': 'extremely',
  'fucker': 'person',
  'f*cker': 'person',
  'f**ker': 'person',
  'fcker': 'person',
  'fucked': 'messed up',
  'f*cked': 'messed up',
  'f**ked': 'messed up',
  'fcked': 'messed up',
  
  // S-word replacements
  'shit': 'stuff',
  'sh*t': 'stuff',
  'sh1t': 'stuff',
  'sht': 'stuff',
  's**t': 'stuff',
  'shite': 'stuff',
  'shitty': 'poor quality',
  
  // Mild profanity
  'damn': 'very',
  'd*mn': 'very',
  'd**n': 'very',
  'dang': 'very',
  'darn': 'very',
  'hell': '',
  'h*ll': '',
  'h**l': '',
  'heck': '',
  'crap': 'nonsense',
  'cr*p': 'nonsense',
  'cr**': 'nonsense',
  'crappy': 'poor quality',
  
  // Body parts / insults
  'ass': 'jerk',
  'a**': 'jerk',
  'a$$': 'jerk',
  'arse': 'jerk',
  'asshole': 'difficult person',
  'a**hole': 'difficult person',
  'bitch': 'difficult person',
  'b*tch': 'difficult person',
  'b1tch': 'difficult person',
  'btch': 'difficult person',
  'bitchy': 'difficult',
  'bastard': 'person',
  'b*stard': 'person',
  'b**tard': 'person',
  'dick': 'difficult person',
  'd*ck': 'difficult person',
  'd1ck': 'difficult person',
  
  // Other profanity
  'piss': 'anger',
  'p*ss': 'anger',
  'p1ss': 'anger',
  'pissed': 'angry',
  'pissing': 'annoying',
  'wtf': 'what',
  'what the f*ck': 'what',
  'what the fuck': 'what',
  'what the hell': 'what',
  'bullshit': 'nonsense',
  'bull shit': 'nonsense',
  'bs': 'nonsense',
  'goddamn': 'very',
  'god damn': 'very',
  'goddam': 'very',
  
  // Additional profanity
  'bloody': 'very',
  'christ': '',
  'jesus christ': '',
  'motherfucker': 'person',
  'son of a bitch': 'difficult person'
};

// Slang terms and their formal equivalents
const slangMap: Record<string, string> = {
  // Greetings and casual expressions
  'yo': 'hello',
  'sup': 'hello',
  'wassup': 'hello',
  'whats up': 'hello',
  'what\'s up': 'hello',
  'whassup': 'hello',
  'hey yo': 'hello',
  'whatsup': 'hello',
  'sup yo': 'hello',
  'yo sup': 'hello',
  
  // Friend/person references
  'dawg': 'friend',
  'bro': 'friend',
  'bruh': 'friend',
  'dude': 'friend',
  'homie': 'friend',
  'buddy': 'friend',
  'pal': 'friend',
  'mate': 'friend',
  'man': 'friend',
  
  // Contractions and informal grammar
  'gonna': 'going to',
  'wanna': 'want to',
  'gotta': 'have to',
  'hafta': 'have to',
  'shoulda': 'should have',
  'coulda': 'could have',
  'woulda': 'would have',
  'gotcha': 'I understand',
  'lemme': 'let me',
  'gimme': 'give me',
  'dunno': 'do not know',
  'ain\'t': 'is not',
  'isn\'t': 'is not',
  'aren\'t': 'are not',
  'won\'t': 'will not',
  'can\'t': 'cannot',
  'don\'t': 'do not',
  'didn\'t': 'did not',
  'wouldn\'t': 'would not',
  'shouldn\'t': 'should not',
  'couldn\'t': 'could not',
  
  // Positive slang
  'lit': 'excellent',
  'fire': 'excellent',
  'sick': 'impressive',
  'dope': 'great',
  'cool': 'good',
  'awesome': 'excellent',
  'rad': 'great',
  'tight': 'good',
  'fresh': 'good',
  'banging': 'excellent',
  'bomb': 'excellent',
  'legit': 'legitimate',
  'solid': 'good',
  'mad': 'very',
  'hella': 'very',
  'super': 'very',
  'crazy': 'very',
  'insane': 'very',
  
  // Agreement/disagreement
  'yeah': 'yes',
  'yep': 'yes',
  'yup': 'yes',
  'uh-huh': 'yes',
  'nah': 'no',
  'nope': 'no',
  'uh-uh': 'no',
  
  // Other common slang
  'what\'s good': 'how are you',
  'whats good': 'how are you',
  'how you doing': 'how are you',
  'wassup with': 'what is happening with',
  'hit me up': 'contact me',
  'hit you up': 'contact you',
  'check it out': 'look at this',
  'for real': 'seriously',
  'no way': 'I disagree',
  'my bad': 'I apologize',
  'no worries': 'it is fine',
  'all good': 'everything is fine',
  'take it easy': 'goodbye',
  'catch you later': 'goodbye',
  'see ya': 'goodbye',
  'peace out': 'goodbye',
  'later': 'goodbye'
};

// Aggressive/rude phrases and their professional alternatives
const aggressiveMap: Record<string, string> = {
  'shut up': 'please stop',
  'shut the hell up': 'please stop',
  'shut your mouth': 'please stop talking',
  'get lost': 'please leave',
  'go away': 'please leave',
  'piss off': 'please leave',
  'screw you': 'I disagree with you',
  'screw that': 'I disagree with that',
  'whatever': 'I understand',
  'you suck': 'you are being difficult',
  'this sucks': 'this is problematic',
  'that sucks': 'that is unfortunate',
  'it sucks': 'it is disappointing',
  'you\'re stupid': 'you are mistaken',
  'that\'s stupid': 'that is not logical',
  'this is stupid': 'this is not logical',
  'you\'re crazy': 'you have an unusual perspective',
  'you\'re nuts': 'you have an unusual perspective',
  'you\'re insane': 'you have an unusual perspective'
};

export interface ContentFilterResult {
  isAppropriate: boolean;
  filteredText: string;
  detectedIssues: string[];
  severityLevel: 'none' | 'mild' | 'moderate' | 'severe';
  shouldBlock: boolean;
  wasFiltered: boolean;
}

/**
 * Filter profanity from text while preserving emotional tone
 */
export const filterProfanity = (text: string): {
  cleanedText: string;
  wasFiltered: boolean;
  detectedWords: string[];
} => {
  let cleanedText = text;
  const detectedWords: string[] = [];
  let wasFiltered = false;

  // Sort profanity list by length (longest first) to handle multi-word phrases correctly
  const sortedProfanity = [...profanityList].sort((a, b) => b.length - a.length);

  // Check each profanity word
  sortedProfanity.forEach(word => {
    // Escape special regex characters but handle asterisks specially
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '\\*');
    
    // Use word boundaries for single words, but not for phrases with spaces
    const hasSpaces = word.includes(' ');
    const regex = hasSpaces 
      ? new RegExp(`${escapedWord}`, 'gi')
      : new RegExp(`\\b${escapedWord}\\b`, 'gi');
    
    if (regex.test(cleanedText)) {
      wasFiltered = true;
      if (!detectedWords.includes(word)) {
        detectedWords.push(word);
      }
      
      // Get replacement
      const replacement = replacements[word.toLowerCase()] || '';
      cleanedText = cleanedText.replace(regex, replacement);
    }
  });

  // Clean up extra spaces after replacements
  cleanedText = cleanedText
    .replace(/\s+/g, ' ')  // Multiple spaces to single space
    .replace(/\s+([.!?])/g, '$1')  // Remove space before punctuation
    .replace(/([.!?])\s+/g, '$1 ')  // Ensure single space after punctuation
    .replace(/\s+(about|with|for|to|in|on|at)\s+/g, ' $1 ')  // Fix preposition spacing
    .trim();

  return {
    cleanedText,
    wasFiltered,
    detectedWords
  };
};

/**
 * Normalize slang terms to formal language
 */
export const normalizeSlang = (text: string): {
  normalizedText: string;
  wasNormalized: boolean;
  detectedSlang: string[];
} => {
  let normalizedText = text;
  const detectedSlang: string[] = [];
  let wasNormalized = false;
  
  // Sort by length (longest first) to handle multi-word phrases correctly
  const sortedSlang = Object.entries(slangMap).sort((a, b) => b[0].length - a[0].length);
  
  sortedSlang.forEach(([slang, formal]) => {
    const regex = new RegExp(`\\b${slang.replace(/'/g, "\\'")}\\b`, 'gi');
    
    if (regex.test(normalizedText)) {
      wasNormalized = true;
      detectedSlang.push(slang);
      normalizedText = normalizedText.replace(regex, formal);
    }
  });

  return {
    normalizedText,
    wasNormalized,
    detectedSlang
  };
};

/**
 * Filter aggressive or rude language
 */
export const filterAggressive = (text: string): {
  filteredText: string;
  wasFiltered: boolean;
  detectedPhrases: string[];
} => {
  let filteredText = text;
  const detectedPhrases: string[] = [];
  let wasFiltered = false;
  
  // Sort by length (longest first) to handle multi-word phrases correctly
  const sortedAggressive = Object.entries(aggressiveMap).sort((a, b) => b[0].length - a[0].length);
  
  sortedAggressive.forEach(([aggressive, polite]) => {
    const regex = new RegExp(`\\b${aggressive.replace(/'/g, "\\'")}\\b`, 'gi');
    
    if (regex.test(filteredText)) {
      wasFiltered = true;
      detectedPhrases.push(aggressive);
      filteredText = filteredText.replace(regex, polite);
    }
  });

  return {
    filteredText,
    wasFiltered,
    detectedPhrases
  };
};

/**
 * Detect severity level of inappropriate content
 */
const detectSeverityLevel = (text: string, detectedIssues: string[]): 'none' | 'mild' | 'moderate' | 'severe' => {
  if (detectedIssues.length === 0) return 'none';
  
  const lowerText = text.toLowerCase();
  
  // Severe violations (would block translation entirely)
  const severePatterns = [
    'kill yourself', 'kys', 'die', 'murder', 'rape', 'nazi', 'hitler',
    'terrorist', 'bomb', 'explosion', 'violence', 'hate', 'racist'
  ];
  
  if (severePatterns.some(pattern => lowerText.includes(pattern))) {
    return 'severe';
  }
  
  // Moderate violations (multiple profanity or aggressive language)
  if (detectedIssues.length >= 3 || detectedIssues.some(issue => 
    ['fuck', 'fucking', 'bitch', 'bastard'].includes(issue.toLowerCase())
  )) {
    return 'moderate';
  }
  
  // Mild violations (single profanity or slang)
  return 'mild';
};

/**
 * Main content sanitization function
 * Combines profanity filtering, slang normalization, and aggressive language filtering
 */
export const sanitizeInput = (text: string, userTier: 'free' | 'paid-uncensored' = 'free'): ContentFilterResult => {
  // If user has uncensored version, skip filtering
  if (userTier === 'paid-uncensored') {
    return {
      isAppropriate: true,
      filteredText: text,
      detectedIssues: [],
      severityLevel: 'none',
      shouldBlock: false,
      wasFiltered: false
    };
  }

  let processedText = text;
  const allDetectedIssues: string[] = [];
  let wasFiltered = false;

  // Step 1: Filter profanity
  const profanityResult = filterProfanity(processedText);
  if (profanityResult.wasFiltered) {
    processedText = profanityResult.cleanedText;
    allDetectedIssues.push(...profanityResult.detectedWords.map(word => `profanity: ${word}`));
    wasFiltered = true;
  }

  // Step 2: Filter aggressive language
  const aggressiveResult = filterAggressive(processedText);
  if (aggressiveResult.wasFiltered) {
    processedText = aggressiveResult.filteredText;
    allDetectedIssues.push(...aggressiveResult.detectedPhrases.map(phrase => `aggressive: ${phrase}`));
    wasFiltered = true;
  }

  // Step 3: Normalize slang
  const slangResult = normalizeSlang(processedText);
  if (slangResult.wasNormalized) {
    processedText = slangResult.normalizedText;
    allDetectedIssues.push(...slangResult.detectedSlang.map(slang => `slang: ${slang}`));
    wasFiltered = true;
  }

  // Step 4: Determine severity and whether to block
  const severityLevel = detectSeverityLevel(text, allDetectedIssues);
  const shouldBlock = severityLevel === 'severe';

  return {
    isAppropriate: severityLevel === 'none',
    filteredText: processedText,
    detectedIssues: allDetectedIssues,
    severityLevel,
    shouldBlock,
    wasFiltered
  };
};

/**
 * Quick profanity check without full sanitization
 */
export const containsProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => {
    const regex = new RegExp(`\\b${word.replace(/\*/g, '\\*')}\\b`, 'i');
    return regex.test(lowerText);
  });
};

/**
 * Quick slang check without full normalization
 */
export const containsSlang = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return Object.keys(slangMap).some(slang => {
    const regex = new RegExp(`\\b${slang.replace(/'/g, "\\'")}\\b`, 'i');
    return regex.test(lowerText);
  });
};

/**
 * Get user-friendly description of detected issues
 */
export const getIssueDescription = (detectedIssues: string[]): string => {
  if (detectedIssues.length === 0) return '';
  
  const categories = {
    profanity: detectedIssues.filter(issue => issue.startsWith('profanity:')).length,
    aggressive: detectedIssues.filter(issue => issue.startsWith('aggressive:')).length,
    slang: detectedIssues.filter(issue => issue.startsWith('slang:')).length
  };
  
  const descriptions = [];
  if (categories.profanity > 0) descriptions.push('inappropriate language');
  if (categories.aggressive > 0) descriptions.push('aggressive tone');
  if (categories.slang > 0) descriptions.push('informal expressions');
  
  return descriptions.join(', ');
};

const contentFilter = {
  sanitizeInput,
  filterProfanity,
  normalizeSlang,
  filterAggressive,
  containsProfanity,
  containsSlang,
  getIssueDescription
};

export default contentFilter;
