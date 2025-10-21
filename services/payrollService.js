const TimeLog = require('../models/TimeLog');
const Employee = require('../models/Employee');
const Company = require('../models/Company');
const Payment = require('../models/Payment');
const JobRole = require('../models/JobRole');

// Calculate payroll for a specific period
const calculatePayroll = async (companyId, startDate, endDate) => {
  try {
    // Get company details
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    // Get all employees for the company
    const employees = await Employee.find({ 
      companyId: companyId, 
      isActive: true 
    }).populate('jobRoleId');


    const payrollResults = [];

    for (const employee of employees) {
      // Get approved time logs for the period (excluding already paid ones)
      const timeLogs = await TimeLog.find({
        employeeId: employee._id,
        status: 'approved', // Only approved logs, exclude 'paid' ones
        clockIn: { $gte: startDate, $lte: endDate },
        clockOut: { $exists: true }
      });

      // Calculate totals
      const totalRegularHours = timeLogs.reduce((sum, log) => sum + log.regularHours, 0);
      const totalBonusHours = timeLogs.reduce((sum, log) => sum + log.bonusHours, 0);

      // Determine rates from JobRole if available; fallback to employee.hourlyRate
      let baseRate = employee.hourlyRate ?? 0;
      let overtimeRate = 0;
      let roleBonus = 0;

      if (employee.jobRoleId && employee.jobRoleId.defaultRates) {
        // JobRole is already populated
        baseRate = employee.jobRoleId.defaultRates.base ?? baseRate;
        overtimeRate = employee.jobRoleId.defaultRates.overtime ?? 0;
        roleBonus = employee.jobRoleId.defaultRates.roleBonus ?? 0;
      }

      // Calculate payment amounts using job role rates
      const regularPay = totalRegularHours * baseRate;
      const bonusPay = (totalBonusHours * overtimeRate) + roleBonus;
      const totalPay = regularPay + bonusPay;

      // Only create payment if there are hours worked
      if (totalRegularHours > 0 || totalBonusHours > 0) {
        // Check if payment already exists for this period or overlapping periods
        // Also check if any of these time logs are already associated with another payment
        const timeLogIds = timeLogs.map(log => log._id);
        const existingPayment = await Payment.findOne({
          $or: [
            // Exact period match
            {
              employeeId: employee._id,
              'period.startDate': startDate,
              'period.endDate': endDate
            },
            // Overlapping period match
            {
              employeeId: employee._id,
              'period.startDate': { $lte: endDate },
              'period.endDate': { $gte: startDate }
            },
            // Time logs already associated with another payment
            {
              employeeId: employee._id,
              timeLogIds: { $in: timeLogIds }
            }
          ]
        });

        if (!existingPayment) {
          // Create new payment
          const payment = new Payment({
            employeeId: employee._id,
            amount: totalPay,
            period: {
              startDate,
              endDate
            },
            regularHours: totalRegularHours,
            bonusHours: totalBonusHours,
            hourlyRate: baseRate,
            bonusRateMultiplier: (company.bonusRateMultiplier ?? 1), // Stored for audit trail, actual calculation uses JobRole rates
            timeLogIds: timeLogs.map(log => log._id),
            status: 'pending'
          });

          await payment.save();
          console.log(`[Payroll] Created pending payment ${payment._id} for employee ${employee._id} amount=${payment.amount}`);

          // Mark associated time logs as paid
          await TimeLog.updateMany(
            { _id: { $in: timeLogs.map(log => log._id) } },
            { status: 'paid' }
          );
          console.log(`[Payroll] Marked ${timeLogs.length} time logs as paid for employee ${employee._id}`);

          payrollResults.push({
            employeeId: employee._id,
            employeeName: employee.name,
            paymentId: payment._id,
            regularHours: totalRegularHours,
            bonusHours: totalBonusHours,
            regularPay,
            bonusPay,
            totalPay,
            timeLogCount: timeLogs.length
          });
        } else if (existingPayment.status === 'pending') {
          // Only update if payment is still pending (not processed/completed)
          if (existingPayment.amount !== totalPay) {
            existingPayment.amount = totalPay;
            existingPayment.regularHours = totalRegularHours;
            existingPayment.bonusHours = totalBonusHours;
            existingPayment.timeLogIds = timeLogs.map(log => log._id);
            await existingPayment.save();
            console.log(`[Payroll] Updated pending payment ${existingPayment._id} for employee ${employee._id} amount=${existingPayment.amount}`);
            
            // Mark associated time logs as paid
            await TimeLog.updateMany(
              { _id: { $in: timeLogs.map(log => log._id) } },
              { status: 'paid' }
            );
            console.log(`[Payroll] Marked ${timeLogs.length} time logs as paid for employee ${employee._id}`);
          }

          payrollResults.push({
            employeeId: employee._id,
            employeeName: employee.name,
            paymentId: existingPayment._id,
            regularHours: totalRegularHours,
            bonusHours: totalBonusHours,
            regularPay,
            bonusPay,
            totalPay,
            timeLogCount: timeLogs.length,
            status: 'updated'
          });
        } else {
          // Payment exists but is not pending (already processed/completed/failed)
          console.log(`[Payroll] Skipping payment ${existingPayment._id} for employee ${employee._id} - status is ${existingPayment.status}`);
          payrollResults.push({
            employeeId: employee._id,
            employeeName: employee.name,
            paymentId: existingPayment._id,
            regularHours: totalRegularHours,
            bonusHours: totalBonusHours,
            regularPay,
            bonusPay,
            totalPay,
            timeLogCount: timeLogs.length,
            status: 'skipped',
            existingStatus: existingPayment.status
          });
        }
      }
    }

    return {
      companyId,
      companyName: company.name,
      period: { startDate, endDate },
      totalEmployees: employees.length,
      employeesWithPayments: payrollResults.length,
      totalAmount: payrollResults.reduce((sum, result) => sum + result.totalPay, 0),
      results: payrollResults
    };
  } catch (error) {
    console.error('Calculate payroll error:', error);
    throw error;
  }
};

