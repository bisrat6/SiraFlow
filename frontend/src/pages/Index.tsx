import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Clock, 
  Zap, 
  TrendingUp, 
  Users, 
  Shield, 
  CheckCircle2,
  Smartphone,
  BarChart3,
  CreditCard,
  Calendar,
  Bell
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black">SiraFlow</span>
            </div>
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
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-800 mb-4">
              ✨ Automate your payroll in minutes
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-black leading-tight">
              Workforce
              <br />
              management,
              <br />
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                reimagined
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The all-in-one platform for time tracking, payroll automation, and instant mobile money disbursements. Built for Ethiopian businesses.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link to="/auth/register">
                <Button size="lg" className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white text-lg px-8 h-14">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-black text-black hover:bg-gray-100 text-lg px-8 h-14">
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="pt-12 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-black" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-black" />
                <span>Free 14-day trial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-gray-400">Businesses</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">5K+</div>
              <div className="text-gray-400">Employees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Everything you need,
              <br />
              nothing you don't
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to save you time and eliminate payroll headaches
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Smart Time Tracking',
                description: 'Employees clock in/out with automatic break tracking and overtime calculations. No more manual timesheets.',
              },
              {
                icon: Zap,
                title: 'Instant Payments',
                description: 'Direct B2C transfers to employee Telebirr wallets. Process payroll in seconds, not days.',
              },
              {
                icon: BarChart3,
                title: 'Real-time Analytics',
                description: 'Get instant insights on attendance, labor costs, and workforce trends with beautiful dashboards.',
              },
              {
                icon: Shield,
                title: 'Bank-level Security',
                description: 'Your data is encrypted and protected with enterprise-grade security protocols.',
              },
              {
                icon: Calendar,
                title: 'Flexible Schedules',
                description: 'Daily, weekly, or monthly payroll cycles. Configure everything to match your business needs.',
              },
              {
                icon: Bell,
                title: 'Smart Notifications',
                description: 'Stay updated with real-time alerts for clock-ins, approvals, and payment confirmations.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl border-2 border-gray-200 hover:border-black transition-all duration-300 hover:shadow-xl group"
              >
                <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes, not weeks. No complex setup required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Sign up & setup',
                description: 'Create your account, add company details, and invite your team members.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Track time',
                description: 'Employees clock in/out using their devices. All data syncs in real-time.',
                icon: Smartphone,
              },
              {
                step: '03',
                title: 'Get paid',
                description: 'Approve timesheets and process payroll. Money lands in wallets instantly.',
                icon: CreditCard,
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-black flex items-center justify-center mb-6">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-6xl font-bold text-gray-200 mb-4">{step.step}</div>
                <h3 className="text-2xl font-bold text-black mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
                Why businesses
                <br />
                choose SiraFlow
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join hundreds of Ethiopian businesses that have automated their payroll and saved countless hours.
              </p>
              <div className="space-y-4">
                {[
                  'Save 10+ hours per month on payroll processing',
                  'Eliminate manual calculation errors',
                  'Pay employees instantly via mobile money',
                  'Real-time visibility into labor costs',
                  'Automatic overtime and bonus calculations',
                  'Comprehensive audit trails and reports',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-12 text-white">
                <div className="space-y-8">
                  <div className="flex items-center justify-between pb-6 border-b border-white/20">
                    <span className="text-gray-400">Monthly Savings</span>
                    <span className="text-3xl font-bold">15,000 ETB</span>
                  </div>
                  <div className="flex items-center justify-between pb-6 border-b border-white/20">
                    <span className="text-gray-400">Time Saved</span>
                    <span className="text-3xl font-bold">12 hrs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Accuracy Rate</span>
                    <span className="text-3xl font-bold">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-black text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to transform
            <br />
            your payroll?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join hundreds of businesses using SiraFlow to automate their workforce management. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-black text-lg px-10 h-14">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-black mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/features" className="hover:text-black transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-black transition-colors">Pricing</Link></li>
                <li><Link to="/privacy" className="hover:text-black transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-black mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/about" className="hover:text-black transition-colors">About</Link></li>
                <li><a href="#" className="hover:text-black transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-black mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/help" className="hover:text-black transition-colors">Help Center</Link></li>
                <li><Link to="/api-docs" className="hover:text-black transition-colors">API Docs</Link></li>
                <li><Link to="/contact" className="hover:text-black transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-black mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/privacy" className="hover:text-black transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-black transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-black transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black">SiraFlow</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 SiraFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
