/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PromptLingo Brand Primary Colors
        brand: {
          coral: '#FF7B54',
          peach: '#FFB26B',
          mint: '#8DE3A6',
          skyBlue: '#4D8BFF',
          indigo: '#333399',
        },
        // Primary color scale (using skyBlue as base)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4D8BFF', // Brand skyBlue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#333399', // Brand indigo
        },
        // Neutral colors from brand system
        neutral: {
          textPrimary: '#1A202C',
          textSecondary: '#718096',
          backgroundLight: '#F7FAFC',
          white: '#FFFFFF',
          black: '#000000',
        },
        // Functional colors from brand system
        success: '#38A169',
        warning: '#D69E2E',
        error: '#E53E3E',
        info: '#4299E1',
        // Legacy accent colors (kept for compatibility)
        accent: {
          red: '#DC2626',
          blue: '#00209F',
          haitian: '#D21034',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      borderRadius: {
        'sm': '0.125rem',
        'md': '0.25rem',
        'lg': '0.5rem',
        'xl': '1rem',
        'full': '9999px',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #FF7B54 0%, #FFB26B 25%, #8DE3A6 50%, #4D8BFF 75%, #333399 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