// Process payroll for a company based on payment cycle
const processPayroll = async (companyId) => {
  try {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const now = new Date();
    let startDate, endDate;

    switch (company.paymentCycle) {
      case 'daily':
        // Process today's time logs
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date(now);
        break;

      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setDate(0); // Last day of previous month
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        throw new Error('Invalid payment cycle');
    }

    // Get all employees for the company
    const employees = await Employee.find({ companyId }).populate('jobRoleId');
    const payrollResults = [];

    for (const employee of employees) {
      // Find approved time logs for this employee in the period that don't have payments yet
      const approvedLogs = await TimeLog.find({
        employeeId: employee._id,
        status: 'approved',
        clockIn: { $gte: startDate, $lte: endDate },
        clockOut: { $exists: true }
      });

      if (approvedLogs.length === 0) {
        continue; // No approved logs for this employee
      }

      // Check which logs don't have payments yet
      const logsWithoutPayments = [];
      for (const log of approvedLogs) {
        const hasPayment = await Payment.findOne({
          employeeId: employee._id,
          timeLogIds: log._id
        });
        if (!hasPayment) {
          logsWithoutPayments.push(log);
        }
      }

      if (logsWithoutPayments.length === 0) {
        continue; // All logs already have payments
      }

      // Group logs by day and create payments for each day
      const logsByDay = {};
      logsWithoutPayments.forEach(log => {
        const dayKey = log.clockIn.toDateString();
        if (!logsByDay[dayKey]) {
          logsByDay[dayKey] = [];
        }
        logsByDay[dayKey].push(log);
      });

      for (const [dayKey, dayLogs] of Object.entries(logsByDay)) {
        const logDate = new Date(dayKey);
        const dayStartDate = new Date(logDate);
        dayStartDate.setHours(0, 0, 0, 0);
        const dayEndDate = new Date(logDate);
        dayEndDate.setHours(23, 59, 59, 999);

        // Calculate payment for this day
        const totalRegularHours = dayLogs.reduce((sum, log) => sum + log.regularHours, 0);
        const totalBonusHours = dayLogs.reduce((sum, log) => sum + log.bonusHours, 0);
        
        let baseRate = employee.hourlyRate ?? 0;
        let overtimeRate = 0;
        let roleBonus = 0;

        if (employee.jobRoleId && employee.jobRoleId.defaultRates) {
          baseRate = employee.jobRoleId.defaultRates.base ?? baseRate;
          overtimeRate = employee.jobRoleId.defaultRates.overtime ?? 0;
          roleBonus = employee.jobRoleId.defaultRates.roleBonus ?? 0;
        }

        const regularPay = totalRegularHours * baseRate;
        const bonusPay = (totalBonusHours * overtimeRate) + roleBonus;
        const totalPay = regularPay + bonusPay;

        // Create payment
        const payment = new Payment({
          employeeId: employee._id,
          amount: totalPay,
          period: {
            startDate: dayStartDate,
            endDate: dayEndDate
          },
          regularHours: totalRegularHours,
          bonusHours: totalBonusHours,
          hourlyRate: baseRate,
          bonusRateMultiplier: (company.bonusRateMultiplier ?? 1),
          timeLogIds: dayLogs.map(log => log._id),
          status: 'pending'
        });

        await payment.save();
        console.log(`[Payroll] Created pending payment ${payment._id} for employee ${employee._id} amount=${payment.amount}`);

        // Mark associated time logs as paid
        await TimeLog.updateMany(
          { _id: { $in: dayLogs.map(log => log._id) } },
          { status: 'paid' }
        );
        console.log(`[Payroll] Marked ${dayLogs.length} time logs as paid for employee ${employee._id}`);

        payrollResults.push({
          employeeId: employee._id,
          employeeName: employee.name,
          paymentId: payment._id,
          regularHours: totalRegularHours,
          bonusHours: totalBonusHours,
          regularPay,
          bonusPay,
          totalPay,
          timeLogCount: dayLogs.length
        });
      }
    }

    return {
      companyId,
      companyName: company.name,
      period: { startDate, endDate },
      totalEmployees: employees.length,
      employeesWithPayments: payrollResults.length,
      totalAmount: payrollResults.reduce((sum, result) => sum + result.totalPay, 0),
      results: payrollResults
    };
  } catch (error) {
    console.error('Process payroll error:', error);
    throw error;
  }
};

