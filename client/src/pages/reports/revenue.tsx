import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Target, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { Deal, Product } from "@shared/schema";

export default function RevenueReports() {
  const { data: deals } = useQuery({ queryKey: ["/api/deals"] });
  const { data: products } = useQuery({ queryKey: ["/api/products"] });

  const dealsData = (deals as Deal[]) || [];
  const productsData = (products as Product[]) || [];

  // Revenue calculations
  const totalRevenue = dealsData.reduce((sum, deal) => sum + parseFloat(deal.value), 0);
  const avgDealSize = dealsData.length > 0 ? totalRevenue / dealsData.length : 0;
  
  // Monthly revenue data
  const monthlyRevenue = dealsData.reduce((acc: any, deal) => {
    const month = new Date(deal.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + parseFloat(deal.value);
    return acc;
  }, {});

  const revenueChartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
    month,
    revenue
  }));

  // Product revenue breakdown
  const productRevenue = dealsData.reduce((acc: any, deal) => {
    if (deal.productId) {
      const product = productsData.find(p => p.id === deal.productId);
      if (product) {
        acc[product.name] = (acc[product.name] || 0) + parseFloat(deal.value);
      }
    }
    return acc;
  }, {});

  const productChartData = Object.entries(productRevenue).map(([product, revenue]) => ({
    product,
    revenue
  }));

  // Growth calculations
  const sortedMonths = Object.keys(monthlyRevenue).sort();
  const currentMonth = sortedMonths[sortedMonths.length - 1];
  const previousMonth = sortedMonths[sortedMonths.length - 2];
  
  const currentMonthRevenue = monthlyRevenue[currentMonth] || 0;
  const previousMonthRevenue = monthlyRevenue[previousMonth] || 0;
  
  const monthlyGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0;

  // Forecasted revenue (simplified calculation)
  const forecastedRevenue = totalRevenue * 1.15; // 15% growth projection

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Revenue Reports</h1>
          <p className="text-slate-600">
            Comprehensive revenue analysis and financial performance metrics
          </p>
        </div>

        {/* Key Revenue Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From all deals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgDealSize.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Average revenue per deal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Month over month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forecast</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${forecastedRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Projected revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Charts */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Product</CardTitle>
              <CardDescription>Top performing products</CardDescription>
            </CardHeader>
            <CardContent>
              {productChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productChartData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No product revenue data</h3>
                  <p className="mt-1 text-sm text-gray-500">Revenue by product will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
              <CardDescription>Revenue by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(monthlyRevenue).slice(-6).map(([month, revenue]) => (
                  <div key={month} className="flex justify-between">
                    <span className="text-sm">{month}</span>
                    <span className="font-medium">${Number(revenue).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Highest revenue generators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productChartData.slice(0, 5).map((product) => (
                  <div key={product.product} className="flex justify-between">
                    <span className="text-sm">{product.product}</span>
                    <span className="font-medium">${Number(product.revenue).toLocaleString()}</span>
                  </div>
                ))}
                {productChartData.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No product data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total Deals</span>
                  <span className="font-medium">{dealsData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Deal Size</span>
                  <span className="font-medium">${avgDealSize.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Best Month</span>
                  <span className="font-medium">
                    {currentMonth || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Growth Rate</span>
                  <span className={`font-medium ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}