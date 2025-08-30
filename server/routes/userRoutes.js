const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleWare');

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

module.exports = router;
