import React, { useState } from 'react';
import { X, ArrowRight, Check, Sparkles, MessageSquare } from 'lucide-react';

/**
 * OnboardingTutorial - Shows the "Aha Moment"
 *
 * Guides users through Sofia's emotional journey:
 * 1. SHAME - See broken English (relatable)
 * 2. HOPE - Click "Transform"
 * 3. RELIEF - See professional output
 * 4. PRIDE - Understand the value
 *
 * This component should appear:
 * - First time user signs up
 * - Can be triggered from Help menu
 * - Shows real before/after examples
 */

interface TutorialStep {
  id: number;
  title: string;
  emotion: 'shame' | 'hope' | 'relief' | 'pride';
  before: string;
  after: string;
  context: string;
  insight: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'The Nursing Essay',
    emotion: 'shame',
    context: 'What you might write after working a 12-hour shift:',
    before: 'The aseptic technique is very importance for preventing infection in patient. Nurse must to wash hands before and after the procedure. Is critical that equipment are sterile and no contamination happen.',
    after: 'Aseptic technique is essential for infection prevention in patient care. Nurses must perform hand hygiene before and after each procedure. It is critical that all equipment remains sterile and contamination is avoided throughout the process.',
    insight: 'Same knowledge. Same expertise. But now you sound like the professional RN you\'re becoming.'
  },
  {
    id: 2,
    title: 'The Work Email',
    emotion: 'hope',
    context: 'Requesting a schedule change from your supervisor:',
    before: 'Hi, I need to ask if possible to change my shift next Tuesday because I have appointment for my son doctor. Sorry for inconvenient. Thank you.',
    after: 'Good morning,\n\nI would like to request a schedule adjustment for next Tuesday, as I have a medical appointment for my son. I apologize for any inconvenience this may cause and appreciate your understanding.\n\nThank you for considering my request.',
    insight: 'Professional, respectful, and clear. Your supervisor sees you as a peer, not someone struggling with English.'
  },
  {
    id: 3,
    title: 'The Patient Note',
    emotion: 'relief',
    context: 'Documenting a patient interaction:',
    before: 'Patient say she have pain in stomach since morning. She not eat breakfast. I give medicine for pain and tell supervisor.',
    after: 'Patient reports experiencing abdominal pain since this morning. She has not consumed breakfast. Pain medication was administered per protocol, and the charge nurse was notified immediately.',
    insight: 'Perfect medical documentation. No one will question your competence when they read this note.'
  },
  {
    id: 4,
    title: 'The Difference PromptLingo Makes',
    emotion: 'pride',
    context: 'What users say after using PromptLingo:',
    before: '"I always feel shame when professor return my paper with red marks everywhere. My ideas are good but my English make me look stupid."',
    after: '"I got an A- on my essay. My professor wrote \'Excellent structure and clear articulation.\' For the first time, I feel like my intelligence is visible."',
    insight: 'This is what PromptLingo gives you: a voice that matches your competence. No more shame. No more hiding. Just confidence.'
  }
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAfter, setShowAfter] = useState(false);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleTransform = () => {
    setShowAfter(true);
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
      setShowAfter(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowAfter(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-brand text-white p-6 relative">
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close tutorial"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-serif">See How PromptLingo Works</h2>
            <span className="text-sm opacity-80">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-neutral-textPrimary mb-2 font-serif">
              {step.title}
            </h3>
            <p className="text-neutral-textSecondary">{step.context}</p>
          </div>

          {/* Before/After Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* BEFORE - Always visible */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-neutral-textPrimary flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-red-500" />
                  Before PromptLingo
                </h4>
                {step.emotion === 'shame' && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    😔 Awkward & Embarrassing
                  </span>
                )}
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 min-h-[200px]">
                <p className="text-neutral-textPrimary whitespace-pre-wrap leading-relaxed">
                  {step.before}
                </p>
              </div>

              {!showAfter && (
                <div className="text-center">
                  <p className="text-sm text-neutral-textSecondary mb-3 italic">
                    "This is how I sound in my head... I know the content is good, but my English makes me look incompetent."
                  </p>
                </div>
              )}
            </div>

            {/* AFTER - Shows after transformation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-neutral-textPrimary flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-green-500" />
                  After PromptLingo
                </h4>
                {showAfter && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    ✨ Professional & Confident
                  </span>
                )}
              </div>

              <div
                className={`border-2 rounded-lg p-6 min-h-[200px] transition-all duration-500 ${
                  showAfter
                    ? 'bg-green-50 border-green-200 opacity-100'
                    : 'bg-gray-100 border-gray-200 opacity-50 blur-sm'
                }`}
              >
                {showAfter ? (
                  <p className="text-neutral-textPrimary whitespace-pre-wrap leading-relaxed">
                    {step.after}
                  </p>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-neutral-textSecondary text-center">
                      Click "Transform with PromptLingo" to see the magic ✨
                    </p>
                  </div>
                )}
              </div>

              {!showAfter && (
                <button
                  onClick={handleTransform}
                  className="w-full bg-gradient-brand text-white py-4 px-6 rounded-lg font-semibold text-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
                >
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Transform with PromptLingo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {showAfter && (
                <div className="text-center">
                  <p className="text-sm text-primary-mint font-semibold mb-2">
                    💚 This Is The Aha Moment
                  </p>
                  <p className="text-sm text-neutral-textSecondary italic">
                    "Wait... this is exactly what I wanted to say. Why couldn't I write this myself?"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Insight - Shows after transformation */}
          {showAfter && (
            <div className="bg-primary-skyBlue/10 border-2 border-primary-skyBlue/20 rounded-lg p-6 mb-8 animate-fadeIn">
              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-skyBlue rounded-full flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-textPrimary mb-2">The Difference:</h4>
                  <p className="text-neutral-textPrimary leading-relaxed">
                    {step.insight}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-textSecondary/10">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-neutral-textSecondary hover:text-neutral-textPrimary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous Example
            </button>

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="px-6 py-3 text-neutral-textSecondary hover:text-neutral-textPrimary transition-colors"
              >
                Skip Tutorial
              </button>

              {showAfter && (
                <button
                  onClick={handleNext}
                  className="bg-primary-skyBlue text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-indigo transition-all duration-200 flex items-center"
                >
                  {isLastStep ? 'Start Using PromptLingo' : 'Next Example'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Encouragement */}
        {showAfter && currentStep === tutorialSteps.length - 1 && (
          <div className="bg-gradient-brand text-white p-6 text-center">
            <h3 className="text-xl font-bold mb-2 font-serif">
              You're Ready, Sofia
            </h3>
            <p className="text-white/90 max-w-2xl mx-auto">
              You've seen how PromptLingo transforms your knowledge into professional English.
              Now it's your turn. Type your first assignment, email, or patient note.
              Feel the relief of confidence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingTutorial;
