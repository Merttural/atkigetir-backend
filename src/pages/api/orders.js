const express = require('express');
const router = express.Router();
const dbConnect = require('../../lib/mongodb');
const Order = require('../../models/Order');

// Eğer ?stats=1 ile gelirse, istatistik verilerini döndür
router.get('/stats', async (req, res) => {
  try {
    await dbConnect();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Bugünkü siparişler
    const todaysOrders = await Order.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
    const todaysSales = todaysOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Tüm siparişler
    const allOrders = await Order.find({});
    const totalSales = allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
    // Benzersiz müşteri sayısı (customerName)
    const customerSet = new Set(allOrders.map(o => o.customerName));
    const totalCustomers = customerSet.size;

    return res.status(200).json({
      todaysSales,
      totalOrders: allOrders.length,
      totalSales,
      pendingOrders,
      totalCustomers
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Son 5 sipariş
router.get('/recent', async (req, res) => {
  try {
    await dbConnect();
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5);
    return res.status(200).json({ orders: recentOrders });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// En çok satan 5 ürün
router.get('/bestsellers', async (req, res) => {
  try {
    await dbConnect();
    // MongoDB aggregation ile productName'e göre grupla ve toplam satış miktarına göre sırala
    const bestSellers = await Order.aggregate([
      { $group: { _id: "$productName", sales: { $sum: "$quantity" }, revenue: { $sum: "$totalPrice" } } },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);
    return res.status(200).json({ bestSellers });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tüm siparişleri getir
router.get('/', async (req, res) => {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni sipariş oluştur
router.post('/', async (req, res) => {
  try {
    await dbConnect();
    const { customerName, productName, quantity, totalPrice } = req.body;
    const newOrder = await Order.create({ customerName, productName, quantity, totalPrice });
    return res.status(201).json({ order: newOrder });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Sipariş durumunu güncelle
router.put('/', async (req, res) => {
  try {
    await dbConnect();
    const { id, status } = req.body;
    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
    return res.status(200).json({ order: updated });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
