const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const userAuth = require('../middleware/authMiddleWare');

// Place a new order
router.post('/', userAuth, orderController.placeOrder);

// Get all orders (admin) or user orders
router.get('/', userAuth, orderController.getOrders);



module.exports = router;
