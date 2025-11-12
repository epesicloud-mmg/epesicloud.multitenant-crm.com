import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Brain, Users, DollarSign, Activity, TrendingUp } from "lucide-react";
import { useTenant } from "@/lib/tenant-context";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { AIDashboardModal } from "@/components/modals/ai-dashboard-modal";

export default function Dashboard() {
  const { tenantId } = useTenant();
  const [showAIDashboard, setShowAIDashboard] = useState(false);

  const { data: deals = [], isLoading: dealsLoading } = useQuery<any[]>({
    queryKey: ['/api/deals'],
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<any[]>({
    queryKey: ['/api/activities'],
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
  });

  const { data: salesStages = [] } = useQuery<any[]>({
    queryKey: ['/api/sales-stages'],
  });

  // Calculate metrics from real data
  const metrics = {
    totalContacts: contacts.length,
    activeDeals: deals.length,
    pipelineRevenue: deals.reduce((sum: number, deal: any) => sum + parseFloat(deal.value || 0), 0),
    conversionRate: contacts.length > 0 ? deals.length / contacts.length : 0,
  };

  if (dealsLoading || activitiesLoading || contactsLoading) {
    return (
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <TopBar title="Dashboard" />
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-slate-200 rounded w-16 animate-pulse mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-32 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Process deals data for charts
  const revenueData = salesStages?.map((stage: any) => ({
    name: stage.title,
    revenue: deals.filter((deal: any) => deal.stageId === stage.id)
      .reduce((sum: number, deal: any) => sum + parseFloat(deal.value || 0), 0)
  })) || [];

  const activityData = activities ? [
    { name: 'Calls', count: activities.filter((a: any) => a.type === 'call').length },
    { name: 'Emails', count: activities.filter((a: any) => a.type === 'email').length },
    { name: 'Meetings', count: activities.filter((a: any) => a.type === 'meeting').length },
    { name: 'Notes', count: activities.filter((a: any) => a.type === 'note').length },
  ] : [];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TopBar title="Dashboard" />
        <div className="p-6">
          {/* Header with AI Dashboard Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Business Overview</h1>
            <Button 
              onClick={() => setShowAIDashboard(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Dashboard
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Total Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalContacts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active customer base
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Active Deals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeDeals || 0}</div>
                <p className="text-xs text-muted-foreground">
                  In pipeline
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pipeline Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(metrics?.pipelineRevenue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total potential
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((metrics?.conversionRate || 0) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Lead to customer
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities?.slice(0, 5).map((activity: any) => {
                  const contact = contacts?.find((c: any) => c.id === activity.contactId);
                  return (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact'} • 
                          {activity.type} • {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {(!activities || activities.length === 0) && (
                  <p className="text-sm text-muted-foreground">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* AI Dashboard Modal */}
      <AIDashboardModal 
        open={showAIDashboard} 
        onOpenChange={setShowAIDashboard} 
      />
    </div>
  );
}