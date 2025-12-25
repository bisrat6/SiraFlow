import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { setToken, decodeToken, isAuthenticated, getCurrentUser } from '@/lib/auth';
import { Clock, TrendingUp, Zap } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      const route = user?.role === 'super_admin' ? '/super-admin' :
                    user?.role === 'employer' ? '/employer' : '/employee';
      navigate(route, { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const token = response.data.token;
      setToken(token);
      
      const user = decodeToken(token);
      toast.success('Login successful!');
      
      // Redirect based on role
      const route = user?.role === 'super_admin' ? '/super-admin' :
                    user?.role === 'employer' ? '/employer' : '/employee';
      navigate(route, { replace: true });
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const fallback = error?.message === 'Network Error' ? 'Network error: cannot reach server' : error?.message;
      toast.error(apiMessage || fallback || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
        
        <div className="relative z-10">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Transform your workforce
            <br />
            management.
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-lg">
            Automated payroll processing with time tracking and instant mobile money disbursement.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Smart Time Tracking</h3>
                <p className="text-sm text-gray-400">Automatic clock-in/out with break management and overtime calculations</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Instant Payments</h3>
                <p className="text-sm text-gray-400">Direct disbursements via Telebirr B2C to employee wallets</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                <p className="text-sm text-gray-400">Comprehensive insights on attendance, payroll, and workforce trends</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-gray-400">
            Trusted by businesses across Ethiopia for automated payroll solutions
          </p>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-2">Welcome Back</h2>
            <p className="text-gray-500">Sign in to your SiraFlow account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Your email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium text-base"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-black font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
