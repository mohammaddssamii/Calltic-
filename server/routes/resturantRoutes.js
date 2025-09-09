const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/resturantController');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');

// إعداد Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ================== CRUD Routes ================== //

// Create a new restaurant (Admin only, with image)
router.post('/', adminAuth, upload.single('image'), restaurantController.createRestaurant);

// Get all restaurants
router.get('/', restaurantController.getAllRestaurants);

// Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// Update restaurant (Admin only, with image)
router.put('/:id', adminAuth, upload.single('image'), restaurantController.updateRestaurant);

// Delete restaurant (Admin only)
router.delete('/:id', adminAuth, restaurantController.deleteRestaurant);

module.exports = router;
