/**
 * PromptLingo Brand Identity & Design System
 * Generated from brand research and design specifications
 */

export const brandDesignSystem = {
  // Brand Identity
  brand: {
    name: "PromptLingo",
    tagline: "Your Professional Voice Amplifier",
    description: "The essential bridge for ambitious immigrant women who possess the intelligence, dedication, and knowledge to achieve their American Dream, but are held back by the language barrier.",
    
    essence: [
      "Authority",
      "Clarity", 
      "Empowerment",
      "Trust",
      "Efficiency",
      "Warmth"
    ],
    
    voice: {
      tone: "Professional, Reassuring, and Confident",
      language: "Clear, Direct, and Aspirational",
      style: "Solution-Oriented, Emphasizing Gain and Avoidance"
    }
  },

  // Design Tokens
  colors: {
    primary: {
      coral: "#FF7B54",
      peach: "#FFB26B", 
      mint: "#8DE3A6",
      skyBlue: "#4D8BFF",
      indigo: "#333399"
    },
    neutral: {
      textPrimary: "#1A202C",
      textSecondary: "#718096",
      backgroundLight: "#F7FAFC",
      white: "#FFFFFF",
      black: "#000000"
    },
    functional: {
      success: "#38A169",
      warning: "#D69E2E",
      error: "#E53E3E",
      info: "#4299E1"
    }
  },

  typography: {
    fontFamily: {
      primary: "Inter, sans-serif",
      secondary: "DM Serif Display, serif"
    },
    sizes: {
      h1: { rem: "3rem", px: "48px", lineHeight: "1.2" },
      h2: { rem: "2.5rem", px: "40px", lineHeight: "1.25" },
      h3: { rem: "2rem", px: "32px", lineHeight: "1.3" },
      h4: { rem: "1.5rem", px: "24px", lineHeight: "1.4" },
      h5: { rem: "1.25rem", px: "20px", lineHeight: "1.5" },
      h6: { rem: "1rem", px: "16px", lineHeight: "1.5" },
      bodyRegular: { rem: "1rem", px: "16px", lineHeight: "1.6" },
      bodySmall: { rem: "0.875rem", px: "14px", lineHeight: "1.6" },
      bodyXSmall: { rem: "0.75rem", px: "12px", lineHeight: "1.5" },
      display: { rem: "4rem", px: "64px", lineHeight: "1.1" },
      caption: { rem: "0.625rem", px: "10px", lineHeight: "1.4" }
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },

  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },

  borderRadius: {
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.5rem",
    xl: "1rem",
    full: "9999px"
  },

  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px"
  },

  // Gradient
  gradient: {
    primary: "linear-gradient(135deg, #FF7B54 0%, #FFB26B 25%, #8DE3A6 50%, #4D8BFF 75%, #333399 100%)"
  }
};

export type BrandDesignSystem = typeof brandDesignSystem;

export default brandDesignSystem;
