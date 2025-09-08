const Order = require('../models/orders');
const Cart = require('../models/cart');
const product = require('../models/productModel');

// Create a new order
exports.placeOrder = async (req, res) => {
  try {
       const { customerName, customerPhone } = req.body;
    const userCart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // فلترة المنتجات اللي موجودة فقط
    const validItems = userCart.items.filter(item => item.product);
    if (validItems.length === 0) {
      return res.status(400).json({ message: 'Some products in your cart are no longer available' });
    }

    // حساب المجموع الكلي
    const total = validItems.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0
    );

    // إنشاء الأوردر
    const newOrder = new Order({
      user: req.user.id,
      customerName,
      customerPhone,
      items: validItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      total,
      status: 'completed'
    });

    await newOrder.save();

    // حذف السلة بعد إتمام الطلب
    await Cart.findOneAndDelete({ user: req.user.id });

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


//Get all orders
exports.getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      // Admin يشوف كل الأوردرات
      orders = await Order.find().populate(['items.product','user']);
    } else {
      // المستخدم العادي يشوف أوردراته فقط
      orders = await Order.find({ user: req.user.id }).populate(['items.product','user']);
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};