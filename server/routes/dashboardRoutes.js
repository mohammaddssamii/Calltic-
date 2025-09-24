const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleWare'); // نفس اللي عندك للمستخدمين
const adminAuth = require('../middleware/adminAuth'); // للتحقق من الأدمن

// ===== Dashboard Stats =====
// بس الأدمن يقدر يوصل
router.get('/stats', auth, adminAuth, dashboardController.getDashboardStats);

module.exports = router;
