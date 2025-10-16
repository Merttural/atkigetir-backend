const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB bağlantısı
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

// Product şeması
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  stock: Number,
  active: Boolean,
  slug: String,
  seoTitle: String,
  seoDescription: String,
  details: String,
  features: mongoose.Schema.Types.Mixed, // Array veya String olabilir
  brand: String,
  model: String,
  color: String,
  size: String,
  weight: String,
  material: String,
  tags: String,
  orderRank: Number
});

const Product = mongoose.model('Product', productSchema);

async function removeTeamNames() {
  try {
    console.log('🔗 MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı!');

    // Takım isimlerini içeren ürünleri bul
    const teamNames = ['Fenerbahçe', 'Galatasaray', 'Beşiktaş', 'fenerbahçe', 'galatasaray', 'beşiktaş'];
    
    console.log('🔍 Takım isimlerini içeren ürünler aranıyor...');
    
    for (const teamName of teamNames) {
      // Ürün adında takım ismi geçenleri bul
      const products = await Product.find({
        $or: [
          { name: { $regex: teamName, $options: 'i' } },
          { description: { $regex: teamName, $options: 'i' } },
          { seoTitle: { $regex: teamName, $options: 'i' } },
          { seoDescription: { $regex: teamName, $options: 'i' } },
          { details: { $regex: teamName, $options: 'i' } },
          { features: { $regex: teamName, $options: 'i' } },
          { tags: { $regex: teamName, $options: 'i' } }
        ]
      });

      console.log(`📋 "${teamName}" içeren ${products.length} ürün bulundu`);

      for (const product of products) {
        console.log(`\n🔧 Ürün güncelleniyor: ${product.name}`);
        
        // Takım isimlerini kaldır
        let updated = false;
        
        if (product.name && product.name.includes(teamName)) {
          product.name = product.name.replace(new RegExp(teamName, 'gi'), 'Takım');
          updated = true;
        }
        
        if (product.description && product.description.includes(teamName)) {
          product.description = product.description.replace(new RegExp(teamName, 'gi'), 'Takım');
          updated = true;
        }
        
        if (product.seoTitle && product.seoTitle.includes(teamName)) {
          product.seoTitle = product.seoTitle.replace(new RegExp(teamName, 'gi'), 'Takım');
          updated = true;
        }
        
        if (product.seoDescription && product.seoDescription.includes(teamName)) {
          product.seoDescription = product.seoDescription.replace(new RegExp(teamName, 'gi'), 'Takım');
          updated = true;
        }
        
        if (product.details && product.details.includes(teamName)) {
          product.details = product.details.replace(new RegExp(teamName, 'gi'), 'Takım');
          updated = true;
        }
        
        if (product.features && typeof product.features === 'string' && product.features.includes(teamName)) {
          product.features = product.features.replace(new RegExp(teamName, 'gi'), 'Takım');
          updated = true;
        }
        
        if (product.tags && product.tags.includes(teamName)) {
          product.tags = product.tags.replace(new RegExp(teamName, 'gi'), 'Takım');
          updated = true;
        }
        
        if (updated) {
          await product.save();
          console.log(`✅ Güncellendi: ${product.name}`);
        }
      }
    }

    console.log('\n🎉 Takım isimleri başarıyla kaldırıldı!');
    
    // Güncellenmiş ürünleri göster
    console.log('\n📊 Güncellenmiş ürün örnekleri:');
    const sampleProducts = await Product.find({}).limit(5);
    sampleProducts.forEach(product => {
      console.log(`- ${product.name}`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı.');
  }
}

removeTeamNames();
