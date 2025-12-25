// Subscription Plans Configuration for SiraFlow SaaS

const PLANS = {
  free: {
    id: 'free',
    name: 'Free Trial',
    description: 'Perfect for testing the platform',
    price: 0,
    currency: 'ETB',
    billingCycle: 'monthly',
    trialDays: 14,
    maxEmployees: 5,
    maxMonthlyPayments: 50,
    features: {
      advancedAnalytics: false,
      multiLocation: false,
      apiAccess: false,
      customBranding: false,
      prioritySupport: false,
      exportReports: false,
      bulkOperations: false
    },
    featureList: [
      'Up to 5 employees',
      'Up to 50 payments per month',
      'Basic time tracking',
      'Basic payroll processing',
      'Standard support',
      '14-day trial'
    ]
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Great for small businesses',
    price: 2500, // ETB per month (~45 USD)
    currency: 'ETB',
    billingCycle: 'monthly',
    trialDays: 0,
    maxEmployees: 25,
    maxMonthlyPayments: 500,
    features: {
      advancedAnalytics: true,
      multiLocation: false,
      apiAccess: false,
      customBranding: false,
      prioritySupport: false,
      exportReports: true,
      bulkOperations: true
    },
    featureList: [
      'Up to 25 employees',
      'Up to 500 payments per month',
      'Advanced analytics',
      'Export reports (PDF/Excel)',
      'Bulk operations',
      'Email support',
      'Automated payroll'
    ],
    popular: false
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'For growing companies',
    price: 7500, // ETB per month (~135 USD)
    currency: 'ETB',
    billingCycle: 'monthly',
    trialDays: 0,
    maxEmployees: 100,
    maxMonthlyPayments: 2000,
    features: {
      advancedAnalytics: true,
      multiLocation: true,
      apiAccess: true,
      customBranding: true,
      prioritySupport: false,
      exportReports: true,
      bulkOperations: true
    },
    featureList: [
      'Up to 100 employees',
      'Up to 2000 payments per month',
      'Multi-location support',
      'API access',
      'Custom branding',
      'Advanced analytics & reports',
      'Priority email support',
      'Bulk operations',
      'Custom workflows'
    ],
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 'custom', // Contact for pricing
    currency: 'ETB',
    billingCycle: 'yearly',
    trialDays: 0,
    maxEmployees: -1, // Unlimited
    maxMonthlyPayments: -1, // Unlimited
    features: {
      advancedAnalytics: true,
      multiLocation: true,
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
      exportReports: true,
      bulkOperations: true,
      dedicatedAccountManager: true,
      customIntegrations: true,
      sla: true
    },
    featureList: [
      'Unlimited employees',
      'Unlimited payments',
      'Everything in Professional',
      'Dedicated account manager',
      'Custom integrations',
      '99.9% SLA',
      'Phone & priority support',
      'Custom features development',
      'On-premise deployment option',
      'Advanced security features'
    ],
    popular: false
  }
};

// Pricing for different billing cycles (annual discount)
const BILLING_CYCLE_MULTIPLIERS = {
  monthly: 1,
  quarterly: 2.7, // 10% discount
  yearly: 10 // ~17% discount
};

// Get plan configuration
const getPlan = (planId) => {
  return PLANS[planId] || null;
};

// Get all plans
const getAllPlans = () => {
  return Object.values(PLANS);
};

// Calculate price for billing cycle
const calculatePrice = (planId, billingCycle = 'monthly') => {
  const plan = getPlan(planId);
  if (!plan || plan.price === 'custom') return null;
  
  const multiplier = BILLING_CYCLE_MULTIPLIERS[billingCycle] || 1;
  return plan.price * multiplier;
};

// Check if upgrade is valid
const canUpgrade = (currentPlan, newPlan) => {
  const planOrder = ['free', 'starter', 'professional', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const newIndex = planOrder.indexOf(newPlan);
  
  return newIndex > currentIndex;
};

// Check if downgrade is valid
const canDowngrade = (currentPlan, newPlan) => {
  const planOrder = ['free', 'starter', 'professional', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const newIndex = planOrder.indexOf(newPlan);
  
  return newIndex < currentIndex && newIndex >= 0;
};

module.exports = {
  PLANS,
  BILLING_CYCLE_MULTIPLIERS,
  getPlan,
  getAllPlans,
  calculatePrice,
  canUpgrade,
  canDowngrade
};

