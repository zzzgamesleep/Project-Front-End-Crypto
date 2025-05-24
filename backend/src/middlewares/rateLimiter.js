const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many requests from this IP, please try again later.'
});

module.exports = { generalLimiter, apiLimiter };
