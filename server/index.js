// IMPORTANT: Sentry must be imported and initialized FIRST
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Initialize Sentry for error tracking and performance monitoring
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
  });
  console.log('✅ Sentry error monitoring enabled');
} else {
  console.warn('⚠️  Sentry DSN not configured - error tracking disabled');
}

const transcribeRoute = require('./routes/transcribe');
const translateRoute = require('./routes/translate');
const synthesizeRoute = require('./routes/synthesize');
const voicesRoute = require('./routes/voices');
const wasmRoute = require('./routes/wasm');
const authRoute = require('./routes/auth');
const accountRoute = require('./routes/account');
const userRoute = require('./routes/user');
const healthRoute = require('./routes/health');
const usageRoute = require('./routes/usage');
const stripeRoute = require('./routes/stripe');
const promotionsRoute = require('./routes/promotions');
const { testConnection } = require('./db/connection');
const { requestLogger, errorLogger} = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { trackUsage } = require('./middleware/usageMiddleware');
const { authenticateToken, providerBasedAuth } = require('./middleware/authMiddleware');
const validateEnv = require('./utils/validateEnv');
const { cleanupOrphanedFiles } = require('./utils/cleanupOrphanedFiles');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware - configured for Google OAuth
// Disable COOP in development to allow Google OAuth popups
const isDevelopment = process.env.NODE_ENV === 'development';

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: isDevelopment ? false : { policy: "same-origin-allow-popups" }, // Disable in dev
  crossOriginEmbedderPolicy: false, // Disable to allow Google OAuth
  contentSecurityPolicy: isDevelopment ? false : { // Disable CSP in development
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://oauth2.googleapis.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      // SECURITY: Removed 'unsafe-inline' to prevent XSS attacks
      // Google OAuth scripts are loaded from their CDN with integrity checks
      scriptSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com"],
      // Use nonce or hash for inline styles if needed, but avoid 'unsafe-inline'
      styleSrc: ["'self'", "https://accounts.google.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
    }
  }
}));

// SECURITY: Add HSTS headers in production (force HTTPS)
if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }));
  console.log('🔒 HSTS headers enabled (HTTPS enforced)');
}

// Trust proxy - required for rate limiter to work correctly
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration - must be before routes
// SECURITY: Explicit whitelist only - no regex patterns for production
const allowedOrigins = [
  // Development origins - only allowed in dev mode
  ...(isDevelopment ? [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173', // Vite dev server
    'http://192.168.1.96:3000', // Your specific local IP
    'http://192.168.1.96:3001',
  ] : []),

  // Production origins - MUST be exact matches
  'https://promptlingo.ai', // Main production domain (custom domain)
  'https://www.promptlingo.ai', // WWW subdomain
  'https://promptmylingo.netlify.app', // Netlify fallback domain
  'https://promptlingomobile.netlify.app', // Mobile Netlify app
  process.env.PRODUCTION_FRONTEND_URL, // Production URL from env
].filter(Boolean); // Remove undefined values

console.log('🌐 CORS Configuration:');
console.log('   - Environment:', process.env.NODE_ENV || 'development');
console.log('   - Allowed Origins:', allowedOrigins.join(', '));

