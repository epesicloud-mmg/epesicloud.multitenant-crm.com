import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Plus, Landmark, Edit, Eye } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function BankAccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bankAccounts = [], isLoading } = useQuery({
    queryKey: ['/api/finance/bank-accounts'],
  });

  const createAccountMutation = useMutation({
    mutationFn: (accountData: any) => apiRequest('/api/finance/bank-accounts', {
      method: 'POST',
      body: accountData,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/bank-accounts'] });
      setIsDialogOpen(false);
      toast({
        title: "Bank account added",
        description: "The new bank account has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bank account",
        variant: "destructive",
      });
    },
  });

  const accountTypes = [
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'investment', label: 'Investment' }
  ];

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount || '0'));
  };

  const getAccountTypeBadge = (type: string) => {
    const variants = {
      checking: 'default',
      savings: 'secondary',
      credit: 'outline',
      investment: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[type as keyof typeof variants] || 'default'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return '';
    if (accountNumber.startsWith('****')) return accountNumber;
    return '****' + accountNumber.slice(-4);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const accountData = {
      accountName: formData.get('accountName'),
      accountNumber: formData.get('accountNumber'),
      bankName: formData.get('bankName'),
      accountType: formData.get('accountType'),
      currency: formData.get('currency') || 'USD',
      currentBalance: formData.get('currentBalance') || '0.00',
      isActive: true
    };

    createAccountMutation.mutate(accountData);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bank Accounts</h1>
            <p className="text-muted-foreground">Manage your business bank accounts</p>
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

  const totalBalance = bankAccounts.reduce((sum: number, account: any) => {
    return sum + parseFloat(account.currentBalance || '0');
  }, 0);

  const activeAccounts = bankAccounts.filter((account: any) => account.isActive);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bank Accounts</h1>
          <p className="text-muted-foreground">Manage your business bank accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bank Account</DialogTitle>
              <DialogDescription>
                Add a new bank account for financial transactions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input id="accountName" name="accountName" placeholder="e.g., Business Checking" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input id="bankName" name="bankName" placeholder="e.g., Wells Fargo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select name="accountType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input id="accountNumber" name="accountNumber" placeholder="Last 4 digits" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue="USD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentBalance">Current Balance</Label>
                <Input id="currentBalance" name="currentBalance" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAccountMutation.isPending}>
                  {createAccountMutation.isPending ? 'Adding...' : 'Add Account'}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankAccounts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{activeAccounts.length} active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance.toString())}</div>
            <p className="text-xs text-muted-foreground mt-1">All accounts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Account Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(bankAccounts.map((a: any) => a.accountType)).size}</div>
            <p className="text-xs text-muted-foreground mt-1">Different types</p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Accounts</CardTitle>
          <CardDescription>All your business bank accounts and balances</CardDescription>
        </CardHeader>
        <CardContent>
          {bankAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bank accounts found. Add your first bank account to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Account #</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankAccounts.map((account: any) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.accountName}</TableCell>
                      <TableCell>{account.bankName}</TableCell>
                      <TableCell>{getAccountTypeBadge(account.accountType)}</TableCell>
                      <TableCell className="font-mono text-sm">{maskAccountNumber(account.accountNumber)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(account.currentBalance)}
                      </TableCell>
                      <TableCell>{account.currency}</TableCell>
                      <TableCell>
                        <Badge variant={account.isActive ? 'default' : 'secondary'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
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