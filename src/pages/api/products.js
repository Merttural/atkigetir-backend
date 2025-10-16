const express = require('express');
const router = express.Router();
const dbConnect = require('../../lib/mongodb');
const Product = require('../../models/Product');
const fs = require('fs');
const path = require('path');
const { validateId, validateSearch } = require('../../middleware/validation');
const { sanitizeInput } = require('../../middleware/security');

// Eğer ?stats=1 ile gelirse, aktif ürün sayısını döndür
router.get('/stats', async (req, res) => {
  try {
    await dbConnect();
    const count = await Product.countDocuments({});
    return res.status(200).json({ activeProducts: count });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// GET: slug ile filtreleme desteği
router.get('/', validateSearch, sanitizeInput, async (req, res) => {
  try {
    await dbConnect();
    let products;
    if (req.query.slug) {
      products = await Product.find({ slug: req.query.slug });
    } else {
      products = await Product.find({});
    }
    
    // Dynamic URL system - her istekte doğru URL'yi döndür
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://atkigetir-backend.onrender.com'
      : `http://localhost:${process.env.PORT || 5000}`;
    
    // Image URL'lerini düzelt
    products = products.map(product => {
      if (product.image) {
        // Eğer relative path ise, base URL ekle
        if (product.image.startsWith('/uploads/')) {
          product.image = `${baseUrl}${product.image}`;
        }
        // Eğer farklı bir base URL varsa, doğru URL ile değiştir
        else if (product.image.includes('/uploads/products/')) {
          product.image = product.image.replace(/https?:\/\/[^\/]+/, baseUrl);
        }
      }
      return product;
    });
    
    return res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// POST: Tüm alanları kaydet
router.post('/', sanitizeInput, async (req, res) => {
  try {
    await dbConnect();
    const { name, price, image, category, stock, description, details, seoTitle, seoDescription, features, slug } = req.body;
    const newProduct = await Product.create({
      name,
      price,
      image,
      category,
      stock,
      description,
      details,
      seoTitle,
      seoDescription,
      features,
      slug
    });
    return res.status(201).json({ product: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// DELETE: ürün sil
router.delete('/', sanitizeInput, async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.body;
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// PUT: Tüm alanları güncelle
router.put('/', sanitizeInput, async (req, res) => {
  try {
    await dbConnect();
    const { id, name, price, image, category, stock, description, details, seoTitle, seoDescription, features, slug } = req.body;
    const updated = await Product.findByIdAndUpdate(
      id,
      { name, price, image, category, stock, description, details, seoTitle, seoDescription, features, slug },
      { new: true }
    );
    return res.status(200).json({ product: updated });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
  