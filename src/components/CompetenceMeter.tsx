import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, CheckCircle } from 'lucide-react';

/**
 * CompetenceMeter - Visual professionalism gauge
 *
 * From Brand Identity Document:
 * "A visual gauge that rates the professionalism of the raw input and the
 * translated output, providing a sense of control and measurable improvement."
 *
 * This component addresses Sofia's emotional needs:
 * - SHAME → PRIDE: Show visible improvement
 * - FEAR → CONFIDENCE: Quantify professionalism
 * - COMPETENCE VALIDATION: "I'm not incompetent, I just needed the right words"
 *
 * Metrics evaluated:
 * 1. Grammar correctness (% errors)
 * 2. Tone appropriateness (casual vs. professional)
 * 3. Vocabulary sophistication (reading level)
 * 4. Medical terminology accuracy (if medical tone)
 */

interface CompetenceMeterProps {
  inputText: string;
  outputText: string;
  selectedTone?: string;
  showAnimation?: boolean;
}

interface ProfessionalismScore {
  overall: number; // 0-100
  grammar: number; // 0-100
  tone: number; // 0-100
  vocabulary: number; // 0-100
  terminology: number; // 0-100 (medical contexts only)
  label: string; // "Casual", "Professional", "Expert"
  improvement: number; // Percentage improvement
}

/**
 * Analyze text professionalism (simplified heuristic)
 * In production, this would call an API for proper NLP analysis
 */
