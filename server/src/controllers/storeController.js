const { Store, User, Rating } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Get all stores
const getAllStores = async (req, res) => {
  try {
    const { name, address } = req.query;

    // Build filter conditions
    const filterConditions = {};

    if (name) filterConditions.name = { [Op.iLike]: `%${name}%` };
    if (address) filterConditions.address = { [Op.iLike]: `%${address}%` };

    const stores = await Store.findAll({
      where: filterConditions,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['name', 'ASC']]
    });

    // If user is authenticated, include their ratings
    if (req.user) {
      const userId = req.user.id;
      for (let store of stores) {
        const userRating = await Rating.findOne({
          where: { userId, storeId: store.id },
          attributes: ['value']
        });
        store.dataValues.userRating = userRating ? userRating.value : null;
      }
    }

    res.status(200).json({ stores });
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get store by ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Rating,
          as: 'storeRatings',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // If user is authenticated, check if they rated the store
    if (req.user) {
      const userId = req.user.id;
      const userRating = await Rating.findOne({
        where: { userId, storeId: store.id },
        attributes: ['value']
      });
      store.dataValues.userRating = userRating ? userRating.value : null;
    }

    res.status(200).json({ store });
  } catch (error) {
    console.error('Get store by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create store (for admin)
const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Validate store owner if provided
    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner) {
        return res.status(400).json({ message: 'Store owner not found' });
      }

      // Update user role to STORE_OWNER if not already
      if (owner.role !== 'STORE_OWNER') {
        owner.role = 'STORE_OWNER';
        await owner.save();
      }
    }

    // Create store
    const store = await Store.create({
      name,
      email,
      address,
      ownerId
    });

    res.status(201).json({
      message: 'Store created successfully',
      store
    });
  } catch (error) {
    console.error('Create store error:', error);

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

// Get store ratings for owners
const getStoreRatings = async (req, res) => {
  try {
    // Find the store owned by the current user
    const store = await Store.findOne({
      where: { ownerId: req.user.id },
      include: [
        {
          model: Rating,
          as: 'storeRatings',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!store) {
      return res.status(404).json({ message: 'You do not own a store' });
    }

    // Calculate average rating
    const ratings = store.storeRatings;
    const averageRating = ratings.length > 0
      ? ratings.reduce((acc, rating) => acc + rating.value, 0) / ratings.length
      : 0;

    res.status(200).json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings: ratings.length,
        ratings: store.storeRatings
      }
    });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  getStoreRatings
};
