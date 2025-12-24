require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:');
      console.log('Email:', existingSuperAdmin.email);
      console.log('\nIf you want to create a new one, please delete the existing one first.');
      process.exit(0);
    }

    // Get email and password from command line or use defaults
    const email = process.argv[2] || 'admin@siraflow.com';
    const password = process.argv[3] || 'Admin@123';

    // Create super admin user
    const superAdmin = new User({
      email,
      password,
      role: 'super_admin',
      isActive: true
    });

    await superAdmin.save();

    console.log('✅ Super admin created successfully!');
    console.log('\n📧 Email:', email);
    console.log('🔒 Password:', password);
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
    console.log('\n🔗 Login at: http://localhost:3000/auth/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    process.exit(1);
  }
};

// Run the script
createSuperAdmin();

