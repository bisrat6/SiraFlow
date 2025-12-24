import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Mail, Clock, CheckCircle, Archive, Trash2 } from 'lucide-react';
import { contactApi } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import DashboardLayout from '@/components/DashboardLayout';

const ContactsManagement = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [statusFilter]);

  const fetchContacts = async () => {
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await contactApi.getAll(params);
      setContacts(response.data.contacts || []);
    } catch (error: any) {
      toast.error('Failed to fetch contacts');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await contactApi.getStats();
      setStats(response.data.stats);
    } catch (error: any) {
      console.error('Failed to fetch stats');
    }
  };

  const handleReply = async () => {
    if (!selectedContact || !replyMessage.trim()) return;
    
    setLoading(true);
    try {
      await contactApi.reply(selectedContact._id, { message: replyMessage });
      toast.success('Reply sent successfully!');
      setReplyDialogOpen(false);
      setReplyMessage('');
      setSelectedContact(null);
      fetchContacts();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (contactId: string, status: string) => {
    try {
      await contactApi.updateStatus(contactId, { status });
      toast.success('Status updated');
      fetchContacts();
      fetchStats();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact message?')) return;
    
    try {
      await contactApi.delete(contactId);
      toast.success('Contact deleted');
      fetchContacts();
      fetchStats();
    } catch (error: any) {
      toast.error('Failed to delete contact');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      'new': { variant: 'default', label: 'New', icon: Mail },
      'read': { variant: 'secondary', label: 'Read', icon: Clock },
      'replied': { variant: 'default', label: 'Replied', icon: CheckCircle },
      'archived': { variant: 'outline', label: 'Archived', icon: Archive }
    };
    
    const { variant, label, icon: Icon } = config[status] || config.new;
    return (
      <Badge variant={variant as any}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <DashboardLayout 
      title="Contact Messages" 
      subtitle="View and respond to customer inquiries"
      role="super_admin"
    >
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-black">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Messages</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
              <p className="text-sm text-gray-500">New</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-yellow-600">{stats.read}</p>
              <p className="text-sm text-gray-500">Read</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-green-600">{stats.replied}</p>
              <p className="text-sm text-gray-500">Replied</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-2xl border border-gray-200">
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-gray-600">{stats.archived}</p>
              <p className="text-sm text-gray-500">Archived</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contacts Table */}
      <Card className="bg-white rounded-2xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Contact Messages</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No contact messages found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact._id} className={contact.status === 'new' ? 'bg-blue-50' : ''}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell className="max-w-xs truncate">{contact.subject}</TableCell>
                    <TableCell>{format(new Date(contact.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell>{getStatusBadge(contact.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedContact(contact);
                            setReplyDialogOpen(true);
                          }}
                          className="border-black text-black hover:bg-gray-50"
                        >
                          Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(contact._id, 'archived')}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(contact._id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Contact Message</DialogTitle>
            <DialogDescription>
              From: {selectedContact?.name} ({selectedContact?.email})
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <Label className="text-sm font-semibold">Original Message:</Label>
                <p className="text-sm text-gray-700 mt-2">{selectedContact.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  placeholder="Type your reply here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={6}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={handleReply} 
              disabled={loading || !replyMessage.trim()}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {loading ? 'Sending...' : 'Send Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ContactsManagement;

