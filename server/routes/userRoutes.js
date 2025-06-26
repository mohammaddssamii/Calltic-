const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleWare');


router.post('/register', userController.register);


router.post('/login', userController.login);


router.get('/profile', authMiddleware, userController.getProfile);


router.put('/update', authMiddleware, userController.updateUser);

module.exports = router;
