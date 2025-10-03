import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, TrendingUp, Users, Target, Sparkles, Brain, ArrowRight, Clock, DollarSign, Eye, MessageSquare, CheckCircle, Building, ChevronDown, Calendar, BarChart, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { MainLayout } from "../components/layout/main-layout";

interface DashboardMetrics {
  totalContacts: number;
  activeDeals: number;
  totalRevenue: number;
  conversionRate: number;
  activitiesThisWeek: number;
  workspaces: Array<{
    id: number;
    name: string;
    color: string;
    projects: number;
    activeDeals: number;
  }>;
  products: Array<{
    id: number;
    name: string;
    revenue: number;
    growth: number;
    deals: number;
  }>;
  projects: Array<{
    id: number;
    name: string;
    workspace: string;
    progress: number;
    priority: string;
    dueDate: string;
  }>;
  aiInsights: Array<{
    type: 'revenue' | 'opportunity' | 'risk' | 'task';
    title: string;
    description: string;
    confidence: number;
    action: string;
  }>;
  recentActivities: Array<{
    id: number;
    type: string;
    subject: string;
    contact: string;
    time: string;
  }>;
}

export default function AIDashboard() {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentWorkspace, setCurrentWorkspace] = useState('sales-operations');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/ai-dashboard/metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time feel
  });

  const handleWorkspaceChange = (workspace: string) => {
    setCurrentWorkspace(workspace);
  };

  if (isLoading) {
    return (
      <MainLayout 
        showWorkspaceSelector={true} 
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={handleWorkspaceChange}
      >
        <div className="p-8 space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const mockMetrics: DashboardMetrics = {
    totalContacts: 142,
    activeDeals: 28,
    totalRevenue: 485000,
    conversionRate: 24.5,
    activitiesThisWeek: 89,
    workspaces: [
      { id: 1, name: 'Marketing Hub', color: '#8b5cf6', projects: 4, activeDeals: 12 },
      { id: 2, name: 'Sales Operations', color: '#06b6d4', projects: 6, activeDeals: 18 },
      { id: 3, name: 'Customer Success', color: '#10b981', projects: 3, activeDeals: 8 }
    ],
    projects: [
      { id: 1, name: 'Q1 Campaign', workspace: 'Marketing', progress: 75, priority: 'High', dueDate: '2025-03-15' },
      { id: 2, name: 'Enterprise Sales', workspace: 'Sales', progress: 60, priority: 'Critical', dueDate: '2025-02-28' },
      { id: 3, name: 'Onboarding 2.0', workspace: 'Customer Success', progress: 40, priority: 'Medium', dueDate: '2025-04-10' }
    ],
    products: [
      { id: 1, name: 'CRM Professional', revenue: 125000, growth: 18, deals: 45 },
      { id: 2, name: 'Analytics Suite', revenue: 89000, growth: 24, deals: 32 },
      { id: 3, name: 'Integration Pack', revenue: 67000, growth: 12, deals: 28 }
    ],
    aiInsights: [
      {
        type: 'revenue',
        title: 'Revenue Surge Opportunity',
        description: 'Based on current pipeline velocity, closing TechCorp and DataFlow deals could boost Q1 revenue by 32%',
        confidence: 89,
        action: 'Focus on enterprise deals'
      },
      {
        type: 'opportunity',
        title: 'Warm Lead Conversion',
        description: '12 leads with 80%+ engagement scores are ready for sales outreach this week',
        confidence: 76,
        action: 'Schedule follow-up calls'
      },
      {
        type: 'risk',
        title: 'Deal at Risk',
        description: 'Manufacturing Solutions deal ($45K) shows declining engagement. Last contact: 8 days ago',
        confidence: 82,
        action: 'Immediate re-engagement'
      }
    ],
    recentActivities: [
      { id: 1, type: 'call', subject: 'Product Demo', contact: 'Sarah Johnson', time: '2 hours ago' },
      { id: 2, type: 'email', subject: 'Proposal Follow-up', contact: 'Mike Chen', time: '4 hours ago' },
      { id: 3, type: 'meeting', subject: 'Contract Review', contact: 'Lisa Anderson', time: '6 hours ago' }
    ]
  };

  const data = metrics || mockMetrics;

  return (
    <MainLayout 
      showWorkspaceSelector={true} 
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={handleWorkspaceChange}
    >
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {greeting}, Alex 👋
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  All Systems Operational
                </Badge>
                <Avatar>
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* AI Insights Section */}
            <Card className="border-none shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
              <CardDescription className="text-purple-100">
                Intelligent recommendations to boost your performance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.aiInsights?.map((insight, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {insight.type === 'revenue' && <DollarSign className="h-4 w-4" />}
                    {insight.type === 'opportunity' && <Target className="h-4 w-4" />}
                    {insight.type === 'risk' && <Eye className="h-4 w-4" />}
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    {insight.confidence}% confident
                  </Badge>
                </div>
                <p className="text-sm text-purple-100 mb-3">{insight.description}</p>
                <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  {insight.action}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
            </CardContent>
            </Card>

            {/* Key Metrics and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Key Metrics - Half Width */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Key Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Contacts</p>
                          <p className="text-2xl font-bold text-gray-900">{data.totalContacts}</p>
                          <p className="text-xs text-green-600">+12% this month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Deals</p>
                          <p className="text-2xl font-bold text-gray-900">{data.activeDeals}</p>
                          <p className="text-xs text-green-600">+8% this week</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <DollarSign className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                          <p className="text-2xl font-bold text-gray-900">${(data.totalRevenue / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-green-600">+24% vs Q4</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Target className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                          <p className="text-2xl font-bold text-gray-900">{data.conversionRate}%</p>
                          <p className="text-xs text-green-600">+3.2% improvement</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Quick Actions - Half Width */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">Add Contact</h4>
                      <p className="text-xs text-gray-500">Create new record</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition-colors">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">New Deal</h4>
                      <p className="text-xs text-gray-500">Start opportunity</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-200 transition-colors">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">Schedule</h4>
                      <p className="text-xs text-gray-500">Plan activities</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-orange-200 transition-colors">
                        <BarChart className="h-5 w-5 text-orange-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">Reports</h4>
                      <p className="text-xs text-gray-500">View analytics</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-red-200 transition-colors">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">Overdue</h4>
                      <p className="text-xs text-gray-500">Review pending</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-teal-200 transition-colors">
                        <Building className="h-5 w-5 text-teal-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">Companies</h4>
                      <p className="text-xs text-gray-500">Manage accounts</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Projects and Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Projects */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Active Projects
            </CardTitle>
            <CardDescription>Current projects in {currentWorkspace.replace('-', ' ')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.projects?.map((project) => (
              <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.workspace}</p>
                  </div>
                  <Badge 
                    variant={project.priority === 'Critical' ? 'destructive' : 
                             project.priority === 'High' ? 'default' : 'secondary'}
                  >
                    {project.priority}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <p className="text-xs text-gray-600">Due: {project.dueDate}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top-Performing Products */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top-Performing Products
            </CardTitle>
            <CardDescription>Your highest revenue generating products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.products?.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.deals} active deals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${(product.revenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-green-600">+{product.growth}% growth</p>
                </div>
              </div>
            ))}
          </CardContent>
            </Card>
            </div>

            {/* Recent Activities */}
            <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Recent Activities
          </CardTitle>
          <CardDescription>Stay updated with your latest interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivities?.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {activity.type === 'call' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'email' && <MessageSquare className="h-4 w-4 text-green-600" />}
                  {activity.type === 'meeting' && <Users className="h-4 w-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.subject}</p>
                  <p className="text-sm text-gray-600">with {activity.contact}</p>
                </div>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
            </CardContent>
            </Card>


          </div>
      </div>
    </MainLayout>
  );
}