const corsOptions = {
  origin: function (origin, callback) {
    // SECURITY: Only allow no-origin requests in development (for testing tools)
    if (!origin) {
      if (isDevelopment) {
        return callback(null, true);
      } else {
        console.warn('❌ CORS: Blocked request with no origin (production)');
        return callback(new Error('Not allowed by CORS - origin required'));
      }
    }

    // Check if origin is in exact whitelist
    const isAllowed = allowedOrigins.includes(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS: Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 hours - cache preflight requests
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// SENTRY: RequestHandler must be the first middleware on the app
if (process.env.SENTRY_DSN && Sentry.Handlers) {
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}

// Logging
app.use(morgan('combined'));

// Request logging middleware
app.use(requestLogger);

// Stripe webhook route MUST be registered BEFORE JSON parser
// Webhook signature verification requires raw body
const stripeWebhookRouter = express.Router();
const { stripe } = require('./services/stripeService');
const {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted
} = require('./services/stripeService');

stripeWebhookRouter.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error(`❌ Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
          console.log('📥 Subscription created');
          await handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          console.log('📥 Subscription updated');
          await handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          console.log('📥 Subscription deleted');
          await handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          console.log('📥 Payment succeeded');
          if (event.data.object.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              event.data.object.subscription
            );
            await handleSubscriptionUpdated(subscription);
          }
          break;

        case 'invoice.payment_failed':
          console.log('📥 Payment failed');
          break;

        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error(`❌ Error handling webhook event:`, error);
      res.status(500).json({
        error: 'Webhook handler failed',
        message: error.message,
      });
    }
  }
);

app.use('/api/stripe', stripeWebhookRouter);

// Body parsing middleware - Increased limits for large translation requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 100000 }));
app.use(cookieParser());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/mpeg',
      'audio/mpga',
      'audio/m4a',
      'audio/wav',
      'audio/webm'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PromptLingo API is running',
    status: 'ok',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      transcribe: '/api/transcribe',
      translate: '/api/translate',
      synthesize: '/api/synthesize',
      voices: '/api/voices',
      auth: '/api/auth'
    }
  });
});

// SECURITY: Comprehensive health check endpoints
// Liveness probe - is the app alive?
app.get('/health/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
    }
  });
});

// Readiness probe - is the app ready to serve traffic?
app.get('/health/ready', async (req, res) => {
  const checks = {
    database: false,
    openai: false,
    elevenlabs: false,
  };

  try {
    // Check database connection
    const db = require('./config/database');
    await db.query('SELECT 1');
    checks.database = true;
  } catch (error) {
    // Database check failed - will be reflected in response status
  }

  try {
    // Check OpenAI API key exists (don't test the actual API)
    checks.openai = !!process.env.OPENAI_API_KEY;
  } catch (error) {
    // OpenAI check failed
  }

  try {
    // Check ElevenLabs API key exists
    checks.elevenlabs = !!process.env.ELEVENLABS_API_KEY;
  } catch (error) {
    // ElevenLabs check failed
  }

  const isReady = checks.database && checks.openai;
  const status = isReady ? 200 : 503;

  res.status(status).json({
    status: isReady ? 'ready' : 'not ready',
    timestamp: new Date().toISOString(),
    checks,
    ready: isReady
  });
});

// Simple health check (for backwards compatibility)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// SECURITY: Debug endpoints removed for production
// /api/cors-test - REMOVED (debug only, exposes CORS configuration)
// /api/health - REMOVED (exposes API key status)

// API routes
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/auth', accountRoute);
app.use('/api/user', userRoute);
app.use('/api/usage', usageRoute);
app.use('/api/stripe', stripeRoute);
app.use('/api/promotions', promotionsRoute);
// SECURITY: Require authentication for transcription (tracks usage)
app.use('/api/transcribe', upload.single('audio'), authenticateToken, trackUsage, transcribeRoute);
app.use('/api/translate', providerBasedAuth, trackUsage, translateRoute);
app.use('/api/synthesize', authenticateToken, trackUsage, synthesizeRoute);
app.use('/api/voices', voicesRoute);
app.use('/api/wasm', wasmRoute);

// Error logging middleware
app.use(errorLogger);

// SENTRY: ErrorHandler must be registered before other error handlers
if (process.env.SENTRY_DSN && Sentry.Handlers) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

// API Keys validation
console.log('🔑 API Keys Check:');
console.log(`   - OpenAI: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing'}`);
console.log(`   - ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? '✓ Set' : '✗ Missing'}`);
console.log(`   - Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing'}`);
console.log(`   - Database: ${process.env.DATABASE_URL ? '✓ Set' : '✗ Missing'}`);
console.log(`   - JWT Secret: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Missing'}`);

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  WARNING: OPENAI_API_KEY not set. Transcription and translation will fail.');
}

if (!process.env.ELEVENLABS_API_KEY) {
  console.warn('⚠️  WARNING: ELEVENLABS_API_KEY not set. Speech synthesis will fail.');
}

if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn('⚠️  WARNING: GOOGLE_CLIENT_ID not set. Google authentication will fail.');
}

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  WARNING: DATABASE_URL not set. User authentication and data persistence will fail.');
}

// Initialize database and start server
const startServer = async () => {
  try {
    // Validate environment variables (only for required ones)
    try {
      validateEnv();
    } catch (error) {
      console.error('❌ Environment validation failed:', error.message);
      console.error('   Please check your .env file and ensure all required variables are set.');
      process.exit(1);
    }

    // Test database connection
    if (process.env.DATABASE_URL) {
      const connected = await testConnection();
      if (!connected) {
        console.warn('⚠️  Database connection failed, but server will continue\n');
      }
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📁 Uploads directory: ${uploadsDir}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`\n✅ Google OAuth Authentication System Ready!`);
      console.log(`   - Login: POST /api/auth/google/login`);
      console.log(`   - Logout: POST /api/auth/logout`);
      console.log(`   - Verify: GET /api/auth/verify`);
      console.log(`   - Refresh: POST /api/auth/refresh`);
      console.log(`   - Current User: GET /api/auth/user`);
      console.log(`   - Auth Status: GET /api/auth/status\n`);

      // Run cleanup immediately on startup
      cleanupOrphanedFiles();

      // Schedule cleanup to run every 5 minutes
      setInterval(() => {
        cleanupOrphanedFiles();
      }, 5 * 60 * 1000); // 5 minutes

      console.log('🧹 Automated file cleanup enabled (runs every 5 minutes)\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
