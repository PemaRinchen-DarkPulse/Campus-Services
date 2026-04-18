const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public (or protected depending on context)
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({ success: false, message: 'Server error fetching menu items' });
  }
});

// @route   POST /api/menu
// @desc    Create a new menu item
// @access  Protected (Requires auth typically, keeping it simple for now)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;

    const newItem = new MenuItem({
      name,
      description,
      price,
      category,
      image,
      available
    });

    const savedItem = await newItem.save();
    res.status(201).json({ success: true, data: savedItem });
  } catch (err) {
    console.error('Error saving menu item:', err);
    res.status(500).json({ success: false, message: 'Server error saving menu item' });
  }
});

// @route   PUT /api/menu/:id
// @desc    Update a menu item
// @access  Protected
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: updatedItem });
  } catch (err) {
    console.error('Error updating menu item:', err);
    res.status(500).json({ success: false, message: 'Server error updating menu item' });
  }
});

// @route   DELETE /api/menu/:id
// @desc    Delete a menu item
// @access  Protected
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ success: false, message: 'Server error deleting menu item' });
  }
});

module.exports = router;
