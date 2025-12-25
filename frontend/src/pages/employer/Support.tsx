import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Phone, 
  Clock, 
  HelpCircle,
  BookOpen,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import { contactApi } from '@/lib/api';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';

const Support = () => {
  const user = getCurrentUser();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await contactApi.submit(formData);
      toast.success(response.data.message || 'Message sent! Our team will get back to you within 24 hours.');
      
      // Reset only subject and message, keep name and email
      setFormData({
        ...formData,
        subject: '',
        message: ''
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickHelp = [
    {
      icon: HelpCircle,
      title: 'Getting Started',
      description: 'Learn how to set up your company and add employees',
      action: 'Read Guide'
    },
    {
      icon: BookOpen,
      title: 'Documentation',
      description: 'Complete guides for all features and APIs',
      action: 'View Docs'
    },
    {
      icon: MessageCircle,
      title: 'Common Issues',
      description: 'Quick solutions to frequently asked questions',
      action: 'View FAQs'
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      detail: 'support@siraflow.com',
      description: 'Response within 24 hours'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      detail: '+251 91 123 4567',
      description: 'Mon-Fri, 9AM-6PM EAT'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      detail: '9:00 AM - 6:00 PM',
      description: 'East Africa Time'
    }
  ];

  return (
    <DashboardLayout 
      title="Help & Support" 
      subtitle="Get help from our team or browse resources"
      role="employer"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Help Cards */}
        <div className="lg:col-span-3 grid grid-cols-3 gap-4 mb-6">
          {quickHelp.map((item, index) => (
            <Card key={index} className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-300 mb-3">{item.description}</p>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      {item.action} →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Send us a message
              </CardTitle>
              <CardDescription>
                Fill out the form below and our support team will get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue or question in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-black hover:bg-gray-800 text-white h-12"
                >
                  {loading ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">We typically respond within 24 hours</p>
                    <p className="text-xs text-green-700 mt-1">
                      For urgent issues, please call our support line
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactMethods.map((method, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <method.icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black text-sm">{method.title}</h4>
                    <p className="text-sm text-gray-900 font-medium">{method.detail}</p>
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl border-0">
            <CardContent className="p-6">
              <MessageCircle className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Need Immediate Help?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Our support team is available during business hours to assist you with any urgent issues.
              </p>
              <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-blue-600">
                Start Live Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Support;

