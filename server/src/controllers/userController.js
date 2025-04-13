const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');

// Get all users (for admin)
const getAllUsers = async (req, res) => {
  try {
    const { name, email, address, role } = req.query;

    // Build filter conditions
    const filterConditions = {};

    if (name) filterConditions.name = { [Op.iLike]: `%${name}%` };
    if (email) filterConditions.email = { [Op.iLike]: `%${email}%` };
    if (address) filterConditions.address = { [Op.iLike]: `%${address}%` };
    if (role) filterConditions.role = role;

    const users = await User.findAll({
      where: filterConditions,
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID (for admin)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'ownedStore',
          include: [
            {
              model: Rating,
              as: 'storeRatings',
              attributes: ['value']
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user (for admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      address,
      role
    });

    // Return user info (excluding password)
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Create user error:', error);

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

// Admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.status(200).json({
      stats: {
        totalUsers,
        totalStores,
        totalRatings
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  getDashboardStats
};
