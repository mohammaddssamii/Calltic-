const Category = require('../models/category');
const Product = require('../models/productModel');

// إنشاء كاتيجوري جديد
exports.createCategory = async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// جلب كل الكاتيجوريز
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// جلب كاتيجوري واحد حسب الـ id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// تحديث كاتيجوري
exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// حذف كاتيجوري
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// تفعيل / تعطيل الكاتيجوري مع كل منتجاته
// تفعيل / تعطيل الكاتيجوري مع كل منتجاته
exports.toggleCategoryWithProducts = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // قلب حالة الكاتيجوري
    category.available = !category.available;
    await category.save();

    // تحديث كل المنتجات التابعة للكاتيجوري
    await Product.updateMany(
      { category: category._id },
      { available: category.available }
    );

    // رجع الحالة الجديدة فقط
    res.status(200).json({ available: category.available });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
