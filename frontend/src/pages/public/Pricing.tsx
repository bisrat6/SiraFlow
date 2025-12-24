import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Check, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '2,500',
      period: 'per month',
      description: 'Perfect for small teams just getting started',
      features: [
        'Up to 10 employees',
        'Time tracking & attendance',
        'Basic analytics',
        'Email support',
        'Mobile access',
        'Telebirr payments',
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: '5,000',
      period: 'per month',
      description: 'For growing businesses that need more',
      features: [
        'Up to 50 employees',
        'Advanced analytics',
        'Priority support',
        'Custom job roles',
        'Bulk operations',
        'API access',
        'Export reports',
        'Automated payroll'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'Tailored solutions for large organizations',
      features: [
        'Unlimited employees',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantees',
        'Training & onboarding',
        'Custom features',
        'Multi-company',
        'White-label option'
      ],
      cta: 'Contact Sales',
      popular: false
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
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-800 mb-6">
            💰 Simple, Transparent Pricing
          </div>
          <h1 className="text-6xl font-bold text-black mb-6">
            Plans that scale
            <br />
            with your business
          </h1>
          <p className="text-xl text-gray-600">
            Start free for 14 days. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-black text-white border-2 border-black scale-105 shadow-2xl'
                    : 'bg-white border-2 border-gray-200 hover:border-black transition-all'
                }`}
              >
                {plan.popular && (
                  <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-black'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-black'}`}>
                    {plan.price !== 'Custom' && 'ETB '}{plan.price}
                  </span>
                  <span className={`text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                    {' '}/{plan.period}
                  </span>
                </div>
                <p className={`mb-8 ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <Link to="/auth/register">
                  <Button 
                    className={`w-full h-12 mb-8 ${
                      plan.popular 
                        ? 'bg-white hover:bg-gray-100 text-black' 
                        : 'bg-black hover:bg-gray-800 text-white'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.popular ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={plan.popular ? 'text-gray-200' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-black text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Is there a free trial?',
                a: 'Yes! All plans come with a 14-day free trial. No credit card required.'
              },
              {
                q: 'Can I change plans later?',
                a: 'Absolutely. You can upgrade, downgrade, or cancel at any time.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major payment methods including bank transfer, mobile money, and credit cards.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. We use bank-level encryption and follow industry best practices for data security.'
              },
              {
                q: 'Do you offer custom plans?',
                a: 'Yes! For businesses with unique needs, we offer custom enterprise solutions. Contact our sales team.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-black text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold mb-6">
            Start your free trial today
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join hundreds of businesses using SiraFlow. No commitment required.
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
      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-gray-600 text-sm">© 2025 SiraFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;

