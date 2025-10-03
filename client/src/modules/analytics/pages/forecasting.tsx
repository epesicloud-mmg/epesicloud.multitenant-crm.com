import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Target, AlertTriangle, Brain, Zap } from 'lucide-react';

export default function ForecastingPage() {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [forecastPeriod, setForecastPeriod] = useState('6m');

  const { data: forecastData, isLoading } = useQuery({
    queryKey: ['/api/analytics/forecasts', selectedMetric, forecastPeriod],
  });

  const mockRevenueData = [
    { month: 'Jan', actual: 32000, forecast: null, upper: null, lower: null },
    { month: 'Feb', actual: 35000, forecast: null, upper: null, lower: null },
    { month: 'Mar', actual: 28000, forecast: null, upper: null, lower: null },
    { month: 'Apr', actual: 42000, forecast: null, upper: null, lower: null },
    { month: 'May', actual: 38000, forecast: null, upper: null, lower: null },
    { month: 'Jun', actual: 45000, forecast: null, upper: null, lower: null },
    { month: 'Jul', actual: null, forecast: 47000, upper: 52000, lower: 42000 },
    { month: 'Aug', actual: null, forecast: 49000, upper: 55000, lower: 43000 },
    { month: 'Sep', actual: null, forecast: 52000, upper: 59000, lower: 45000 },
    { month: 'Oct', actual: null, forecast: 54000, upper: 62000, lower: 46000 },
    { month: 'Nov', actual: null, forecast: 57000, upper: 66000, lower: 48000 },
    { month: 'Dec', actual: null, forecast: 60000, upper: 70000, lower: 50000 }
  ];

  const mockUserData = [
    { month: 'Jan', actual: 1200, forecast: null, upper: null, lower: null },
    { month: 'Feb', actual: 1350, forecast: null, upper: null, lower: null },
    { month: 'Mar', actual: 1100, forecast: null, upper: null, lower: null },
    { month: 'Apr', actual: 1450, forecast: null, upper: null, lower: null },
    { month: 'May', actual: 1600, forecast: null, upper: null, lower: null },
    { month: 'Jun', actual: 1750, forecast: null, upper: null, lower: null },
    { month: 'Jul', actual: null, forecast: 1850, upper: 2100, lower: 1600 },
    { month: 'Aug', actual: null, forecast: 1950, upper: 2200, lower: 1700 },
    { month: 'Sep', actual: null, forecast: 2100, upper: 2400, lower: 1800 },
    { month: 'Oct', actual: null, forecast: 2200, upper: 2500, lower: 1900 },
    { month: 'Nov', actual: null, forecast: 2350, upper: 2700, lower: 2000 },
    { month: 'Dec', actual: null, forecast: 2500, upper: 2900, lower: 2100 }
  ];

  const getCurrentData = () => {
    switch (selectedMetric) {
      case 'revenue':
        return mockRevenueData;
      case 'users':
        return mockUserData;
      default:
        return mockRevenueData;
    }
  };

  const getMetricFormatter = (value: number) => {
    switch (selectedMetric) {
      case 'revenue':
        return `$${value.toLocaleString()}`;
      case 'users':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const forecastSummary = {
    accuracy: 87,
    trend: 'increasing',
    confidence: 'high',
    nextPeriodGrowth: 12.5,
    riskFactors: ['Market volatility', 'Seasonal patterns', 'Competition']
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Forecasting</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
          <h1 className="text-2xl font-bold">Predictive Analytics & Forecasting</h1>
          <p className="text-muted-foreground">AI-powered business forecasting and predictions</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="users">Active Users</SelectItem>
              <SelectItem value="sales">Sales Volume</SelectItem>
              <SelectItem value="conversion">Conversion Rate</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="12m">12 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Refresh Forecast
          </Button>
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4 inline mr-2" />
              Forecast Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecastSummary.accuracy}%</div>
            <p className="text-xs text-muted-foreground mt-1">Based on historical data</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Predicted Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{forecastSummary.nextPeriodGrowth}%</div>
            <p className="text-xs text-muted-foreground mt-1">Next period vs current</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Zap className="h-4 w-4 inline mr-2" />
              Confidence Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">High</div>
              <Badge className="bg-green-100 text-green-800">
                {forecastSummary.confidence}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">AI confidence rating</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4 inline mr-2" />
              Trend Direction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">Increasing</div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall trend</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Forecast
          </CardTitle>
          <CardDescription>
            Historical data and {forecastPeriod} prediction with confidence intervals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={getCurrentData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={getMetricFormatter} />
              <Tooltip formatter={(value, name) => [getMetricFormatter(Number(value)), name]} />
              
              {/* Historical data */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#0088FE" 
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls={false}
                name="Actual"
              />
              
              {/* Forecast line */}
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#00C49F" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                connectNulls={false}
                name="Forecast"
              />
              
              {/* Confidence interval upper bound */}
              <Line 
                type="monotone" 
                dataKey="upper" 
                stroke="#FFBB28" 
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                connectNulls={false}
                name="Upper Bound"
              />
              
              {/* Confidence interval lower bound */}
              <Line 
                type="monotone" 
                dataKey="lower" 
                stroke="#FFBB28" 
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                connectNulls={false}
                name="Lower Bound"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Factors and Assumptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Risk Factors
            </CardTitle>
            <CardDescription>
              Factors that could impact forecast accuracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forecastSummary.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">{risk}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-600" />
              Model Information
            </CardTitle>
            <CardDescription>
              AI model details and assumptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Algorithm</div>
                <div className="text-sm text-muted-foreground">Time Series ARIMA with ML enhancement</div>
              </div>
              <div>
                <div className="text-sm font-medium">Training Data</div>
                <div className="text-sm text-muted-foreground">24 months historical data</div>
              </div>
              <div>
                <div className="text-sm font-medium">Last Updated</div>
                <div className="text-sm text-muted-foreground">January 15, 2024 at 10:30 AM</div>
              </div>
              <div>
                <div className="text-sm font-medium">Seasonality</div>
                <div className="text-sm text-muted-foreground">Monthly and quarterly patterns detected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Analysis</CardTitle>
          <CardDescription>Multiple forecast scenarios based on different assumptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Optimistic</span>
              </div>
              <div className="text-2xl font-bold text-green-600">+18.5%</div>
              <div className="text-sm text-muted-foreground">Best case scenario</div>
            </div>
            
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Most Likely</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">+12.5%</div>
              <div className="text-sm text-muted-foreground">Expected outcome</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium">Conservative</span>
              </div>
              <div className="text-2xl font-bold text-red-600">+6.8%</div>
              <div className="text-sm text-muted-foreground">Cautious estimate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}