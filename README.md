# Promptlingo - Original React App

The original Promptlingo web application built with React and TypeScript.

## Features

- **Voice Recording & Transcription**: Record audio and transcribe using OpenAI Whisper API
- **AI-Powered Translation**: Translate between English, Spanish, and Haitian Creole
- **Tone Enhancement**: Apply different tones (professional, casual, formal, friendly) to your translations
- **ElevenLabs Text-to-Speech**: High-quality AI voice synthesis
- **Advanced Competence Meter**: Detailed scoring and feedback on translation quality
- **Speaker Tracking**: Continuous recording with speaker identification
- **WASM Text Processing**: Fast client-side text processing using Rust/WebAssembly
- **User Authentication**: Google OAuth integration
- **Stripe Payment Integration**: Subscription and payment processing
- **Translation History**: Encrypted local storage of translation history

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Authentication**: Google OAuth
- **Payment**: Stripe
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Prerequisites

- Node.js 16+
- npm or yarn
- Backend server running (see server setup)

## Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key
REACT_APP_ELEVENLABS_API_KEY=your_elevenlabs_key
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will run on [http://localhost:3000](http://localhost:3000) by default.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/         # Reusable UI components
├── contexts/          # React context providers
├── services/          # API services and business logic
├── config/            # Configuration files
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── types/             # TypeScript type definitions
└── App.tsx            # Main application component
```

## Backend Integration

This frontend requires the Promptlingo backend server to be running. The backend handles:
- OpenAI API calls (translation, Whisper transcription)
- ElevenLabs API calls (text-to-speech)
- User authentication
- Payment processing
- Database operations

See the backend repository for setup instructions.

## Features Overview

### Translation
- Real-time audio recording with visual feedback
- Automatic transcription using Whisper API
- AI-powered translation with tone customization
- Quality scoring and improvement suggestions

### Text-to-Speech
- Multiple voice options (male/female, various accents)
- Adjustable speech rate (0.5x - 2x)
- Play/pause/resume controls
- Support for English, Spanish, Haitian Creole, and French

### User Management
- Google OAuth authentication
- Usage tracking and limits
- Subscription management
- Payment history

## Contributing

This is the stable, production-ready version of Promptlingo. For the Next.js version currently in development, see the main repository.

## License

Proprietary - All rights reserved
