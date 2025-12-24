const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  employerName: {
    type: String,
    required: true,
    trim: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentCycle: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'monthly'
  },
  bonusRateMultiplier: {
    type: Number,
    default: 1.5,
    min: 1.0
  },
  maxDailyHours: {
    type: Number,
    default: 8,
    min: 1,
    max: 24
  },
  arifpayMerchantKey: {
    type: String,
    required: true,
    trim: true,
    default: 'pending_setup',
    validate: {
      validator: function(v) {
        // Allow 'pending_setup' or validate actual merchant keys
        return v === 'pending_setup' || (typeof v === 'string' && v.length >= 5);
      },
      message: 'Merchant key must be at least 5 characters long or pending_setup'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'suspended'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  tin: { // Tax Identification Number
    type: String,
    trim: true
  },
  businessLicense: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    default: '1-10'
  }
}, {
  timestamps: true
});

// Ensure one company per employer
companySchema.index({ employerId: 1 }, { unique: true });

// Index for arifpayMerchantKey for faster lookups (not unique to allow multiple 'pending_setup')
companySchema.index({ arifpayMerchantKey: 1 });

module.exports = mongoose.model('Company', companySchema);
