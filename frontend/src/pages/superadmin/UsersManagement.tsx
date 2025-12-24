import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, UserCheck, UserX, Mail, Calendar } from 'lucide-react';
import { superAdminApi } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import DashboardLayout from '@/components/DashboardLayout';

const UsersManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      
      const response = await superAdminApi.getAllUsers(params);
      setUsers(response.data.users || []);
    } catch (error: any) {
      toast.error('Failed to fetch users');
      console.error(error);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      await superAdminApi.toggleUserStatus(userId, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    employers: users.filter(u => u.role === 'employer').length,
    employees: users.filter(u => u.role === 'employee').length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length
  };

  return (
    <DashboardLayout 
      title="Users Management" 
      subtitle="Manage all system users and their access"
      role="super_admin"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-black">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-blue-600">{stats.employers}</p>
            <p className="text-sm text-gray-500">Employers</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-green-600">{stats.employees}</p>
            <p className="text-sm text-gray-500">Employees</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-purple-600">{stats.superAdmins}</p>
            <p className="text-sm text-gray-500">Super Admins</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
            <p className="text-sm text-gray-500">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-white rounded-2xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="employer">Employers</SelectItem>
                  <SelectItem value="employee">Employees</SelectItem>
                  <SelectItem value="super_admin">Super Admins</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === 'super_admin' ? 'default' :
                        user.role === 'employer' ? 'secondary' : 'outline'
                      }>
                        {user.role === 'super_admin' ? 'Super Admin' : user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy') : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={user.isActive ? 'destructive' : 'default'}
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                        disabled={loading || user.role === 'super_admin'}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
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

export default UsersManagement;

