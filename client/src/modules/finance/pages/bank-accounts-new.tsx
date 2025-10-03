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
import { Plus, Eye, Settings, CreditCard, Building2 } from 'lucide-react';

const mockBankAccounts = [
  {
    id: 1,
    name: 'Main Checking Account',
    bank: 'Chase Bank',
    accountNumber: '****1234',
    accountType: 'Checking',
    balance: 25847.50,
    currency: 'USD',
    active: true,
    lastSync: '2025-01-12T08:00:00Z'
  },
  {
    id: 2,
    name: 'Business Savings',
    bank: 'Wells Fargo',
    accountNumber: '****5678',
    accountType: 'Savings',
    balance: 150000.00,
    currency: 'USD',
    active: true,
    lastSync: '2025-01-12T07:30:00Z'
  },
  {
    id: 3,
    name: 'Petty Cash',
    bank: 'Cash Account',
    accountNumber: 'CASH-001',
    accountType: 'Cash',
    balance: 500.00,
    currency: 'USD',
    active: true,
    lastSync: '2025-01-12T09:00:00Z'
  },
  {
    id: 4,
    name: 'Credit Line',
    bank: 'Bank of America',
    accountNumber: '****9012',
    accountType: 'Credit',
    balance: -5000.00,
    currency: 'USD',
    active: true,
    lastSync: '2025-01-12T08:15:00Z'
  }
];

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState(mockBankAccounts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'Checking':
      case 'Savings':
        return <Building2 className="h-4 w-4" />;
      case 'Credit':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Checking': 'bg-blue-100 text-blue-800',
      'Savings': 'bg-green-100 text-green-800',
      'Cash': 'bg-yellow-100 text-yellow-800',
      'Credit': 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bank Accounts</h1>
          <p className="text-muted-foreground">Manage your financial accounts and monitor balances</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input id="name" placeholder="e.g., Main Checking" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank">Bank Name</Label>
                <Input id="bank" placeholder="e.g., Chase Bank" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" placeholder="Last 4 digits only" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Account Type</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Select type</option>
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Opening Balance</Label>
                <Input id="balance" type="number" placeholder="0.00" step="0.01" />
              </div>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                Add Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">All accounts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.filter(a => a.active).length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Checking Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(accounts.filter(a => a.accountType === 'Checking').reduce((sum, a) => sum + a.balance, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Checking accounts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Savings Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(accounts.filter(a => a.accountType === 'Savings').reduce((sum, a) => sum + a.balance, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Savings accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getAccountIcon(account.accountType)}
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">{account.accountNumber}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{account.bank}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(account.accountType)}>
                      {account.accountType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <span className={account.balance < 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(account.balance)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.active ? "default" : "secondary"}>
                      {account.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
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