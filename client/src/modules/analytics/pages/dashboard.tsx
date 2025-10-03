import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, Activity, Calendar, Download, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [metric, setMetric] = useState('revenue');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard', timeRange, metric],
  });

  const { data: kpiData } = useQuery({
    queryKey: ['/api/analytics/kpis'],
  });

  const { data: trendsData } = useQuery({
    queryKey: ['/api/analytics/trends', timeRange],
  });

  const { data: performanceData } = useQuery({
    queryKey: ['/api/analytics/performance'],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
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

  const kpis = kpiData || [
    { title: 'Total Revenue', value: '$125,430', change: '+12.5%', trend: 'up', icon: DollarSign },
    { title: 'Active Users', value: '2,547', change: '+8.2%', trend: 'up', icon: Users },
    { title: 'Conversion Rate', value: '3.24%', change: '-0.1%', trend: 'down', icon: Target },
    { title: 'Customer Satisfaction', value: '4.8/5.0', change: '+0.2', trend: 'up', icon: CheckCircle }
  ];

  const revenueData = trendsData?.revenue || [
    { month: 'Jan', value: 32000 },
    { month: 'Feb', value: 35000 },
    { month: 'Mar', value: 28000 },
    { month: 'Apr', value: 42000 },
    { month: 'May', value: 38000 },
    { month: 'Jun', value: 45000 }
  ];

  const userActivityData = trendsData?.userActivity || [
    { day: 'Mon', active: 1200, new: 45 },
    { day: 'Tue', active: 1350, new: 52 },
    { day: 'Wed', active: 1100, new: 38 },
    { day: 'Thu', active: 1450, new: 61 },
    { day: 'Fri', active: 1600, new: 73 },
    { day: 'Sat', active: 900, new: 29 },
    { day: 'Sun', active: 800, new: 22 }
  ];

  const departmentData = performanceData?.departments || [
    { name: 'Sales', value: 35, color: '#0088FE' },
    { name: 'Marketing', value: 28, color: '#00C49F' },
    { name: 'Engineering', value: 22, color: '#FFBB28' },
    { name: 'Support', value: 15, color: '#FF8042' }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <kpi.icon className="h-4 w-4 mr-2" />
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                  {getTrendIcon(kpi.trend)}
                  <span>{kpi.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="value" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Daily active users and new registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="active" fill="#0088FE" name="Active Users" />
                <Bar dataKey="new" fill="#00C49F" name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Performance distribution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>AI-generated business insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Revenue Growth</div>
                  <div className="text-sm text-muted-foreground">
                    Revenue increased 12.5% this month, driven by strong performance in the Enterprise segment.
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium">User Engagement</div>
                  <div className="text-sm text-muted-foreground">
                    Average session duration increased by 23%, indicating improved user experience.
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium">Conversion Optimization</div>
                  <div className="text-sm text-muted-foreground">
                    Mobile conversion rate is 15% lower than desktop. Consider mobile UX improvements.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Key metrics and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sales Target</span>
                <span className="text-sm text-muted-foreground">85% achieved</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Customer Satisfaction</span>
                <span className="text-sm text-muted-foreground">96% positive</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Uptime</span>
                <span className="text-sm text-muted-foreground">99.9% uptime</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}