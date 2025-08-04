const express = require('express');
const router = express.Router();
const dbConnect = require('../../lib/mongodb');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { validateUser, validateLogin } = require('../../middleware/validation');
const { sanitizeInput } = require('../../middleware/security');

const JWT_SECRET = process.env.JWT_SECRET || 'atkigetir_secret_key';

// Kayıt
router.post('/register', sanitizeInput, validateUser, async (req, res) => {
  try {
    await dbConnect();
    const { name, email, password } = req.body;
    
    // Email kontrolü
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        error: 'Bu e-posta adresi zaten kayıtlı' 
      });
    }
    
    // Yeni kullanıcı oluştur (password otomatik hash'lenecek)
    const user = await User.create({ 
      name, 
      email, 
      password,
      role: 'user' 
    });
    
    return res.status(201).json({ 
      message: 'Kayıt başarılı',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Kayıt işlemi başarısız',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Giriş
router.post('/login', sanitizeInput, validateLogin, async (req, res) => {
  try {
    await dbConnect();
    const { email, password } = req.body;
    
    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        error: 'E-posta veya şifre hatalı' 
      });
    }
    
    // Aktif kullanıcı kontrolü
    if (!user.isActive) {
      return res.status(400).json({ 
        error: 'Hesabınız devre dışı bırakılmış' 
      });
    }
    
    // Şifre kontrolü
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        error: 'E-posta veya şifre hatalı' 
      });
    }
    
    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role, 
        name: user.name, 
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    return res.status(200).json({ 
      message: 'Giriş başarılı', 
      user: {
        id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role 
      }, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Giriş işlemi başarısız',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Çıkış
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Çıkış yapıldı' });
});

// Me (kimlik doğrulama)
router.get('/me', async (req, res) => {
  try {
    await dbConnect();
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Oturum bulunamadı' 
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Geçersiz oturum' 
      });
    }
    
    return res.status(200).json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(401).json({ 
      error: 'Geçersiz oturum' 
    });
  }
});

module.exports = router; 