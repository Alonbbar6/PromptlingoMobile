/**
 * Brand Content & Messaging
 * Based on PromptLingo brand research and user persona
 */

export const brandContent = {
  // Main value propositions
  valueProps: [
    {
      title: "Authority",
      description: "Communicate with the same power and respect as a native speaker",
      icon: "shield"
    },
    {
      title: "Clarity", 
      description: "Precise, professional, and context-aware language output",
      icon: "target"
    },
    {
      title: "Empowerment",
      description: "Take control of your academic and professional future",
      icon: "zap"
    },
    {
      title: "Trust",
      description: "Eliminate the fear of critical communication errors",
      icon: "check-circle"
    },
    {
      title: "Efficiency",
      description: "Save precious time and mental energy",
      icon: "clock"
    },
    {
      title: "Warmth",
      description: "Supportive and reassuring, never cold or impersonal",
      icon: "heart"
    }
  ],

  // Feature highlights (4 Core Features from PRD)
  features: [
    {
      title: "Contextual Prompt Library",
      description: "Access pre-built, professional prompts for Nursing, Academia, Business, and Immigration forms. Simply select your context and let the AI handle the rest.",
      metric: "99% reduction in tone-inappropriate communication",
      highlight: true
    },
    {
      title: "Authority-Grade Output",
      description: "Our AI is trained on millions of professional documents to deliver output that is grammatically flawless, technically precise, and sounds like a native expert wrote it.",
      metric: "Users report a 40% increase in confidence in written communication"
    },
    {
      title: "Dual-View Editor",
      description: "See your original thought and the polished English side-by-side. This builds trust and helps you learn professional phrasing quickly, saving time on expensive tutors."
    },
    {
      title: "Time-Saver Input (Voice/Text)",
      description: "Quickly input your thoughts via voice or text, even in Spanglish. PromptLingo understands your intent and delivers the professional output in seconds, freeing up hours for your family and studies."
    }
  ],

  // Testimonials based on Sofia's journey (addressing negative emotions)
  testimonials: [
    {
      name: "Sofia Rodriguez",
      role: "CNA pursuing RN certification",
      quote: "I no longer feel embarrassed to send emails to my professor. PromptLingo gave me my confidence back.",
      rating: 5,
      result: "Passed NCLEX on First Try"
    },
    {
      name: "Maria Garcia",
      role: "Medical Assistant Student",
      quote: "I finished my homework two hours earlier tonight. Two hours! I spent that time reading to my daughter, not fighting with Google Translate.",
      rating: 5
    },
    {
      name: "Carmen Reyes",
      role: "Healthcare Professional",
      quote: "The constant anxiety of making mistakes in patient notes is gone. PromptLingo ensures every word is professional and accurate.",
      rating: 5
    }
  ],

  // FAQ content
  faq: [
    {
      question: "Is this just another translation tool?",
      answer: "No. PromptLingo is a professional voice amplifier, not a basic translator. It understands context, tone, and professional requirements to deliver language that matches your competence and expertise."
    },
    {
      question: "Will people know I used this tool?",
      answer: "PromptLingo helps you express YOUR knowledge in professional English. The ideas, expertise, and intelligence are yours—we just help you communicate them with the clarity and authority you deserve."
    },
    {
      question: "How much time will this save me?",
      answer: "Users report saving 2+ hours per assignment or professional communication task. That's time you can spend with family, studying, or resting instead of struggling with awkward phrasing."
    },
    {
      question: "What languages are supported?",
      answer: "We support Spanish, Haitian Creole, and many other languages commonly spoken by healthcare and academic professionals. Our focus is on helping you succeed in your professional journey."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. Your communications are processed securely and never shared. We understand the sensitive nature of academic and professional content."
    },
    {
      question: "Can this help with academic writing?",
      answer: "Yes! PromptLingo is designed specifically for professionals and students who need to produce high-quality academic and professional communications in English."
    }
  ],

  // Call-to-action messages (PRD-specified)
  cta: {
    primary: "Start Your 7-Day Free Trial",
    secondary: "See the Before & After",
    tagline: "Join thousands of ambitious professionals who replaced anxiety with authority. Start your free trial and unlock your true potential today.",
    microcopy: "Free 7-Day Trial • $10/Month After • Cancel Anytime • Setup in 2 Minutes"
  },

  // Brand narrative
  narrative: {
    problem: "You possess the intelligence, dedication, and knowledge to achieve your American Dream, but are held back by the language barrier. The deep shame, anxiety, and frustration of having your competence masked by awkward English.",
    solution: "Stop letting language barriers mask your competence. PromptLingo instantly refines your ideas into flawless, professional English for your essays, emails, and patient notes, so you can focus on your career.",
    outcome: "Replace the fear of failure with the confidence of authority, ensuring that every professional and academic communication you send is as competent as you are."
  },

  // Pain points (3-column grid)
  painPoints: [
    {
      title: "The Shame of Miscommunication",
      description: "Your intelligence is hidden by awkward, robotic English that fails to convey your true competence.",
      icon: "user-x"
    },
    {
      title: "The Anxiety of Error",
      description: "The constant fear of making a critical mistake in a patient note or academic essay that could jeopardize your future.",
      icon: "alert-triangle"
    },
    {
      title: "The Time-Sink Exhaustion",
      description: "Hours wasted on manual translation and proofreading, stealing precious time from your family and sleep.",
      icon: "clock"
    }
  ],

  // Trust indicators
  trustIndicators: {
    preHeadline: "Trusted by Students, Nurses, and Professionals in 40+ Countries",
    stats: [
      { value: "5,000+", label: "Students & Professionals" },
      { value: "40+", label: "Countries" },
      { value: "2+ hours", label: "Saved Per Task" },
      { value: "99%", label: "Accuracy Rate" }
    ]
  },

  // Pricing tiers
  pricing: [
    {
      name: "Student/Basic",
      price: 10,
      period: "month",
      description: "Core features, limited usage",
      features: [
        "50 professional translations/month",
        "Basic prompt library",
        "Voice & text input",
        "Email support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional/Unlimited",
      price: 15,
      period: "month",
      description: "Unlimited usage, advanced features",
      features: [
        "Unlimited translations",
        "Advanced prompt library",
        "Dual-view editor",
        "Voice & text input",
        "Priority support",
        "Context-aware AI"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise/Institutional",
      price: null,
      period: "custom",
      description: "For colleges or nursing programs",
      features: [
        "Bulk licensing",
        "Custom integrations",
        "Dedicated support",
        "Analytics dashboard",
        "Training sessions"
      ],
      cta: "Request Institutional Pricing",
      popular: false
    }
  ]
};

export default brandContent;
