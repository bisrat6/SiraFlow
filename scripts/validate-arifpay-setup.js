#!/usr/bin/env node

/**
 * Arifpay Setup Validation Script
 * 
 * This script validates that the Arifpay integration is properly configured
 * for multi-company support with individual merchant keys.
 * 
 * Run with: node scripts/validate-arifpay-setup.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('../models/Company');

const validateSetup = async () => {
  console.log('🔍 Validating Arifpay Multi-Company Setup...\n');

  // 1. Check environment variables
  console.log('1. Environment Variables:');
  const requiredEnvVars = ['ARIFPAY_API_KEY', 'ARIFPAY_BASE_URL'];
  const optionalEnvVars = ['ARIFPAY_DRY_RUN'];
  
  let envValid = true;
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName}: ${varName.includes('KEY') ? '***' + process.env[varName].slice(-4) : process.env[varName]}`);
    } else {
      console.log(`   ❌ ${varName}: Missing`);
      envValid = false;
    }
  });
  
  optionalEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   ℹ️  ${varName}: ${process.env[varName]}`);
    } else {
      console.log(`   ⚠️  ${varName}: Not set (optional)`);
    }
  });

  if (!envValid) {
    console.log('\n❌ Environment validation failed. Please check your .env file.');
    return;
  }

  // 2. Check database connection and company merchant keys
  try {
    console.log('\n2. Database & Company Validation:');
    
    if (!process.env.MONGO_URI) {
      console.log('   ❌ MONGO_URI not set. Cannot validate companies.');
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('   ✅ Database connected');

    const companies = await Company.find({ isActive: true });
    console.log(`   📊 Found ${companies.length} active companies`);

    if (companies.length === 0) {
      console.log('   ⚠️  No companies found. Create companies with merchant keys first.');
    } else {
      companies.forEach((company, index) => {
        const merchantKey = company.arifpayMerchantKey;
        const maskedKey = merchantKey ? '***' + merchantKey.slice(-4) : 'MISSING';
        console.log(`   ${index + 1}. ${company.name}: ${maskedKey}`);
        
        if (!merchantKey) {
          console.log(`      ❌ Missing merchant key for ${company.name}`);
          envValid = false;
        }
      });
    }

    await mongoose.disconnect();
    console.log('   ✅ Database disconnected');

  } catch (error) {
    console.log(`   ❌ Database error: ${error.message}`);
    envValid = false;
  }

  // 3. Summary
  console.log('\n3. Summary:');
  if (envValid) {
    console.log('   ✅ Setup validation passed!');
    console.log('   📝 Next steps:');
    console.log('      - Ensure each company has a unique merchant key');
    console.log('      - Test with ARIFPAY_DRY_RUN=true first');
    console.log('      - Monitor logs for proper merchant key usage');
  } else {
    console.log('   ❌ Setup validation failed!');
    console.log('   🔧 Please fix the issues above before proceeding.');
  }
};

// Run validation
validateSetup().catch(console.error);
