import React, { useState } from 'react';
import { Check, X, ArrowRight, Shield, Clock, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

/**
 * PricingPage - Sofia-focused pricing
 *
 * Pricing Strategy:
 * - Free tier: 10 translations/month (enough to test, not enough to rely on)
 * - Student tier: $9.99/month (targets Sofia directly - affordable on CNA wage)
 * - Professional tier: $19.99/month (for working professionals)
 *
 * Copy focuses on Sofia's emotional drivers:
 * - Shame → Pride
 * - Fear → Confidence
 * - Time poverty → Time savings
 */

interface PricingTier {
  name: string;
  price: number | null;
  period: string;
  description: string;
  emotionalBenefit: string;
  features: Array<{ text: string; included: boolean }>;
  cta: string;
  popular?: boolean;
  badge?: string;
  testimonial?: {
    quote: string;
    author: string;
  };
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free Trial',
    price: 0,
    period: 'month',
    description: 'Test PromptLingo risk-free',
    emotionalBenefit: 'See if this finally ends your translation frustration',
    badge: 'Try Before You Commit',
    features: [
      { text: '10 professional translations per month', included: true },
      { text: 'All 5 tone styles (Casual, Business, Formal, Medical, Informal)', included: true },
      { text: 'Voice & text input', included: true },
      { text: 'Haitian Creole + Spanish support', included: true },
      { text: 'Translation history (last 50)', included: true },
      { text: 'Unlimited translations', included: false },
      { text: 'Priority support', included: false },
      { text: 'Advanced AI (GPT-4)', included: false },
    ],
    cta: 'Start Free Trial',
    testimonial: {
      quote: 'I tried the free version and couldn\'t believe how perfect the medical tone was. Signed up immediately.',
      author: 'Maria G., Medical Assistant Student'
    }
  },
  {
    name: 'Student',
    price: 9.99,
    period: 'month',
    description: 'For nursing students & CNAs pursuing certification',
    emotionalBenefit: 'Stop wasting 2+ hours per assignment fighting with English',
    popular: true,
    badge: 'Most Popular for Students',
    features: [
      { text: 'Unlimited professional translations', included: true },
      { text: 'All 5 tone styles (Perfect for nursing essays)', included: true },
      { text: 'Voice & text input', included: true },
      { text: 'Haitian Creole + Spanish support', included: true },
      { text: 'Translation history (encrypted locally)', included: true },
      { text: 'Advanced AI (GPT-4 for better quality)', included: true },
      { text: 'Email support (24-hour response)', included: true },
      { text: 'Text-to-speech (hear your professional voice)', included: true },
    ],
    cta: 'Start Sounding Professional',
    testimonial: {
      quote: 'Worth every penny. I got an A- on my essay and saved 3 hours. That\'s time I spent with my kids, not Google Translate.',
      author: 'Sofia R., CNA pursuing RN'
    }
  },
  {
    name: 'Professional',
    price: 19.99,
    period: 'month',
    description: 'For working nurses & healthcare professionals',
    emotionalBenefit: 'Communicate with the authority your expertise deserves',
    badge: 'For Working Professionals',
    features: [
      { text: 'Everything in Student, plus:', included: true },
      { text: 'Priority support (Same-day response)', included: true },
      { text: 'Advanced medical terminology database', included: true },
      { text: 'Team collaboration (share with colleagues)', included: true },
      { text: 'Custom tone presets (save your common use cases)', included: true },
      { text: 'Export to Word/PDF', included: true },
      { text: 'Mobile app (iOS & Android)', included: true },
      { text: 'Offline mode (translate without internet)', included: true },
    ],
    cta: 'Upgrade to Professional',
    testimonial: {
      quote: 'My charge nurse complimented my patient notes. I\'ve never felt so confident at work.',
      author: 'Carmen R., RN'
    }
  },
];

const PricingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (tier: PricingTier) => {
    // Free tier - no payment needed
    if (tier.price === 0) {
      // User can just sign up and start using the free tier
      if (!isAuthenticated) {
        alert('Please sign in to start your free trial. Click "Get Started" in the header.');
      } else {
        alert('You\'re already on the free tier! Start translating now.');
      }
      return;
    }

    if (!isAuthenticated) {
      alert('Please sign in first to subscribe. Click "Get Started" in the header.');
      return;
    }

    try {
      setLoading(tier.name);

      // Determine plan type for backend
      let planType = 'pro-monthly';
      if (tier.name === 'Student') {
        planType = 'essential';
      } else if (tier.period === 'year') {
        planType = 'yearly';
      }

      // Create Stripe checkout session
      const response = await api.post('/stripe/create-checkout-session', {
        planType,
      });

      // Redirect to Stripe checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-backgroundLight">
      {/* Hero Section */}
      <section className="bg-gradient-brand text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 font-serif">
              Stop Letting Your English Barrier Cost You Your Future
            </h1>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              One failed essay costs you $500+ in retake fees. One miscommunication at work could cost you your job.
              For less than the cost of a textbook, get professional English that matches your competence.
            </p>

            {/* Emotional ROI Callout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Shield className="h-8 w-8 mx-auto mb-3" />
                <p className="font-semibold">No More Shame</p>
                <p className="text-sm opacity-80 mt-2">Send emails with confidence</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Clock className="h-8 w-8 mx-auto mb-3" />
                <p className="font-semibold">Save 2+ Hours Per Task</p>
                <p className="text-sm opacity-80 mt-2">Time for family, not frustration</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Heart className="h-8 w-8 mx-auto mb-3" />
                <p className="font-semibold">Peace of Mind</p>
                <p className="text-sm opacity-80 mt-2">No more anxiety about mistakes</p>
              </div>
            </div>

            <p className="text-sm opacity-80">
              💳 No credit card required for free trial • ⏱️ Setup in 60 seconds • 🔒 Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                tier.popular ? 'ring-4 ring-primary-skyBlue scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-primary-skyBlue text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  ⭐ {tier.badge}
                </div>
              )}

              {/* Plan Header */}
              <div className={`p-8 ${tier.popular ? 'bg-gradient-to-br from-primary-skyBlue/10 to-primary-mint/10' : 'bg-neutral-backgroundLight'}`}>
                <h3 className="text-2xl font-bold text-neutral-textPrimary mb-2 font-serif">
                  {tier.name}
                </h3>
                <p className="text-neutral-textSecondary text-sm mb-4">
                  {tier.description}
                </p>

                {/* Emotional Benefit */}
                <div className="bg-white rounded-lg p-4 mb-6 border-2 border-primary-mint/20">
                  <p className="text-sm font-medium text-primary-mint">
                    💚 {tier.emotionalBenefit}
                  </p>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  {tier.price !== null ? (
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-neutral-textPrimary">
                        ${tier.price}
                      </span>
                      <span className="text-neutral-textSecondary ml-2">/{tier.period}</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-neutral-textPrimary">Free Forever</div>
                  )}

                  {/* Value Comparison */}
                  {tier.price && tier.price > 0 && (
                    <p className="text-xs text-neutral-textSecondary mt-2">
                      = ${(tier.price / 30).toFixed(2)}/day • Less than a coffee
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(tier)}
                  disabled={loading === tier.name}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center group ${
                    tier.popular
                      ? 'bg-primary-skyBlue text-white hover:bg-primary-indigo shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                      : 'bg-neutral-backgroundLight text-neutral-textPrimary hover:bg-primary-mint/20 border-2 border-neutral-textSecondary/20 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {loading === tier.name ? 'Loading...' : tier.cta}
                  {loading !== tier.name && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>

              {/* Features List */}
              <div className="p-8">
                <ul className="space-y-4">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-primary-mint mr-3 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-neutral-textSecondary/30 mr-3 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-neutral-textPrimary' : 'text-neutral-textSecondary/50 line-through'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Testimonial */}
                {tier.testimonial && (
                  <div className="mt-8 pt-8 border-t border-neutral-textSecondary/10">
                    <p className="text-sm italic text-neutral-textSecondary mb-2">
                      "{tier.testimonial.quote}"
                    </p>
                    <p className="text-xs font-semibold text-neutral-textPrimary">
                      — {tier.testimonial.author}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-neutral-textPrimary mb-8 text-center font-serif">
          Pricing Questions (Sofia's Concerns Answered)
        </h2>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-bold text-neutral-textPrimary mb-3">
              Can I really afford this on a CNA salary?
            </h3>
            <p className="text-neutral-textSecondary">
              Yes! At $9.99/month, that's less than <strong>$0.33 per day</strong>. Think of it this way:
              one failed class costs $500-1000 in retake fees. PromptLingo helps you pass the first time.
              Plus, once you become an RN, your salary increases by $30,000+/year. This is an investment in your future.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-bold text-neutral-textPrimary mb-3">
              Will my professor know I used this?
            </h3>
            <p className="text-neutral-textSecondary">
              PromptLingo doesn't write your essays—<strong>you do</strong>. It helps you express YOUR knowledge in professional English.
              The ideas, clinical expertise, and understanding are 100% yours. We just remove the language barrier that's been masking your intelligence.
              Think of it like spell-check, but for professionalism.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-bold text-neutral-textPrimary mb-3">
              Can I cancel if I don't like it?
            </h3>
            <p className="text-neutral-textSecondary">
              <strong>Yes, instantly.</strong> No contracts, no cancellation fees, no questions asked.
              Cancel in your account settings with one click. We're confident you'll love PromptLingo, but if it's not for you, you're free to go.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-bold text-neutral-textPrimary mb-3">
              What payment methods do you accept?
            </h3>
            <p className="text-neutral-textSecondary">
              All major credit cards, debit cards, and prepaid cards (Visa, Mastercard, American Express, Discover).
              We use Stripe, the same secure payment processor used by Amazon and Google.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-bold text-neutral-textPrimary mb-3">
              Is there a student discount?
            </h3>
            <p className="text-neutral-textSecondary">
              The <strong>Student plan IS the discounted plan</strong> ($9.99/month vs. $19.99 for professionals).
              We designed it specifically for nursing students and CNAs pursuing their RN.
              Plus, try the <strong>Free plan first</strong> to see if it's right for you.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-bold text-neutral-textPrimary mb-3">
              How is this different from Google Translate (which is free)?
            </h3>
            <p className="text-neutral-textSecondary">
              Google Translate gives you <strong>literal word-for-word translation</strong> that sounds robotic and awkward.
              PromptLingo gives you <strong>professional, context-aware communication</strong>.
              For example, Google Translate can't distinguish between a casual text to a friend and a formal email to your professor.
              PromptLingo understands tone, medical terminology, and academic writing conventions. It's the difference between sounding like a machine and sounding like a professional.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-brand text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-serif">
            Sofia, Your English Doesn't Have to Hold You Back Anymore
          </h2>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            You work hard. You study late. You sacrifice for your family. You deserve a tool that honors your effort.
            PromptLingo gives you the professional voice your competence has always deserved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleSelectPlan(pricingTiers[1])}
              disabled={loading !== null}
              className="bg-white text-primary-skyBlue px-8 py-4 rounded-lg font-semibold text-lg hover:bg-neutral-backgroundLight transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === pricingTiers[1].name ? 'Loading...' : 'Start Your Free Trial (10 Translations)'}
              {loading !== pricingTiers[1].name && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>

          <p className="mt-6 text-sm opacity-80">
            ✅ No credit card required • ✅ Cancel anytime • ✅ Get results in 60 seconds
          </p>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
