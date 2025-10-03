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
import { Plus, BookOpen, Edit } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function ChartOfAccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['/api/finance/ledger-accounts'],
  });

  const createAccountMutation = useMutation({
    mutationFn: (accountData: any) => apiRequest('/api/finance/ledger-accounts', {
      method: 'POST',
      body: accountData,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/ledger-accounts'] });
      setIsDialogOpen(false);
      toast({
        title: "Account created",
        description: "The new account has been added to the chart of accounts.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const accountTypes = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

  const getAccountTypeBadge = (type: string) => {
    const variants = {
      asset: 'default',
      liability: 'destructive',
      equity: 'secondary',
      income: 'outline',
      expense: 'outline'
    } as const;
    
    const colors = {
      asset: 'text-blue-700 bg-blue-50',
      liability: 'text-red-700 bg-red-50',
      equity: 'text-purple-700 bg-purple-50',
      income: 'text-green-700 bg-green-50',
      expense: 'text-orange-700 bg-orange-50'
    } as const;
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || ''}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const accountData = {
      accountCode: formData.get('accountCode'),
      accountName: formData.get('accountName'),
      accountType: formData.get('accountType'),
      description: formData.get('description'),
      isActive: true
    };

    createAccountMutation.mutate(accountData);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chart of Accounts</h1>
            <p className="text-muted-foreground">Manage your accounting structure</p>
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

  // Group accounts by type
  const groupedAccounts = accounts.reduce((groups: any, account: any) => {
    const type = account.accountType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage your accounting structure</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>
                Add a new account to your chart of accounts
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountCode">Account Code</Label>
                  <Input id="accountCode" name="accountCode" placeholder="e.g., 4500" required />
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
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input id="accountName" name="accountName" placeholder="e.g., Consulting Revenue" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="Optional description" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAccountMutation.isPending}>
                  {createAccountMutation.isPending ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {accountTypes.map((type) => {
          const typeAccounts = groupedAccounts[type.value] || [];
          return (
            <Card key={type.value}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{type.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{typeAccounts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">accounts</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accounts by Type */}
      <div className="space-y-6">
        {accountTypes.map((type) => {
          const typeAccounts = groupedAccounts[type.value] || [];
          
          if (typeAccounts.length === 0) return null;
          
          return (
            <Card key={type.value}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getAccountTypeBadge(type.value)}
                  <span>{type.label} Accounts</span>
                </CardTitle>
                <CardDescription>
                  {typeAccounts.length} account{typeAccounts.length !== 1 ? 's' : ''} in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {typeAccounts.map((account: any) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono text-sm">{account.accountCode}</TableCell>
                          <TableCell className="font-medium">{account.accountName}</TableCell>
                          <TableCell className="text-muted-foreground">{account.description || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={account.isActive ? 'default' : 'secondary'}>
                              {account.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No accounts found. Create your first account to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}