const mongoose = require('mongoose');

const CATEGORY = [
  'produce','meat','seafood','dairy','beverage','baked','frozen','canned',
  'grain','snack','condiment','other'
];

const LOCATION = ['fridge','freezer','pantry','shelf'];

const itemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:    { type: String, required: true, trim: true },
  category:{ type: String, enum: CATEGORY, default: 'other' },
  quantity:{ type: Number, min: 0, default: 1 },
  location:{ type: String, enum: LOCATION, required: true },
  bestBy:  { type: Date, required: true },
  notes:   { type: String, default: '' },
  createdAt:{ type: Date, default: Date.now }
});

// Helpful compound index for queries (owner + expiring)
itemSchema.index({ userId: 1, bestBy: 1 });

module.exports = mongoose.model('Item', itemSchema);
