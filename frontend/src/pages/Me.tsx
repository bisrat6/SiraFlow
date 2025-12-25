import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  Building2, 
  DollarSign, 
  Clock,
  Key,
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { authApi, employeeApi, companyApi } from '@/lib/api';
import { format } from 'date-fns';
import DashboardLayout from '@/components/DashboardLayout';
import { getCurrentUser } from '@/lib/auth';

const Me = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [user, setUser] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    telebirrMsisdn: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // First fetch the user profile
      const userResponse = await authApi.getProfile();
      const fetchedUser = userResponse.data.user;
      setUser(fetchedUser);
      
      // Then fetch role-specific data
      if (fetchedUser.role === 'employee') {
        try {
          const employeeResponse = await employeeApi.getMyProfile();
          if (employeeResponse && employeeResponse.data) {
            setEmployee(employeeResponse.data.employee);
            setEditData({
              name: employeeResponse.data.employee.name || '',
              email: employeeResponse.data.employee.email || '',
              telebirrMsisdn: employeeResponse.data.employee.telebirrMsisdn || '',
              phoneNumber: employeeResponse.data.employee.phoneNumber || '',
              address: employeeResponse.data.employee.address || ''
            });
          }
        } catch (empError) {
          console.error('Failed to fetch employee profile:', empError);
        }
      } else if (fetchedUser.role === 'employer') {
        try {
          const companyResponse = await companyApi.getMy();
          if (companyResponse && companyResponse.data) {
            setCompany(companyResponse.data.company);
            setEditData({
              name: companyResponse.data.company.employerName || '',
              email: fetchedUser.email || '',
              telebirrMsisdn: '',
              phoneNumber: '',
              address: ''
            });
          }
        } catch (compError) {
          console.error('Failed to fetch company profile:', compError);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to fetch profile');
    } finally {
      setPageLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully!');
      setChangePasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (user?.role === 'employee' && employee) {
        await employeeApi.update(employee._id, editData);
        toast.success('Profile updated successfully!');
        fetchProfile();
      } else if (user?.role === 'employer' && company) {
        // Update company information for employer
        await companyApi.updateMy({
          name: editData.name,
          employerName: editData.name
        });
        toast.success('Profile updated successfully!');
        fetchProfile();
      }
      setEditing(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = () => {
    if (!user) return 'User';
    return user.role === 'employer' ? 'Employer' : 'Employee';
  };

  const getRoleColor = () => {
    if (!user) return 'bg-gray-100 text-gray-800';
    return user.role === 'employer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (pageLoading) {
    return (
      <DashboardLayout title="Profile" subtitle="Loading..." role={currentUser?.role as any}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title="Profile" subtitle="Error loading profile" role={currentUser?.role as any}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Failed to load profile. Please try again.</p>
            <Button onClick={fetchProfile} className="bg-black hover:bg-gray-800 text-white">Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="My Profile" 
      subtitle="Manage your account settings and preferences"
      role={user?.role as any}
    >
      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        {!editing && user?.role === 'employer' && (
          <Button variant="outline" onClick={() => setEditing(true)} className="border-black text-black hover:bg-gray-50">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
        <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-black text-black hover:bg-gray-50">
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleChangePassword}>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and new password
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:border-black"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="bg-black hover:bg-gray-800 text-white">
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-white/10 border-4 border-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-4xl">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">{editData.name || user?.email}</h2>
              <Badge className="bg-white/20 text-white border-0 mb-4">
                {getRoleDisplayName()}
              </Badge>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{editData.email}</span>
                </div>
                {user?.createdAt && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                {user?.role === 'employee' && editData.telebirrMsisdn && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">{editData.telebirrMsisdn}</span>
                  </div>
                )}
                {user?.role === 'employee' && editData.phoneNumber && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{editData.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Company/Employment Info */}
        {(company || employee) && (
          <Card className="bg-white rounded-2xl border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {user?.role === 'employer' ? 'Company Information' : 'Employment Details'}
                </CardTitle>
                <CardDescription>
                  {user?.role === 'employer' ? 'Your company details' : 'Your employment information'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.role === 'employer' && company ? (
                  <>
                    <div>
                      <Label className="text-sm text-muted-foreground">Company Name</Label>
                      <p className="font-semibold">{company.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Payment Cycle</Label>
                      <p className="font-semibold capitalize">{company.paymentCycle}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Bonus Rate Multiplier</Label>
                      <p className="font-semibold">{company.bonusRateMultiplier}x</p>
                    </div>
                  </>
                ) : user?.role === 'employee' && employee ? (
                  <>
                    <div>
                      <Label className="text-sm text-muted-foreground">Company</Label>
                      <p className="font-semibold">{employee.companyId?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {employee.hireDate && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Hire Date</Label>
                        <p className="font-semibold">{format(new Date(employee.hireDate), 'MMM dd, yyyy')}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>
          )}

        {/* Account Security */}
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Account Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-500">Password</Label>
              <p className="font-semibold mb-2">••••••••••</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setChangePasswordOpen(true)}
                className="border-black text-black hover:bg-gray-50"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
            <Separator />
            <div>
              <Label className="text-sm text-gray-500">Account Status</Label>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
            {user?.passwordChangedAt && (
              <div>
                <Label className="text-sm text-gray-500">Last Password Change</Label>
                <p className="text-sm">{format(new Date(user.passwordChangedAt), 'MMM dd, yyyy')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Form - Only for Employers */}
        {editing && user?.role === 'employer' && (
          <Card className="bg-white rounded-2xl border border-gray-200 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Edit Profile
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Company/Employer Name</Label>
                      <Input
                        id="edit-name"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        required
                        disabled
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="bg-black hover:bg-gray-800 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditing(false)} className="border-black text-black hover:bg-gray-50">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
      </div>
    </DashboardLayout>
  );
};

export default Me;

