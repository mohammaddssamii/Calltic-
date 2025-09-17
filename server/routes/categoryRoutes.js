const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const adminAuth = require('../middleware/adminAuth');

router.post('/', adminAuth, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', adminAuth, categoryController.updateCategory);
router.delete('/:id', adminAuth, categoryController.deleteCategory);
router.patch('/:id/toggle-with-products', adminAuth, categoryController.toggleCategoryWithProducts);


module.exports = router;
