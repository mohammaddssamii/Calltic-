const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const userAuth = require('../middleware/authMiddleWare');

router.post('/place-order', userAuth, orderController.placeOrder);
router.get('/get-all-orders', userAuth, orderController.getOrders);

module.exports = router;