const analyzeProfessionalism = (text: string, tone?: string): ProfessionalismScore => {
  if (!text || text.trim().length === 0) {
    return {
      overall: 0,
      grammar: 0,
      tone: 0,
      vocabulary: 0,
      terminology: 0,
      label: 'No Text',
      improvement: 0
    };
  }

  // Grammar score (simple heuristics)
  const hasCapitalization = /^[A-Z]/.test(text.trim());
  const hasPunctuation = /[.!?]$/.test(text.trim());
  const hasProperSpacing = !/\s{2,}/.test(text);
  const hasNoObviousErrors = !/\b(dont|cant|wont|shouldnt)\b/i.test(text); // Missing apostrophes
  const hasNoArticleErrors = !/\b(a RN|an CNA|the nurse must to)\b/i.test(text);

  let grammarScore = 0;
  if (hasCapitalization) grammarScore += 20;
  if (hasPunctuation) grammarScore += 20;
  if (hasProperSpacing) grammarScore += 20;
  if (hasNoObviousErrors) grammarScore += 20;
  if (hasNoArticleErrors) grammarScore += 20;

  // Tone score (formal vs. casual indicators)
  const formalIndicators = /\b(essential|critical|appropriate|ensure|demonstrate|indicate|accordingly|therefore)\b/gi;
  const casualIndicators = /\b(really|very|a lot|stuff|things|gonna|wanna)\b/gi;
  const contractionsCount = (text.match(/\b\w+'\w+\b/g) || []).length;

  const formalMatches = (text.match(formalIndicators) || []).length;
  const casualMatches = (text.match(casualIndicators) || []).length;

  let toneScore = 50; // Base neutral
  if (tone === 'formal' || tone === 'medical' || tone === 'business') {
    toneScore = Math.min(100, 50 + (formalMatches * 10) - (casualMatches * 10) - (contractionsCount * 5));
  } else if (tone === 'casual') {
    toneScore = Math.min(100, 50 + (casualMatches * 10) - (formalMatches * 5));
  }

  // Vocabulary sophistication (word length and variety)
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / (words.length || 1);
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const lexicalDiversity = uniqueWords / (words.length || 1);

  const vocabularyScore = Math.min(100,
    (avgWordLength / 6 * 50) + // Longer words = more sophisticated
    (lexicalDiversity * 50) // Higher diversity = better
  );

  // Medical terminology (if medical tone)
  const medicalTerms = /\b(aseptic|infection|hygiene|patient|procedure|sterile|medication|symptom|diagnosis|protocol)\b/gi;
  const medicalMatches = (text.match(medicalTerms) || []).length;
  const terminologyScore = tone === 'medical'
    ? Math.min(100, medicalMatches * 15)
    : vocabularyScore;

  // Overall score (weighted average)
  const overall = Math.round(
    (grammarScore * 0.3) +
    (toneScore * 0.3) +
    (vocabularyScore * 0.2) +
    (terminologyScore * 0.2)
  );

  // Determine label
  let label = 'Casual';
  if (overall >= 85) label = 'Expert Professional';
  else if (overall >= 70) label = 'Professional';
  else if (overall >= 50) label = 'Acceptable';
  else if (overall >= 30) label = 'Needs Improvement';

  return {
    overall: Math.max(0, Math.min(100, overall)),
    grammar: Math.max(0, Math.min(100, grammarScore)),
    tone: Math.max(0, Math.min(100, toneScore)),
    vocabulary: Math.max(0, Math.min(100, vocabularyScore)),
    terminology: Math.max(0, Math.min(100, terminologyScore)),
    label,
    improvement: 0 // Calculated separately
  };
};

const CompetenceMeter: React.FC<CompetenceMeterProps> = ({
  inputText,
  outputText,
  selectedTone,
  showAnimation = true
}) => {
  const [inputScore, setInputScore] = useState<ProfessionalismScore | null>(null);
  const [outputScore, setOutputScore] = useState<ProfessionalismScore | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Analyze both texts
    const input = analyzeProfessionalism(inputText, selectedTone);
    const output = analyzeProfessionalism(outputText, selectedTone);

    // Calculate improvement
    const improvement = output.overall - input.overall;
    output.improvement = improvement;

    setInputScore(input);
    setOutputScore(output);

    // Trigger animation
    if (showAnimation && improvement > 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }
  }, [inputText, outputText, selectedTone, showAnimation]);

  if (!inputScore || !outputScore) {
    return null;
  }

  // Don't show if no meaningful input/output
  if (inputScore.overall === 0 && outputScore.overall === 0) {
    return null;
  }

  const improvement = outputScore.improvement;
  const hasImprovement = improvement > 10; // Only show if significant improvement

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary-skyBlue/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Award className="h-6 w-6 text-primary-skyBlue mr-2" />
          <h3 className="text-lg font-bold text-neutral-textPrimary font-serif">
            Professionalism Meter
          </h3>
        </div>

        {hasImprovement && (
          <div className={`flex items-center text-primary-mint ${isAnimating ? 'animate-pulse' : ''}`}>
            <TrendingUp className="h-5 w-5 mr-1" />
            <span className="font-bold">+{improvement.toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Before & After Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Input Score */}
        <div>
          <div className="text-center mb-3">
            <p className="text-sm text-neutral-textSecondary mb-1">Your Input</p>
            <p className="text-2xl font-bold text-neutral-textPrimary">{inputScore.overall}%</p>
            <p className="text-xs text-neutral-textSecondary">{inputScore.label}</p>
          </div>

          {/* Circular Gauge */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="transform -rotate-90 w-32 h-32">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#E5E7EB"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#FF7B54"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${inputScore.overall * 3.51} 351`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-neutral-textPrimary">
                {inputScore.overall}
              </span>
            </div>
          </div>
        </div>

        {/* Output Score */}
        <div>
          <div className="text-center mb-3">
            <p className="text-sm text-neutral-textSecondary mb-1">PromptLingo Output</p>
            <p className="text-2xl font-bold text-primary-mint">{outputScore.overall}%</p>
            <p className="text-xs text-primary-mint font-semibold">{outputScore.label}</p>
          </div>

          {/* Circular Gauge */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="transform -rotate-90 w-32 h-32">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#E5E7EB"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#8DE3A6"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${outputScore.overall * 3.51} 351`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-mint">
                {outputScore.overall}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3 mb-6">
        <DetailBar label="Grammar" before={inputScore.grammar} after={outputScore.grammar} />
        <DetailBar label="Tone" before={inputScore.tone} after={outputScore.tone} />
        <DetailBar label="Vocabulary" before={inputScore.vocabulary} after={outputScore.vocabulary} />
        {selectedTone === 'medical' && (
          <DetailBar label="Medical Terms" before={inputScore.terminology} after={outputScore.terminology} />
        )}
      </div>

      {/* Emotional Insight */}
      {hasImprovement && (
        <div className="bg-primary-mint/10 border-2 border-primary-mint/30 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-primary-mint mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-neutral-textPrimary mb-1">
                Your Competence Is Now Visible
              </p>
              <p className="text-xs text-neutral-textSecondary">
                Your knowledge was always {inputScore.overall}% professional. PromptLingo just gave you the words to show it.
                {improvement >= 30 && " This is the difference between sounding like a student and sounding like an expert."}
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasImprovement && inputScore.overall >= 70 && (
        <div className="bg-primary-skyBlue/10 border-2 border-primary-skyBlue/30 rounded-lg p-4">
          <p className="text-sm text-neutral-textPrimary text-center">
            💙 Your input is already professional! PromptLingo is here when you need it.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * DetailBar - Shows before/after comparison for specific metrics
 */
const DetailBar: React.FC<{ label: string; before: number; after: number }> = ({ label, before, after }) => {
  const improvement = after - before;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-neutral-textSecondary">{label}</span>
        {improvement > 5 && (
          <span className="text-xs text-primary-mint font-semibold">+{improvement.toFixed(0)}%</span>
        )}
      </div>
      <div className="flex gap-2">
        {/* Before bar */}
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-coral h-full transition-all duration-500"
            style={{ width: `${before}%` }}
          />
        </div>
        {/* After bar */}
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-mint h-full transition-all duration-500"
            style={{ width: `${after}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CompetenceMeter;
