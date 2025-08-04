const express = require('express');
const router = express.Router();
const dbConnect = require('../../lib/mongodb');
const Category = require('../../models/Category');
const { validateCategory } = require('../../middleware/validation');
const { adminAuth } = require('../../middleware/auth');

// Tüm kategorileri getir
router.get('/', async (req, res) => {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true }).sort('order');
    res.json({ categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ 
      error: 'Kategoriler yüklenemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Kategori detayı getir
router.get('/:slug', async (req, res) => {
  try {
    await dbConnect();
    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    res.json({ category });
  } catch (error) {
    console.error('Category fetch error:', error);
    res.status(500).json({ 
      error: 'Kategori yüklenemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Yeni kategori oluştur (Admin)
router.post('/', adminAuth, validateCategory, async (req, res) => {
  try {
    await dbConnect();
    const { name, description, image, order } = req.body;
    
    const category = await Category.create({
      name,
      description,
      image,
      order: order || 0
    });
    
    res.status(201).json({ 
      message: 'Kategori başarıyla oluşturuldu',
      category
    });
  } catch (error) {
    console.error('Category create error:', error);
    res.status(500).json({ 
      error: 'Kategori oluşturulamadı',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Kategori güncelle (Admin)
router.put('/:id', adminAuth, validateCategory, async (req, res) => {
  try {
    await dbConnect();
    const { name, description, image, order, isActive } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        image,
        order,
        isActive
      },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    res.json({ 
      message: 'Kategori başarıyla güncellendi',
      category
    });
  } catch (error) {
    console.error('Category update error:', error);
    res.status(500).json({ 
      error: 'Kategori güncellenemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Kategori sil (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await dbConnect();
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    res.json({ message: 'Kategori başarıyla silindi' });
  } catch (error) {
    console.error('Category delete error:', error);
    res.status(500).json({ 
      error: 'Kategori silinemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
