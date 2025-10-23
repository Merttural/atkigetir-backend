// Admin şifresini düzelt - hash'lenmiş şifre ile güncelle
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function fixAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');

    const userEmail = 'atkigetir@gmail.com';
    const newPassword = 'atkigetir1970';
    
    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Kullanıcıyı bul ve şifreyi güncelle
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`❌ ${userEmail} kullanıcısı bulunamadı`);
      process.exit(1);
    }
    
    // Şifreyi güncelle
    await User.findByIdAndUpdate(user._id, { 
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });
    
    console.log(`✅ ${userEmail} kullanıcısının şifresi hash'lenerek güncellendi`);
    console.log('Güncellenmiş kullanıcı bilgileri:', {
      email: userEmail,
      role: 'admin',
      isActive: true,
      password: 'Hash\'lenmiş (güvenli)'
    });
    
    // Test et - şifre doğru mu kontrol et
    const updatedUser = await User.findOne({ email: userEmail });
    const isPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
    
    if (isPasswordValid) {
      console.log('✅ Şifre testi başarılı - giriş yapılabilir');
    } else {
      console.log('❌ Şifre testi başarısız');
    }

    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

fixAdminPassword();




