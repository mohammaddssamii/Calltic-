const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const userAuth = require('../middleware/authMiddleWare');

// Add item to cart
router.post('/', userAuth, cartController.addToCart);

// Get user cart
router.get('/', userAuth, cartController.getCart);

// Update quantity of an item in cart
router.put('/:productId', userAuth, cartController.updateQuantity);

// Remove item from cart
router.delete('/:productId', userAuth, cartController.removeFromCart);

module.exports = router;
