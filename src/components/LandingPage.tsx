import React, { useState } from 'react';
import { BrandedButton, BrandedCard, FeatureCard, TestimonialCard, FAQ } from './ui';
import brandContent from '../data/brandContent';
import { useLanguage } from '../contexts/LanguageContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

/**
 * LandingPage - Main marketing page for PromptLingo
 * Based on Product Requirements Document specifications
 */
export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { t } = useLanguage();

  // ROI Calculator state
  const [currentWage, setCurrentWage] = useState(18);
  const [targetWage, setTargetWage] = useState(35);
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [monthsToExam, setMonthsToExam] = useState(12);

  // Calculate ROI
  const hoursSavedAnnually = hoursPerWeek * 52;
  const incomeGap = (targetWage - currentWage) * 2080;
  const appCostAnnual = 10 * 12; // $10/month * 12 months

  return (
    <div className="min-h-screen bg-neutral-backgroundLight">
      {/* Hero Section - PRD Section 2 */}
      <section className="relative overflow-hidden bg-gradient-brand text-white min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left Column - 60% */}
            <div className="lg:col-span-3">
              {/* Pre-headline badge */}
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <p className="text-sm font-medium">
                  {t('landing.trustIndicator')}
                </p>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-serif">
                {t('landing.hero.headline')}
              </h1>

              <p className="text-lg sm:text-xl mb-8 opacity-90 leading-relaxed">
                {t('landing.hero.solution')}
              </p>

              {/* Dual CTA */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <BrandedButton
                  variant="secondary"
                  size="lg"
                  onClick={onGetStarted}
                  className="text-lg px-8 py-4 bg-white text-primary-skyBlue hover:bg-neutral-backgroundLight"
                >
                  {t('landing.cta.primary')}
                </BrandedButton>
                <BrandedButton
                  variant="outline"
                  size="lg"
                  onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white/10"
                >
                  {t('landing.cta.secondary')}
                </BrandedButton>
              </div>

              {/* Micro-copy */}
              <p className="text-sm opacity-80">
                {t('landing.cta.microcopy')}
              </p>
            </div>
            
            {/* Right Column - 40% Visual */}
            <div className="lg:col-span-2">
              <BrandedCard variant="elevated" className="bg-white/10 backdrop-blur-md border-white/20">
                <div className="space-y-4">
                  <div className="text-left">
                    <p className="text-xs opacity-70 mb-2">{t('landing.hero.beforeLabel')}</p>
                    <p className="text-sm italic opacity-80">
                      "{t('landing.hero.beforeExample')}"
                    </p>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <p className="text-xs opacity-70 mb-2">{t('landing.hero.afterLabel')}</p>
                    <p className="text-sm font-medium">
                      "{t('landing.hero.afterExample')}"
                    </p>
                  </div>
                </div>
              </BrandedCard>
            </div>
          </div>
        </div>
        
        {/* Decorative gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-backgroundLight to-transparent" />
      </section>

      {/* Problem/Pain Point Section - PRD Section 3 */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-textPrimary mb-4 font-serif">
            Is Your English Barrier Costing You Your Career and Confidence?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {brandContent.painPoints.map((pain, index) => (
            <BrandedCard key={index} variant="elevated" className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-coral/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-textPrimary mb-3 font-serif">
                {pain.title}
              </h3>
              <p className="text-neutral-textSecondary leading-relaxed">
                {pain.description}
              </p>
            </BrandedCard>
          ))}
        </div>
      </section>

      {/* Solution Positioning Section - PRD Section 4 */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-textPrimary mb-6 font-serif">
              PromptLingo: The Professional Voice Amplifier That Honors Your Effort
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-neutral-textSecondary leading-relaxed">
                Bridge from the pain of awkward translation to the philosophy of context-aware, prompt-powered AI. Unlike generic translators that produce robotic, tone-deaf output, PromptLingo understands the nuance of professional communication.
              </p>
              <p className="text-lg text-neutral-textSecondary leading-relaxed">
                This is an investment in professional authority, not a slow language lesson. You don't have time for grammar drills—you need results now. PromptLingo delivers professional-grade English instantly.
              </p>
              <p className="text-lg text-neutral-textSecondary leading-relaxed">
                Gain respect and time. Every communication you send will reflect your true competence, freeing you to focus on what matters: your career, your family, your future.
              </p>
              
              <BrandedCard variant="elevated" className="bg-primary-skyBlue/10 border-primary-skyBlue/20">
                <p className="text-base font-medium text-neutral-textPrimary">
                  <strong>Unlike generic translators,</strong> PromptLingo uses professional-grade prompts (e.g., "Rewrite this as a formal nursing note") to ensure the tone and terminology are always perfect.
                </p>
              </BrandedCard>
            </div>
            
            <div>
              <BrandedCard variant="elevated">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-neutral-textPrimary mb-4 font-serif">
                      The Old Way vs. PromptLingo
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-red-800 mb-2">❌ The Mental Burden</p>
                      <p className="text-sm text-red-700">
                        Translate → Edit → Stress → Repeat
                      </p>
                    </div>
                    
                    <div className="flex justify-center">
                      <svg className="w-8 h-8 text-primary-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-green-800 mb-2">✅ The PromptLingo Way</p>
                      <p className="text-sm text-green-700">
                        Input → PromptLingo → Professional Output
                      </p>
                    </div>
                  </div>
                </div>
              </BrandedCard>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
            Why PromptLingo?
          </h2>
          <p className="text-lg text-neutral-textSecondary">
            Six core principles that power your success
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandContent.valueProps.map((prop, index) => (
            <FeatureCard
              key={index}
              title={prop.title}
              description={prop.description}
              highlight={index === 0}
            />
          ))}
        </div>
      </section>

      {/* Features & Benefits Section - PRD Section 5 */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
              4 Core Features That Transform Your Communication
            </h2>
            <p className="text-lg text-neutral-textSecondary">
              Everything you need to communicate with authority
            </p>
          </div>
          
          <div className="space-y-12">
            {brandContent.features.map((feature, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    highlight={feature.highlight}
                  />
                  {feature.metric && (
                    <div className="mt-4 p-4 bg-primary-mint/10 rounded-lg">
                      <p className="text-sm font-semibold text-primary-mint">
                        📊 {feature.metric}
                      </p>
                    </div>
                  )}
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="bg-neutral-backgroundLight p-8 rounded-lg">
                    <div className="aspect-video bg-white rounded-lg flex items-center justify-center">
                      <p className="text-neutral-textSecondary">Feature Screenshot</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator Section - PRD Section 6 */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
            Future Income & Time Saved Calculator
          </h2>
          <p className="text-lg text-neutral-textSecondary">
            See your personalized return on investment
          </p>
        </div>
        
        <BrandedCard variant="elevated" className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                  Current Hourly Wage (e.g., CNA: $18/hr)
                </label>
                <input
                  type="number"
                  value={currentWage}
                  onChange={(e) => setCurrentWage(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-neutral-textSecondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-skyBlue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                  Target Hourly Wage (e.g., RN: $35/hr)
                </label>
                <input
                  type="number"
                  value={targetWage}
                  onChange={(e) => setTargetWage(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-neutral-textSecondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-skyBlue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                  Hours Spent on Translation/Proofreading Per Week: {hoursPerWeek}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                  Months Until RN Exam
                </label>
                <input
                  type="number"
                  value={monthsToExam}
                  onChange={(e) => setMonthsToExam(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-neutral-textSecondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-skyBlue"
                />
              </div>
            </div>
            
            {/* Results */}
            <div className="space-y-6">
              <div className="bg-primary-mint/10 p-6 rounded-lg">
                <p className="text-sm text-neutral-textSecondary mb-2">Total Hours Saved Annually</p>
                <p className="text-4xl font-bold text-primary-mint">{hoursSavedAnnually}</p>
                <p className="text-sm text-neutral-textSecondary mt-2">hours of your life back</p>
              </div>
              
              <div className="bg-primary-skyBlue/10 p-6 rounded-lg">
                <p className="text-sm text-neutral-textSecondary mb-2">Potential Annual Income Increase</p>
                <p className="text-4xl font-bold text-primary-skyBlue">${incomeGap.toLocaleString()}</p>
                <p className="text-sm text-neutral-textSecondary mt-2">when you become an RN</p>
              </div>
              
              <div className="bg-neutral-backgroundLight p-6 rounded-lg">
                <p className="text-sm text-neutral-textSecondary mb-2">PromptLingo Annual Cost</p>
                <p className="text-2xl font-bold text-neutral-textPrimary">${appCostAnnual}</p>
                <p className="text-sm text-primary-mint mt-2">ROI: {Math.round((incomeGap / appCostAnnual) * 100) / 100}x return on investment</p>
              </div>
              
              <BrandedButton 
                variant="primary" 
                size="lg"
                onClick={onGetStarted}
                className="w-full"
              >
                Get Your Personalized Success Plan
              </BrandedButton>
            </div>
          </div>
        </BrandedCard>
      </section>

      {/* Demo/Video Section - PRD Section 10 */}
      <section id="demo-video" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
              See How PromptLingo Turns Frustration into Flawless English
            </h2>
            <p className="text-lg text-neutral-textSecondary">
              Watch a 90-second demo of the transformation
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-neutral-backgroundLight rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-20 h-20 mx-auto mb-4 text-primary-skyBlue" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                <p className="text-neutral-textSecondary">Demo Video: Problem → Input → Flawless Output</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <BrandedButton 
                variant="primary" 
                size="lg"
                onClick={onGetStarted}
              >
                Ready to feel confident? Start Your Free Trial Now
              </BrandedButton>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - PRD Section 8 */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-neutral-textSecondary">
            Choose the plan that fits your journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {brandContent.pricing.map((tier, index) => (
            <BrandedCard 
              key={index} 
              variant="elevated"
              className={tier.popular ? 'ring-2 ring-primary-skyBlue relative' : ''}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-skyBlue text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-neutral-textPrimary mb-2 font-serif">
                  {tier.name}
                </h3>
                <p className="text-neutral-textSecondary mb-4">{tier.description}</p>
                
                <div className="mb-6">
                  {tier.price !== null ? (
                    <>
                      <span className="text-5xl font-bold text-neutral-textPrimary">${tier.price}</span>
                      <span className="text-neutral-textSecondary">/{tier.period}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-neutral-textPrimary">Custom</span>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8 text-left">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-primary-mint mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-neutral-textSecondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <BrandedButton 
                  variant={tier.popular ? "primary" : "outline"}
                  size="lg"
                  onClick={onGetStarted}
                  className="w-full"
                >
                  {tier.cta}
                </BrandedButton>
              </div>
            </BrandedCard>
          ))}
        </div>
        
        {/* Pricing FAQ */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-neutral-textPrimary mb-6 text-center font-serif">
            Pricing Questions
          </h3>
          <div className="space-y-4">
            <BrandedCard variant="default">
              <p className="font-semibold text-neutral-textPrimary mb-2">Is the free trial a full version?</p>
              <p className="text-neutral-textSecondary">Yes! You get full access to all features for 7 days, no credit card required.</p>
            </BrandedCard>
            <BrandedCard variant="default">
              <p className="font-semibold text-neutral-textPrimary mb-2">Can I pay with a prepaid card?</p>
              <p className="text-neutral-textSecondary">Absolutely. We accept all major credit cards, debit cards, and prepaid cards.</p>
            </BrandedCard>
            <BrandedCard variant="default">
              <p className="font-semibold text-neutral-textPrimary mb-2">Is there a discount for annual payment?</p>
              <p className="text-neutral-textSecondary">Yes! Save 20% when you pay annually. Contact us for details.</p>
            </BrandedCard>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gradient-brand text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {brandContent.trustIndicators.stats.map((stat, index) => (
              <div key={index}>
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Case Study Section - PRD Section 7 */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
            Success Stories
          </h2>
          <p className="text-lg text-neutral-textSecondary">
            Real experiences from professionals like you
          </p>
        </div>
        
        {/* Featured Case Study */}
        <BrandedCard variant="elevated" className="mb-12 bg-gradient-to-r from-primary-skyBlue/10 to-primary-mint/10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-coral flex items-center justify-center text-white font-bold text-2xl mr-4">
                  SR
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-textPrimary font-serif">
                    {brandContent.testimonials[0].name}
                  </h3>
                  <p className="text-neutral-textSecondary">{brandContent.testimonials[0].role}</p>
                </div>
              </div>
              <p className="text-lg text-neutral-textPrimary italic mb-6 leading-relaxed">
                "{brandContent.testimonials[0].quote}"
              </p>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="text-center lg:text-right">
              <div className="inline-block bg-white p-6 rounded-lg shadow-lg">
                <p className="text-4xl font-bold text-primary-mint mb-2">✓</p>
                <p className="text-xl font-bold text-neutral-textPrimary mb-1">
                  {brandContent.testimonials[0].result}
                </p>
                <p className="text-sm text-neutral-textSecondary">Key Achievement</p>
              </div>
            </div>
          </div>
        </BrandedCard>
        
        {/* Supporting Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandContent.testimonials.slice(1).map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              role={testimonial.role}
              quote={testimonial.quote}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-neutral-textSecondary">
              Everything you need to know about PromptLingo
            </p>
          </div>
          
          <FAQ items={brandContent.faq} />
        </div>
      </section>

      {/* Final CTA Section - PRD Section 11 */}
      <section className="bg-gradient-brand text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-serif">
            Stop Letting Language Barriers Hold You Back
          </h2>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            {brandContent.cta.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <BrandedButton 
              variant="secondary" 
              size="lg"
              onClick={onGetStarted}
              className="text-lg px-8 py-4 bg-white text-primary-skyBlue hover:bg-neutral-backgroundLight"
            >
              Start Your Free Trial Now
            </BrandedButton>
            <BrandedButton 
              variant="outline" 
              size="lg"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white/10"
            >
              See Pricing & Plans
            </BrandedButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
