import express from 'express';
import dbConnect from '../../../lib/mongodb.js';
import Category from '../../../models/Category.js';

const router = express.Router();

// GET: Tüm kategorileri getir
router.get('/', async (req, res) => {
  await dbConnect();
  const categories = await Category.find({});
  res.status(200).json({ categories });
});

// POST: Yeni kategori oluştur
router.post('/', async (req, res) => {
  await dbConnect();
  const { name } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  try {
    const category = await Category.create({ name, slug });
    res.status(201).json({ category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE: Kategori sil
router.delete('/', async (req, res) => {
  await dbConnect();
  const { id } = req.body;

  try {
    await Category.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT: Kategori güncelle
router.put('/', async (req, res) => {
  await dbConnect();
  const { id, name } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  try {
    const updated = await Category.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true }
    );
    res.status(200).json({ category: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
