const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'professional', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['trial', 'active', 'suspended', 'cancelled', 'expired'],
    default: 'trial'
  },
  limits: {
    maxEmployees: { type: Number, default: 5 },
    maxMonthlyPayments: { type: Number, default: 50 },
    features: {
      advancedAnalytics: { type: Boolean, default: false },
      multiLocation: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      exportReports: { type: Boolean, default: false },
      bulkOperations: { type: Boolean, default: false }
    }
  },
  pricing: {
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'ETB' },
    billingCycle: { 
      type: String, 
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'monthly' 
    }
  },
  currentPeriod: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  trialEndsAt: { type: Date },
  cancelledAt: { type: Date },
  suspendedAt: { type: Date },
  suspensionReason: { type: String },
  paymentMethod: {
    type: { type: String }, // 'telebirr', 'bank_transfer', etc.
    lastFourDigits: String
  },
  autoRenew: { type: Boolean, default: true },
  notes: { type: String }, // Admin notes
  usageStats: {
    employeesCount: { type: Number, default: 0 },
    paymentsThisMonth: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Check if subscription is valid and active
subscriptionSchema.methods.isValid = function() {
  if (this.status === 'active') return true;
  if (this.status === 'trial' && this.trialEndsAt && this.trialEndsAt > new Date()) return true;
  return false;
};

// Check if feature is available
subscriptionSchema.methods.hasFeature = function(featureName) {
  return this.limits.features[featureName] === true;
};

// Check if limit is exceeded for employees
subscriptionSchema.methods.canAddEmployee = async function() {
  const Employee = require('./Employee');
  const currentCount = await Employee.countDocuments({ 
    companyId: this.companyId,
    isActive: true 
  });
  
  // -1 means unlimited
  if (this.limits.maxEmployees === -1) return true;
  
  return currentCount < this.limits.maxEmployees;
};

// Update usage statistics
subscriptionSchema.methods.updateUsageStats = async function() {
  const Employee = require('./Employee');
  const Payment = require('./Payment');
  
  const employeesCount = await Employee.countDocuments({
    companyId: this.companyId,
    isActive: true
  });
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const employees = await Employee.find({ companyId: this.companyId });
  const employeeIds = employees.map(emp => emp._id);
  
  const paymentsThisMonth = await Payment.countDocuments({
    employeeId: { $in: employeeIds },
    createdAt: { $gte: startOfMonth }
  });
  
  this.usageStats = {
    employeesCount,
    paymentsThisMonth,
    lastUpdated: new Date()
  };
  
  await this.save();
};

// Check if payment limit is reached
subscriptionSchema.methods.canProcessPayment = function() {
  // -1 means unlimited
  if (this.limits.maxMonthlyPayments === -1) return true;
  
  return this.usageStats.paymentsThisMonth < this.limits.maxMonthlyPayments;
};

// Calculate days remaining
subscriptionSchema.methods.getDaysRemaining = function() {
  const end = this.status === 'trial' ? this.trialEndsAt : this.currentPeriod.end;
  if (!end) return 0;
  
  const now = new Date();
  const diff = end - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Index for efficient queries
subscriptionSchema.index({ companyId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ plan: 1 });
subscriptionSchema.index({ 'currentPeriod.end': 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

