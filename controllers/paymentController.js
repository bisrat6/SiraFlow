const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Company = require('../models/Company');
const arifpayService = require('../services/arifpayService');
const payrollService = require('../services/payrollService');
const Employee = require('../models/Employee');

// ============================================
// ARIFPAY B2C PAYOUT ENDPOINTS
// ============================================

// (Removed) Initiate payment route - superseded by approval flow

// Get payments for company
const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, employeeId } = req.query;
    
    // Get company
    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get employees for this company
    const Employee = require('../models/Employee');
    const employees = await Employee.find({ companyId: company._id });
    const employeeIds = employees.map(emp => emp._id);

    // Build query
    const query = { employeeId: { $in: employeeIds } };
    if (status) {
      query.status = status;
    }
    if (employeeId) {
      query.employeeId = employeeId;
    }

    const payments = await Payment.find(query)
      .populate('employeeId', 'name hourlyRate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payment by ID
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('employeeId', 'name hourlyRate')
      .populate('timeLogIds');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payments summary for employer/company
const getPaymentsSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query || {};

    // Get company
    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get employees for this company
    const employees = await Employee.find({ companyId: company._id });
    const employeeIds = employees.map(emp => emp._id);

    // Build query
    const query = { employeeId: { $in: employeeIds } };
    if (startDate) query['period.startDate'] = { $gte: new Date(startDate) };
    if (endDate) query['period.endDate'] = { ...(query['period.endDate'] || {}), $lte: new Date(endDate) };

    const payments = await Payment.find(query).select('amount status');

    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const processingPayments = payments.filter(p => p.status === 'processing').length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;

    return res.json({
      totalPayments,
      totalAmount,
      pendingPayments,
      processingPayments,
      completedPayments,
      failedPayments
    });
  } catch (error) {
    console.error('Get payments summary error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Process payroll (calculate only; do not auto-initiate)
const processPayroll = async (req, res) => {
  try {
    // Get company
    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Process payroll for the company
    const payrollResult = await payrollService.processPayroll(company._id);

    // Get pending payments count for visibility
    const pendingPayments = await payrollService.getPendingPayments(company._id);

    res.json({
      message: 'Payroll calculated successfully',
      payroll: payrollResult,
      payments: {
        pending: pendingPayments.length
      }
    });
  } catch (error) {
    console.error('Process payroll error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Approve a single pending payment and immediately process it
const approvePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId } = req.body;

    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (!company.arifpayMerchantKey || company.arifpayMerchantKey === 'pending_setup') {
      return res.status(400).json({ message: 'Arifpay merchant key not configured. Please set up your payment gateway first.' });
    }

    const payment = await Payment.findById(paymentId).populate('employeeId', 'companyId name');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: `Payment not approvable (status: ${payment.status})` });
    }

    if (payment.employeeId.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to approve this payment' });
    }

    payment.status = 'approved';
    payment.approvedAt = new Date();
    payment.approvedBy = req.user._id;
    await payment.save();

    try {
      const result = await arifpayService.initiateTelebirrPayout(payment._id, company.arifpayMerchantKey);

      return res.json({
        message: 'Payment approved and sent',
        paymentId: payment._id,
        ...result
      });
    } catch (arifpayError) {
      // If Arifpay fails, mark payment as failed with clear reason
      payment.status = 'failed';
      payment.failureReason = arifpayError.message;
      await payment.save();

      return res.status(400).json({
        message: 'Payment approval failed',
        paymentId: payment._id,
        error: arifpayError.message,
        details: 'The payment could not be processed. Please check your Arifpay configuration and try again.'
      });
    }
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Approve all pending payments in a period and process them in bulk
const approvePaymentsForPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};

    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (!company.arifpayMerchantKey || company.arifpayMerchantKey === 'pending_setup') {
      return res.status(400).json({ message: 'Arifpay merchant key not configured. Please set up your payment gateway first.' });
    }

    const employees = await Employee.find({ companyId: company._id, isActive: true });
    const employeeIds = employees.map(e => e._id);

    let query = {
      employeeId: { $in: employeeIds },
      status: 'pending'
    };

    if (startDate && endDate) {
      query['period.startDate'] = { $gte: new Date(startDate) };
      query['period.endDate'] = { $lte: new Date(endDate) };
    }

    const pendingToApprove = await Payment.find(query);

    if (pendingToApprove.length === 0) {
      return res.json({ message: 'No pending payments to approve', approved: 0, processed: 0 });
    }

    const ids = [];
    for (const p of pendingToApprove) {
      p.status = 'approved';
      p.approvedAt = new Date();
      p.approvedBy = req.user._id;
      await p.save();
      ids.push(p._id.toString());
    }

    try {
      const results = await arifpayService.processBulkPayments(ids, company.arifpayMerchantKey);
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      return res.json({
        message: 'Approved and processed payments',
        approved: ids.length,
        processed: results.length,
        successful,
        failed,
        results
      });
    } catch (bulkError) {
      // If bulk processing fails, still return the approved payments
      return res.status(400).json({
        message: 'Bulk approval failed',
        approved: ids.length,
        processed: 0,
        successful: 0,
        failed: ids.length,
        error: bulkError.message,
        details: 'Some payments were approved but failed to process. Please check your Arifpay configuration.',
        results: []
      });
    }
  } catch (error) {
    console.error('Approve payments for period error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get payroll summary
const getPayrollSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get company
    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const period = {
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: endDate ? new Date(endDate) : new Date()
    };

    const summary = await payrollService.getPayrollSummary(company._id, period);

    res.json({ summary });
  } catch (error) {
    console.error('Get payroll summary error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Handle Arifpay B2C webhook
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-arifpay-signature'];
    const payload = req.rawBody || JSON.stringify(req.body);
    
    // Find the payment by session ID to get the company's merchant key
    const sessionId = req.body?.sessionId || req.body?.uuid;
    const payment = await Payment.findOne({ arifpaySessionId: sessionId }).populate({
      path: 'employeeId',
      populate: { path: 'companyId' }
    });

    if (!payment) {
      console.error('[B2C Webhook] Payment not found for session ID:', sessionId);
      return res.status(400).json({ message: 'Unknown session' });
    }

    const merchantKey = payment.employeeId.companyId.arifpayMerchantKey;
    
    // Verify webhook signature using the company's specific merchant key
    const isValidSignature = arifpayService.verifyWebhookSignature(
      payload, 
      signature, 
      merchantKey
    );

    if (!isValidSignature) {
      console.warn(`[B2C Webhook] Invalid signature for payment ${payment._id} with merchant key: ${merchantKey ? merchantKey.substring(0, 4) + '***' : 'missing'}`);
      return res.status(403).json({ message: 'Invalid signature' });
    }

    // Process B2C webhook
    const result = await arifpayService.handleB2CWebhook(req.body);

    if (result.success) {
      console.log(`[B2C Webhook] Successfully processed payment ${payment._id}`);
      // Webhook MUST return HTTP 200 for Arifpay to mark it as processed
      return res.status(200).json({ message: 'Webhook processed successfully' });
    } else {
      console.error(`[B2C Webhook] Failed to process payment ${payment._id}: ${result.message}`);
      return res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('[B2C Webhook] Processing error:', error);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// Retry a single failed payment
const retryPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (!company.arifpayMerchantKey || company.arifpayMerchantKey === 'pending_setup') {
      return res.status(400).json({ message: 'Arifpay merchant key not configured. Please set up your payment gateway first.' });
    }

    const payment = await Payment.findById(paymentId).populate('employeeId', 'companyId name');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.employeeId.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to retry this payment' });
    }

    if (payment.status !== 'failed') {
      return res.status(400).json({ message: `Payment is not in failed status (current: ${payment.status})` });
    }

    // Reset payment status and retry count
    payment.status = 'approved';
    payment.retryCount += 1;
    payment.failureReason = null;
    await payment.save();

    try {
      const result = await arifpayService.initiateTelebirrPayout(payment._id, company.arifpayMerchantKey);

      return res.json({
        message: 'Payment retry initiated successfully',
        paymentId: payment._id,
        retryCount: payment.retryCount,
        ...result
      });
    } catch (arifpayError) {
      // If Arifpay fails again, mark payment as failed
      payment.status = 'failed';
      payment.failureReason = arifpayError.message;
      await payment.save();

      return res.status(400).json({
        message: 'Payment retry failed',
        paymentId: payment._id,
        retryCount: payment.retryCount,
        error: arifpayError.message,
        details: 'The payment retry could not be processed. Please check your Arifpay configuration and try again.'
      });
    }
  } catch (error) {
    console.error('Retry payment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Retry failed payments (Arifpay)
const retryFailedPayments = async (req, res) => {
  try {
    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (!company.arifpayMerchantKey || company.arifpayMerchantKey === 'pending_setup') {
      return res.status(400).json({ message: 'Arifpay merchant key not configured. Please set up your payment gateway first.' });
    }

    const results = await arifpayService.retryFailedPayments(
      company._id, 
      company.arifpayMerchantKey
    );

    res.json({
      message: 'Failed payments retry completed',
      results
    });
  } catch (error) {
    console.error('Retry failed payments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get my payments (employee only)
const getMyPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Get employee record
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    // Build query
    const query = { employeeId: employee._id };
    if (status) {
      query.status = status;
    }

    // Get payments with pagination
    const skip = (page - 1) * limit;
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('employeeId', 'name email');

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my payment summary (employee only)
const getMyPaymentsSummary = async (req, res) => {
  try {
    // Get employee record
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    // Get all payments for this employee
    const allPayments = await Payment.find({ employeeId: employee._id });

    // Calculate summary statistics
    const totalAmount = allPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingPayments = allPayments.filter(p => p.status === 'pending').length;
    const approvedPayments = allPayments.filter(p => p.status === 'approved').length;
    const processingPayments = allPayments.filter(p => p.status === 'processing').length;
    const completedPayments = allPayments.filter(p => p.status === 'completed').length;
    const failedPayments = allPayments.filter(p => p.status === 'failed').length;

    // Calculate amounts by status
    const pendingAmount = allPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const completedAmount = allPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      totalAmount,
      completedAmount,
      pendingAmount,
      pendingPayments,
      approvedPayments,
      processingPayments,
      completedPayments,
      failedPayments,
      totalPayments: allPayments.length
    });
  } catch (error) {
    console.error('Get my payments summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// MODULE EXPORTS
// ============================================

module.exports = {
  // Payment operations
  getPayments,
  getPayment,
  getPaymentsSummary,
  approvePayment,
  approvePaymentsForPeriod,
  getMyPayments,
  getMyPaymentsSummary,
  
  // Payroll processing
  processPayroll,
  getPayrollSummary,
  
  // Webhooks
  handleWebhook,             // B2C webhook handler
  
  // Retry operations
  retryPayment,
  retryFailedPayments
};

