const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// User - Store (Owner) relationship
User.hasOne(Store, { foreignKey: 'ownerId', as: 'ownedStore' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// User - Rating relationship
User.hasMany(Rating, { foreignKey: 'userId', as: 'userRatings' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Store - Rating relationship
Store.hasMany(Rating, { foreignKey: 'storeId', as: 'storeRatings' });
Rating.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

module.exports = {
  User,
  Store,
  Rating
};
