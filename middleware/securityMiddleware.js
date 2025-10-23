const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

// ------------------------
// Rate limiting configurations
// ------------------------
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { error: "Too many payment requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ------------------------
// Helmet configuration
// ------------------------
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// ------------------------
// CORS configuration - Allow all origins for development
// ------------------------
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-arifpay-signature"],
};

// ------------------------
// Input sanitization middleware
// ------------------------
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");
  };

  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== "object") return sanitizeString(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

// ------------------------
// Request logging middleware
// ------------------------
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("User-Agent") || "Unknown";

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
  next();
};

// ------------------------
// Error handling middleware
// ------------------------
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: "Validation Error", errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }

  if (err.name === "JsonWebTokenError")
    return res.status(401).json({ message: "Invalid token" });
  if (err.name === "TokenExpiredError")
    return res.status(401).json({ message: "Token expired" });

  if (err.message.includes("CORS"))
    return res.status(403).json({ message: "CORS policy violation" });

  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
};

// ------------------------
// 404 handler
// ------------------------
const notFoundHandler = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};

// ------------------------
// Exports
// ------------------------
module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  helmetConfig,
  corsOptions,
  sanitizeInput,
  requestLogger,
  errorHandler,
  notFoundHandler,
};
