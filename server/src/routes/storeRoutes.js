const express = require('express');
const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);

// Admin routes
router.post('/', authenticate, authorize('ADMIN'), storeController.createStore);

// Store owner routes
router.get('/owner/ratings', authenticate, authorize('STORE_OWNER'), storeController.getStoreRatings);

module.exports = router;
