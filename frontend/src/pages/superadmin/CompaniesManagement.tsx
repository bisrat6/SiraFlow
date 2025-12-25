import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Eye, CheckCircle, XCircle, Ban, Search } from 'lucide-react';
import { superAdminApi } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import DashboardLayout from '@/components/DashboardLayout';

const CompaniesManagement = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState('verified');
  const [rejectionReason, setRejectionReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await superAdminApi.getAllCompanies();
      setCompanies(response.data.companies || []);
    } catch (error: any) {
      toast.error('Failed to fetch companies');
      console.error(error);
    }
  };

  const handleVerify = async () => {
    if (!selectedCompany) return;
    
    setLoading(true);
    try {
      await superAdminApi.verifyCompany(selectedCompany._id, {
        status: verifyStatus,
        rejectionReason: verifyStatus === 'rejected' ? rejectionReason : undefined
      });
      toast.success(`Company ${verifyStatus} successfully!`);
      setVerifyDialogOpen(false);
      setRejectionReason('');
      fetchCompanies();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to verify company');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (suspend: boolean) => {
    if (!selectedCompany) return;
    
    setLoading(true);
    try {
      await superAdminApi.suspendCompany(selectedCompany._id, {
        suspend,
        reason: suspend ? suspendReason : undefined
      });
      toast.success(`Company ${suspend ? 'suspended' : 'unsuspended'} successfully!`);
      setSuspendDialogOpen(false);
      setSuspendReason('');
      fetchCompanies();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update company status');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.employerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Companies Management" 
      subtitle="Manage all registered companies and their subscriptions"
      role="super_admin"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-black">{companies.length}</p>
            <p className="text-sm text-gray-500">Total Companies</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-green-600">
              {companies.filter(c => c.isActive).length}
            </p>
            <p className="text-sm text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-blue-600">
              {companies.filter(c => c.verificationStatus === 'verified').length}
            </p>
            <p className="text-sm text-gray-500">Verified</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-red-600">
              {companies.filter(c => c.isSuspended).length}
            </p>
            <p className="text-sm text-gray-500">Suspended</p>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card className="bg-white rounded-2xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Companies</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No companies found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company._id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.employerName}</TableCell>
                    <TableCell className="capitalize">{company.paymentCycle}</TableCell>
                    <TableCell>
                      {company.isSuspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : company.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={company.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                        {company.verificationStatus || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(company.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/super-admin/companies/${company._id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCompany(company);
                            setVerifyDialogOpen(true);
                          }}
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCompany(company);
                            setSuspendDialogOpen(true);
                          }}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Company</DialogTitle>
            <DialogDescription>
              {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Verification Status</Label>
              <div className="flex gap-3">
                <Button
                  variant={verifyStatus === 'verified' ? 'default' : 'outline'}
                  onClick={() => setVerifyStatus('verified')}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify
                </Button>
                <Button
                  variant={verifyStatus === 'rejected' ? 'destructive' : 'outline'}
                  onClick={() => setVerifyStatus('rejected')}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
            {verifyStatus === 'rejected' && (
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why this company is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleVerify} disabled={loading} className="bg-black hover:bg-gray-800 text-white">
              {loading ? 'Processing...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCompany?.isSuspended ? 'Unsuspend' : 'Suspend'} Company
            </DialogTitle>
            <DialogDescription>
              {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          {!selectedCompany?.isSuspended && (
            <div className="space-y-2 py-4">
              <Label htmlFor="suspendReason">Suspension Reason</Label>
              <Textarea
                id="suspendReason"
                placeholder="Explain why this company is being suspended..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                required
              />
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => handleSuspend(!selectedCompany?.isSuspended)} 
              disabled={loading}
              variant={selectedCompany?.isSuspended ? 'default' : 'destructive'}
            >
              {loading ? 'Processing...' : selectedCompany?.isSuspended ? 'Unsuspend' : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CompaniesManagement;

