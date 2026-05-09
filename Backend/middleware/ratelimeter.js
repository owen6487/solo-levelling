const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// Custom handler — signature is (req, res, next, options) in express-rate-limit v6+
const handleRateLimit = (req, res, next, options) => {
    const retryAfter = req.rateLimit?.resetTime
        ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
        : options.windowMs / 1000;

    const minutes = Math.floor(retryAfter / 60);
    const seconds = retryAfter % 60;
    const timeDisplay = minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;

    res.status(429).json({
        message: typeof options.message === 'object' ? options.message.message : options.message,
        retryAfter,
        timeRemaining: timeDisplay,
        lockedUntil: req.rateLimit?.resetTime || null,
        timestamp: new Date().toISOString()
    });
};

// General API rate limiter — 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: handleRateLimit,
    // ipKeyGenerator handles IPv6 properly — required in express-rate-limit v8
    keyGenerator: (req) => {
        const forwarded = req.headers['x-forwarded-for']?.split(',')[0].trim();
        return forwarded || ipKeyGenerator(req);
    },
});

// Strict rate limiter for authentication endpoints — 5 attempts per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: handleRateLimit,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        const forwarded = req.headers['x-forwarded-for']?.split(',')[0].trim();
        return forwarded || ipKeyGenerator(req);
    },
});

// Rate limiter for password reset — 3 attempts per 1 hour
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { message: 'Too many password reset attempts, please try again after 1 hour' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: handleRateLimit,
    keyGenerator: (req) => {
        const forwarded = req.headers['x-forwarded-for']?.split(',')[0].trim();
        return forwarded || ipKeyGenerator(req);
    },
});

module.exports = { apiLimiter, authLimiter, passwordResetLimiter };
