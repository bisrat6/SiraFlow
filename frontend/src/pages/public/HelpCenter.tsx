import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Search, BookOpen, Video, MessageCircle, ArrowRight, Users, CreditCard, BarChart3, Shield } from 'lucide-react';
import { useState } from 'react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: Clock,
      title: 'Getting Started',
      articles: 5,
      topics: [
        'How to create your account',
        'Setting up your company profile',
        'Adding your first employee',
        'Understanding payment cycles',
        'Configuring Arifpay integration'
      ]
    },
    {
      icon: Users,
      title: 'Employee Management',
      articles: 7,
      topics: [
        'Adding employees',
        'Setting up job roles',
        'Managing employee profiles',
        'Deactivating employees',
        'Bulk employee operations'
      ]
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      articles: 6,
      topics: [
        'How employees clock in/out',
        'Break management',
        'Approving time logs',
        'Editing time entries',
        'Understanding overtime calculation'
      ]
    },
    {
      icon: CreditCard,
      title: 'Payments & Payroll',
      articles: 8,
      topics: [
        'Processing payroll',
        'Approving payments',
        'Understanding payment statuses',
        'Retrying failed payments',
        'Bulk payment operations'
      ]
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      articles: 4,
      topics: [
        'Generating attendance reports',
        'Viewing payroll summaries',
        'Exporting data',
        'Understanding analytics'
      ]
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      articles: 5,
      topics: [
        'Data security practices',
        'User permissions',
        'Password management',
        'Two-factor authentication',
        'Compliance standards'
      ]
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
              <Link to="/contact">
                <Button variant="ghost" className="text-black hover:bg-gray-100">
                  Contact Support
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-6xl font-bold text-black mb-6">
            How can we help?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Search our knowledge base or browse categories below
          </p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search for articles, guides, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 text-lg border-2 border-gray-300 focus:border-black"
            />
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8">
              <Video className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Video Tutorials</h3>
              <p className="mb-4 opacity-90">Watch step-by-step guides</p>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Watch Now
              </Button>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-8">
              <BookOpen className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Documentation</h3>
              <p className="mb-4 opacity-90">Complete API documentation</p>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                Read Docs
              </Button>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-8">
              <MessageCircle className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Live Chat</h3>
              <p className="mb-4 opacity-90">Chat with our support team</p>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                Start Chat
              </Button>
            </div>
          </div>

          {/* Categories */}
          <h2 className="text-4xl font-bold text-black mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-black transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <category.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">{category.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{category.articles} articles</p>
                <ul className="space-y-2">
                  {category.topics.slice(0, 3).map((topic, idx) => (
                    <li key={idx} className="text-sm text-gray-600 hover:text-black flex items-center">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      {topic}
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
          <h2 className="text-4xl font-bold mb-6">
            Still have questions?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Our support team is ready to help you succeed.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-white hover:bg-gray-100 text-black text-lg px-10 h-14">
              Contact Support
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

export default HelpCenter;

