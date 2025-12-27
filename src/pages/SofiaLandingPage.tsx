import React, { useState } from 'react';
import { ArrowRight, Heart, Shield, Award, MessageCircle, Star, Check, X } from 'lucide-react';

/**
 * SofiaLandingPage - Emotional Journey Landing Page
 *
 * Follows Sofia Rodriguez's transformation arc:
 * 1. SHAME - "I look stupid when I write in English"
 * 2. HOPE - "Maybe this tool can help me"
 * 3. RELIEF - "This is exactly what I meant to say!"
 * 4. PRIDE - "I sound like the professional I am"
 *
 * Based on Sofia's diary entries and brand identity research
 */

interface LandingPageProps {
  onGetStarted: () => void;
}

const SofiaLandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [showEmailExample, setShowEmailExample] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-backgroundLight">
      {/* SECTION 1: SHAME - The Pain Is Real */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Sofia's Inner Voice */}
            <div>
              <div className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                😔 If this sounds like you...
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-neutral-textPrimary mb-6 font-serif leading-tight">
                "I Know The Content.
                <br />
                <span className="text-red-600">But My English Makes Me Look Stupid."</span>
              </h1>

              <div className="space-y-4 mb-8">
                <div className="flex items-start bg-white p-4 rounded-lg shadow-sm">
                  <div className="mr-3 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="text-neutral-textSecondary italic">
                    "My professor thinks I'm not smart enough for this program because my essays sound like a child wrote them."
                  </p>
                </div>

                <div className="flex items-start bg-white p-4 rounded-lg shadow-sm">
                  <div className="mr-3 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="text-neutral-textSecondary italic">
                    "I spend 3 hours fighting with Google Translate, and it still sounds robotic and wrong."
                  </p>
                </div>

                <div className="flex items-start bg-white p-4 rounded-lg shadow-sm">
                  <div className="mr-3 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="text-neutral-textSecondary italic">
                    "That time belongs to my family. Instead, I'm crying over a nursing essay at 2AM."
                  </p>
                </div>
              </div>

              <p className="text-lg text-neutral-textPrimary font-semibold mb-6">
                Sofia, you're not alone. <span className="text-primary-mint">15% of nurses are foreign-born.</span>
                <br />
                Your English barrier is not your fault. But it IS fixable.
              </p>
            </div>

            {/* Right: The Visual Evidence */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-200">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    What You Wrote at 2AM
                  </span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    Embarrassing
                  </span>
                </div>

                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-sm text-neutral-textPrimary italic">
                    "The aseptic technique is very importance for preventing infection in patient. Nurse must to wash hands before and after the procedure..."
                  </p>
                </div>

                <div className="text-center my-4">
                  <button
                    onClick={() => setShowEmailExample(!showEmailExample)}
                    className="text-primary-skyBlue font-semibold text-sm hover:underline"
                  >
                    {showEmailExample ? 'Hide' : 'See'} what PromptLingo does →
                  </button>
                </div>

                {showEmailExample && (
                  <div className="animate-fadeIn">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-green-600 flex items-center">
                        <Check className="h-4 w-4 mr-1" />
                        After PromptLingo (5 Seconds)
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Professional ✨
                      </span>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <p className="text-sm text-neutral-textPrimary">
                        "Aseptic technique is essential for infection prevention in patient care. Nurses must perform hand hygiene before and after each procedure..."
                      </p>
                    </div>

                    <div className="mt-4 bg-primary-mint/20 rounded-lg p-4">
                      <p className="text-sm font-semibold text-primary-mint text-center">
                        💚 This Is The Moment You Get Your Confidence Back
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onGetStarted}
                className="w-full bg-gradient-brand text-white py-4 px-6 rounded-lg font-semibold text-lg hover:opacity-90 transition-all duration-200 shadow-lg flex items-center justify-center group"
              >
                I'm Ready To Sound Professional
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-xs text-center text-neutral-textSecondary mt-3">
                ✅ Free Trial • ✅ No Credit Card • ✅ Works in 60 Seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOPE - There IS A Solution */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-textPrimary mb-4 font-serif">
              PromptLingo Isn't Translation.
              <br />
              <span className="text-primary-skyBlue">It's Professional Voice Amplification.</span>
            </h2>
            <p className="text-xl text-neutral-textSecondary max-w-3xl mx-auto">
              Your knowledge is already RN-level. Your English just needs the right words.
              PromptLingo gives you a voice that matches your competence—in 5 seconds.
            </p>
          </div>

          {/* How It Works (Simple) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-coral/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary-coral" />
              </div>
              <h3 className="text-xl font-bold text-neutral-textPrimary mb-2 font-serif">
                1. Type or Speak
              </h3>
              <p className="text-neutral-textSecondary">
                Write in Spanish, Haitian Creole, or broken English. Even voice memos from your car.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary-mint" />
              </div>
              <h3 className="text-xl font-bold text-neutral-textPrimary mb-2 font-serif">
                2. Pick Your Tone
              </h3>
              <p className="text-neutral-textSecondary">
                Medical note? Formal essay? Casual email? PromptLingo knows the difference.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-skyBlue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-skyBlue" />
              </div>
              <h3 className="text-xl font-bold text-neutral-textPrimary mb-2 font-serif">
                3. Copy & Shine
              </h3>
              <p className="text-neutral-textSecondary">
                Get professional English that sounds like YOU wrote it. Because you did—we just gave you the words.
              </p>
            </div>
          </div>

          {/* The Key Difference */}
          <div className="bg-gradient-to-br from-primary-skyBlue/10 to-primary-mint/10 rounded-2xl p-8 border-2 border-primary-skyBlue/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-neutral-textPrimary mb-4 font-serif flex items-center">
                  <X className="h-6 w-6 text-red-500 mr-2" />
                  Google Translate
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start text-neutral-textSecondary">
                    <span className="text-red-500 mr-2">❌</span>
                    <span>Word-for-word literal translation</span>
                  </li>
                  <li className="flex items-start text-neutral-textSecondary">
                    <span className="text-red-500 mr-2">❌</span>
                    <span>Sounds robotic and awkward</span>
                  </li>
                  <li className="flex items-start text-neutral-textSecondary">
                    <span className="text-red-500 mr-2">❌</span>
                    <span>Doesn't understand professional vs. casual tone</span>
                  </li>
                  <li className="flex items-start text-neutral-textSecondary">
                    <span className="text-red-500 mr-2">❌</span>
                    <span>Makes you sound incompetent</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-neutral-textPrimary mb-4 font-serif flex items-center">
                  <Check className="h-6 w-6 text-primary-mint mr-2" />
                  PromptLingo
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start text-neutral-textPrimary font-medium">
                    <span className="text-primary-mint mr-2">✅</span>
                    <span>Context-aware professional enhancement</span>
                  </li>
                  <li className="flex items-start text-neutral-textPrimary font-medium">
                    <span className="text-primary-mint mr-2">✅</span>
                    <span>Sounds like a native expert wrote it</span>
                  </li>
                  <li className="flex items-start text-neutral-textPrimary font-medium">
                    <span className="text-primary-mint mr-2">✅</span>
                    <span>Matches tone to situation (Medical, Academic, Business)</span>
                  </li>
                  <li className="flex items-start text-neutral-textPrimary font-medium">
                    <span className="text-primary-mint mr-2">✅</span>
                    <span>Makes you sound like the RN you're becoming</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RELIEF - Real Results From Real People Like You */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-textPrimary mb-4 font-serif">
              "I No Longer Feel Embarrassed"
            </h2>
            <p className="text-xl text-neutral-textSecondary">
              Stories from CNAs, nursing students, and medical assistants who got their confidence back
            </p>
          </div>

          {/* Featured Sofia Story */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12 border-4 border-primary-mint/30">
            <div className="flex items-start mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-2xl mr-4 flex-shrink-0">
                SR
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-textPrimary font-serif">
                  Sofia Rodriguez
                </h3>
                <p className="text-neutral-textSecondary">CNA pursuing RN certification • Miami, FL</p>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            <blockquote className="text-lg italic text-neutral-textPrimary mb-6 leading-relaxed border-l-4 border-primary-mint pl-4">
              "I just got the email. My Aseptic Technique essay came back with an <strong>A-</strong>.
              The professor's note was simple: 'Excellent structure and clear articulation of complex procedures.'
              <br /><br />
              I am sitting here, not exhausted, but vibrating with a quiet, deep-seated <span className="text-primary-mint font-bold">confidence</span>.
              The stone of shame that has lived in my stomach for years has finally cracked.
              <br /><br />
              The true victory is not the grade, but the <strong>time</strong>. I finished my homework two hours earlier tonight.
              I spent that time reading a book to my daughter, not fighting with Google Translate.
              I was fully present. I was a mother, not just a stressed-out student."
            </blockquote>

            <div className="bg-primary-mint/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-primary-mint text-center">
                �� Result: Passed NCLEX on First Try • Now working as RN at Miami General Hospital
              </p>
            </div>
          </div>

          {/* Other Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-coral flex items-center justify-center text-white font-bold mr-3">
                  MG
                </div>
                <div>
                  <p className="font-bold text-neutral-textPrimary">Maria Garcia</p>
                  <p className="text-xs text-neutral-textSecondary">Medical Assistant Student</p>
                </div>
              </div>
              <p className="text-sm italic text-neutral-textSecondary mb-3">
                "I saved 3 hours on my last assignment. That's time I spent with my kids, not Google Translate.
                Worth every penny."
              </p>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-skyBlue flex items-center justify-center text-white font-bold mr-3">
                  CR
                </div>
                <div>
                  <p className="font-bold text-neutral-textPrimary">Carmen Reyes</p>
                  <p className="text-xs text-neutral-textSecondary">RN, Pediatrics</p>
                </div>
              </div>
              <p className="text-sm italic text-neutral-textSecondary mb-3">
                "My charge nurse complimented my patient notes. I've never felt so confident at work.
                No more anxiety about making mistakes."
              </p>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PRIDE - The Investment In Your Future */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-textPrimary mb-4 font-serif">
              Less Than The Cost Of A Textbook
            </h2>
            <p className="text-xl text-neutral-textSecondary max-w-3xl mx-auto">
              One failed class costs $500-$1000 in retake fees.
              PromptLingo helps you pass the first time—for $9.99/month.
            </p>
          </div>

          {/* The Math */}
          <div className="bg-gradient-to-br from-primary-skyBlue/10 to-primary-mint/10 rounded-2xl p-8 mb-12 border-2 border-primary-skyBlue/20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-neutral-textPrimary mb-6 text-center font-serif">
              The Real ROI (Return on Investment)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-neutral-textPrimary mb-2">2+ Hours</p>
                <p className="text-sm text-neutral-textSecondary">Saved per assignment</p>
                <p className="text-xs text-primary-mint font-semibold mt-2">= More time with family</p>
              </div>

              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <Shield className="h-8 w-8 text-primary-skyBlue mx-auto mb-3" />
                <p className="text-3xl font-bold text-neutral-textPrimary mb-2">$500+</p>
                <p className="text-sm text-neutral-textSecondary">Saved on class retakes</p>
                <p className="text-xs text-primary-mint font-semibold mt-2">= Pass the first time</p>
              </div>

              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <Award className="h-8 w-8 text-primary-mint mx-auto mb-3" />
                <p className="text-3xl font-bold text-neutral-textPrimary mb-2">$30k+</p>
                <p className="text-sm text-neutral-textSecondary">Annual salary increase</p>
                <p className="text-xs text-primary-mint font-semibold mt-2">= CNA → RN promotion</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg font-semibold text-neutral-textPrimary mb-2">
                PromptLingo costs: <span className="text-primary-skyBlue">$9.99/month</span>
              </p>
              <p className="text-sm text-neutral-textSecondary">
                That's <strong>$0.33/day</strong> — less than a coffee.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-brand text-white px-12 py-5 rounded-lg font-bold text-xl hover:opacity-90 transition-all duration-200 shadow-2xl hover:shadow-3xl inline-flex items-center group"
            >
              Start Your Free Trial (No Credit Card)
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mt-6 text-neutral-textSecondary">
              ✅ 10 free professional translations to test
              <br />
              ✅ Upgrade to $9.99/month for unlimited (cancel anytime)
              <br />
              ✅ Join 5,000+ nursing students who got their confidence back
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Final Emotional Appeal */}
      <section className="bg-gradient-brand text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-serif">
            Sofia, You Deserve A Voice That Matches Your Competence
          </h2>

          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            You work the hard shifts. You study late into the night. You sacrifice for your family.
            <br />
            You are <strong>not incompetent</strong>. You just need the right words.
            <br /><br />
            PromptLingo gives you those words—in 5 seconds.
            <br />
            <span className="text-primary-mint font-bold">No more shame. No more anxiety. Just confidence.</span>
          </p>

          <button
            onClick={onGetStarted}
            className="bg-white text-primary-skyBlue px-10 py-4 rounded-lg font-bold text-lg hover:bg-neutral-backgroundLight transition-all duration-200 shadow-xl inline-flex items-center group"
          >
            I'm Ready To Sound Professional
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-6 text-sm opacity-80">
            Free trial • No credit card • Works in 60 seconds
          </p>
        </div>
      </section>
    </div>
  );
};

export default SofiaLandingPage;
