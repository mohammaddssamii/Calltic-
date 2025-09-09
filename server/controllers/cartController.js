// controllers/cartController.js
const Cart = require('../models/cart');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

// ===== Add item to cart =====
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    // تحقق من أن المنتج موجود
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: 'Product not found or deleted' });
    }

    let userCart = await Cart.findOne({ user: req.user.id });
    if (!userCart) {
      userCart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = userCart.items.find(item => item.product.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      userCart.items.push({ product: productId, quantity });
    }

    await userCart.save();

    // Populate كامل مع category و restaurant
    userCart = await userCart.populate({
      path: 'items.product',
      populate: ['category', 'restaurant']
    });

    // فلترة أي items بدون product (محذوفة من النظام)
    userCart.items = userCart.items.filter(item => item.product);

    res.status(200).json({ message: 'Item added to cart', cart: userCart });
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ===== Get user cart =====
exports.getCart = async (req, res) => {
  try {
    let userCart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      populate: ['category', 'restaurant']
    });

    if (!userCart) {
      return res.status(200).json({ items: [] });
    }

    // فلترة أي items بدون product
    userCart.items = userCart.items.filter(item => item.product);

    res.status(200).json(userCart);
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ===== Remove item from cart =====
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

    // Populate بعد التعديل
    const populatedCart = await userCart.populate({
      path: 'items.product',
      populate: ['category', 'restaurant']
    });

    res.status(200).json({ message: 'Item removed from cart', cart: populatedCart });
  } catch (error) {
    console.error('Error removing from cart:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ===== Update quantity of an item in cart =====
exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const userCart = await Cart.findOne({ user: req.user.id });
    if (!userCart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = userCart.items.find(i => i.product.equals(productId));
    if (!item) {
      return res.status(404).json({ message: 'Product not in cart' });
    }

    item.quantity = quantity;
    await userCart.save();

    // Populate كامل بعد التعديل
    const populatedCart = await userCart.populate({
      path: 'items.product',
      populate: ['category', 'restaurant']
    });

    res.status(200).json({ message: 'Quantity updated', cart: populatedCart });
  } catch (error) {
    console.error('Error updating quantity:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
