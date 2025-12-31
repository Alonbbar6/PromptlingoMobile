/**
 * Request Logger Middleware
 * Logs all incoming requests and responses
 */

/**
 * Log request details
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  console.log(`📥 ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '🔴' : '🟢';
    
    console.log(`${statusColor} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
};

/**
 * Log authentication attempts
 */
const authLogger = (req, res, next) => {
  console.log('🔐 Auth attempt:', {
    path: req.path,
    method: req.method,
    hasToken: !!req.headers.authorization,
    timestamp: new Date().toISOString()
  });

  next();
};

/**
 * Log errors
 */
const errorLogger = (err, req, res, next) => {
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  next(err);
};

module.exports = {
  requestLogger,
  authLogger,
  errorLogger
};
