const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: String,
  customerPhone: String,
   fulfillment: { type: String, enum: ['pickup', 'delivery'] },
  pickupType: { type: String, enum: ['dine-in', 'takeaway'], default: null },
  region: { type: String, default: null },
   deliveryAddress: { type: String, default: null },
  notes: { type: String, default: '' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' }
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
