const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireSuperAdmin } = require('../middleware/subscriptionMiddleware');
const {
  getDashboardStats,
  getAllCompanies,
  getCompanyDetails,
  verifyCompany,
  toggleCompanySuspension,
  getAllUsers,
  toggleUserStatus,
  getPlatformAnalytics
} = require('../controllers/superAdminController');

// All routes require super admin authentication
router.use(authMiddleware);
router.use(requireSuperAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getPlatformAnalytics);

// Companies management
router.get('/companies', getAllCompanies);
router.get('/companies/:id', getCompanyDetails);
router.post('/companies/:id/verify', [
  body('status').isIn(['verified', 'rejected']).withMessage('Invalid status'),
  body('rejectionReason').optional().isString()
], verifyCompany);
router.post('/companies/:id/suspend', [
  body('suspend').isBoolean().withMessage('suspend must be boolean'),
  body('reason').optional().isString()
], toggleCompanySuspension);

// Users management
router.get('/users', getAllUsers);
router.post('/users/:id/toggle-status', [
  body('isActive').isBoolean().withMessage('isActive must be boolean')
], toggleUserStatus);

// Subscriptions management
router.get('/subscriptions', async (req, res) => {
  try {
    const Subscription = require('../models/Subscription');
    const subscriptions = await Subscription.find()
      .populate('companyId', 'name employerName')
      .sort({ createdAt: -1 });
    res.json({ subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Subscription Plans management
router.get('/plans', async (req, res) => {
  try {
    const SubscriptionPlan = require('../models/SubscriptionPlan');
    const plans = await SubscriptionPlan.find().sort({ order: 1, price: 1 });
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/plans', async (req, res) => {
  try {
    const SubscriptionPlan = require('../models/SubscriptionPlan');
    const plan = new SubscriptionPlan(req.body);
    await plan.save();
    res.status(201).json({ message: 'Plan created successfully', plan });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/plans/:id', async (req, res) => {
  try {
    const SubscriptionPlan = require('../models/SubscriptionPlan');
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan updated successfully', plan });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/plans/:id', async (req, res) => {
  try {
    const SubscriptionPlan = require('../models/SubscriptionPlan');
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

