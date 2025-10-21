/* eslint-disable no-console */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const axios = require('axios');

const connectDB = require('../config/db');
const User = require('../models/User');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const Payment = require('../models/Payment');

async function testAPI() {
  try {
    await connectDB();

    console.log('\n=== API TEST ===\n');

    // Get employer user
    const employer = await User.findOne({ role: 'employer' });
    if (!employer) {
      console.error('No employer found');
      return;
    }

    console.log(`Employer: ${employer.email}`);

    // Get company
    const company = await Company.findOne({ employerId: employer._id });
    console.log(`Company: ${company.name}`);

    // Get employees
    const employees = await Employee.find({ companyId: company._id });
    console.log(`Employees: ${employees.length}`);

    // Get payments directly from database
    const employeeIds = employees.map(emp => emp._id);
    const payments = await Payment.find({ employeeId: { $in: employeeIds } })
      .populate('employeeId', 'name');
    
    console.log(`\nPayments in database: ${payments.length}`);
    payments.forEach(p => {
      console.log(`  - ${p.employeeId.name}: $${p.amount} (${p.status})`);
    });

    // Test API endpoint (if server is running)
    try {
      console.log('\n=== Testing API Endpoint ===');
      
      // First, get auth token
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'employer1@example.com',
        password: 'Password123!'
      });
      
      const token = loginResponse.data.token;
      console.log('Login successful, token received');

      // Test payments endpoint
      const paymentsResponse = await axios.get('http://localhost:5000/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`API returned ${paymentsResponse.data.payments.length} payments`);
      paymentsResponse.data.payments.forEach(p => {
        console.log(`  - ${p.employeeId.name}: $${p.amount} (${p.status})`);
      });

    } catch (apiError) {
      console.log('API test failed (server might not be running):', apiError.message);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

testAPI();
