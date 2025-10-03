import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { FileText, Download, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function TransactionTrailReportPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/finance-enhanced/transactions', dateRange, sourceFilter, searchTerm],
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['/api/finance-enhanced/ledger-accounts'],
  });

  // Create account lookup for display names
  const accountLookup = accounts.reduce((acc: any, account: any) => {
    acc[account.id] = account;
    return acc;
  }, {});

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount || '0'));
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig = {
      'invoice': { color: 'bg-blue-100 text-blue-800', label: 'Invoice' },
      'bill': { color: 'bg-red-100 text-red-800', label: 'Bill' },
      'payment': { color: 'bg-green-100 text-green-800', label: 'Payment' },
      'expense': { color: 'bg-orange-100 text-orange-800', label: 'Expense' },
      'credit_note': { color: 'bg-purple-100 text-purple-800', label: 'Credit Note' },
      'journal': { color: 'bg-gray-100 text-gray-800', label: 'Journal Entry' }
    };
    
    const config = sourceConfig[source as keyof typeof sourceConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: source };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredTransactions = Array.isArray(transactions) ? transactions.filter((transaction: any) => {
    const matchesSource = sourceFilter === 'all' || transaction.source === sourceFilter;
    const matchesSearch = !searchTerm || 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSource && matchesSearch;
  }) : [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transaction Trail Report</h1>
            <p className="text-muted-foreground">Comprehensive audit trail of all financial transactions</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalTransactions = filteredTransactions.length;
  const totalAmount = filteredTransactions.reduce((sum: number, t: any) => 
    sum + Math.abs(parseFloat(t.amount || '0')), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction Trail Report</h1>
          <p className="text-muted-foreground">Comprehensive audit trail of all financial transactions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Filters</CardTitle>
          <CardDescription>Customize your transaction trail report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceFilter">Transaction Source</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="bill">Bills</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                  <SelectItem value="credit_note">Credit Notes</SelectItem>
                  <SelectItem value="journal">Journal Entries</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4 inline mr-2" />
              Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {format(new Date(dateRange.startDate), 'MMM dd')} - {format(new Date(dateRange.endDate), 'MMM dd, yyyy')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {sourceFilter !== 'all' ? `Filtered by ${sourceFilter}` : 'All sources'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount.toString())}</div>
            <p className="text-xs text-muted-foreground mt-1">All transactions combined</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Trail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Trail</CardTitle>
          <CardDescription>
            Complete audit trail showing all financial transaction details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found for the selected criteria.</p>
              <p className="text-sm mt-2">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction #</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Debit Account</TableHead>
                    <TableHead>Credit Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: any) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.transactionNumber}
                      </TableCell>
                      <TableCell>
                        {getSourceBadge(transaction.source)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.reference || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium">
                          {accountLookup[transaction.debitAccountId]?.accountCode} - 
                          {accountLookup[transaction.debitAccountId]?.accountName}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium">
                          {accountLookup[transaction.creditAccountId]?.accountCode} - 
                          {accountLookup[transaction.creditAccountId]?.accountName}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'posted' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
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