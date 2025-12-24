import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Award } from 'lucide-react';
import { timeLogApi } from '@/lib/api';
import { format } from 'date-fns';
import DashboardLayout from '@/components/DashboardLayout';

const TimeLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    avgCheckIn: '--:--',
    avgCheckOut: '--:--',
    onTimePercentage: 0
  });

  useEffect(() => {
    fetchMyLogs();
  }, []);

  const fetchMyLogs = async () => {
    try {
      const response = await timeLogApi.getMyLogs();
      const fetchedLogs = response.data.timeLogs || [];
      setLogs(fetchedLogs);
      calculateStats(fetchedLogs);
    } catch (error) {
      console.error('Failed to fetch logs');
    }
  };

  const calculateStats = (logs: any[]) => {
    const completedLogs = logs.filter(log => log.clockOut);
    
    if (completedLogs.length === 0) {
      return;
    }

    // Calculate average check-in time
    const avgCheckInMinutes = completedLogs.reduce((sum, log) => {
      const date = new Date(log.clockIn);
      return sum + (date.getHours() * 60 + date.getMinutes());
    }, 0) / completedLogs.length;
    
    const avgCheckInHours = Math.floor(avgCheckInMinutes / 60);
    const avgCheckInMins = Math.round(avgCheckInMinutes % 60);
    
    // Calculate average check-out time
    const avgCheckOutMinutes = completedLogs.reduce((sum, log) => {
      const date = new Date(log.clockOut);
      return sum + (date.getHours() * 60 + date.getMinutes());
    }, 0) / completedLogs.length;
    
    const avgCheckOutHours = Math.floor(avgCheckOutMinutes / 60);
    const avgCheckOutMins = Math.round(avgCheckOutMinutes % 60);
    
    // Calculate on-time percentage (before 9:00 AM)
    const onTimeCount = completedLogs.filter(log => {
      const checkIn = new Date(log.clockIn);
      const checkInMinutes = checkIn.getHours() * 60 + checkIn.getMinutes();
      return checkInMinutes <= 9 * 60; // 9:00 AM
    }).length;
    
    setStats({
      totalAttendance: logs.length,
      avgCheckIn: `${String(avgCheckInHours).padStart(2, '0')}:${String(avgCheckInMins).padStart(2, '0')}`,
      avgCheckOut: `${String(avgCheckOutHours).padStart(2, '0')}:${String(avgCheckOutMins).padStart(2, '0')}`,
      onTimePercentage: Math.round((onTimeCount / completedLogs.length) * 100)
    });
  };

  const calculateDuration = (clockIn: string, clockOut?: string) => {
    if (!clockOut) return 'Active';
    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    const hours = ((end - start) / (1000 * 60 * 60)).toFixed(2);
    return `${hours} hrs`;
  };

  const getStatusBadge = (log: any) => {
    if (!log.clockOut) return <Badge variant="secondary">Active</Badge>;
    
    const checkIn = new Date(log.clockIn);
    const checkInMinutes = checkIn.getHours() * 60 + checkIn.getMinutes();
    
    if (checkInMinutes <= 9 * 60) {
      return <Badge className="bg-green-500 text-white">On Time</Badge>;
    } else if (checkInMinutes <= 9 * 60 + 15) {
      return <Badge className="bg-yellow-500 text-white">Late</Badge>;
    } else {
      return <Badge variant="destructive">Very Late</Badge>;
    }
  };

  return (
    <DashboardLayout 
      title="My Time Logs" 
      subtitle="View your clock in/out records and attendance history"
      role="employee"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{stats.totalAttendance}</p>
                <p className="text-sm text-gray-500">Total Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{stats.avgCheckIn}</p>
                <p className="text-sm text-gray-500">Avg Check In</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{stats.avgCheckOut}</p>
                <p className="text-sm text-gray-500">Avg Check Out</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{stats.onTimePercentage}%</p>
                <p className="text-sm text-gray-500">On Time Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Log History
            </CardTitle>
            <CardDescription>View your clock in/out records</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No time logs yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-medium">
                        {format(new Date(log.clockIn), 'PP')}
                      </TableCell>
                      <TableCell>{format(new Date(log.clockIn), 'p')}</TableCell>
                      <TableCell>
                        {log.clockOut ? format(new Date(log.clockOut), 'p') : '-'}
                      </TableCell>
                      <TableCell>{calculateDuration(log.clockIn, log.clockOut)}</TableCell>
                      <TableCell className="space-y-1">
                        {getStatusBadge(log)}
                        <Badge variant={
                          log.status === 'approved' ? 'default' : 
                          log.status === 'pending' ? 'secondary' : 
                          'outline'
                        } className="ml-2">
                          {log.status}
                        </Badge>
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

export default TimeLogs;
