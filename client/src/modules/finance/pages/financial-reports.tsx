import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, FileText, TrendingUp, TrendingDown, DollarSign, PieChart, Download, Calendar } from "lucide-react";

function ReportCard({ title, value, change, icon: Icon, changeType }: {
  title: string;
  value: string;
  change: string;
  icon: any;
  changeType: 'positive' | 'negative' | 'neutral';
}) {
  const changeColor = changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-gray-600';
  const ChangeIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : TrendingUp;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs ${changeColor}`}>
          <ChangeIcon className="h-3 w-3 mr-1" />
          {change}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FinancialReportsPage() {
  const [reportType, setReportType] = useState("profit-loss");
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch P&L Report
  const { data: profitLossData, isLoading: plLoading } = useQuery({
    queryKey: ["/api/finance/reports/profit-loss", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/finance/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          "X-Tenant-Id": "1"
        }
      });
      return response.json();
    }
  });

  // Fetch Cash Flow Report
  const { data: cashFlowData, isLoading: cfLoading } = useQuery({
    queryKey: ["/api/finance/reports/cash-flow", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/finance/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          "X-Tenant-Id": "1"
        }
      });
      return response.json();
    }
  });

  // Fetch Finance Stats
  const { data: statsData } = useQuery({
    queryKey: ["/api/finance/stats"],
    queryFn: async () => {
      const response = await fetch("/api/finance/stats", {
        headers: {
          "X-Tenant-Id": "1"
        }
      });
      return response.json();
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-slate-500 mt-2">
            Comprehensive financial analysis and reporting dashboard.
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Reports
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ReportCard
          title="Total Revenue"
          value={`$${statsData?.totalRevenue?.toFixed(2) || '0.00'}`}
          change="+20.1% from last month"
          icon={DollarSign}
          changeType="positive"
        />
        <ReportCard
          title="Total Expenses"
          value={`$${statsData?.monthlyExpenses?.toFixed(2) || '0.00'}`}
          change="+5.2% from last month"
          icon={TrendingUp}
          changeType="negative"
        />
        <ReportCard
          title="Net Profit"
          value={`$${((statsData?.totalRevenue || 0) - (statsData?.monthlyExpenses || 0)).toFixed(2)}`}
          change="+12.5% from last month"
          icon={TrendingUp}
          changeType="positive"
        />
        <ReportCard
          title="Profit Margin"
          value={`${statsData?.profitMargin || 0}%`}
          change="+2.1% from last month"
          icon={PieChart}
          changeType="positive"
        />
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                  <SelectItem value="cash-flow">Cash Flow</SelectItem>
                  <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                  <SelectItem value="budget-variance">Budget Variance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="profit-loss" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="budget-variance">Budget Variance</TabsTrigger>
        </TabsList>

        <TabsContent value="profit-loss">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Profit & Loss Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : profitLossData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Revenue</h3>
                      <p className="text-2xl font-bold text-green-600">
                        ${profitLossData.revenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Expenses</h3>
                      <p className="text-2xl font-bold text-red-600">
                        ${profitLossData.expenses.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Net Income</h3>
                      <p className={`text-2xl font-bold ${profitLossData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${profitLossData.netIncome.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Financial Ratios</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Profit Margin:</span>
                        <span className="ml-2 font-medium">{profitLossData.profitMargin.toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Period:</span>
                        <span className="ml-2 font-medium">
                          {startDate} to {endDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">No data available for the selected period.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Cash Flow Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cfLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : cashFlowData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Cash Inflow</h3>
                      <p className="text-2xl font-bold text-green-600">
                        ${cashFlowData.cashInflow.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Cash Outflow</h3>
                      <p className="text-2xl font-bold text-red-600">
                        ${cashFlowData.cashOutflow.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Net Cash Flow</h3>
                      <p className={`text-2xl font-bold ${cashFlowData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${cashFlowData.netCashFlow.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Cash Flow Analysis</h4>
                    <p className="text-sm text-gray-600">
                      {cashFlowData.netCashFlow >= 0 
                        ? "Positive cash flow indicates healthy financial operations."
                        : "Negative cash flow requires attention to improve liquidity."
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">No cash flow data available for the selected period.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Balance Sheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Balance Sheet Report</h3>
                <p className="text-gray-500">
                  This report will display assets, liabilities, and equity information.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget-variance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Budget Variance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Variance Report</h3>
                <p className="text-gray-500">
                  Compare actual spending against budgeted amounts across categories.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}