/* eslint-disable no-console */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const TimeLog = require('../models/TimeLog');
const Payment = require('../models/Payment');

async function checkData() {
  try {
    await connectDB();

    console.log('\n=== DATABASE CONTENT CHECK ===\n');

    // Get company
    const company = await Company.findOne();
    console.log(`Company: ${company.name} (ID: ${company._id})`);

    // Get employees
    const employees = await Employee.find({ companyId: company._id });
    console.log(`\nEmployees for company (${employees.length}):`);
    employees.forEach(emp => {
      console.log(`  - ${emp.name} (ID: ${emp._id})`);
    });

    // Get time logs
    const timeLogs = await TimeLog.find({ companyId: company._id });
    console.log(`\nTime Logs (${timeLogs.length}):`);
    console.log(`  - Pending: ${timeLogs.filter(t => t.status === 'pending').length}`);
    console.log(`  - Approved: ${timeLogs.filter(t => t.status === 'approved').length}`);
    console.log(`  - Paid: ${timeLogs.filter(t => t.status === 'paid').length}`);

    // Get payments
    const employeeIds = employees.map(e => e._id);
    const payments = await Payment.find({ employeeId: { $in: employeeIds } })
      .populate('employeeId', 'name');
    
    console.log(`\nPayments (${payments.length}):`);
    console.log(`  - Pending: ${payments.filter(p => p.status === 'pending').length}`);
    console.log(`  - Approved: ${payments.filter(p => p.status === 'approved').length}`);
    console.log(`  - Processing: ${payments.filter(p => p.status === 'processing').length}`);
    console.log(`  - Completed: ${payments.filter(p => p.status === 'completed').length}`);
    console.log(`  - Failed: ${payments.filter(p => p.status === 'failed').length}`);

    console.log(`\n  Details:`);
    payments.forEach(p => {
      console.log(`    - ${p.employeeId.name}: $${p.amount.toFixed(2)} (${p.status}) - ${p.timeLogIds.length} time logs`);
    });

    // Check for orphaned time logs (approved but no payment)
    const approvedLogs = await TimeLog.find({ 
      companyId: company._id, 
      status: 'approved' 
    });
    
    console.log(`\n  Approved time logs without payments:`);
    let orphanCount = 0;
    for (const log of approvedLogs) {
      const hasPayment = payments.some(p => 
        p.timeLogIds.some(tid => tid.toString() === log._id.toString())
      );
      if (!hasPayment) {
        orphanCount++;
        console.log(`    - Log ${log._id} (${log.clockIn.toDateString()}) has no payment`);
      }
    }
    if (orphanCount === 0) {
      console.log(`    - None (all approved logs have payments)`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

checkData();

