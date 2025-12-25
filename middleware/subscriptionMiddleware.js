const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const Employee = require('../models/Employee');

// Check if company has valid subscription
const requireActiveSubscription = async (req, res, next) => {
  try {
    // Super admins bypass subscription checks
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Get company for the current user
    let company;
    if (req.user.role === 'employer') {
      company = await Company.findOne({ employerId: req.user._id });
    } else if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ userId: req.user._id });
      if (employee) {
        company = await Company.findById(employee.companyId);
      }
    }

    if (!company) {
      return res.status(404).json({ 
        message: 'Company not found',
        code: 'COMPANY_NOT_FOUND'
      });
    }

    // Get subscription
    const subscription = await Subscription.findOne({ companyId: company._id });
    
    if (!subscription) {
      return res.status(403).json({ 
        message: 'No active subscription found. Please subscribe to continue.',
        code: 'NO_SUBSCRIPTION'
      });
    }

    if (!subscription.isValid()) {
      return res.status(403).json({ 
        message: 'Your subscription has expired. Please renew to continue.',
        code: 'SUBSCRIPTION_EXPIRED',
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          daysRemaining: subscription.getDaysRemaining()
        }
      });
    }

    // Attach subscription to request for later use
    req.subscription = subscription;
    req.company = company;
    
    next();
  } catch (error) {
    console.error('Subscription middleware error:', error);
    res.status(500).json({ message: 'Server error checking subscription' });
  }
};

// Check if specific feature is available in subscription
const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      // Super admins bypass feature checks
      if (req.user.role === 'super_admin') {
        return next();
      }

      if (!req.subscription) {
        return res.status(403).json({ 
          message: 'Subscription information not available',
          code: 'NO_SUBSCRIPTION_INFO'
        });
      }

      if (!req.subscription.hasFeature(featureName)) {
        return res.status(403).json({ 
          message: `This feature requires a higher subscription plan`,
          code: 'FEATURE_NOT_AVAILABLE',
          feature: featureName,
          currentPlan: req.subscription.plan
        });
      }

      next();
    } catch (error) {
      console.error('Feature check middleware error:', error);
      res.status(500).json({ message: 'Server error checking feature access' });
    }
  };
};

// Check if employee limit allows adding more employees
const checkEmployeeLimit = async (req, res, next) => {
  try {
    // Super admins bypass limit checks
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!req.subscription) {
      return res.status(403).json({ 
        message: 'Subscription information not available',
        code: 'NO_SUBSCRIPTION_INFO'
      });
    }

    const canAdd = await req.subscription.canAddEmployee();
    
    if (!canAdd) {
      return res.status(403).json({ 
        message: 'Employee limit reached for your current plan. Please upgrade to add more employees.',
        code: 'EMPLOYEE_LIMIT_REACHED',
        currentLimit: req.subscription.limits.maxEmployees,
        currentPlan: req.subscription.plan
      });
    }

    next();
  } catch (error) {
    console.error('Employee limit check error:', error);
    res.status(500).json({ message: 'Server error checking employee limit' });
  }
};

// Check if payment limit allows processing more payments
const checkPaymentLimit = async (req, res, next) => {
  try {
    // Super admins bypass limit checks
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!req.subscription) {
      return res.status(403).json({ 
        message: 'Subscription information not available',
        code: 'NO_SUBSCRIPTION_INFO'
      });
    }

    // Update usage stats if they're stale (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!req.subscription.usageStats.lastUpdated || 
        req.subscription.usageStats.lastUpdated < oneHourAgo) {
      await req.subscription.updateUsageStats();
    }

    const canProcess = req.subscription.canProcessPayment();
    
    if (!canProcess) {
      return res.status(403).json({ 
        message: 'Monthly payment limit reached for your current plan. Please upgrade to process more payments.',
        code: 'PAYMENT_LIMIT_REACHED',
        currentLimit: req.subscription.limits.maxMonthlyPayments,
        currentUsage: req.subscription.usageStats.paymentsThisMonth,
        currentPlan: req.subscription.plan
      });
    }

    next();
  } catch (error) {
    console.error('Payment limit check error:', error);
    res.status(500).json({ message: 'Server error checking payment limit' });
  }
};

// Middleware to check if user is super admin
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      message: 'Access denied. Super admin privileges required.',
      code: 'SUPER_ADMIN_REQUIRED'
    });
  }
  next();
};

module.exports = {
  requireActiveSubscription,
  requireFeature,
  checkEmployeeLimit,
  checkPaymentLimit,
  requireSuperAdmin
};

