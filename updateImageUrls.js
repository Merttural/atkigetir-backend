// MongoDB'deki ürün resim URL'lerini production URL'si ile güncelle
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  description: { type: String },
  details: { type: String },
  features: [{ type: String }],
  seoTitle: { type: String },
  seoDescription: { type: String },
  slug: { type: String },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function updateImageUrls() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');

    const products = await Product.find({});
    console.log(`${products.length} ürün bulundu`);

    let updatedCount = 0;
    
    for (const product of products) {
      if (product.image && product.image.includes('localhost:5000')) {
        const newImageUrl = product.image.replace('http://localhost:5000', 'https://atkigetir-backend.onrender.com');
        
        await Product.findByIdAndUpdate(product._id, { image: newImageUrl });
        console.log(`Ürün güncellendi: ${product.name}`);
        console.log(`Eski URL: ${product.image}`);
        console.log(`Yeni URL: ${newImageUrl}`);
        console.log('---');
        
        updatedCount++;
      }
    }

    console.log(`\n✅ Toplam ${updatedCount} ürünün resim URL'si güncellendi`);
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

updateImageUrls();
