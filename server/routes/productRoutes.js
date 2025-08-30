const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const adminAuth = require('../middleware/adminAuth');
const multer = require("multer");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// CRUD routes
router.post('/', adminAuth, upload.single('image'), productController.createProduct);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.put('/:id', adminAuth, upload.single('image'), productController.updateProduct);
router.delete('/:id', adminAuth, productController.deleteProduct);

module.exports = router;
