import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Zap, 
  BarChart3, 
  Shield, 
  Calendar, 
  Bell,
  Users,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Lock,
  TrendingUp
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Clock,
      title: 'Smart Time Tracking',
      description: 'Employees clock in/out with automatic break tracking. The system calculates regular hours, overtime, and deductions automatically.',
      benefits: ['GPS location tracking', 'Break management', 'Automatic calculations', 'Mobile-friendly']
    },
    {
      icon: Zap,
      title: 'Instant Mobile Payments',
      description: 'Direct B2C transfers to employee Telebirr wallets. Process payroll in seconds with Arifpay integration.',
      benefits: ['Telebirr integration', 'Instant transfers', 'Bulk processing', 'Payment tracking']
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Get instant insights on attendance, labor costs, and workforce trends with beautiful dashboards.',
      benefits: ['Live dashboards', 'Attendance reports', 'Cost analysis', 'Export reports']
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and security protocols protect your sensitive payroll data.',
      benefits: ['End-to-end encryption', 'Secure authentication', 'Role-based access', 'Audit trails']
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Configure daily, weekly, or monthly payroll cycles. Automated scheduling takes care of the rest.',
      benefits: ['Multiple pay cycles', 'Automated processing', 'Custom schedules', 'Holiday management']
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Stay updated with real-time alerts for clock-ins, approvals, and payment confirmations.',
      benefits: ['Email notifications', 'In-app alerts', 'Payment updates', 'Approval requests']
    },
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Comprehensive employee profiles with job roles, rates, and payment information.',
      benefits: ['Unlimited employees', 'Job role templates', 'Bulk operations', 'Employee portal']
    },
    {
      icon: CreditCard,
      title: 'Automated Payroll',
      description: 'Set it and forget it. Automated payroll processing based on approved time logs.',
      benefits: ['Auto-calculation', 'Bulk approvals', 'Payment retry', 'Webhooks']
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Access SiraFlow from any device. Employees can clock in/out from their phones.',
      benefits: ['Responsive design', 'Mobile apps ready', 'Works offline', 'Cross-platform']
    },
    {
      icon: Lock,
      title: 'Compliance Ready',
      description: 'Meet Ethiopian labor law requirements with comprehensive audit trails and reports.',
      benefits: ['Legal compliance', 'Audit logs', 'Document storage', 'Report generation']
    },
    {
      icon: TrendingUp,
      title: 'Scalable Infrastructure',
      description: 'Grow from 5 to 500+ employees without changing systems. Built to scale with your business.',
      benefits: ['No limits', 'Fast performance', 'Cloud-based', 'Auto-scaling']
    },
    {
      icon: CheckCircle2,
      title: 'Easy Integration',
      description: 'RESTful API for integrations with your existing systems. Complete documentation provided.',
      benefits: ['REST API', 'Webhooks', 'Documentation', 'Developer support']
    }
  ];

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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block px-4 py-2 bg-black text-white rounded-full text-sm font-medium mb-6">
            ✨ Complete Feature Set
          </div>
          <h1 className="text-6xl font-bold text-black mb-6">
            Everything you need
            <br />
            for workforce management
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Powerful features designed to save time and eliminate payroll headaches. 
            Built specifically for Ethiopian businesses.
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white text-lg px-8 h-14">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-black transition-all duration-300 hover:shadow-xl"
              >
                <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-black text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to transform
            <br />
            your payroll?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Start your free 14-day trial. No credit card required.
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="bg-white hover:bg-gray-100 text-black text-lg px-10 h-14">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black">SiraFlow</span>
          </Link>
          <p className="text-gray-600 text-sm">© 2025 SiraFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Features;

