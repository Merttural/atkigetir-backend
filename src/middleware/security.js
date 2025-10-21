const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// SQL Injection ve NoSQL Injection koruması
const sanitizeInput = (req, res, next) => {
  // Request body'yi temizle
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Tehlikeli karakterleri temizle
        req.body[key] = req.body[key]
          .replace(/[<>]/g, '') // HTML tag'lerini kaldır
          .replace(/javascript:/gi, '') // JavaScript protokolünü kaldır
          .replace(/onw+=/gi, '') // Event handler'ları kaldır
          .replace(/script/gi, '') // Script tag'lerini kaldır
          .replace(/iframe/gi, '') // Iframe tag'lerini kaldır
          .replace(/object/gi, '') // Object tag'lerini kaldır
          .replace(/embed/gi, '') // Embed tag'lerini kaldır
          .replace(/form/gi, '') // Form tag'lerini kaldır
          .replace(/input/gi, '') // Input tag'lerini kaldır
          .replace(/textarea/gi, '') // Textarea tag'lerini kaldır
          .replace(/select/gi, '') // Select tag'lerini kaldır
          .replace(/button/gi, '') // Button tag'lerini kaldır
          .replace(/link/gi, '') // Link tag'lerini kaldır
          .replace(/meta/gi, '') // Meta tag'lerini kaldır
          .replace(/style/gi, '') // Style tag'lerini kaldır
          .replace(/title/gi, '') // Title tag'lerini kaldır
          .replace(/base/gi, '') // Base tag'lerini kaldır
          .replace(/bgsound/gi, '') // Bgsound tag'lerini kaldır
          .replace(/link/gi, '') // Link tag'lerini kaldır
          .replace(/meta/gi, '') // Meta tag'lerini kaldır
          .replace(/xml/gi, '') // XML tag'lerini kaldır
          .replace(/xmp/gi, '') // XMP tag'lerini kaldır
          .replace(/plaintext/gi, '') // Plaintext tag'lerini kaldır
          .replace(/listing/gi, '') // Listing tag'lerini kaldır
          .replace(/marquee/gi, '') // Marquee tag'lerini kaldır
          .replace(/applet/gi, '') // Applet tag'lerini kaldır
          .replace(/embed/gi, '') // Embed tag'lerini kaldır
          .replace(/object/gi, '') // Object tag'lerini kaldır
          .replace(/param/gi, '') // Param tag'lerini kaldır
          .replace(/source/gi, '') // Source tag'lerini kaldır
          .replace(/track/gi, '') // Track tag'lerini kaldır
          .replace(/video/gi, '') // Video tag'lerini kaldır
          .replace(/audio/gi, '') // Audio tag'lerini kaldır
          .replace(/canvas/gi, '') // Canvas tag'lerini kaldır
          .replace(/svg/gi, '') // SVG tag'lerini kaldır
          .replace(/math/gi, '') // Math tag'lerini kaldır
          .replace(/details/gi, '') // Details tag'lerini kaldır
          .replace(/dialog/gi, '') // Dialog tag'lerini kaldır
          .replace(/menu/gi, '') // Menu tag'lerini kaldır
          .replace(/menuitem/gi, '') // Menuitem tag'lerini kaldır
          .replace(/summary/gi, '') // Summary tag'lerini kaldır
          .replace(/content/gi, '') // Content tag'lerini kaldır
          .replace(/shadow/gi, '') // Shadow tag'lerini kaldır
          .replace(/slot/gi, '') // Slot tag'lerini kaldır
          .replace(/template/gi, '') // Template tag'lerini kaldır
          .replace(/acronym/gi, '') // Acronym tag'lerini kaldır
          .replace(/applet/gi, '') // Applet tag'lerini kaldır
          .replace(/basefont/gi, '') // Basefont tag'lerini kaldır
          .replace(/bgsound/gi, '') // Bgsound tag'lerini kaldır
          .replace(/big/gi, '') // Big tag'lerini kaldır
          .replace(/blink/gi, '') // Blink tag'lerini kaldır
          .replace(/center/gi, '') // Center tag'lerini kaldır
          .replace(/command/gi, '') // Command tag'lerini kaldır
          .replace(/content/gi, '') // Content tag'lerini kaldır
          .replace(/dir/gi, '') // Dir tag'lerini kaldır
          .replace(/element/gi, '') // Element tag'lerini kaldır
          .replace(/font/gi, '') // Font tag'lerini kaldır
          .replace(/frame/gi, '') // Frame tag'lerini kaldır
          .replace(/frameset/gi, '') // Frameset tag'lerini kaldır
          .replace(/isindex/gi, '') // Isindex tag'lerini kaldır
          .replace(/keygen/gi, '') // Keygen tag'lerini kaldır
          .replace(/listing/gi, '') // Listing tag'lerini kaldır
          .replace(/marquee/gi, '') // Marquee tag'lerini kaldır
          .replace(/multicol/gi, '') // Multicol tag'lerini kaldır
          .replace(/nextid/gi, '') // Nextid tag'lerini kaldır
          .replace(/noembed/gi, '') // Noembed tag'lerini kaldır
          .replace(/noframes/gi, '') // Noframes tag'lerini kaldır
          .replace(/noscript/gi, '') // Noscript tag'lerini kaldır
          .replace(/plaintext/gi, '') // Plaintext tag'lerini kaldır
          .replace(/spacer/gi, '') // Spacer tag'lerini kaldır
          .replace(/strike/gi, '') // Strike tag'lerini kaldır
          .replace(/tt/gi, '') // TT tag'lerini kaldır
          .replace(/u/gi, '') // U tag'lerini kaldır
          .replace(/xmp/gi, ''); // XMP tag'lerini kaldır
      }
    });
  }

  // Query parametrelerini temizle
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/onw+=/gi, '')
          .replace(/script/gi, '')
          .replace(/iframe/gi, '')
          .replace(/object/gi, '')
          .replace(/embed/gi, '')
          .replace(/form/gi, '')
          .replace(/input/gi, '')
          .replace(/textarea/gi, '')
          .replace(/select/gi, '')
          .replace(/button/gi, '')
          .replace(/link/gi, '')
          .replace(/meta/gi, '')
          .replace(/style/gi, '')
          .replace(/title/gi, '')
          .replace(/base/gi, '')
          .replace(/bgsound/gi, '')
          .replace(/link/gi, '')
          .replace(/meta/gi, '')
          .replace(/xml/gi, '')
          .replace(/xmp/gi, '')
          .replace(/plaintext/gi, '')
          .replace(/listing/gi, '')
          .replace(/marquee/gi, '')
          .replace(/applet/gi, '')
          .replace(/embed/gi, '')
          .replace(/object/gi, '')
          .replace(/param/gi, '')
          .replace(/source/gi, '')
          .replace(/track/gi, '')
          .replace(/video/gi, '')
          .replace(/audio/gi, '')
          .replace(/canvas/gi, '')
          .replace(/svg/gi, '')
          .replace(/math/gi, '')
          .replace(/details/gi, '')
          .replace(/dialog/gi, '')
          .replace(/menu/gi, '')
          .replace(/menuitem/gi, '')
          .replace(/summary/gi, '')
          .replace(/content/gi, '')
          .replace(/shadow/gi, '')
          .replace(/slot/gi, '')
          .replace(/template/gi, '')
          .replace(/acronym/gi, '')
          .replace(/applet/gi, '')
          .replace(/basefont/gi, '')
          .replace(/bgsound/gi, '')
          .replace(/big/gi, '')
          .replace(/blink/gi, '')
          .replace(/center/gi, '')
          .replace(/command/gi, '')
          .replace(/content/gi, '')
          .replace(/dir/gi, '')
          .replace(/element/gi, '')
          .replace(/font/gi, '')
          .replace(/frame/gi, '')
          .replace(/frameset/gi, '')
          .replace(/isindex/gi, '')
          .replace(/keygen/gi, '')
          .replace(/listing/gi, '')
          .replace(/marquee/gi, '')
          .replace(/multicol/gi, '')
          .replace(/nextid/gi, '')
          .replace(/noembed/gi, '')
          .replace(/noframes/gi, '')
          .replace(/noscript/gi, '')
          .replace(/plaintext/gi, '')
          .replace(/spacer/gi, '')
          .replace(/strike/gi, '')
          .replace(/tt/gi, '')
          .replace(/u/gi, '')
          .replace(/xmp/gi, '');
      }
    });
  }

  // URL parametrelerini temizle
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key]
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/onw+=/gi, '')
          .replace(/script/gi, '')
          .replace(/iframe/gi, '')
          .replace(/object/gi, '')
          .replace(/embed/gi, '')
          .replace(/form/gi, '')
          .replace(/input/gi, '')
          .replace(/textarea/gi, '')
          .replace(/select/gi, '')
          .replace(/button/gi, '')
          .replace(/link/gi, '')
          .replace(/meta/gi, '')
          .replace(/style/gi, '')
          .replace(/title/gi, '')
          .replace(/base/gi, '')
          .replace(/bgsound/gi, '')
          .replace(/link/gi, '')
          .replace(/meta/gi, '')
          .replace(/xml/gi, '')
          .replace(/xmp/gi, '')
          .replace(/plaintext/gi, '')
          .replace(/listing/gi, '')
          .replace(/marquee/gi, '')
          .replace(/applet/gi, '')
          .replace(/embed/gi, '')
          .replace(/object/gi, '')
          .replace(/param/gi, '')
          .replace(/source/gi, '')
          .replace(/track/gi, '')
          .replace(/video/gi, '')
          .replace(/audio/gi, '')
          .replace(/canvas/gi, '')
          .replace(/svg/gi, '')
          .replace(/math/gi, '')
          .replace(/details/gi, '')
          .replace(/dialog/gi, '')
          .replace(/menu/gi, '')
          .replace(/menuitem/gi, '')
          .replace(/summary/gi, '')
          .replace(/content/gi, '')
          .replace(/shadow/gi, '')
          .replace(/slot/gi, '')
          .replace(/template/gi, '')
          .replace(/acronym/gi, '')
          .replace(/applet/gi, '')
          .replace(/basefont/gi, '')
          .replace(/bgsound/gi, '')
          .replace(/big/gi, '')
          .replace(/blink/gi, '')
          .replace(/center/gi, '')
          .replace(/command/gi, '')
          .replace(/content/gi, '')
          .replace(/dir/gi, '')
          .replace(/element/gi, '')
          .replace(/font/gi, '')
          .replace(/frame/gi, '')
          .replace(/frameset/gi, '')
          .replace(/isindex/gi, '')
          .replace(/keygen/gi, '')
          .replace(/listing/gi, '')
          .replace(/marquee/gi, '')
          .replace(/multicol/gi, '')
          .replace(/nextid/gi, '')
          .replace(/noembed/gi, '')
          .replace(/noframes/gi, '')
          .replace(/noscript/gi, '')
          .replace(/plaintext/gi, '')
          .replace(/spacer/gi, '')
          .replace(/strike/gi, '')
          .replace(/tt/gi, '')
          .replace(/u/gi, '')
          .replace(/xmp/gi, '');
      }
    });
  }

  next();
};

// Rate limiting
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Güvenlik middleware'lerini birleştir
const securityMiddleware = [
  // Helmet - Güvenlik başlıkları
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.atkigetir.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
  
  // XSS koruması
  xss(),
  
  // NoSQL Injection koruması
  mongoSanitize(),
  
  // HTTP Parameter Pollution koruması
  hpp(),
  
  // Input sanitization
  sanitizeInput,
  
  // Rate limiting
  createRateLimit(15 * 60 * 1000, 100), // 15 dakikada 100 istek
];

// API rate limiting (development için çok artırıldı)
const apiRateLimit = createRateLimit(15 * 60 * 1000, 10000); // 15 dakikada 10000 istek (development)

// Auth rate limiting (development için çok artırıldı)
const authRateLimit = createRateLimit(15 * 60 * 1000, 20000); // 15 dakikada 20000 istek (development)

module.exports = {
  securityMiddleware,
  apiRateLimit,
  authRateLimit,
  sanitizeInput,
  createRateLimit
}; 
