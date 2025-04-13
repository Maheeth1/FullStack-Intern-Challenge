const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), userController.getAllUsers);
router.get('/dashboard-stats', authenticate, authorize('ADMIN'), userController.getDashboardStats);
router.get('/:id', authenticate, authorize('ADMIN'), userController.getUserById);
router.post('/', authenticate, authorize('ADMIN'), userController.createUser);

module.exports = router;
