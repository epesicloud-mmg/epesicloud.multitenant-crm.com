import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, FileText, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const mockCreditNotes = [
  {
    id: 1,
    number: 'CN-001',
    customer: 'ABC Corporation',
    amount: 500.00,
    reason: 'Product return',
    status: 'issued',
    date: '2025-01-10',
    originalInvoice: 'INV-125',
    description: 'Defective product returned'
  },
  {
    id: 2,
    number: 'CN-002',
    customer: 'XYZ Ltd.',
    amount: 750.00,
    reason: 'Service adjustment',
    status: 'applied',
    date: '2025-01-08',
    originalInvoice: 'INV-120',
    description: 'Service level adjustment'
  },
  {
    id: 3,
    number: 'CN-003',
    customer: 'Tech Innovations',
    amount: 1200.00,
    reason: 'Billing error',
    status: 'draft',
    date: '2025-01-12',
    originalInvoice: 'INV-130',
    description: 'Incorrect billing amount'
  },
  {
    id: 4,
    number: 'CN-004',
    customer: 'Global Solutions',
    amount: 300.00,
    reason: 'Discount adjustment',
    status: 'cancelled',
    date: '2025-01-05',
    originalInvoice: 'INV-118',
    description: 'Volume discount applied incorrectly'
  }
];

export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState(mockCreditNotes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    amount: '',
    reason: '',
    originalInvoice: '',
    description: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-blue-100 text-blue-800',
      applied: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCreditNote = {
      id: creditNotes.length + 1,
      number: `CN-${String(creditNotes.length + 1).padStart(3, '0')}`,
      customer: formData.customer,
      amount: parseFloat(formData.amount),
      reason: formData.reason,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      originalInvoice: formData.originalInvoice,
      description: formData.description
    };
    
    setCreditNotes([...creditNotes, newCreditNote]);
    setFormData({ customer: '', amount: '', reason: '', originalInvoice: '', description: '' });
    setIsDialogOpen(false);
  };

  const totalAmount = creditNotes.reduce((sum, note) => sum + note.amount, 0);
  const issuedAmount = creditNotes.filter(note => note.status === 'issued').reduce((sum, note) => sum + note.amount, 0);
  const appliedAmount = creditNotes.filter(note => note.status === 'applied').reduce((sum, note) => sum + note.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Credit Notes</h1>
          <p className="text-muted-foreground">Manage customer credit notes and refunds</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Credit Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Credit Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="Customer name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalInvoice">Original Invoice</Label>
                <Input
                  id="originalInvoice"
                  value={formData.originalInvoice}
                  onChange={(e) => setFormData({ ...formData, originalInvoice: e.target.value })}
                  placeholder="e.g., INV-125"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Credit Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                >
                  <option value="">Select reason</option>
                  <option value="Product return">Product return</option>
                  <option value="Service adjustment">Service adjustment</option>
                  <option value="Billing error">Billing error</option>
                  <option value="Discount adjustment">Discount adjustment</option>
                  <option value="Goodwill credit">Goodwill credit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                />
              </div>
              <Button type="submit" className="w-full">
                Create Credit Note
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credit Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">{creditNotes.length} notes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Issued Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(issuedAmount)}</div>
            <p className="text-xs text-muted-foreground">Pending application</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Applied Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(appliedAmount)}</div>
            <p className="text-xs text-muted-foreground">Successfully applied</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditNotes.length}</div>
            <p className="text-xs text-muted-foreground">New credit notes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Credit Notes List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Credit Note #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Original Invoice</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-mono">{note.number}</TableCell>
                  <TableCell className="font-medium">{note.customer}</TableCell>
                  <TableCell className="font-mono text-sm">{note.originalInvoice}</TableCell>
                  <TableCell>{note.reason}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(note.amount)}
                  </TableCell>
                  <TableCell>
                    {format(parseISO(note.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{getStatusBadge(note.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {note.status === 'issued' && (
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}