// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// ================== CRUD Routes ================== //

// Create a new product (Admin only)
router.post('/', adminAuth, upload.single('image'), productController.createProduct);

// Get all products
router.get('/', productController.getAllProducts);

// Get products by restaurant (must be before /:id to avoid conflict)
router.get('/restaurant/:restaurantId', productController.getProductsByRestaurant);

// Get single product by ID
router.get('/:id', productController.getProductById);

// Update a product (Admin only)
router.put('/:id', adminAuth, upload.single('image'), productController.updateProduct);

// Delete a product (Admin only, with check for existing orders)
router.delete('/:id', adminAuth, productController.deleteProduct);

module.exports = router;
