import Iyzipay from 'iyzipay';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
console.log("API KEY:", process.env.IYZIPAY_API_KEY);

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZIPAY_API_KEY,
  secretKey: process.env.IYZIPAY_SECRET_KEY,
  uri: process.env.IYZIPAY_URI || 'https://sandbox-api.iyzipay.com'
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token gerekli' });
    }

    // iyzico'dan ödeme sonucunu al
    const request = {
      token: token
    };

    iyzipay.checkoutForm.retrieve(request, async function (err, result) {
      if (err) {
        console.error('iyzico callback error:', err);
        return res.redirect('/payment/error');
      }

      if (result.status === 'success') {
        // Siparişi güncelle
        try {
          const order = await Order.findOne({ paymentToken: token });
          if (order) {
            order.status = 'completed';
            order.paymentResult = result;
            await order.save();
          }

          // Başarılı ödeme sayfasına yönlendir
          return res.redirect('/payment/success');
        } catch (dbError) {
          console.error('Database error:', dbError);
          return res.redirect('/payment/error');
        }
      } else {
        // Başarısız ödeme
        try {
          const order = await Order.findOne({ paymentToken: token });
          if (order) {
            order.status = 'failed';
            order.paymentResult = result;
            await order.save();
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
        }

        return res.redirect('/payment/error');
      }
    });

  } catch (error) {
    console.error('Callback error:', error);
    return res.redirect('/payment/error');
  }
} 