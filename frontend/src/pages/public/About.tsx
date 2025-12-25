import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Users, Target, Heart, ArrowRight, Award, Globe, Zap } from 'lucide-react';

const About = () => {
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
          <h1 className="text-6xl font-bold text-black mb-6">
            Transforming workforce
            <br />
            management in Ethiopia
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            SiraFlow was built to solve the payroll challenges faced by Ethiopian businesses. 
            We combine modern technology with deep understanding of local needs.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-12 border border-gray-200">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-4">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To empower Ethiopian businesses with automated payroll solutions that save time, 
                reduce errors, and enable instant payments to employees through mobile money.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-12 border border-gray-200">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-4">Our Vision</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To become the leading workforce management platform in East Africa, 
                making payroll simple and accessible for businesses of all sizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-4 bg-black text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-gray-400">Businesses</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">5,000+</div>
              <div className="text-gray-400">Employees Paid</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-black text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Speed',
                description: 'We believe payroll should be instant. Process payments in seconds, not days.'
              },
              {
                icon: Globe,
                title: 'Local Focus',
                description: 'Built specifically for Ethiopian businesses with Telebirr integration and local support.'
              },
              {
                icon: Award,
                title: 'Excellence',
                description: 'We maintain the highest standards in security, reliability, and customer support.'
              }
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold text-black mb-6">
            Join us in transforming
            <br />
            Ethiopian businesses
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Start automating your payroll today with a free 14-day trial.
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white text-lg px-10 h-14">
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

export default About;

