const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Stores',
      key: 'id'
    }
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'storeId']
    }
  ]
});

module.exports = Rating;
