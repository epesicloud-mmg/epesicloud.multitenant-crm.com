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
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const mockAccounts = [
  { id: 1, code: '1000', name: 'Cash', type: 'Asset', balance: 25000, active: true },
  { id: 2, code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 15000, active: true },
  { id: 3, code: '2000', name: 'Accounts Payable', type: 'Liability', balance: -8000, active: true },
  { id: 4, code: '3000', name: 'Owner Equity', type: 'Equity', balance: -32000, active: true },
  { id: 5, code: '4000', name: 'Sales Revenue', type: 'Revenue', balance: -50000, active: true },
  { id: 6, code: '5000', name: 'Cost of Goods Sold', type: 'Expense', balance: 30000, active: true },
  { id: 7, code: '6000', name: 'Operating Expenses', type: 'Expense', balance: 20000, active: true },
];

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.includes(searchTerm)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Asset': 'bg-green-100 text-green-800',
      'Liability': 'bg-red-100 text-red-800',
      'Equity': 'bg-blue-100 text-blue-800',
      'Revenue': 'bg-purple-100 text-purple-800',
      'Expense': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage your financial account structure</p>
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
              <DialogTitle>Add New Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Account Code</Label>
                <Input id="code" placeholder="e.g., 1200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input id="name" placeholder="e.g., Inventory" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Account Type</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Select type</option>
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                Create Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Account List</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono">{account.code}</TableCell>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(account.type)}>
                      {account.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(account.balance)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.active ? "default" : "secondary"}>
                      {account.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$40,000</div>
            <p className="text-xs text-muted-foreground">Total assets</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,000</div>
            <p className="text-xs text-muted-foreground">Total liabilities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$32,000</div>
            <p className="text-xs text-muted-foreground">Owner equity</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$50,000</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$50,000</div>
            <p className="text-xs text-muted-foreground">Total expenses</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}