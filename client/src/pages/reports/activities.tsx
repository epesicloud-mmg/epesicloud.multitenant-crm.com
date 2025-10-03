import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, Phone, Mail, Users } from "lucide-react";
import type { Activity } from "@shared/schema";

export default function ActivityReports() {
  const { data: activities, isLoading } = useQuery({ queryKey: ["/api/activities"] });
  
  const activitiesData = (activities as Activity[]) || [];

  // Calculate activity metrics
  const activityMetrics = {
    total: activitiesData.length,
    completed: activitiesData.filter(a => a.completedAt).length,
    pending: activitiesData.filter(a => !a.completedAt).length,
    calls: activitiesData.filter(a => a.type === 'call').length,
    emails: activitiesData.filter(a => a.type === 'email').length,
    meetings: activitiesData.filter(a => a.type === 'meeting').length,
  };

  const completionRate = activityMetrics.total > 0 
    ? Math.round((activityMetrics.completed / activityMetrics.total) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Activity Reports</h1>
          <p className="text-slate-600">
            Comprehensive analysis of team activities and engagement metrics
          </p>
        </div>

        {/* Key Activity Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityMetrics.total}</div>
              <p className="text-xs text-muted-foreground">
                All recorded activities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityMetrics.completed}</div>
              <p className="text-xs text-muted-foreground">
                Finished activities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityMetrics.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Tasks completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Types Breakdown */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Activity Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Calls</span>
                  </div>
                  <span className="font-medium">{activityMetrics.calls}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Emails</span>
                  </div>
                  <span className="font-medium">{activityMetrics.emails}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Meetings</span>
                  </div>
                  <span className="font-medium">{activityMetrics.meetings}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest team activities</CardDescription>
            </CardHeader>
            <CardContent>
              {activitiesData.length > 0 ? (
                <div className="space-y-4">
                  {activitiesData.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {activity.type === 'call' && <Phone className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'email' && <Mail className="h-4 w-4 text-green-600" />}
                        {activity.type === 'meeting' && <Users className="h-4 w-4 text-purple-600" />}
                        {activity.type === 'note' && <Calendar className="h-4 w-4 text-orange-600" />}
                        <div>
                          <p className="font-medium">{activity.subject}</p>
                          <p className="text-sm text-muted-foreground capitalize">{activity.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {activity.scheduledAt ? new Date(activity.scheduledAt).toLocaleDateString() : 'No date'}
                        </p>
                        <p className={`text-xs ${activity.completedAt ? 'text-green-600' : 'text-orange-600'}`}>
                          {activity.completedAt ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
                  <p className="mt-1 text-sm text-gray-500">Activities will appear here once you start recording them</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}