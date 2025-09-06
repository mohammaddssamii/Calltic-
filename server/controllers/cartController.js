const Cart = require('../models/cart');
const mongoose = require('mongoose');

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // تحقق من وجود productId وكمية صحيحة
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }

    // تحقق من صحة ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    // جلب السلة الخاصة بالمستخدم
    let userCart = await Cart.findOne({ user: req.user.id });

    if (!userCart) {
      userCart = new Cart({ user: req.user.id, items: [] });
    }

    // التحقق إذا المنتج موجود مسبقًا
    const existingItem = userCart.items.find(item => item.product.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      userCart.items.push({ product: productId, quantity });
    }

    await userCart.save();
    res.status(200).json({ message: 'Item added to cart', cart: userCart });
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user cart
exports.getCart = async (req, res) => {
  try {
    const userCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!userCart) {
      return res.status(200).json({ items: [] });
    }
    res.status(200).json(userCart);
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const userCart = await Cart.findOne({ user: req.user.id });
    if (!userCart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    userCart.items = userCart.items.filter(item => !item.product.equals(productId));
    await userCart.save();

    res.status(200).json({ message: 'Item removed from cart', cart: userCart });
  } catch (error) {
    console.error('Error removing from cart:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
