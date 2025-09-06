const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const userAuth = require('../middleware/authMiddleWare');

router.use(userAuth);

router.post('/add-to-cart', cartController.addToCart);
router.get('/get-cart', cartController.getCart);
router.delete('/remove-from-cart/:productId', cartController.removeFromCart);

module.exports = router;
