const express = require('express');
const dbConnect = require('../../lib/mongodb');
const User = require('../../models/User');
const Order = require('../../models/Order');
const { auth } = require('../../middleware/auth');
const { validateId } = require('../../middleware/validation');
const { sanitizeInput } = require('../../middleware/security');

const router = express.Router();

// GET /api/users - Admin only
router.get('/', async (req, res) => {
  try {
    await dbConnect();

    const users = await User.find({}).sort({ registered: -1 });
    res.status(200).json({ users });
  } catch (err) {
    console.error('Kullanıcıları alırken hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// PUT /api/users/:id/role - Admin yetkisi verme (geçici endpoint)
router.put('/:id/role', validateId, sanitizeInput, async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    res.status(200).json({ 
      message: 'Kullanıcı yetkisi güncellendi',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Kullanıcı yetkisi güncellenirken hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// PUT /api/users/:id/password - Şifre değiştirme (geçici endpoint)
router.put('/:id/password', validateId, sanitizeInput, async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const { password } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Şifreyi hash'le
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ 
      message: 'Şifre başarıyla değiştirildi',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Şifre değiştirilirken hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// GET /api/users/profile - Kullanıcının kendi profil bilgileri
router.get('/profile', auth, async (req, res) => {
  console.log('[USERS API] Profile endpoint called');
  try {
    await dbConnect();
    
    const userId = req.user._id;
    console.log('[USERS API] User ID:', userId);
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log('[USERS API] User not found');
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    console.log('[USERS API] User found:', user.name);

    // Kullanıcının siparişlerini getir
    const orders = await Order.find({ customerName: user.name }).sort({ createdAt: -1 });
    console.log('[USERS API] Orders found:', orders.length);
    
    // İstatistikleri hesapla
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const joinDate = user.registered;
    
    // Üyelik süresini hesapla
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const membershipDuration = diffDays > 30 ? `${Math.floor(diffDays / 30)} Ay` : `${diffDays} Gün`;

    const profileData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        joinDate: user.registered
      },
      stats: {
        totalOrders,
        totalSpent: `₺${totalSpent.toFixed(0)}`,
        membershipDuration,
        favoriteProducts: 0 // Şimdilik 0, favori sistemi eklendiğinde güncellenir
      },
      orders: orders.slice(0, 5) // Son 5 sipariş
    };

    console.log('[USERS API] Profile data sent');
    res.status(200).json(profileData);
  } catch (err) {
    console.error('[USERS API] Profil bilgileri alınırken hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// GET /api/users/orders - Kullanıcının kendi siparişleri
router.get('/orders', auth, async (req, res) => {
  console.log('[USERS API] Orders endpoint called');
  try {
    await dbConnect();
    
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const orders = await Order.find({ customerName: user.name }).sort({ createdAt: -1 });
    
    // Sipariş durumlarını Türkçe'ye çevir
    const ordersWithStatus = orders.map(order => ({
      ...order.toObject(),
      status: order.status === 'pending' ? 'Hazırlanıyor' : 
              order.status === 'completed' ? 'Teslim Edildi' : 
              order.status === 'cancelled' ? 'İptal Edildi' : 'Beklemede',
      statusColor: order.status === 'pending' ? 'text-orange-600 bg-orange-50' :
                   order.status === 'completed' ? 'text-green-600 bg-green-50' :
                   order.status === 'cancelled' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
    }));

    res.status(200).json({ orders: ordersWithStatus });
  } catch (err) {
    console.error('Siparişler alınırken hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// GET /api/users/activities - Kullanıcının kendi aktiviteleri
router.get('/activities', auth, async (req, res) => {
  console.log('[USERS API] Activities endpoint called');
  try {
    await dbConnect();
    
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const orders = await Order.find({ customerName: user.name }).sort({ createdAt: -1 }).limit(10);
    
    const activities = orders.map(order => ({
      id: order._id,
      type: 'order',
      title: `Sipariş #${order._id.toString().slice(-4)} ${order.status === 'completed' ? 'teslim edildi' : 'hazırlanıyor'}`,
      date: order.createdAt,
      status: order.status
    }));

    res.status(200).json({ activities });
  } catch (err) {
    console.error('Aktiviteler alınırken hata:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
