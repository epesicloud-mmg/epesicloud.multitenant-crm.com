import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Minus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function CreditNotesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: creditNotes = [], isLoading } = useQuery({
    queryKey: ['/api/finance/credit-notes'],
  });

  const createCreditNoteMutation = useMutation({
    mutationFn: async (creditNoteData: any) => {
      const response = await fetch('/api/finance/credit-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': '1',
          'X-User-Id': '1'
        },
        body: JSON.stringify(creditNoteData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create credit note');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/credit-notes'] });
      setIsDialogOpen(false);
      toast({
        title: "Credit note created",
        description: "The credit note has been created and transaction recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create credit note",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      applied: 'secondary',
      cancelled: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const creditNoteData = {
      customerId: 1, // Default customer for now
      creditNoteNumber: formData.get('creditNoteNumber'),
      issueDate: new Date().toISOString(),
      amount: formData.get('amount'),
      currency: 'USD',
      reason: formData.get('reason'),
      description: formData.get('description'),
      status: 'active'
    };

    createCreditNoteMutation.mutate(creditNoteData);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Credit Notes</h1>
            <p className="text-muted-foreground">Manage customer credit notes and refunds</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const creditNotesArray = Array.isArray(creditNotes) ? creditNotes : [];
  const totalCreditNotes = creditNotesArray.length;
  const totalAmount = creditNotesArray.reduce((sum: number, cn: any) => sum + parseFloat(cn.amount || '0'), 0);
  const activeAmount = creditNotesArray
    .filter((cn: any) => cn.status === 'active')
    .reduce((sum: number, cn: any) => sum + parseFloat(cn.amount || '0'), 0);

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Credit Note</DialogTitle>
              <DialogDescription>
                Issue a credit note for a customer. A transaction will be automatically recorded.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="creditNoteNumber">Credit Note Number</Label>
                <Input id="creditNoteNumber" name="creditNoteNumber" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input id="reason" name="reason" placeholder="e.g., Product return, Service refund" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Additional details about this credit note" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCreditNoteMutation.isPending}>
                  {createCreditNoteMutation.isPending ? 'Creating...' : 'Create Credit Note'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditNotes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount.toString())}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Credit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(activeAmount.toString())}</div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Notes</CardTitle>
          <CardDescription>All customer credit notes and refunds</CardDescription>
        </CardHeader>
        <CardContent>
          {creditNotesArray.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Minus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No credit notes found. Create your first credit note to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credit Note #</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditNotesArray.map((creditNote: any) => (
                    <TableRow key={creditNote.id}>
                      <TableCell className="font-medium">{creditNote.creditNoteNumber}</TableCell>
                      <TableCell>{format(new Date(creditNote.issueDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{creditNote.reason || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(creditNote.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(creditNote.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}