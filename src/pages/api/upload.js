const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // Sharp kütüphanesini dahil et

// Klasör oluştur
const uploadDir = 'uploads/products';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.memoryStorage(); // Dosyayı bellekte tut

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.post('/', upload.single('file'), async (req, res) => { // async ekle
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenemedi!' });
    }
    
    const filename = `${Date.now()}.webp`; // WebP formatında kaydet
    const outputPath = path.join(uploadDir, filename);

    // Sharp ile resmi işle: boyutlandır, WebP'ye dönüştür ve kaydet
    await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: sharp.fit.inside, // Oranları koruyarak sığdır
        withoutEnlargement: true // Büyükse küçült, küçükse büyütme
      })
      .webp({ quality: 85 }) // WebP formatında %85 kalite
      .toFile(outputPath);

    // Production'da tam URL, development'ta relative path
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://atkigetir-backend.onrender.com'
      : `http://localhost:${process.env.PORT || 5000}`;
    
    const imageUrl = `${baseUrl}/uploads/products/${filename}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: error.message || 'Yükleme hatası!' });
  }
});

module.exports = router;