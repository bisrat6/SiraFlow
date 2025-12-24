import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Coffee, DollarSign, Calendar, Play, Square, TrendingUp } from 'lucide-react';
import { getCurrentUser, removeToken } from '@/lib/auth';
import { timeLogApi, employeeApi } from '@/lib/api';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeLog, setActiveLog] = useState<any>(null);
  const [onBreak, setOnBreak] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);

  useEffect(() => {
    checkClockStatus();
    fetchEmployeeProfile();
  }, []);

  useEffect(() => {
    let interval: any;
    if (activeLog && !onBreak) {
      interval = setInterval(() => {
        const start = new Date(activeLog.clockIn).getTime();
        const now = Date.now();
        const diff = now - start;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
        
        // Calculate real-time earnings
        const totalHours = diff / 3600000; // Convert milliseconds to hours
        const regularHours = Math.min(totalHours, 8);
        const overtimeHours = Math.max(0, totalHours - 8);
        
        // Base rate for regular hours + 1.5x for overtime
        const earnings = (regularHours * hourlyRate) + (overtimeHours * hourlyRate * 1.5);
        setCurrentEarnings(earnings);
      }, 1000);
    } else {
      setCurrentEarnings(0);
    }
    return () => clearInterval(interval);
  }, [activeLog, onBreak, hourlyRate]);

  const checkClockStatus = async () => {
    try {
      const response = await timeLogApi.getMyStatus();
      if (response.data.isClockedIn) {
        setActiveLog(response.data.currentLog);
      }
    } catch (error) {
      console.error('Failed to check clock status:', error);
    }
  };

  const fetchEmployeeProfile = async () => {
    try {
      const response = await employeeApi.getMyProfile();
      const employee = response.data.employee;
      
      // Get hourly rate from job role or employee record
      let rate = employee.hourlyRate || 0;
      if (employee.jobRoleId?.defaultRates?.base) {
        rate = employee.jobRoleId.defaultRates.base;
      }
      
      console.log('Employee hourly rate:', rate);
      setHourlyRate(rate);
      
      // If no rate is set, show a warning
      if (rate === 0) {
        toast.info('Hourly rate not set. Please contact your employer to set your job role.', { duration: 5000 });
      }
    } catch (error) {
      console.error('Failed to fetch employee profile:', error);
      // Default to 0 if fetch fails
      setHourlyRate(0);
      toast.error('Could not fetch employee profile. Earnings counter may not work correctly.');
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      const response = await timeLogApi.clockIn();
      setActiveLog(response.data.timeLog);
      toast.success('Clocked in successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeLog) return;
    setLoading(true);
    try {
      await timeLogApi.clockOut();
      setActiveLog(null);
      setOnBreak(false);
      toast.success('Clocked out successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const handleStartBreak = async () => {
    if (!activeLog) return;
    setLoading(true);
    try {
      await timeLogApi.startBreak({ type: 'lunch' });
      setOnBreak(true);
      toast.success('Break started');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to start break');
    } finally {
      setLoading(false);
    }
  };

  const handleEndBreak = async () => {
    if (!activeLog) return;
    setLoading(true);
    try {
      await timeLogApi.endBreak();
      setOnBreak(false);
      toast.success('Break ended');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to end break');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle={`Welcome, ${user?.name?.split(' ')[0]} 👋 Track your time and manage your schedule`}
      role="employee"
    >

      {/* Time Clock Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-sm text-gray-400 mb-2">Current Status</h3>
                    <p className="text-2xl font-bold">
                      {!activeLog ? 'Not Clocked In' : onBreak ? 'On Break' : 'Working'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${activeLog && !onBreak ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                </div>

                {activeLog ? (
                  <div className="space-y-6">
                    {/* Live Timer */}
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Time Elapsed</p>
                      <p className="text-5xl font-bold font-mono">{elapsedTime}</p>
                    </div>

                    {/* Live Earnings Counter */}
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur rounded-xl p-4 border border-green-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-300 mb-1 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            Your Earnings Today
                          </p>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl font-bold text-green-400">
                              {currentEarnings.toFixed(2)}
                            </span>
                            <span className="text-xl text-gray-300">ETB</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-400">
                                {elapsedTime.split(':')[0]} hrs @ {hourlyRate} ETB/hr
                              </span>
                            </div>
                            {parseFloat(elapsedTime.split(':')[0]) >= 8 && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <span className="text-yellow-400">
                                  Overtime Rate Active!
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-green-400 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Clock In</p>
                        <p className="text-lg font-semibold">
                          {new Date(activeLog.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Expected Out</p>
                        <p className="text-lg font-semibold">
                          {new Date(new Date(activeLog.clockIn).getTime() + 8 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      {!onBreak ? (
                        <>
                          <Button 
                            onClick={handleStartBreak} 
                            disabled={loading}
                            className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white"
                          >
                            <Coffee className="w-4 h-4 mr-2" />
                            Start Break
                          </Button>
                          <Button 
                            onClick={handleClockOut} 
                            disabled={loading}
                            className="flex-1 bg-white hover:bg-gray-100 text-black"
                          >
                            <Square className="w-4 h-4 mr-2" />
                            Clock Out
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={handleEndBreak} 
                          disabled={loading}
                          className="w-full bg-white hover:bg-gray-100 text-black"
                        >
                          End Break
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Play className="w-10 h-10" />
                    </div>
                    <p className="text-gray-400 mb-6">Ready to start your shift?</p>
                    <Button 
                      onClick={handleClockIn} 
                      disabled={loading}
                      className="bg-white hover:bg-gray-100 text-black px-8 h-12"
                      size="lg"
                    >
                      <Clock className="w-5 h-5 mr-2" />
                      Clock In
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4">
                  {activeLog ? 'Today\'s Session' : 'This Week'}
                </h3>
                <div className="space-y-4">
                  {activeLog ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Current Earnings</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-green-600">
                            {currentEarnings.toFixed(2)}
                          </p>
                          <span className="text-sm text-gray-500">ETB</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Live counter</p>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500 mb-1">Hourly Rate</p>
                        <p className="text-2xl font-bold text-black">{hourlyRate} ETB</p>
                        <p className="text-xs text-gray-400 mt-1">Regular hours rate</p>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500 mb-1">Overtime Rate</p>
                        <p className="text-2xl font-bold text-black">{(hourlyRate * 1.5).toFixed(2)} ETB</p>
                        <p className="text-xs text-gray-400 mt-1">After 8 hours</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Hours Worked</p>
                        <p className="text-3xl font-bold text-black">0.0h</p>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500 mb-1">Hourly Rate</p>
                        <p className="text-2xl font-bold text-black">{hourlyRate} ETB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate('/employee/logs')}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Time Logs</span>
                  </button>
                  <button 
                    onClick={() => navigate('/employee/payments')}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Payments</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
