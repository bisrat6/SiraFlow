const { validationResult } = require('express-validator');
const TimeLog = require('../models/TimeLog');
const Employee = require('../models/Employee');
const Company = require('../models/Company');
const Payment = require('../models/Payment');

// Generate attendance report
const generateAttendanceReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { periodStart, periodEnd } = req.body;

    // Get company
    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get employees for this company
    const employees = await Employee.find({ companyId: company._id });
    const employeeIds = employees.map(emp => emp._id);

    // Get time logs for the period
    const timeLogs = await TimeLog.find({
      employeeId: { $in: employeeIds },
      clockIn: { $gte: new Date(periodStart), $lte: new Date(periodEnd) }
    })
    .populate('employeeId', 'name hourlyRate')
    .sort({ clockIn: 1 });

    // Calculate total hours
    const totalHoursWorked = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

    // Generate employee stats
    const employeeStats = employees.map(emp => {
      const empLogs = timeLogs.filter(log => log.employeeId._id.toString() === emp._id.toString());
      const totalHours = empLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      const daysWorked = new Set(empLogs.map(log => new Date(log.clockIn).toDateString())).size;
      
      return {
        employeeId: emp._id,
        employeeName: emp.name,
        totalHours: totalHours,
        daysWorked: daysWorked,
        timeLogsCount: empLogs.length
      };
    });

    res.json({
      totalHoursWorked,
      employeeStats,
      totalEmployees: employees.length,
      totalTimeLogs: timeLogs.length,
      period: {
        start: periodStart,
        end: periodEnd
      }
    });
  } catch (error) {
    console.error('Generate attendance report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const { type, period } = req.query;

    // Get company
    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get employees for this company
    const employees = await Employee.find({ companyId: company._id });
    const employeeIds = employees.map(emp => emp._id);

    let analytics = {};

    switch (type) {
      case 'payroll':
        // Get payroll analytics
        const payments = await Payment.find({
          employeeId: { $in: employeeIds }
        })
        .populate('employeeId', 'name')
        .sort({ createdAt: -1 });

        analytics = {
          totalPayments: payments.length,
          totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
          pendingPayments: payments.filter(p => p.status === 'pending').length,
          completedPayments: payments.filter(p => p.status === 'completed').length,
          failedPayments: payments.filter(p => p.status === 'failed').length
        };
        break;

      case 'attendance':
        // Get attendance analytics
        const timeLogs = await TimeLog.find({
          employeeId: { $in: employeeIds }
        })
        .populate('employeeId', 'name')
        .sort({ clockIn: -1 });

        analytics = {
          totalTimeLogs: timeLogs.length,
          totalHours: timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0),
          pendingApprovals: timeLogs.filter(log => log.status === 'pending').length,
          approvedLogs: timeLogs.filter(log => log.status === 'approved').length,
          rejectedLogs: timeLogs.filter(log => log.status === 'rejected').length
        };
        break;

      default:
        // General analytics
        analytics = {
          totalEmployees: employees.length,
          activeEmployees: employees.filter(emp => emp.isActive).length,
          totalTimeLogs: await TimeLog.countDocuments({ employeeId: { $in: employeeIds } }),
          totalPayments: await Payment.countDocuments({ employeeId: { $in: employeeIds } })
        };
    }

    res.json({
      type: type || 'general',
      period: period || 'all',
      analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  generateAttendanceReport,
  getAnalytics
};
