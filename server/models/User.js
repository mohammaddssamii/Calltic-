const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String },
  fullName: { type: String },
  address: { type: String },
  phoneNumber: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'admin' },
  isOnline: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null },
  totalOnlineTime: { type: Number, default: 0 }
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
