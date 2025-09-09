// controllers/productController.js
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Restaurant = require('../models/resturant');
const Order = require('../models/orders'); // لاستعماله عند الحذف

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, restaurant } = req.body;

    if (!restaurant) {
      return res.status(400).json({ message: 'Restaurant is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      return res.status(400).json({ message: 'Invalid restaurant ID' });
    }

    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      return res.status(400).json({ message: 'Restaurant not found' });
    }

    const image = req.file ? req.file.filename : null;

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      restaurant,
      image,
    });

    const saved = await newProduct.save();
    const populated = await saved.populate('category restaurant');

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category restaurant');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get products by restaurant
exports.getProductsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant ID' });
    }

    const products = await Product.find({ restaurant: restaurantId }).populate('category restaurant');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category restaurant');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, restaurant } = req.body;
    const updateData = { name, description, price, category, restaurant };

    if (restaurant) {
      if (!mongoose.Types.ObjectId.isValid(restaurant)) {
        return res.status(400).json({ message: 'Invalid restaurant ID' });
      }
      const restaurantExists = await Restaurant.findById(restaurant);
      if (!restaurantExists) {
        return res.status(400).json({ message: 'Restaurant not found' });
      }
    }

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('category restaurant');

    if (!updated) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // تحقق من أن المنتج ليس مرتبط بأي أوردر
    const orderWithProduct = await Order.findOne({ 'items.product': productId });
    if (orderWithProduct) {
      return res.status(400).json({ message: 'Cannot delete product, it is associated with existing orders' });
    }

    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
