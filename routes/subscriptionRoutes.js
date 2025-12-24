const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireSuperAdmin } = require('../middleware/subscriptionMiddleware');
const {
  getPlans,
  getCurrentSubscription,
  changePlan,
  cancelSubscription,
  reactivateSubscription,
  getAllSubscriptions,
  updateSubscriptionAdmin,
  suspendSubscription
} = require('../controllers/subscriptionController');

// Public route - get all available plans
router.get('/plans', getPlans);

// Protected routes - require authentication
router.use(authMiddleware);

// Get current user's subscription
router.get('/current', getCurrentSubscription);

// Change subscription plan
router.post('/change-plan', [
  body('plan').isIn(['free', 'starter', 'professional', 'enterprise']).withMessage('Invalid plan'),
  body('billingCycle').optional().isIn(['monthly', 'quarterly', 'yearly']).withMessage('Invalid billing cycle')
], changePlan);

// Cancel subscription
router.post('/cancel', cancelSubscription);

// Reactivate subscription
router.post('/reactivate', reactivateSubscription);

// Super Admin routes
router.get('/admin/all', requireSuperAdmin, getAllSubscriptions);
router.put('/admin/:id', requireSuperAdmin, updateSubscriptionAdmin);
router.post('/admin/:id/suspend', requireSuperAdmin, [
  body('reason').optional().isString()
], suspendSubscription);

module.exports = router;

