const Order = require('../models/orders');
const Cart = require('../models/cart');
const product = require('../models/productModel');

// Create a new order
exports.placeOrder = async (req, res) => {
  try {
    const userCart = await Cart.findOne({ user: req.user }).populate('items.product');
    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    } 
    const total = userCart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const newOrder = new Order({
      user: req.user,
      items: userCart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      total,
      status: 'completed'
    });
    await newOrder.save();
    await Cart.findOneAndDelete({ user: req.user });
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user }).populate('items.product');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};