import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Download, 
  CalendarIcon,
  DollarSign,
  PieChart
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const reports = [
  {
    id: 1,
    name: 'Profit & Loss Statement',
    description: 'Revenue, expenses, and net income for a specific period',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-600',
    data: {
      revenue: 85000,
      expenses: 62000,
      netIncome: 23000,
      period: 'This Month'
    }
  },
  {
    id: 2,
    name: 'Balance Sheet',
    description: 'Assets, liabilities, and equity at a point in time',
    icon: BarChart3,
    color: 'bg-blue-100 text-blue-600',
    data: {
      assets: 450000,
      liabilities: 125000,
      equity: 325000,
      date: 'As of Today'
    }
  },
  {
    id: 3,
    name: 'Cash Flow Statement',
    description: 'Cash inflows and outflows during a specific period',
    icon: DollarSign,
    color: 'bg-purple-100 text-purple-600',
    data: {
      operating: 45000,
      investing: -15000,
      financing: -8000,
      netCash: 22000
    }
  },
  {
    id: 4,
    name: 'Accounts Receivable Aging',
    description: 'Outstanding invoices by age categories',
    icon: FileText,
    color: 'bg-orange-100 text-orange-600',
    data: {
      current: 25000,
      thirtyDays: 8000,
      sixtyDays: 3000,
      ninetyPlus: 1500
    }
  },
  {
    id: 5,
    name: 'Sales by Product',
    description: 'Revenue breakdown by product categories',
    icon: PieChart,
    color: 'bg-pink-100 text-pink-600',
    data: {
      services: 45000,
      products: 28000,
      subscriptions: 12000
    }
  },
  {
    id: 6,
    name: 'Expense Analysis',
    description: 'Detailed expense breakdown by category',
    icon: BarChart3,
    color: 'bg-red-100 text-red-600',
    data: {
      salaries: 35000,
      rent: 8000,
      utilities: 2500,
      marketing: 5500,
      other: 11000
    }
  }
];

export default function FinancialReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(subMonths(new Date(), 1))
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const generateReport = (reportId: number) => {
    console.log(`Generating report ${reportId} for period ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Generate and view comprehensive financial reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? format(dateRange.from, 'MMM dd') : 'Start date'} - {dateRange.to ? format(dateRange.to, 'MMM dd') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => range && range.from && range.to && setDateRange({ from: range.from, to: range.to })}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(85000)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(62000)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(23000)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(125000)}</div>
            <p className="text-xs text-muted-foreground">Current balance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div>
                  <CardTitle className="text-lg">{report.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                </div>
              </CardHeader>
              
              <CardContent>
                {report.id === 1 && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Revenue:</span>
                      <span className="font-mono text-green-600">{formatCurrency(report.data.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Expenses:</span>
                      <span className="font-mono text-red-600">{formatCurrency(report.data.expenses)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Net Income:</span>
                      <span className="font-mono text-blue-600">{formatCurrency(report.data.netIncome)}</span>
                    </div>
                  </div>
                )}
                
                {report.id === 2 && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Assets:</span>
                      <span className="font-mono">{formatCurrency(report.data.assets)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Liabilities:</span>
                      <span className="font-mono">{formatCurrency(report.data.liabilities)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Equity:</span>
                      <span className="font-mono">{formatCurrency(report.data.equity)}</span>
                    </div>
                  </div>
                )}
                
                {report.id === 3 && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Operating:</span>
                      <span className="font-mono text-green-600">{formatCurrency(report.data.operating)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Investing:</span>
                      <span className="font-mono text-red-600">{formatCurrency(report.data.investing)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Financing:</span>
                      <span className="font-mono text-red-600">{formatCurrency(report.data.financing)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Net Cash:</span>
                      <span className="font-mono text-blue-600">{formatCurrency(report.data.netCash)}</span>
                    </div>
                  </div>
                )}
                
                {report.id > 3 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">
                      Click Generate to view detailed report
                    </p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 mt-4">
                  <Button 
                    className="flex-1" 
                    onClick={() => generateReport(report.id)}
                  >
                    Generate Report
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}