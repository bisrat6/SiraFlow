/* eslint-disable no-console */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const JobRole = require('../models/JobRole');
const TimeLog = require('../models/TimeLog');
const Payment = require('../models/Payment');

async function seedClean() {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Employee.deleteMany({}),
      JobRole.deleteMany({}),
      TimeLog.deleteMany({}),
      Payment.deleteMany({})
    ]);

    console.log('Creating employer user and company...');
    const employer = await User.create({
      email: 'employer1@example.com',
      password: 'Password123!',
      role: 'employer'
    });

    const company = await Company.create({
      name: 'Acme Corp',
      employerName: 'John Doe',
      employerId: employer._id,
      paymentCycle: 'weekly', // Set to weekly from the start
      bonusRateMultiplier: 1.5,
      maxDailyHours: 8,
      arifpayMerchantKey: process.env.ARIFPAY_MERCHANT_KEY || 'demo_key'
    });

    console.log('Creating job roles...');
    const jobRolesData = [
      { 
        name: 'Software Developer', 
        companyId: company._id,
        defaultRates: { base: 25, overtime: 37.5, roleBonus: 100 }
      },
      { 
        name: 'Sales Associate', 
        companyId: company._id,
        defaultRates: { base: 15, overtime: 22.5, roleBonus: 50 }
      },
      { 
        name: 'Manager', 
        companyId: company._id,
        defaultRates: { base: 35, overtime: 52.5, roleBonus: 200 }
      }
    ];

    const jobRoles = await JobRole.insertMany(jobRolesData);

    console.log('Creating employee users and records...');
    const employeesData = [
      { 
        email: 'employee1@example.com', 
        name: 'Alice Worker', 
        jobRoleId: jobRoles[0]._id,
        telebirrMsisdn: '251912345678'
      },
      { 
        email: 'employee2@example.com', 
        name: 'Bob Helper', 
        jobRoleId: jobRoles[1]._id,
        telebirrMsisdn: '251923456789'
      },
      { 
        email: 'employee3@example.com', 
        name: 'Charlie Maker', 
        jobRoleId: jobRoles[2]._id,
        telebirrMsisdn: '251934567890'
      }
    ];

    const employeeUsers = [];
    const employees = [];

    for (const empData of employeesData) {
      const user = await User.create({
        email: empData.email,
        password: 'Password123!',
        role: 'employee',
        companyId: company._id
      });
      employeeUsers.push(user);

      const jobRole = await JobRole.findById(empData.jobRoleId);
      
      const employee = await Employee.create({
        userId: user._id,
        companyId: company._id,
        name: empData.name,
        email: empData.email,
        jobRoleId: empData.jobRoleId,
        hourlyRate: jobRole.defaultRates.base,
        position: jobRole.name,
        telebirrMsisdn: empData.telebirrMsisdn,
        isActive: true
      });
      employees.push(employee);
    }

    console.log('Creating time logs for the past 5 days...');
    const now = new Date();
    const logsToInsert = [];
    
    // Create time logs with different statuses
    for (let dayOffset = 1; dayOffset <= 5; dayOffset += 1) {
      for (const emp of employees) {
        const date = new Date(now);
        date.setDate(now.getDate() - dayOffset);
        const clockIn = new Date(date.setHours(9, 0, 0, 0));
        const clockOut = new Date(new Date(clockIn).setHours(clockIn.getHours() + 8 + Math.random() * 2));

        // Different statuses based on day
        let status = 'pending';
        if (dayOffset <= 2) {
          status = 'approved'; // Recent days - approved but no payments yet
        } else if (dayOffset <= 3) {
          status = 'paid'; // Older days - already paid
        } else {
          status = 'pending'; // Very recent - still pending
        }

        logsToInsert.push({
          employeeId: emp._id,
          companyId: company._id,
          clockIn,
          clockOut,
          status,
          approvedBy: status !== 'pending' ? employer._id : undefined,
          approvedAt: status !== 'pending' ? new Date(date.getTime() + 24 * 60 * 60 * 1000) : undefined
        });
      }
    }

    const createdLogs = await TimeLog.insertMany(logsToInsert);
    // Calculate duration/regular/bonus
    for (const log of createdLogs) {
      log.duration = (log.clockOut - log.clockIn) / 3600000;
      log.regularHours = Math.min(log.duration, 8);
      log.bonusHours = Math.max(0, log.duration - 8);
      await log.save();
    }

    // Create some completed payments for the "paid" time logs only
    console.log('Creating completed payments for paid time logs only...');
    for (const emp of employees) {
      const paidLogs = await TimeLog.find({ 
        employeeId: emp._id, 
        status: 'paid' 
      });
      
      if (paidLogs.length > 0) {
        // Group by day
        const logsByDay = {};
        paidLogs.forEach(log => {
          const dayKey = log.clockIn.toDateString();
          if (!logsByDay[dayKey]) {
            logsByDay[dayKey] = [];
          }
          logsByDay[dayKey].push(log);
        });

        for (const [dayKey, dayLogs] of Object.entries(logsByDay)) {
          const logDate = new Date(dayKey);
          const startDate = new Date(logDate);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(logDate);
          endDate.setHours(23, 59, 59, 999);

          // Calculate payment manually
          const totalRegularHours = dayLogs.reduce((sum, log) => sum + log.regularHours, 0);
          const totalBonusHours = dayLogs.reduce((sum, log) => sum + log.bonusHours, 0);
          
          const employeeWithRole = await Employee.findById(emp._id).populate('jobRoleId');
          let baseRate = employeeWithRole.hourlyRate ?? 0;
          let overtimeRate = 0;
          let roleBonus = 0;

          if (employeeWithRole.jobRoleId && employeeWithRole.jobRoleId.defaultRates) {
            baseRate = employeeWithRole.jobRoleId.defaultRates.base ?? baseRate;
            overtimeRate = employeeWithRole.jobRoleId.defaultRates.overtime ?? 0;
            roleBonus = employeeWithRole.jobRoleId.defaultRates.roleBonus ?? 0;
          }

          const regularPay = totalRegularHours * baseRate;
          const bonusPay = (totalBonusHours * overtimeRate) + roleBonus;
          const totalPay = regularPay + bonusPay;

          await Payment.create({
            employeeId: emp._id,
            amount: totalPay,
            period: {
              startDate,
              endDate
            },
            status: 'completed',
            regularHours: totalRegularHours,
            bonusHours: totalBonusHours,
            hourlyRate: baseRate,
            bonusRateMultiplier: company.bonusRateMultiplier,
            timeLogIds: dayLogs.map(log => log._id),
            arifpayTransactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            paymentDate: new Date(logDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            approvedBy: employer._id,
            approvedAt: new Date(logDate.getTime() + 24 * 60 * 60 * 1000)
          });
          
          console.log(`Created completed payment for ${employeeWithRole.name} on ${dayKey}: $${totalPay.toFixed(2)}`);
        }
      }
    }

    console.log('Seed completed successfully.');
    console.log('\n=== SEEDED DATA SUMMARY ===');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Companies: ${await Company.countDocuments()}`);
    console.log(`Job Roles: ${await JobRole.countDocuments()}`);
    console.log(`Employees: ${await Employee.countDocuments()}`);
    console.log(`Time Logs: ${await TimeLog.countDocuments()}`);
    console.log(`Payments: ${await Payment.countDocuments()}`);
    
    console.log('\n=== TIME LOG STATUS BREAKDOWN ===');
    console.log(`Pending: ${await TimeLog.countDocuments({ status: 'pending' })}`);
    console.log(`Approved: ${await TimeLog.countDocuments({ status: 'approved' })}`);
    console.log(`Paid: ${await TimeLog.countDocuments({ status: 'paid' })}`);
    
    console.log('\n=== PAYMENT STATUS BREAKDOWN ===');
    console.log(`Pending: ${await Payment.countDocuments({ status: 'pending' })}`);
    console.log(`Completed: ${await Payment.countDocuments({ status: 'completed' })}`);
    
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Employer: employer1@example.com / Password123!');
    console.log('Employee 1: employee1@example.com / Password123!');
    console.log('Employee 2: employee2@example.com / Password123!');
    console.log('Employee 3: employee3@example.com / Password123!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedClean();
