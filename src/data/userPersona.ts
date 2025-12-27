/**
 * User Persona: Sofia Rodriguez
 * Based on diary entries and user research
 */

export interface UserPersona {
  name: string;
  role: string;
  background: string;
  painPoints: string[];
  goals: string[];
  emotions: {
    before: string[];
    during: string[];
    after: string[];
  };
  keyInsights: string[];
}

export const sofiaRodriguez: UserPersona = {
  name: "Sofia Rodriguez",
  role: "CNA pursuing RN certification",
  background: "Ambitious immigrant woman with intelligence, dedication, and knowledge to achieve the American Dream, held back by the language barrier",
  
  painPoints: [
    "Deep shame and anxiety from having competence masked by awkward English",
    "Fear of public embarrassment and academic failure",
    "Time theft from using inadequate translation tools like Google Translate",
    "Stress from critical communication errors in professional settings",
    "Feeling reduced to incompetence despite professional expertise"
  ],
  
  goals: [
    "Achieve RN certification",
    "Communicate with professional authority",
    "Save time and mental energy",
    "Gain professional credibility",
    "Provide better future for family"
  ],
  
  emotions: {
    before: [
      "Shame - 'This language reduces me to an idiot'",
      "Anxiety - 'What if I fail this class?'",
      "Frustration - 'My knowledge is trapped inside me'",
      "Anger - 'I hate this invisible, hateful wall of English'"
    ],
    during: [
      "Resentment - 'Why couldn't I write this?'",
      "Relief - 'This is what I meant!'",
      "Hope - 'It sounds like a professional, a peer'",
      "Anxiety - 'Is this too good? Will they know?'"
    ],
    after: [
      "Confidence - 'The stone of shame has finally cracked'",
      "Relief - 'I did not fail. I was understood'",
      "Pride - 'This tool honors my effort'",
      "Empowerment - 'I am no longer fighting the language; I am using it'"
    ]
  },
  
  keyInsights: [
    "The problem was never intelligence - it was the translation gap",
    "Time saved is a physical, tangible gift (2 hours to spend with family)",
    "The app is a professional voice amplifier, not a language tutor",
    "Success metric: Being understood and recognized for competence",
    "The app removes the barrier hiding existing competence"
  ]
};

export default sofiaRodriguez;
