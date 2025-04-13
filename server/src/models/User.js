const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: [20, 60],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      // Validation will be handled in hooks
    }
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: [1, 400],
      notEmpty: true
    }
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'USER', 'STORE_OWNER'),
    defaultValue: 'USER',
    allowNull: false
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      // Validate password
      console.log('Validating password:', user.password);
      const isValid = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(.{8,16})$/.test(user.password);
      console.log('Password validation result:', isValid);
      if (!isValid) {
        throw new Error('Password must be 8-16 characters with at least one uppercase letter and one special character');
      }
      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        // Validate password
      console.log('Raw password:', user.password);
      console.log('Password length:', user.password.length);
      if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(user.password)) {
        throw new Error('Password must be at least 8 characters with at least one uppercase letter and one special character');
      }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
