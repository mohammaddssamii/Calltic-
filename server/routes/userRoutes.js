const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleWare');
const authAdmin = require('../middleware/adminAuth');

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


router.post('/register', userController.register);


router.post('/login', userController.login);


router.get('/profile', authMiddleware, userController.getProfile);


router.put('/update', authMiddleware, upload.single('profileImage'), userController.updateUser);

router.post('/change-password', authMiddleware, userController.changePassword);

router.post('/logout', authMiddleware, userController.logout);

router.put('/change-role', authMiddleware, authAdmin, userController.changeUserRole);

router.post('/save-online-times', authMiddleware, userController.saveOnlineTimes);

module.exports = router;
