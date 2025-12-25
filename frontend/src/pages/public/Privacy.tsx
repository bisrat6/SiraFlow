import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black">SiraFlow</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/auth/login">
                <Button variant="ghost" className="text-black hover:bg-gray-100">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="inline-block px-4 py-2 bg-black text-white rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4 inline mr-2" />
            Last updated: December 24, 2025
          </div>
          <h1 className="text-6xl font-bold text-black mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600">
            Your privacy is important to us. This policy explains how we collect, use, and protect your data.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl prose prose-lg">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4 flex items-center">
              <Database className="w-8 h-8 mr-3" />
              Information We Collect
            </h2>
            <div className="text-gray-700 space-y-4">
              <p><strong>Account Information:</strong> When you register, we collect your email address, name, and company details.</p>
              <p><strong>Employee Data:</strong> Employee names, email addresses, phone numbers, Telebirr wallet numbers, and work-related information.</p>
              <p><strong>Time Tracking Data:</strong> Clock in/out times, break records, and attendance information.</p>
              <p><strong>Payment Information:</strong> Payment records, transaction IDs, and payroll data.</p>
              <p><strong>Usage Data:</strong> How you interact with our service, including IP addresses and device information.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4 flex items-center">
              <Eye className="w-8 h-8 mr-3" />
              How We Use Your Information
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our payroll and time tracking services</li>
                <li>Process employee payments through Arifpay Telebirr</li>
                <li>Send notifications about clock-ins, approvals, and payments</li>
                <li>Generate reports and analytics for your business</li>
                <li>Improve our services and develop new features</li>
                <li>Provide customer support</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4 flex items-center">
              <Lock className="w-8 h-8 mr-3" />
              Data Security
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> All data is encrypted in transit (SSL/TLS) and at rest</li>
                <li><strong>Access Control:</strong> Role-based access ensures users only see authorized data</li>
                <li><strong>Authentication:</strong> Secure JWT-based authentication with bcrypt password hashing</li>
                <li><strong>Regular Backups:</strong> Your data is backed up regularly to prevent loss</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and logging</li>
                <li><strong>Compliance:</strong> We follow Ethiopian data protection regulations</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4 flex items-center">
              <UserCheck className="w-8 h-8 mr-3" />
              Your Rights
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
                <li><strong>Export:</strong> Export your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Complaints:</strong> Lodge complaints with relevant authorities</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Data Sharing</h2>
            <div className="text-gray-700 space-y-4">
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Payment Processors:</strong> Arifpay for processing Telebirr payments</li>
                <li><strong>Service Providers:</strong> Cloud hosting and email services</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
              </ul>
              <p>All third-party providers are contractually bound to protect your data.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-black mb-4">Contact Us</h2>
            <div className="text-gray-700 space-y-4">
              <p>If you have questions about this Privacy Policy, please contact us:</p>
              <ul className="space-y-2">
                <li><strong>Email:</strong> privacy@siraflow.com</li>
                <li><strong>Address:</strong> Addis Ababa, Ethiopia</li>
                <li><strong>Phone:</strong> +251 91 123 4567</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-gray-600 text-sm">© 2025 SiraFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;

