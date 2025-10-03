import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Calendar, Users, TrendingUp, Download, Play, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PayrollPeriod {
  id: number;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  status: 'draft' | 'processing' | 'paid' | 'cancelled';
  totalGross: string;
  totalDeductions: string;
  totalNet: string;
  employeeCount: number;
}

interface PayrollEntry {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  baseSalary: string;
  overtime: string;
  bonuses: string;
  grossPay: string;
  taxDeductions: string;
  otherDeductions: string;
  netPay: string;
  status: 'pending' | 'approved' | 'paid';
}

export default function PayrollPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [processData, setProcessData] = useState({
    periodStart: '',
    periodEnd: '',
    payDate: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payrollPeriods = [], isLoading } = useQuery({
    queryKey: ['/api/hr/payroll/periods'],
  });

  const { data: currentPeriodEntries = [] } = useQuery({
    queryKey: ['/api/hr/payroll/entries', selectedPeriod],
    enabled: !!selectedPeriod
  });

  const { data: payrollSummary } = useQuery({
    queryKey: ['/api/hr/payroll/summary'],
  });

  const processPayrollMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/hr/payroll/process', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/payroll/periods'] });
      setIsProcessDialogOpen(false);
      toast({ title: 'Success', description: 'Payroll processing initiated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const approvePayrollMutation = useMutation({
    mutationFn: (periodId: number) => apiRequest(`/api/hr/payroll/approve/${periodId}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/payroll/periods'] });
      toast({ title: 'Success', description: 'Payroll approved successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800', label: 'Approved' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount || '0'));
  };

  const handleProcessPayroll = (e: React.FormEvent) => {
    e.preventDefault();
    processPayrollMutation.mutate(processData);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Payroll Management</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee payroll and compensation</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Process Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process New Payroll</DialogTitle>
                <DialogDescription>Create a new payroll period and calculate employee payments</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProcessPayroll}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodStart">Period Start Date</Label>
                    <Input
                      id="periodStart"
                      type="date"
                      value={processData.periodStart}
                      onChange={(e) => setProcessData({ ...processData, periodStart: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodEnd">Period End Date</Label>
                    <Input
                      id="periodEnd"
                      type="date"
                      value={processData.periodEnd}
                      onChange={(e) => setProcessData({ ...processData, periodEnd: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payDate">Pay Date</Label>
                    <Input
                      id="payDate"
                      type="date"
                      value={processData.payDate}
                      onChange={(e) => setProcessData({ ...processData, payDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processPayrollMutation.isPending}>
                    Process Payroll
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Payroll Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4 inline mr-2" />
              This Month's Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payrollSummary?.currentMonthTotal || '0')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {payrollSummary?.currentMonthEmployees || 0} employees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline mr-2" />
              YTD Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payrollSummary?.ytdTotal || '0')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Year to date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4 inline mr-2" />
              Last Pay Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payrollSummary?.lastPayDate ? 
                format(new Date(payrollSummary.lastPayDate), 'MMM dd') : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Most recent payroll</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4 inline mr-2" />
              Active Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollSummary?.activeEmployees || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">On current payroll</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Periods */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Periods</CardTitle>
          <CardDescription>View and manage payroll processing periods</CardDescription>
        </CardHeader>
        <CardContent>
          {payrollPeriods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payroll periods found.</p>
              <p className="text-sm mt-2">Process your first payroll to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Pay Date</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollPeriods.map((period: PayrollPeriod) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">
                        {format(new Date(period.periodStart), 'MMM dd')} - {format(new Date(period.periodEnd), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(period.payDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{period.employeeCount}</TableCell>
                      <TableCell>{formatCurrency(period.totalGross)}</TableCell>
                      <TableCell>{formatCurrency(period.totalDeductions)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(period.totalNet)}</TableCell>
                      <TableCell>
                        {getStatusBadge(period.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPeriod(period.id.toString())}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {period.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approvePayrollMutation.mutate(period.id)}
                            >
                              Approve
                            </Button>
                          )}
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

      {/* Selected Period Details */}
      {selectedPeriod && currentPeriodEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payroll Details</CardTitle>
            <CardDescription>Individual employee payroll entries for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Bonuses</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPeriodEntries.map((entry: PayrollEntry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.employeeName}</TableCell>
                      <TableCell>{entry.department}</TableCell>
                      <TableCell>{formatCurrency(entry.baseSalary)}</TableCell>
                      <TableCell>{formatCurrency(entry.overtime)}</TableCell>
                      <TableCell>{formatCurrency(entry.bonuses)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(entry.grossPay)}</TableCell>
                      <TableCell>{formatCurrency(entry.taxDeductions)}</TableCell>
                      <TableCell className="font-bold text-green-600">{formatCurrency(entry.netPay)}</TableCell>
                      <TableCell>
                        {getStatusBadge(entry.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}