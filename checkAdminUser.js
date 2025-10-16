const mongoose = require('mongoose');
require('dotenv').config();

async function checkAdminUser() {
  try {
    console.log('🔍 Admin kullanıcıları kontrol ediliyor...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı!');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const adminUsers = await User.find({ role: 'admin' });
    
    if (adminUsers.length === 0) {
      console.log('❌ Hiç admin kullanıcı yok!');
    } else {
      console.log(`✅ ${adminUsers.length} admin kullanıcı bulundu:`);
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}, Created: ${user.createdAt}`);
      });
    }
    
    // Tüm kullanıcıları da listele
    const allUsers = await User.find({});
    console.log(`\n📊 Toplam ${allUsers.length} kullanıcı var:`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role || 'user'}`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Bağlantı kapatıldı.');
  }
}

checkAdminUser();
