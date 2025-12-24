const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'ETB'
  },
  duration: {
    type: Number, // in days
    required: true,
    default: 30
  },
  limits: {
    maxEmployees: {
      type: Number,
      required: true,
      default: 10
    },
    maxMonthlyPayments: {
      type: Number,
      required: true,
      default: 100
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number, // For display ordering
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionPlanSchema.index({ isActive: 1, order: 1 });
subscriptionPlanSchema.index({ price: 1 });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

