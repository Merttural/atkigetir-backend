// src/models/Category.js

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Kategori adı gereklidir'],
    trim: true,
    maxlength: [50, 'Kategori adı 50 karakterden uzun olamaz']
  },
  slug: { 
    type: String, 
    required: [true, 'Slug gereklidir'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: [200, 'Açıklama 200 karakterden uzun olamaz']
  },
  image: { 
    type: String,
    default: '/images/categories/default.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Slug oluşturma middleware
CategorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  next();
});

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
