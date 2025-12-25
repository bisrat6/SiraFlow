const { validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const { getPlan, getAllPlans, calculatePrice, canUpgrade, canDowngrade } = require('../config/subscriptionPlans');

// Get all available subscription plans
const getPlans = async (req, res) => {
  try {
    const plans = getAllPlans();
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current subscription for user's company
const getCurrentSubscription = async (req, res) => {
  try {
    let company;
    
    if (req.user.role === 'employer') {
      company = await Company.findOne({ employerId: req.user._id });
    } else if (req.user.role === 'employee') {
      const Employee = require('../models/Employee');
      const employee = await Employee.findOne({ userId: req.user._id });
      if (employee) {
        company = await Company.findById(employee.companyId);
      }
    }

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const subscription = await Subscription.findOne({ companyId: company._id });
    
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Update usage stats
    await subscription.updateUsageStats();

    const planDetails = getPlan(subscription.plan);

    res.json({
      subscription: {
        ...subscription.toObject(),
        isValid: subscription.isValid(),
        daysRemaining: subscription.getDaysRemaining()
      },
      planDetails
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create subscription (used during company creation)
const createSubscription = async (companyId, plan = 'free') => {
  try {
    const planConfig = getPlan(plan);
    
    if (!planConfig) {
      throw new Error('Invalid plan');
    }

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + planConfig.trialDays);

    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = new Subscription({
      companyId,
      plan: planConfig.id,
      status: planConfig.trialDays > 0 ? 'trial' : 'active',
      limits: {
        maxEmployees: planConfig.maxEmployees,
        maxMonthlyPayments: planConfig.maxMonthlyPayments,
        features: planConfig.features
      },
      pricing: {
        amount: planConfig.price === 'custom' ? 0 : planConfig.price,
        currency: planConfig.currency,
        billingCycle: planConfig.billingCycle
      },
      currentPeriod: {
        start: now,
        end: periodEnd
      },
      trialEndsAt: planConfig.trialDays > 0 ? trialEnd : null
    });

    await subscription.save();

    // Update company with subscription reference
    await Company.findByIdAndUpdate(companyId, { subscriptionId: subscription._id });

    return subscription;
  } catch (error) {
    console.error('Create subscription error:', error);
    throw error;
  }
};

// Upgrade or change subscription plan
const changePlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan, billingCycle } = req.body;

    // Only employers can change plans
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can change subscription plans' });
    }

    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const subscription = await Subscription.findOne({ companyId: company._id });
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Validate new plan
    const newPlanConfig = getPlan(plan);
    if (!newPlanConfig) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    // Check if it's an upgrade or downgrade
    const isUpgrade = canUpgrade(subscription.plan, plan);
    const isDowngrade = canDowngrade(subscription.plan, plan);

    if (!isUpgrade && !isDowngrade && subscription.plan !== plan) {
      return res.status(400).json({ message: 'Invalid plan change' });
    }

    // Check current usage against new plan limits
    await subscription.updateUsageStats();
    
    if (newPlanConfig.maxEmployees !== -1 && 
        subscription.usageStats.employeesCount > newPlanConfig.maxEmployees) {
      return res.status(400).json({ 
        message: `Cannot downgrade: You currently have ${subscription.usageStats.employeesCount} employees, but the ${newPlanConfig.name} plan allows only ${newPlanConfig.maxEmployees}`,
        code: 'EMPLOYEE_COUNT_EXCEEDS_LIMIT'
      });
    }

    // Update subscription
    subscription.plan = plan;
    subscription.limits = {
      maxEmployees: newPlanConfig.maxEmployees,
      maxMonthlyPayments: newPlanConfig.maxMonthlyPayments,
      features: newPlanConfig.features
    };
    
    const newPrice = calculatePrice(plan, billingCycle || subscription.pricing.billingCycle);
    subscription.pricing = {
      amount: newPrice || 0,
      currency: newPlanConfig.currency,
      billingCycle: billingCycle || subscription.pricing.billingCycle
    };

    // If upgrading from trial, activate immediately
    if (subscription.status === 'trial' && plan !== 'free') {
      subscription.status = 'active';
      subscription.trialEndsAt = null;
    }

    await subscription.save();

    res.json({
      message: `Successfully ${isUpgrade ? 'upgraded' : isDowngrade ? 'downgraded' : 'changed'} to ${newPlanConfig.name} plan`,
      subscription: {
        ...subscription.toObject(),
        isValid: subscription.isValid(),
        daysRemaining: subscription.getDaysRemaining()
      },
      planDetails: newPlanConfig
    });
  } catch (error) {
    console.error('Change plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    // Only employers can cancel
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can cancel subscriptions' });
    }

    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const subscription = await Subscription.findOne({ companyId: company._id });
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;

    await subscription.save();

    res.json({
      message: 'Subscription cancelled successfully. Access will continue until the end of current billing period.',
      subscription: {
        ...subscription.toObject(),
        daysRemaining: subscription.getDaysRemaining()
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reactivate subscription
const reactivateSubscription = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can reactivate subscriptions' });
    }

    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const subscription = await Subscription.findOne({ companyId: company._id });
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    if (subscription.status !== 'cancelled' && subscription.status !== 'expired') {
      return res.status(400).json({ message: 'Subscription is already active' });
    }

    subscription.status = 'active';
    subscription.cancelledAt = null;
    subscription.autoRenew = true;
    
    // Extend period
    const now = new Date();
    subscription.currentPeriod.start = now;
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    subscription.currentPeriod.end = periodEnd;

    await subscription.save();

    res.json({
      message: 'Subscription reactivated successfully',
      subscription: {
        ...subscription.toObject(),
        isValid: subscription.isValid(),
        daysRemaining: subscription.getDaysRemaining()
      }
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Super Admin: Get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const { status, plan, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (plan) query.plan = plan;

    const subscriptions = await Subscription.find(query)
      .populate('companyId', 'name employerName verificationStatus')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Subscription.countDocuments(query);

    res.json({
      subscriptions,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Super Admin: Update subscription
const updateSubscriptionAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Apply updates
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        subscription[key] = updates[key];
      }
    });

    await subscription.save();

    res.json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Super Admin: Suspend subscription
const suspendSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.status = 'suspended';
    subscription.suspendedAt = new Date();
    subscription.suspensionReason = reason || 'Suspended by admin';

    await subscription.save();

    res.json({
      message: 'Subscription suspended successfully',
      subscription
    });
  } catch (error) {
    console.error('Suspend subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPlans,
  getCurrentSubscription,
  createSubscription,
  changePlan,
  cancelSubscription,
  reactivateSubscription,
  getAllSubscriptions,
  updateSubscriptionAdmin,
  suspendSubscription
};

