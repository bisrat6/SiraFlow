# Arifpay Multi-Company Setup Guide

This document outlines the implementation of multi-company support for Arifpay payments, where each company has its own merchant key while sharing a platform API key.

## 🏗️ Architecture Overview

- **Platform API Key**: Shared across all companies for authentication
- **Company Merchant Keys**: Individual keys stored per company for payment routing
- **Webhook Security**: Each webhook is verified using the specific company's merchant key

## 📋 Implementation Summary

### 1. Environment Configuration (.env)

**Before:**
```env
ARIFPAY_MERCHANT_KEY=your_arifpay_key
ARIFPAY_BASE_URL=https://gateway.arifpay.net/api/v1
```

**After:**
```env
ARIFPAY_API_KEY=your_platform_api_key
ARIFPAY_BASE_URL=https://sandbox.arifpay.et/api
ARIFPAY_DRY_RUN=true
```

### 2. Company Model Updates

Added validation and uniqueness constraints to the `arifpayMerchantKey` field:

```javascript
arifpayMerchantKey: {
  type: String,
  required: true,
  trim: true,
  unique: true,
  validate: {
    validator: function(v) {
      return typeof v === 'string' && v.length >= 10;
    },
    message: 'Merchant key must be at least 10 characters long'
  }
}
```

### 3. Arifpay Service Updates

**Authentication Pattern:**
- Uses `ARIFPAY_API_KEY` for Authorization header
- Uses company's `merchantKey` for `x-arifpay-key` header
- Added merchant key validation and masked logging

**Example API Call Headers:**
```javascript
const headers = {
  "Authorization": `Bearer ${ARIFPAY_API_KEY}`,
  "x-arifpay-key": merchantKey,
  "Content-Type": "application/json",
};
```

### 4. Webhook Security Enhancement

Updated webhook handler to:
1. Find payment by session ID
2. Retrieve company's merchant key from database
3. Verify webhook signature using the specific merchant key
4. Process webhook securely

### 5. Security Features

- **Masked Logging**: Sensitive data is masked in logs using `maskSensitiveData()`
- **Merchant Key Validation**: Ensures merchant keys are provided and valid
- **Unique Constraints**: Prevents duplicate merchant key registrations
- **Dry Run Mode**: Safe testing with `ARIFPAY_DRY_RUN=true`

## 🔧 Setup Instructions

### Step 1: Update Environment Variables

1. Remove any existing `ARIFPAY_MERCHANT_KEY` lines from your `.env` file
2. Add the new configuration:
   ```env
   ARIFPAY_API_KEY=your_platform_api_key
   ARIFPAY_BASE_URL=https://sandbox.arifpay.et/api
   ARIFPAY_DRY_RUN=true
   ```

### Step 2: Update Company Records

Each company needs a unique merchant key:

```javascript
// Example: Update existing companies
await Company.findByIdAndUpdate(companyId, {
  arifpayMerchantKey: 'company_specific_merchant_key'
});
```

### Step 3: Validate Setup

Run the validation script:
```bash
node scripts/validate-arifpay-setup.js
```

### Step 4: Test with Dry Run

1. Set `ARIFPAY_DRY_RUN=true` in your `.env`
2. Test payment flows - no actual transfers will occur
3. Check logs for proper merchant key usage

### Step 5: Production Deployment

1. Set `ARIFPAY_DRY_RUN=false`
2. Update `ARIFPAY_BASE_URL` to production URL
3. Store `ARIFPAY_API_KEY` in a secure vault
4. Monitor logs for any issues

## 🔍 Monitoring & Debugging

### Log Patterns

Look for these log patterns to verify correct operation:

```
[B2C Session] Creating session with merchant key: ****1234
[B2C Transfer] Executing transfer with merchant key: ****1234
[B2C Webhook] Successfully processed payment 507f1f77bcf86cd799439011
```

### Validation Commands

```bash
# Validate setup
node scripts/validate-arifpay-setup.js

# Check for linting errors
npm run lint

# Test dry run mode
ARIFPAY_DRY_RUN=true node server.js
```

## 🚨 Important Security Notes

1. **Never log merchant keys or API keys** - Use the `maskSensitiveData()` function
2. **Store API keys securely** - Use AWS Secrets Manager or similar in production
3. **Validate merchant keys** - Each company must have a unique, valid merchant key
4. **Monitor webhook signatures** - All webhooks are verified using company-specific keys
5. **Use dry run mode** - Always test with `ARIFPAY_DRY_RUN=true` first

## 🔄 Migration from Single Merchant Key

If migrating from the old single merchant key setup:

1. **Backup your database** before making changes
2. **Update environment variables** as shown above
3. **Add merchant keys** to existing companies
4. **Test thoroughly** with dry run mode
5. **Monitor logs** during the transition

## 📞 Support

If you encounter issues:

1. Check the validation script output
2. Verify environment variables are correct
3. Ensure all companies have valid merchant keys
4. Check logs for masked merchant key usage
5. Test with dry run mode first

## 🎯 Key Benefits

- **Multi-tenant Support**: Each company has its own payment routing
- **Enhanced Security**: Company-specific webhook verification
- **Better Monitoring**: Detailed logging with masked sensitive data
- **Safe Testing**: Dry run mode prevents accidental transfers
- **Scalability**: Platform API key shared across all companies
