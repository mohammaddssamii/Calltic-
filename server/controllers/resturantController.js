const mongoose = require('mongoose');
const Restaurant = require('../models/resturant');

// ================== CREATE ================== //
exports.createRestaurant = async (req, res) => {
  try {
    const { name, address, phoneNumber, description } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    const image = req.file ? req.file.filename : null;

    const newRestaurant = new Restaurant({
      name,
      address,
      phoneNumber,
      description,
      image,
    });

    const saved = await newRestaurant.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create restaurant error:', err.message);
    res.status(500).json({ message: 'Error saving restaurant', error: err.message });
  }
};

// ================== GET ALL ================== //
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (err) {
    console.error('Fetch restaurants error:', err.message);
    res.status(500).json({ message: 'Error fetching restaurants', error: err.message });
  }
};

// ================== GET BY ID ================== //
exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid restaurant ID' });

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    res.status(200).json(restaurant);
  } catch (err) {
    console.error('Get restaurant by ID error:', err.message);
    res.status(500).json({ message: 'Error fetching restaurant', error: err.message });
  }
};

// ================== UPDATE ================== //
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid restaurant ID' });

    const updateData = { ...req.body };
    if (req.file) updateData.image = req.file.filename;

    const updated = await Restaurant.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Restaurant not found' });

    res.status(200).json(updated);
  } catch (err) {
    console.error('Update restaurant error:', err.message);
    res.status(500).json({ message: 'Error updating restaurant', error: err.message });
  }
};

// ================== DELETE ================== //
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid restaurant ID' });

    const deleted = await Restaurant.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Restaurant not found' });

    res.status(200).json({ message: 'Restaurant deleted successfully' });
  } catch (err) {
    console.error('Delete restaurant error:', err.message);
    res.status(500).json({ message: 'Error deleting restaurant', error: err.message });
  }
};
