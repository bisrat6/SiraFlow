import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, Clock, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { analyticsApi, paymentApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import DashboardLayout from '@/components/DashboardLayout';

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [analyticsType, setAnalyticsType] = useState('attendance');

  useEffect(() => {
    // Set default date range to last 30 days
    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    setPeriodStart(format(startDate, 'yyyy-MM-dd'));
    setPeriodEnd(format(endDate, 'yyyy-MM-dd'));
    
    // Load initial data
    fetchPaymentSummary();
  }, []);

  const fetchPaymentSummary = async () => {
    try {
      const response = await paymentApi.getSummary();
      setPaymentSummary(response.data);
    } catch (error: any) {
      console.error('Failed to fetch payment summary:', error);
    }
  };

  const handleGenerate = async () => {
    if (!periodStart || !periodEnd) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    setLoading(true);
    try {
      let response;
      if (analyticsType === 'attendance') {
        response = await analyticsApi.generateAttendance({
          periodStart: new Date(periodStart).toISOString(),
          periodEnd: new Date(periodEnd).toISOString(),
        });
      } else {
        response = await analyticsApi.get({
          type: analyticsType,
          period: `${periodStart}_${periodEnd}`
        });
      }
      setAnalyticsData(response.data);
      toast.success('Analytics generated!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to generate analytics');
    } finally {
      setLoading(false);
    }
  };

  const setQuickDateRange = (range: string) => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case 'month':
        startDate = startOfMonth(endDate);
        break;
      case 'quarter':
        startDate = subDays(endDate, 90);
        break;
      default:
        startDate = subDays(endDate, 30);
    }
    
    setPeriodStart(format(startDate, 'yyyy-MM-dd'));
    setPeriodEnd(format(endDate, 'yyyy-MM-dd'));
  };

  const chartData = analyticsData?.employeeStats?.map((stat: any) => ({
    name: stat.employeeName,
    hours: stat.totalHours,
    days: stat.daysWorked,
  })) || [];

  return (
    <DashboardLayout 
      title="Analytics" 
      subtitle="View comprehensive insights and reports on your workforce"
      role="employer"
    >
      {/* Payment Summary Cards */}
      {paymentSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white rounded-2xl border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-2xl font-bold">${(paymentSummary.totalAmount || 0).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-2xl border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{paymentSummary.pendingPayments || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-2xl border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Employees</p>
                    <p className="text-2xl font-bold">{paymentSummary.totalEmployees || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-2xl border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">{paymentSummary.thisMonthPayments || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-white rounded-2xl border border-gray-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Generate Analytics
            </CardTitle>
            <CardDescription>Select a time period and analytics type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Analytics Type</Label>
                <Select value={analyticsType} onValueChange={setAnalyticsType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start">Period Start</Label>
                <Input
                  id="start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Period End</Label>
                <Input
                  id="end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerate} disabled={loading} className="w-full">
                  {loading ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </div>
            
            {/* Quick Date Range Buttons */}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuickDateRange('week')}>
                Last 7 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickDateRange('month')}>
                This Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickDateRange('quarter')}>
                Last 90 Days
              </Button>
            </div>
          </CardContent>
        </Card>

        {analyticsData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-lg">Total Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-3xl font-bold">{analyticsData.totalHoursWorked?.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-lg">Employees</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-3xl font-bold">{analyticsData.employeeStats?.length || 0}</span>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-lg">Avg Hours/Employee</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-3xl font-bold">
                    {analyticsData.employeeStats?.length 
                      ? (analyticsData.totalHoursWorked / analyticsData.employeeStats.length).toFixed(2)
                      : '0'
                    }
                  </span>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Hours Worked by Employee</CardTitle>
                <CardDescription>Visual breakdown of employee attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="hsl(var(--primary))" name="Total Hours" />
                    <Bar dataKey="days" fill="hsl(var(--accent))" name="Days Worked" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
    </DashboardLayout>
  );
};

export default Analytics;
