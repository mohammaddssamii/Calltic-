const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
   restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    available: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
