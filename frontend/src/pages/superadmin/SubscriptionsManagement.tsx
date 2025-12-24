import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Plus, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import DashboardLayout from '@/components/DashboardLayout';

const SubscriptionsManagement = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Plan form state
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'ETB',
    duration: '30',
    maxEmployees: '',
    maxMonthlyPayments: '',
    features: '',
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
    fetchSubscriptions();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data.plans || []);
    } catch (error: any) {
      console.error('Failed to fetch plans');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/super-admin/subscriptions');
      setSubscriptions(response.data.subscriptions || []);
    } catch (error: any) {
      console.error('Failed to fetch subscriptions');
    }
  };

  const resetForm = () => {
    setPlanForm({
      name: '',
      description: '',
      price: '',
      currency: 'ETB',
      duration: '30',
      maxEmployees: '',
      maxMonthlyPayments: '',
      features: '',
      isActive: true
    });
    setEditingPlan(null);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = {
        ...planForm,
        price: parseFloat(planForm.price),
        duration: parseInt(planForm.duration),
        maxEmployees: parseInt(planForm.maxEmployees),
        maxMonthlyPayments: parseInt(planForm.maxMonthlyPayments),
        features: planForm.features.split('\n').filter(f => f.trim())
      };
      
      await api.post('/super-admin/plans', data);
      toast.success('Plan created successfully!');
      setPlanDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    
    setLoading(true);
    try {
      const data = {
        ...planForm,
        price: parseFloat(planForm.price),
        duration: parseInt(planForm.duration),
        maxEmployees: parseInt(planForm.maxEmployees),
        maxMonthlyPayments: parseInt(planForm.maxMonthlyPayments),
        features: planForm.features.split('\n').filter(f => f.trim())
      };
      
      await api.put(`/super-admin/plans/${editingPlan._id}`, data);
      toast.success('Plan updated successfully!');
      setPlanDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      currency: plan.currency,
      duration: plan.duration.toString(),
      maxEmployees: plan.limits?.maxEmployees?.toString() || '',
      maxMonthlyPayments: plan.limits?.maxMonthlyPayments?.toString() || '',
      features: plan.features.join('\n'),
      isActive: plan.isActive
    });
    setPlanDialogOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure? This will affect all companies on this plan.')) return;
    
    try {
      await api.delete(`/super-admin/plans/${planId}`);
      toast.success('Plan deleted successfully!');
      fetchPlans();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete plan');
    }
  };

  const getStatusBadge = (subscription: any) => {
    if (subscription.status === 'active') {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    } else if (subscription.status === 'trial') {
      return <Badge className="bg-blue-500 text-white">Trial</Badge>;
    } else if (subscription.status === 'expired') {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge variant="secondary">{subscription.status}</Badge>;
    }
  };

  return (
    <DashboardLayout 
      title="Subscriptions Management" 
      subtitle="Manage subscription plans and company subscriptions"
      role="super_admin"
    >
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-black">{plans.length}</p>
            <p className="text-sm text-gray-500">Total Plans</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-green-600">
              {subscriptions.filter(s => s.status === 'active').length}
            </p>
            <p className="text-sm text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-blue-600">
              {subscriptions.filter(s => s.status === 'trial').length}
            </p>
            <p className="text-sm text-gray-500">Trial</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-red-600">
              {subscriptions.filter(s => s.status === 'expired').length}
            </p>
            <p className="text-sm text-gray-500">Expired</p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Management */}
      <Card className="bg-white rounded-2xl border border-gray-200 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription Plans</CardTitle>
            <Dialog open={planDialogOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setPlanDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}>
                  <DialogHeader>
                    <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
                    <DialogDescription>
                      Define subscription plan details and pricing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Plan Name</Label>
                        <Input
                          id="name"
                          placeholder="Professional"
                          value={planForm.name}
                          onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ({planForm.currency})</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="5000"
                          value={planForm.price}
                          onChange={(e) => setPlanForm({...planForm, price: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Perfect for growing businesses..."
                        value={planForm.description}
                        onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (days)</Label>
                        <Input
                          id="duration"
                          type="number"
                          placeholder="30"
                          value={planForm.duration}
                          onChange={(e) => setPlanForm({...planForm, duration: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxEmployees">Max Employees</Label>
                        <Input
                          id="maxEmployees"
                          type="number"
                          placeholder="50"
                          value={planForm.maxEmployees}
                          onChange={(e) => setPlanForm({...planForm, maxEmployees: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxPayments">Max Payments/Month</Label>
                        <Input
                          id="maxPayments"
                          type="number"
                          placeholder="200"
                          value={planForm.maxMonthlyPayments}
                          onChange={(e) => setPlanForm({...planForm, maxMonthlyPayments: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="features">Features (one per line)</Label>
                      <Textarea
                        id="features"
                        placeholder="Up to 50 employees&#10;Advanced analytics&#10;Priority support"
                        value={planForm.features}
                        onChange={(e) => setPlanForm({...planForm, features: e.target.value})}
                        rows={5}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={planForm.isActive}
                        onCheckedChange={(checked) => setPlanForm({...planForm, isActive: checked})}
                      />
                      <Label htmlFor="isActive">Plan is active and visible to users</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading} className="bg-black hover:bg-gray-800 text-white">
                      {loading ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className={`rounded-2xl p-6 border-2 ${
                  plan.isActive ? 'border-black' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-black">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                  {!plan.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-black">{plan.price}</span>
                  <span className="text-gray-600"> {plan.currency}</span>
                  <p className="text-sm text-gray-500">per {plan.duration} days</p>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Max Employees:</strong> {plan.limits?.maxEmployees || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Max Payments:</strong> {plan.limits?.maxMonthlyPayments || 'N/A'}/month
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPlan(plan)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeletePlan(plan._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card className="bg-white rounded-2xl border border-gray-200">
        <CardHeader>
          <CardTitle>Company Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No subscriptions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Usage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell className="font-medium">
                      {sub.companyId?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>{getStatusBadge(sub)}</TableCell>
                    <TableCell>{format(new Date(sub.startDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(sub.endDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Employees: {sub.usage?.employeeCount || 0}/{sub.limits?.maxEmployees}</p>
                        <p>Payments: {sub.usage?.paymentsThisMonth || 0}/{sub.limits?.maxMonthlyPayments}</p>
                      </div>
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

export default SubscriptionsManagement;

