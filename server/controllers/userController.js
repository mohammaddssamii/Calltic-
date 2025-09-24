const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, address, phoneNumber, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      address,
      phoneNumber,
      role,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

 
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    user.isOnline = true;
    user.lastLogin = new Date();
    await user.save();


    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id,  username: user.username,  email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { username, email, fullName, address, phoneNumber } = req.body;
    let profileImage = req.file ? req.file.filename : undefined;

    const updateData = { username, email, fullName, address, phoneNumber };
    if (profileImage) updateData.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Profile updated successfully', updatedUser: user });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// controllers/userController.js
exports.changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    res.json({ message: 'Role updated', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating role' });
  }
};
// controllers/userController.js
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isOnline && user.lastLogin) {
      const minutesOnline = Math.floor((new Date() - user.lastLogin) / 60000);
      user.totalOnlineTime += minutesOnline;
    }

    user.isOnline = false;
    user.lastLogin = null;
    await user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// controllers/userController.js
exports.saveOnlineTimes = async (req, res) => {
  try {
    const { onlineTimes } = req.body; // { userId1: seconds1, userId2: seconds2, ... }

    const updatePromises = Object.keys(onlineTimes).map(userId =>
      User.findByIdAndUpdate(userId, { totalOnlineTime: onlineTimes[userId] })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Online times saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save online times', error: err.message });
  }
};
