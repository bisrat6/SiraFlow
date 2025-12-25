import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, CreditCard, TrendingUp, DollarSign, Clock, BarChart3 } from 'lucide-react';
import { superAdminApi } from '@/lib/api';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

const SuperAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await superAdminApi.getAnalytics();
      setAnalytics(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Platform Analytics" subtitle="Loading..." role="super_admin">
        <div className="flex items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Platform Analytics" 
      subtitle="View comprehensive platform metrics and insights"
      role="super_admin"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{analytics?.companies?.total || 0}</p>
                <p className="text-sm text-gray-300">Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{analytics?.users?.total || 0}</p>
                <p className="text-sm text-gray-200">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{analytics?.subscriptions?.active || 0}</p>
                <p className="text-sm text-gray-200">Active Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{analytics?.revenue?.monthly || 0}</p>
                <p className="text-sm text-gray-200">Monthly Revenue (ETB)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle>Company Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Companies</span>
              <span className="font-bold text-black">{analytics?.companies?.active || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verified Companies</span>
              <span className="font-bold text-black">{analytics?.companies?.verified || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Suspended Companies</span>
              <span className="font-bold text-red-600">{analytics?.companies?.suspended || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle>User Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Employers</span>
              <span className="font-bold text-black">{analytics?.users?.employers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Employees</span>
              <span className="font-bold text-black">{analytics?.users?.employees || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Super Admins</span>
              <span className="font-bold text-purple-600">{analytics?.users?.superAdmins || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="font-bold text-green-600">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Response Time</span>
              <span className="font-bold text-black">45ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Sessions</span>
              <span className="font-bold text-black">{analytics?.activeSessions || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle>Payment Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Payments</span>
              <span className="font-bold text-black">{analytics?.payments?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Successful</span>
              <span className="font-bold text-green-600">{analytics?.payments?.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Failed</span>
              <span className="font-bold text-red-600">{analytics?.payments?.failed || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Companies (30d)</span>
              <span className="font-bold text-black">{analytics?.growth?.newCompanies || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Users (30d)</span>
              <span className="font-bold text-black">{analytics?.growth?.newUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Growth Rate</span>
              <span className="font-bold text-green-600">+{analytics?.growth?.rate || 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminAnalytics;

