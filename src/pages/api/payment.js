const express = require('express');
const router = express.Router();
const Iyzipay = require('iyzipay');
const dbConnect = require('../../lib/mongodb');
const Order = require('../../models/Order');

router.post('/', async (req, res) => {
  try {
    console.log('🔍 Payment API başlatıldı');
    
    // Environment variables'ları detaylı kontrol et
    const apiKey = process.env.IYZIPAY_API_KEY;
    const secretKey = process.env.IYZIPAY_SECRET_KEY;
    const uri = process.env.IYZIPAY_URI;
    
    console.log('🔍 Environment variables:', {
      apiKey: apiKey ? '✅ Set' : '❌ Not set',
      secretKey: secretKey ? '✅ Set' : '❌ Not set',
      uri: uri || 'https://sandbox-api.iyzipay.com'
    });

    // API bilgileri eksikse hata döndür
    if (!apiKey || !secretKey) {
      console.error('❌ iyzico API bilgileri eksik');
      return res.status(500).json({ 
        error: 'iyzico API bilgileri bulunamadı',
        details: {
          apiKey: apiKey ? 'Set' : 'Not set',
          secretKey: secretKey ? 'Set' : 'Not set',
          uri: uri || 'default'
        }
      });
    }

    // iyzico konfigürasyonu
    const iyzipay = new Iyzipay({
      apiKey: apiKey,
      secretKey: secretKey,
      uri: uri || 'https://sandbox-api.iyzipay.com'
    });

    await dbConnect();
    console.log('✅ Database bağlantısı başarılı');

    const { cartItems, customerInfo } = req.body;
    console.log('🔍 Gelen veriler:', { cartItems, customerInfo });

    if (!cartItems || cartItems.length === 0) {
      console.log('❌ Sepet boş');
      return res.status(400).json({ error: 'Sepet boş' });
    }

    // Toplam tutarı hesapla
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log('💰 Toplam tutar:', totalAmount);

    // Benzersiz sipariş ID'si oluştur
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 Sipariş ID:', orderId);

    // iyzico ödeme formu oluştur
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: orderId,
      price: totalAmount.toFixed(2),
      paidPrice: totalAmount.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: orderId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/payment/callback`,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: customerInfo.email || 'guest',
        name: customerInfo.name || 'Misafir',
        surname: customerInfo.surname || 'Kullanıcı',
        gsmNumber: customerInfo.phone || '+905350000000',
        email: customerInfo.email || 'guest@example.com',
        identityNumber: '74300864791',
        lastLoginDate: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
        registrationAddress: customerInfo.address || 'Türkiye',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        city: customerInfo.city || 'Istanbul',
        country: 'Turkey',
        zipCode: customerInfo.zipCode || '34732'
      },
      shippingAddress: {
        contactName: customerInfo.name || 'Misafir',
        city: customerInfo.city || 'Istanbul',
        country: 'Turkey',
        address: customerInfo.address || 'Türkiye',
        zipCode: customerInfo.zipCode || '34732'
      },
      billingAddress: {
        contactName: customerInfo.name || 'Misafir',
        city: customerInfo.city || 'Istanbul',
        country: 'Turkey',
        address: customerInfo.address || 'Türkiye',
        zipCode: customerInfo.zipCode || '34732'
      },
      basketItems: cartItems.map((item, index) => ({
        id: item._id || `item_${index}`,
        name: item.name,
        category1: 'Atkı & Bere',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: (item.price * item.quantity).toFixed(2)
      }))
    };

    console.log('📤 iyzico isteği gönderiliyor...');
    
    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
      if (err) {
        console.error('❌ iyzico hatası:', err);
        return res.status(500).json({ error: 'Ödeme başlatılamadı: ' + err.message });
      }

      console.log('✅ iyzico yanıtı:', result);
      
      if (result.status === 'success') {
        // Siparişi veritabanına kaydet
        const orderData = {
          customerName: customerInfo.name || 'Misafir',
          productName: cartItems.map(item => item.name).join(', '),
          quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: totalAmount,
          status: 'pending'
        };

        Order.create(orderData)
          .then(() => {
            console.log('✅ Sipariş kaydedildi');
            res.json({ 
              checkoutFormContent: result.checkoutFormContent,
              token: result.token 
            });
          })
          .catch(err => {
            console.error('❌ Sipariş kaydedilemedi:', err);
            res.status(500).json({ error: 'Sipariş kaydedilemedi' });
          });
      } else {
        console.error('❌ iyzico başarısız:', result.errorMessage);
        res.status(500).json({ error: 'Ödeme formu oluşturulamadı: ' + result.errorMessage });
      }
    });

  } catch (error) {
    console.error('❌ Payment API hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
  }
});

module.exports = router; 