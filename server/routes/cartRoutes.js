const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const userAuth = require('../middleware/authMiddleWare');



router.post('/add-to-cart', userAuth, cartController.addToCart);
router.get('/get-cart', userAuth, cartController.getCart);
router.delete('/remove-from-cart/:productId', userAuth, cartController.removeFromCart);

module.exports = router;
