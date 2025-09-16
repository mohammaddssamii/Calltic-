const Order = require('../models/orders');
const Cart = require('../models/cart');
const Product = require('../models/productModel');

// Place order
exports.placeOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, fulfillment, pickupType, region, deliveryAddress, notes } = req.body;

    const userCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Filter valid products
    const validItems = userCart.items.filter(item => item.product);
    if (validItems.length === 0) {
      return res.status(400).json({ message: 'Some products are no longer available' });
    }

    // Optional: check all products belong to same restaurant
    // const restaurantIds = [...new Set(validItems.map(i => i.product.restaurant.toString()))];
    // if (restaurantIds.length > 1) return res.status(400).json({ message: 'Products from multiple restaurants not allowed' });

    // Calculate total
    const total = validItems.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0
    );

    const newOrder = new Order({
      user: req.user.id,
      customerName,
      customerPhone,
      fulfillment,
      pickupType: fulfillment === 'pickup' ? pickupType : null,
      region: fulfillment === 'delivery' ? region : null,
      deliveryAddress: fulfillment === 'delivery' ? deliveryAddress : null,
      notes: notes || '',
      items: validItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        note: item.note || ''
      })),
      total,
      status: 'completed'
    });

    const savedOrder = await newOrder.save();

    // Delete cart only after successful order
    await Cart.findOneAndDelete({ user: req.user.id });

    res.status(201).json({ message: 'Order placed successfully', order: savedOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get orders
exports.getOrders = async (req, res) => {
  try {
    let orders;
     const populateOptions = [
      { path: 'items.product', populate: { path: 'restaurant', select: 'name' } },
      { path: 'user', select: 'username' }
    ];

    if (req.user.role === 'admin') {
      orders = await Order.find().populate(populateOptions);
    } else {
      orders = await Order.find({ user: req.user.id }).populate(populateOptions);
    }
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
