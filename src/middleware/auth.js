const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  console.log('[AUTH] Auth middleware called');
  console.log('[AUTH] Headers:', req.headers);
  
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('[AUTH] Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('[AUTH] No token found');
      return res.status(401).json({ error: 'Token bulunamadı' });
    }

    console.log('[AUTH] JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH] Decoded token:', decoded);
    
    // JWT token'da 'id' field'ı var, 'userId' değil
    const userId = decoded.userId || decoded.id;
    console.log('[AUTH] User ID from token:', userId);
    
    const user = await User.findById(userId);
    console.log('[AUTH] User found:', user ? user.name : 'Not found');

    if (!user || !user.isActive) {
      console.log('[AUTH] Invalid user or inactive');
      return res.status(401).json({ error: 'Geçersiz token' });
    }

    req.user = user;
    console.log('[AUTH] User set in request:', user.name);
    next();
  } catch (error) {
    console.error('[AUTH] Error:', error.message);
    res.status(401).json({ error: 'Token doğrulanamadı' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    
    next();
  } catch (error) {
    res.status(403).json({ error: 'Yetki hatası' });
  }
};

module.exports = { auth, adminAuth }; 