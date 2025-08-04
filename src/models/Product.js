const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  description: { type: String }, // kısa açıklama
  details: { type: String }, // uzun açıklama
  features: [{ type: String }], // özellikler
  seoTitle: { type: String },
  seoDescription: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
