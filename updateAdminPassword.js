const dbConnect = require('./src/lib/mongodb');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
  try {
    await dbConnect();
    
    const adminEmail = 'admin@atkigetir.com';
    const newPassword = '123456';
    
    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Admin kullanıcısını bul ve şifresini güncelle
    const user = await User.findOneAndUpdate(
      { email: adminEmail },
      { password: hashedPassword },
      { new: true }
    );
    
    if (user) {
      console.log('✅ Admin şifresi başarıyla güncellendi!');
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Yeni şifre:', newPassword);
    } else {
      console.log('❌ Admin kullanıcısı bulunamadı');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

updateAdminPassword(); 