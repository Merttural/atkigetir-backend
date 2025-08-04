const { body, validationResult, param, query } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation error',
      details: errors.array()
    });
  }
  next();
};

const validateProduct = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Ürün adı 2-100 karakter arasında olmalıdır'),
  body('price').isFloat({ min: 0 }).withMessage('Geçerli bir fiyat giriniz'),
  body('description').trim().isLength({ min: 10 }).withMessage('Açıklama en az 10 karakter olmalıdır'),
  body('category').trim().notEmpty().withMessage('Kategori seçiniz'),
  validate
];

const validateCategory = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Kategori adı 2-50 karakter arasında olmalıdır'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Açıklama 200 karakterden uzun olamaz'),
  body('order').optional().isInt({ min: 0 }).withMessage('Sıra numarası 0 veya daha büyük olmalıdır'),
  validate
];

const validateUser = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('İsim 2-50 karakter arasında olmalıdır'),
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  validate
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').notEmpty().withMessage('Şifre gereklidir'),
  validate
];

// ID parametreleri için validation
const validateId = [
  param('id').isMongoId().withMessage('Geçersiz ID formatı'),
  validate
];

// Query parametreleri için validation
const validateSearch = [
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Arama terimi çok uzun'),
  query('page').optional().isInt({ min: 1 }).withMessage('Sayfa numarası 1 veya daha büyük olmalıdır'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında olmalıdır'),
  validate
];

// Slug parametreleri için validation
const validateSlug = [
  param('slug').matches(/^[a-z0-9-]+$/).withMessage('Geçersiz slug formatı'),
  validate
];

module.exports = {
  validate,
  validateProduct,
  validateCategory,
  validateUser,
  validateLogin,
  validateId,
  validateSearch,
  validateSlug
}; 