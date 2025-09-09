const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
