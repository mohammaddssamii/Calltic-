const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const adminAuth = require('../middleware/adminAuth');

// CRUD routes
router.post('/', adminAuth, productController.createProduct);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.put('/:id', adminAuth, productController.updateProduct);
router.delete('/:id', adminAuth, productController.deleteProduct);

module.exports = router;
