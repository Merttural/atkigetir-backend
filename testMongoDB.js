const mongoose = require('mongoose');

async function testMongoDB() {
  try {
    console.log('🔗 MongoDB bağlantısı test ediliyor...');
    console.log('📡 URI:', process.env.MONGODB_URI ? 'Mevcut' : 'Eksik');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable bulunamadı!');
      return;
    }
    
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı!');
    
    // Veritabanı ve koleksiyonları listele
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📁 Koleksiyonlar:', collections.map(c => c.name));
    
    // Products koleksiyonundaki ürün sayısını kontrol et
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const productCount = await Product.countDocuments();
    console.log('📦 Toplam ürün sayısı:', productCount);
    
    if (productCount > 0) {
      const sampleProduct = await Product.findOne();
      console.log('📝 Örnek ürün:', {
        name: sampleProduct.name,
        category: sampleProduct.category,
        price: sampleProduct.price
      });
    }
    
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Bağlantı kapatıldı.');
  }
}

testMongoDB();
