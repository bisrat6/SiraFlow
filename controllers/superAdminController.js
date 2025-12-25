const { validationResult } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const Subscription = require('../models/Subscription');
const Employee = require('../models/Employee');
const Payment = require('../models/Payment');
const TimeLog = require('../models/TimeLog');

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ isActive: true });
    const pendingVerification = await Company.countDocuments({ verificationStatus: 'pending' });
    const verifiedCompanies = await Company.countDocuments({ verificationStatus: 'verified' });
    
    const totalUsers = await User.countDocuments();
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const trialSubscriptions = await Subscription.countDocuments({ status: 'trial' });
    const expiredSubscriptions = await Subscription.countDocuments({ status: 'expired' });
    
    // Revenue calculations (active subscriptions)
    const subscriptions = await Subscription.find({ status: 'active' });
    const monthlyRevenue = subscriptions.reduce((sum, sub) => {
      return sum + (sub.pricing.amount || 0);
    }, 0);

    // Recent activity
    const recentCompanies = await Company.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name employerName verificationStatus createdAt');

    const recentSubscriptions = await Subscription.find()
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('plan status createdAt companyId');

    res.json({
      stats: {
        companies: {
          total: totalCompanies,
          active: activeCompanies,
          pending: pendingVerification,
          verified: verifiedCompanies
        },
        users: {
          total: totalUsers,
          employers: totalEmployers,
          employees: totalEmployees
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          trial: trialSubscriptions,
          expired: expiredSubscriptions
        },
        revenue: {
          monthly: monthlyRevenue,
          currency: 'ETB'
        }
      },
      recentActivity: {
        companies: recentCompanies,
        subscriptions: recentSubscriptions
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all companies with filters
const getAllCompanies = async (req, res) => {
  try {
    const { 
      status, 
      verificationStatus, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};
    
    if (status) query.isActive = status === 'active';
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employerName: { $regex: search, $options: 'i' } }
      ];
    }

    const companies = await Company.find(query)
      .populate('employerId', 'email')
      .populate('subscriptionId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Company.countDocuments(query);

    res.json({
      companies,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get company details
const getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id)
      .populate('employerId', 'email createdAt')
      .populate('subscriptionId');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get additional stats
    const employeesCount = await Employee.countDocuments({ companyId: company._id });
    const activeEmployeesCount = await Employee.countDocuments({ companyId: company._id, isActive: true });
    
    const employees = await Employee.find({ companyId: company._id });
    const employeeIds = employees.map(emp => emp._id);
    
    const timeLogsCount = await TimeLog.countDocuments({ employeeId: { $in: employeeIds } });
    const paymentsCount = await Payment.countDocuments({ employeeId: { $in: employeeIds } });
    
    const totalPaymentsAmount = await Payment.aggregate([
      { $match: { employeeId: { $in: employeeIds }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      company,
      stats: {
        employees: employeesCount,
        activeEmployees: activeEmployeesCount,
        timeLogs: timeLogsCount,
        payments: paymentsCount,
        totalPaymentsAmount: totalPaymentsAmount.length > 0 ? totalPaymentsAmount[0].total : 0
      }
    });
  } catch (error) {
    console.error('Get company details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify company
const verifyCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.verificationStatus = status;
    company.verifiedBy = req.user._id;
    company.verifiedAt = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      company.rejectionReason = rejectionReason;
    }

    await company.save();

    res.json({
      message: `Company ${status} successfully`,
      company
    });
  } catch (error) {
    console.error('Verify company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Suspend/unsuspend company
const toggleCompanySuspension = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspend, reason } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (suspend) {
      company.verificationStatus = 'suspended';
      company.isActive = false;
      
      // Also suspend their subscription
      const subscription = await Subscription.findOne({ companyId: company._id });
      if (subscription) {
        subscription.status = 'suspended';
        subscription.suspendedAt = new Date();
        subscription.suspensionReason = reason || 'Company suspended by admin';
        await subscription.save();
      }
    } else {
      company.verificationStatus = 'verified';
      company.isActive = true;
      
      // Reactivate subscription
      const subscription = await Subscription.findOne({ companyId: company._id });
      if (subscription && subscription.status === 'suspended') {
        subscription.status = 'active';
        subscription.suspendedAt = null;
        subscription.suspensionReason = null;
        await subscription.save();
      }
    }

    await company.save();

    res.json({
      message: `Company ${suspend ? 'suspended' : 'reactivated'} successfully`,
      company
    });
  } catch (error) {
    console.error('Toggle company suspension error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;

    const query = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Deactivate/activate user
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({ message: 'Cannot modify super admin accounts' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get platform analytics
const getPlatformAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // New companies
    const newCompanies = await Company.countDocuments({
      createdAt: { $gte: startDate }
    });

    // New users
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Subscription distribution
    const subscriptionDistribution = await Subscription.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);

    // Status distribution
    const statusDistribution = await Subscription.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Revenue by plan
    const revenueByPlan = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$plan', revenue: { $sum: '$pricing.amount' } } }
    ]);

    // Growth over time (last 12 months)
    const monthlyGrowth = await Company.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      period,
      dateRange: { start: startDate, end: now },
      newCompanies,
      newUsers,
      subscriptionDistribution,
      statusDistribution,
      revenueByPlan,
      monthlyGrowth
    });
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAllCompanies,
  getCompanyDetails,
  verifyCompany,
  toggleCompanySuspension,
  getAllUsers,
  toggleUserStatus,
  getPlatformAnalytics
};

