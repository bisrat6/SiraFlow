import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Clock, CheckCircle2, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { timeLogApi, paymentApi } from '@/lib/api';
import { format } from 'date-fns';

const TimeLogsManagement = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [approvedUnpaidLogs, setApprovedUnpaidLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
    fetchApprovedUnpaidLogs();
  }, [statusFilter]);

  const fetchLogs = async () => {
    try {
      const response = await timeLogApi.getCompanyLogs({ status: statusFilter });
      setLogs(response.data.timeLogs || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to fetch logs');
    }
  };

  const fetchApprovedUnpaidLogs = async () => {
    try {
      // Get approved time logs
      const logsResponse = await timeLogApi.getCompanyLogs({ status: 'approved' });
      const approvedLogs = logsResponse.data.timeLogs || [];
      console.log('Approved logs:', approvedLogs.length);
      
      // Get all payments to check which logs have been paid
      const paymentsResponse = await paymentApi.list();
      const payments = paymentsResponse.data.payments || [];
      console.log('All payments:', payments.length);
      console.log('Payment statuses:', payments.map(p => ({ status: p.status, timeLogCount: p.timeLogIds?.length })));
      
      // Filter logs that don't have any payments (pending, processing, or completed)
      const unpaidLogs = approvedLogs.filter((log: any) => {
        // Check if this log is part of any payment (regardless of status)
        const hasPayment = payments.some((payment: any) => {
          // Check if payment includes this time log
          return payment.timeLogIds?.some((id: string) => id === log._id);
        });
        
        if (hasPayment) {
          console.log(`Log ${log._id} has payment, filtering out`);
        }
        
        return !hasPayment; // Show only logs without any payment
      });
      
      console.log('Unpaid logs after filtering:', unpaidLogs.length);
      setApprovedUnpaidLogs(unpaidLogs);
    } catch (error: any) {
      console.error('Failed to fetch approved unpaid logs:', error);
    }
  };

  const handleApprove = async (logId: string) => {
    setLoading(true);
    try {
      await timeLogApi.approve(logId, { status: 'approved' });
      toast.success('Time log approved!');
      fetchLogs();
      fetchApprovedUnpaidLogs();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to approve log');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (clockIn: string, clockOut?: string) => {
    if (!clockOut) return 'Active';
    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    const hours = ((end - start) / (1000 * 60 * 60)).toFixed(2);
    return `${hours} hrs`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/employer')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold">Time Logs</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Logs */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Approvals
              </CardTitle>
              <CardDescription>Review and approve employee time logs</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No pending logs</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="font-medium">{log.employeeId?.name || 'Unknown'}</TableCell>
                        <TableCell>{calculateDuration(log.clockIn, log.clockOut)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(log._id)}
                            disabled={loading}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Approved Unpaid Logs */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Approved Unpaid Logs
              </CardTitle>
              <CardDescription>Time logs approved but not yet paid</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedUnpaidLogs.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">All approved logs have been paid</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedUnpaidLogs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="font-medium">{log.employeeId?.name || 'Unknown'}</TableCell>
                        <TableCell>{calculateDuration(log.clockIn, log.clockOut)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Awaiting Payment
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TimeLogsManagement;
