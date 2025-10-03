import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Receipt, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function BillsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['/api/finance/bills'],
  });

  const createBillMutation = useMutation({
    mutationFn: async (billData: any) => {
      const response = await fetch('/api/finance/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': '1',
          'X-User-Id': '1'
        },
        body: JSON.stringify(billData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create bill');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/bills'] });
      setIsDialogOpen(false);
      toast({
        title: "Bill created",
        description: "The bill has been created and transaction recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bill",
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
      pending: 'secondary',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'outline'
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
    
    const billData = {
      vendorId: 1, // Default vendor for now
      billNumber: formData.get('billNumber'),
      referenceNumber: formData.get('referenceNumber'),
      billDate: new Date().toISOString(),
      dueDate: formData.get('dueDate'),
      subtotal: formData.get('subtotal'),
      taxAmount: formData.get('taxAmount') || '0.00',
      totalAmount: formData.get('totalAmount'),
      balanceAmount: formData.get('totalAmount'),
      status: 'pending',
      currency: 'USD'
    };

    createBillMutation.mutate(billData);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bills</h1>
            <p className="text-muted-foreground">Manage vendor bills and payables</p>
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

  const billsArray = Array.isArray(bills) ? bills : [];
  const totalBills = billsArray.length;
  const totalAmount = billsArray.reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || '0'), 0);
  const pendingAmount = billsArray
    .filter((bill: any) => bill.status === 'pending')
    .reduce((sum: number, bill: any) => sum + parseFloat(bill.balanceAmount || '0'), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bills</h1>
          <p className="text-muted-foreground">Manage vendor bills and payables</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Bill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Bill</DialogTitle>
              <DialogDescription>
                Create a new vendor bill. A transaction will be automatically recorded.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billNumber">Bill Number</Label>
                  <Input id="billNumber" name="billNumber" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referenceNumber">Reference</Label>
                  <Input id="referenceNumber" name="referenceNumber" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal</Label>
                  <Input id="subtotal" name="subtotal" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxAmount">Tax Amount</Label>
                  <Input id="taxAmount" name="taxAmount" type="number" step="0.01" defaultValue="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input id="totalAmount" name="totalAmount" type="number" step="0.01" required />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBillMutation.isPending}>
                  {createBillMutation.isPending ? 'Creating...' : 'Create Bill'}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBills}</div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount.toString())}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bills List</CardTitle>
          <CardDescription>All vendor bills and payment obligations</CardDescription>
        </CardHeader>
        <CardContent>
          {billsArray.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bills found. Create your first bill to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill #</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billsArray.map((bill: any) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.billNumber}</TableCell>
                      <TableCell>{bill.referenceNumber || '-'}</TableCell>
                      <TableCell>{format(new Date(bill.billDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(bill.dueDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(bill.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(bill.balanceAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
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