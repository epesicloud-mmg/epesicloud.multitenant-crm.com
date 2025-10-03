import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Activity, Search, Filter, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Event {
  id: string;
  eventName: string;
  userId?: number;
  workspaceId?: number;
  timestamp: string;
  source: string;
  url?: string;
  userAgent?: string;
  eventProperties: Record<string, any>;
}

interface EventAnalytics {
  timeframe: string;
  summary: {
    totalEvents: number;
    uniqueEventTypes: number;
    activeUsers: number;
    totalPageViews: number;
  };
  eventsByType: Array<{ eventName: string; count: number }>;
  timeline: Array<{ hour: string; count: number }>;
  topUsers: Array<{ userId: number; count: number }>;
  popularPages: Array<{ page: string; count: number }>;
}

export default function EventsAnalyticsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("7d");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', searchQuery, eventTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (eventTypeFilter && eventTypeFilter !== 'all') params.append('eventName', eventTypeFilter);
      
      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<EventAnalytics>({
    queryKey: ['/api/events/analytics', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/events/analytics?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  const handleSearch = () => {
    // Search will be triggered automatically by the query dependency
  };

  const exportEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (eventTypeFilter && eventTypeFilter !== 'all') params.append('eventName', eventTypeFilter);
      
      const response = await fetch(`/api/events?${params}&limit=10000`);
      const data = await response.json();
      
      // Convert to CSV
      const csv = [
        ['Event Name', 'User ID', 'Timestamp', 'Source', 'URL', 'Properties'],
        ...data.map((event: Event) => [
          event.eventName,
          event.userId || '',
          event.timestamp,
          event.source,
          event.url || '',
          JSON.stringify(event.eventProperties)
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `events-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export events:', error);
    }
  };

  if (analyticsLoading) {
    return (
      <div className="p-6">
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Analytics</h1>
          <p className="text-muted-foreground">
            PostHog-style event tracking and behavioral insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportEvents} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.timeframe}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Event Types</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.uniqueEventTypes}</div>
              <p className="text-xs text-muted-foreground">
                Unique event types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Users with activity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalPageViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total page views
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="funnels">Funnels</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Event Search</CardTitle>
              <CardDescription>
                Search and filter events by name, properties, or user activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="page.view">Page Views</SelectItem>
                    <SelectItem value="user.login">User Logins</SelectItem>
                    <SelectItem value="deal.created">Deal Created</SelectItem>
                    <SelectItem value="contact.created">Contact Created</SelectItem>
                    <SelectItem value="api.call">API Calls</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{event.eventName}</Badge>
                          <Badge variant="secondary">{event.source}</Badge>
                          {event.userId && <Badge variant="default">User {event.userId}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.url && `${event.url} • `}
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </p>
                        {Object.keys(event.eventProperties).length > 0 && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">
                              View properties ({Object.keys(event.eventProperties).length})
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                              {JSON.stringify(event.eventProperties, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              {/* Event Types Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Events by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.eventsByType.map((item) => (
                      <div key={item.eventName} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.eventName}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(item.count / analytics.summary.totalEvents) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-16 text-right">
                            {item.count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.popularPages.map((item) => (
                      <div key={item.page} className="flex items-center justify-between">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {item.page}
                        </code>
                        <Badge variant="secondary">{item.count} views</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="funnels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Analysis</CardTitle>
              <CardDescription>
                Coming soon: Track user conversion through defined event sequences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funnel analysis will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}