const { Rating, Store } = require('../models');
const { Op } = require('sequelize');

// Submit or update a rating
const submitRating = async (req, res) => {
  try {
    const { storeId, value } = req.body;
    const userId = req.user.id;

    // Validate rating value
    if (value < 1 || value > 5 || !Number.isInteger(value)) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user already rated this store
    const existingRating = await Rating.findOne({
      where: { userId, storeId }
    });

    let rating;
    let isUpdate = false;

    if (existingRating) {
      // Update existing rating
      isUpdate = true;
      existingRating.value = value;
      rating = await existingRating.save();
    } else {
      // Create new rating
      rating = await Rating.create({
        userId,
        storeId,
        value
      });
    }

    // Update store average rating
    await updateStoreRating(storeId);

    res.status(200).json({
      message: isUpdate ? 'Rating updated successfully' : 'Rating submitted successfully',
      rating
    });
  } catch (error) {
    console.error('Submit rating error:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(err => ({ field: err.path, message: err.message }))
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// Get user ratings
const getUserRatings = async (req, res) => {
  try {
    const userId = req.user.id;

    const ratings = await Rating.findAll({
      where: { userId },
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'address', 'averageRating']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    res.status(200).json({ ratings });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update store average rating
async function updateStoreRating(storeId) {
  try {
    // Get all ratings for the store
    const ratings = await Rating.findAll({
      where: { storeId },
      attributes: ['value']
    });

    if (ratings.length === 0) {
      await Store.update(
        { averageRating: 0, totalRatings: 0 },
        { where: { id: storeId } }
      );
      return;
    }

    // Calculate average rating
    const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
    const average = sum / ratings.length;

    // Update store
    await Store.update(
      {
        averageRating: average,
        totalRatings: ratings.length
      },
      { where: { id: storeId } }
    );
  } catch (error) {
    console.error('Update store rating error:', error);
    throw error;
  }
}

module.exports = {
  submitRating,
  getUserRatings
};
