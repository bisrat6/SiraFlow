import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Clock, Calendar, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

const Payments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchMyPayments();
    fetchSummary();
  }, [statusFilter]);

  const fetchMyPayments = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await paymentApi.getMyPayments(params);
      setPayments(response.data.payments || []);
    } catch (error: any) {
      console.error('Failed to fetch payments');
      toast.error(error?.response?.data?.message || error?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await paymentApi.getMyPaymentsSummary();
      setSummary(response.data);
      console.log('Employee payment summary:', response.data);
    } catch (error: any) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'pending': 'outline',
      'approved': 'secondary',
      'processing': 'secondary',
      'completed': 'default',
      'failed': 'destructive',
      'cancelled': 'outline'
    };
    
    const icons: any = {
      'pending': <Clock className="w-3 h-3" />,
      'approved': <CheckCircle2 className="w-3 h-3" />,
      'processing': <RefreshCw className="w-3 h-3" />,
      'completed': <CheckCircle2 className="w-3 h-3" />,
      'failed': <AlertCircle className="w-3 h-3" />,
      'cancelled': <AlertCircle className="w-3 h-3" />
    };
    
    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const getStatusDescription = (status: string) => {
    const descriptions: any = {
      'pending': 'Awaiting approval from employer',
      'approved': 'Approved and ready for processing',
      'processing': 'Payment is being processed',
      'completed': 'Successfully disbursed to your account',
      'failed': 'Payment failed - contact your employer',
      'cancelled': 'Payment was cancelled'
    };
    return descriptions[status] || 'Unknown status';
  };

  return (
    <DashboardLayout 
      title="My Payments" 
      subtitle="View your payment history and earnings"
      role="employee"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white rounded-2xl border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">${(summary?.totalAmount || 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-black">{summary?.completedPayments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-black">{summary?.pendingPayments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">{summary?.processingPayments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment History
                </CardTitle>
                <CardDescription>View all your payments</CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No payments found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Hours Worked</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div>{format(new Date(payment.period?.startDate || payment.createdAt), 'MMM dd')}</div>
                            <div className="text-xs text-muted-foreground">
                              to {format(new Date(payment.period?.endDate || payment.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div>{(payment.regularHours + (payment.bonusHours || 0)).toFixed(2)}h</div>
                            {payment.bonusHours > 0 && (
                              <div className="text-xs text-muted-foreground">
                                +{payment.bonusHours.toFixed(2)}h bonus
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${payment.amount?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(payment.status)}
                          <div className="text-xs text-muted-foreground">
                            {getStatusDescription(payment.status)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {payment.arifpayTransactionId || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    </DashboardLayout>
  );
};

export default Payments;