// Get payroll summary for a company
const getPayrollSummary = async (companyId, period) => {
  try {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const employees = await Employee.find({ 
      companyId: companyId, 
      isActive: true 
    });

    const summary = {
      companyId,
      companyName: company.name,
      totalEmployees: employees.length,
      period,
      totalPayments: 0,
      totalAmount: 0,
      pendingPayments: 0,
      completedPayments: 0,
      failedPayments: 0
    };

    // Get payment statistics
    const payments = await Payment.find({
      employeeId: { $in: employees.map(emp => emp._id) },
      'period.startDate': { $gte: period.startDate },
      'period.endDate': { $lte: period.endDate }
    });

    summary.totalPayments = payments.length;
    summary.totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    summary.pendingPayments = payments.filter(p => p.status === 'pending').length;
    summary.completedPayments = payments.filter(p => p.status === 'completed').length;
    summary.failedPayments = payments.filter(p => p.status === 'failed').length;

    return summary;
  } catch (error) {
    console.error('Get payroll summary error:', error);
    throw error;
  }
};

// Get pending payments for processing
const getPendingPayments = async (companyId) => {
  try {
    const employees = await Employee.find({ 
      companyId: companyId, 
      isActive: true 
    });

    const pendingPayments = await Payment.find({
      employeeId: { $in: employees.map(emp => emp._id) },
      status: 'pending'
    })
    .populate('employeeId', 'name hourlyRate')
    .sort({ createdAt: 1 });

    return pendingPayments;
  } catch (error) {
    console.error('Get pending payments error:', error);
    throw error;
  }
};

// Get approved payments for processing
const getApprovedPayments = async (companyId) => {
  try {
    const employees = await Employee.find({ 
      companyId: companyId, 
      isActive: true 
    });

    const approvedPayments = await Payment.find({
      employeeId: { $in: employees.map(emp => emp._id) },
      status: 'approved'
    })
    .populate('employeeId', 'name hourlyRate')
    .sort({ createdAt: 1 });

    return approvedPayments;
  } catch (error) {
    console.error('Get approved payments error:', error);
    throw error;
  }
};

// Helper function to calculate payment for a single employee's approved time logs
const calculateEmployeePayment = async (employeeId, timeLogIds) => {
  try {
    const employee = await Employee.findById(employeeId).populate('jobRoleId');
    if (!employee) {
      throw new Error('Employee not found');
    }

    const timeLogs = await TimeLog.find({
      _id: { $in: timeLogIds },
      status: 'approved'
    });

    if (timeLogs.length === 0) {
      return null;
    }

    // Calculate totals
    const totalRegularHours = timeLogs.reduce((sum, log) => sum + log.regularHours, 0);
    const totalBonusHours = timeLogs.reduce((sum, log) => sum + log.bonusHours, 0);

    // Determine rates from JobRole if available; fallback to employee.hourlyRate
    let baseRate = employee.hourlyRate ?? 0;
    let overtimeRate = 0;
    let roleBonus = 0;

    if (employee.jobRoleId && employee.jobRoleId.defaultRates) {
      baseRate = employee.jobRoleId.defaultRates.base ?? baseRate;
      overtimeRate = employee.jobRoleId.defaultRates.overtime ?? 0;
      roleBonus = employee.jobRoleId.defaultRates.roleBonus ?? 0;
    }

    // Calculate payment amounts
    const regularPay = totalRegularHours * baseRate;
    const bonusPay = (totalBonusHours * overtimeRate) + roleBonus;
    const totalPay = regularPay + bonusPay;

    return {
      employeeId,
      amount: totalPay,
      regularHours: totalRegularHours,
      bonusHours: totalBonusHours,
      hourlyRate: baseRate,
      timeLogIds: timeLogIds,
      timeLogs: timeLogs
    };
  } catch (error) {
    console.error('Calculate employee payment error:', error);
    throw error;
  }
};

module.exports = {
  calculatePayroll,
  processPayroll,
  getPayrollSummary,
  getPendingPayments,
  getApprovedPayments,
  calculateEmployeePayment
};
