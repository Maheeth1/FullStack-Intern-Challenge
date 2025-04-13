const express = require('express');
const ratingController = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// User routes
router.post('/', authenticate, authorize('USER'), ratingController.submitRating);
router.get('/user', authenticate, ratingController.getUserRatings);

module.exports = router;
