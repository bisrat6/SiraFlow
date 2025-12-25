import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, FileText, AlertCircle, Scale, CheckCircle2 } from 'lucide-react';

const Terms = () => {
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
            <FileText className="w-4 h-4 inline mr-2" />
            Last updated: December 24, 2025
          </div>
          <h1 className="text-6xl font-bold text-black mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using SiraFlow services.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4 flex items-center">
              <CheckCircle2 className="w-8 h-8 mr-3" />
              Acceptance of Terms
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>By accessing and using SiraFlow ("Service"), you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our Service.</p>
              <p>These terms apply to all users, including employers, employees, and visitors.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Service Description</h2>
            <div className="text-gray-700 space-y-4">
              <p>SiraFlow provides:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Automated payroll processing and time tracking</li>
                <li>Mobile money payment integration (Arifpay Telebirr)</li>
                <li>Employee management and analytics</li>
                <li>Reporting and compliance tools</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">User Responsibilities</h2>
            <div className="text-gray-700 space-y-4">
              <p><strong>Employers must:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate employee information</li>
                <li>Ensure compliance with Ethiopian labor laws</li>
                <li>Maintain sufficient funds for payroll processing</li>
                <li>Keep their Arifpay merchant key secure</li>
                <li>Review and approve time logs promptly</li>
              </ul>
              <p className="mt-4"><strong>Employees must:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Clock in/out accurately</li>
                <li>Report any errors or issues promptly</li>
                <li>Keep login credentials secure</li>
                <li>Provide accurate Telebirr wallet information</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4 flex items-center">
              <AlertCircle className="w-8 h-8 mr-3" />
              Payment Terms
            </h2>
            <div className="text-gray-700 space-y-4">
              <p><strong>Subscription Fees:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscription fees are billed monthly or annually</li>
                <li>Fees are non-refundable except as required by law</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
              </ul>
              <p className="mt-4"><strong>Payroll Processing:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for ensuring sufficient funds for employee payments</li>
                <li>Transaction fees may apply for payment processing</li>
                <li>Failed payments due to insufficient funds are your responsibility</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Service Availability</h2>
            <div className="text-gray-700 space-y-4">
              <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. We are not liable for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Scheduled maintenance periods</li>
                <li>Third-party service disruptions (Arifpay, internet providers)</li>
                <li>Force majeure events beyond our control</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4 flex items-center">
              <Scale className="w-8 h-8 mr-3" />
              Limitation of Liability
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>SiraFlow is provided "as is" without warranties of any kind. We are not liable for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Errors in payroll calculations (you should review before processing)</li>
                <li>Failed payments due to incorrect employee information</li>
                <li>Business losses or damages</li>
                <li>Third-party service failures</li>
              </ul>
              <p>Our total liability shall not exceed the fees paid by you in the last 12 months.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Account Termination</h2>
            <div className="text-gray-700 space-y-4">
              <p><strong>By You:</strong> You may cancel your account at any time. Data will be retained for 30 days before permanent deletion.</p>
              <p><strong>By Us:</strong> We may suspend or terminate accounts that violate these terms, engage in fraudulent activity, or fail to pay subscription fees.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Intellectual Property</h2>
            <div className="text-gray-700 space-y-4">
              <p>SiraFlow and its original content, features, and functionality are owned by SiraFlow and protected by international copyright, trademark, and other intellectual property laws.</p>
              <p>You may not copy, modify, distribute, or reverse engineer any part of our Service.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Governing Law</h2>
            <div className="text-gray-700 space-y-4">
              <p>These Terms shall be governed by the laws of Ethiopia. Any disputes shall be resolved in Ethiopian courts.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-black mb-4">Contact</h2>
            <div className="text-gray-700 space-y-4">
              <p>For questions about these Terms, contact us:</p>
              <ul className="space-y-2">
                <li><strong>Email:</strong> legal@siraflow.com</li>
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

export default Terms;

