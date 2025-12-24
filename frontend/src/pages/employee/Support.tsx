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
  CheckCircle2
} from 'lucide-react';
import { contactApi } from '@/lib/api';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';

const EmployeeSupport = () => {
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

  const helpTopics = [
    {
      icon: Clock,
      title: 'Time Tracking',
      questions: [
        'How do I clock in/out?',
        'What if I forgot to clock out?',
        'How are breaks calculated?'
      ]
    },
    {
      icon: DollarSign,
      title: 'Payments',
      questions: [
        'When will I receive my payment?',
        'How is overtime calculated?',
        'Where can I see my earnings?'
      ]
    },
    {
      icon: HelpCircle,
      title: 'Account',
      questions: [
        'How do I change my password?',
        'How do I update my Telebirr number?',
        'Who do I contact for account issues?'
      ]
    }
  ];

  return (
    <DashboardLayout 
      title="Help & Support" 
      subtitle="Get help from the support team"
      role="employee"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Help Topics */}
        <div className="lg:col-span-3 mb-6">
          <h2 className="text-xl font-bold text-black mb-4">Common Questions</h2>
          <div className="grid grid-cols-3 gap-4">
            {helpTopics.map((topic, index) => (
              <Card key={index} className="bg-white rounded-2xl border border-gray-200">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                    <topic.icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <h3 className="font-bold text-black mb-3">{topic.title}</h3>
                  <ul className="space-y-2">
                    {topic.questions.map((q, idx) => (
                      <li key={idx} className="text-sm text-gray-600 hover:text-black cursor-pointer">
                        • {q}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Send a Message
              </CardTitle>
              <CardDescription>
                Can't find your answer? Send us a message and we'll help you out
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
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
                    placeholder="What do you need help with?"
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
                    placeholder="Describe your issue..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    rows={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-black hover:bg-gray-800 text-white h-12"
                >
                  {loading ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">We're here to help!</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Our team will respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardHeader>
              <CardTitle>Need Quick Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-black text-sm">Email Support</h4>
                  <p className="text-sm text-gray-900">support@siraflow.com</p>
                  <p className="text-xs text-gray-500">24 hour response time</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-black text-sm">Phone Support</h4>
                  <p className="text-sm text-gray-900">+251 91 123 4567</p>
                  <p className="text-xs text-gray-500">Mon-Fri, 9AM-6PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl border-0">
            <CardContent className="p-6">
              <BookOpen className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Help Center</h3>
              <p className="text-sm text-green-100 mb-4">
                Browse our knowledge base for instant answers to common questions
              </p>
              <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-green-600">
                Browse Articles
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeSupport;

