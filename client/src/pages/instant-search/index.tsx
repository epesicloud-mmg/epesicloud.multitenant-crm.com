import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Search, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Eye, 
  ShoppingCart,
  Copy,
  Settings,
  Play,
  Code
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Mock data for instant search analytics
const mockSearchData = [
  { date: "2024-01-01", searches: 1250, clicks: 456, conversions: 23 },
  { date: "2024-01-02", searches: 1340, clicks: 523, conversions: 31 },
  { date: "2024-01-03", searches: 1180, clicks: 398, conversions: 19 },
  { date: "2024-01-04", searches: 1520, clicks: 612, conversions: 28 },
  { date: "2024-01-05", searches: 1890, clicks: 734, conversions: 42 },
  { date: "2024-01-06", searches: 2100, clicks: 845, conversions: 57 },
  { date: "2024-01-07", searches: 1960, clicks: 721, conversions: 48 },
];

const mockTopQueries = [
  { query: "wireless headphones", searches: 2845, ctr: 23.5 },
  { query: "laptop", searches: 2341, ctr: 19.2 },
  { query: "smartphone", searches: 1892, ctr: 31.4 },
  { query: "tablet", searches: 1654, ctr: 28.7 },
  { query: "smartwatch", searches: 1421, ctr: 15.8 },
];

const mockEventTypes = [
  { name: "Search", value: 45, color: "#8884d8" },
  { name: "Click", value: 25, color: "#82ca9d" },
  { name: "View", value: 20, color: "#ffc658" },
  { name: "Add to Cart", value: 7, color: "#ff7300" },
  { name: "Purchase", value: 3, color: "#ff0000" },
];

const mockRecentEvents = [
  {
    id: 1,
    type: "search",
    query: "wireless headphones",
    timestamp: "2024-01-07T10:30:00Z",
    results: 45,
    sessionId: "sess_123",
  },
  {
    id: 2,
    type: "click",
    query: "laptop",
    productName: "MacBook Pro 16-inch",
    position: 1,
    timestamp: "2024-01-07T10:25:00Z",
    sessionId: "sess_456",
  },
  {
    id: 3,
    type: "view",
    productName: "iPhone 15 Pro",
    timestamp: "2024-01-07T10:20:00Z",
    sessionId: "sess_789",
  },
  {
    id: 4,
    type: "conversion",
    productName: "AirPods Pro",
    timestamp: "2024-01-07T10:15:00Z",
    sessionId: "sess_321",
  },
];

export default function InstantSearchPage() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [embedCode, setEmbedCode] = useState("");
  const { toast } = useToast();

  const generateEmbedCode = () => {
    const code = `<!-- Epesi Instant Search Widget -->
<div id="epesi-instant-search"></div>
<script>
  window.EpesiSearch = {
    containerId: 'epesi-instant-search',
    apiKey: 'your-api-key-here',
    tenantId: 'your-tenant-id',
    theme: 'modern',
    facets: ['has_offers', 'is_featured', 'product_type', 'product_category'],
    views: ['list', 'grid', 'detail'],
    placeholder: 'Search products...',
    showResults: true,
    maxResults: 20
  };
</script>
<script src="https://cdn.epesi.com/instant-search/v1/widget.js"></script>
<link rel="stylesheet" href="https://cdn.epesi.com/instant-search/v1/widget.css">`;
    
    setEmbedCode(code);
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Success",
      description: "Embed code copied to clipboard",
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Instant Search</h1>
          <p className="text-slate-600 mt-2">
            Algolia-style instant search with analytics and embeddable widgets
          </p>
        </div>
        <Button onClick={generateEmbedCode}>
          <Code className="w-4 h-4 mr-2" />
          Generate Embed Code
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,485</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click-through Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.3%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.8%</div>
                <p className="text-xs text-muted-foreground">
                  +0.7% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4m 32s</div>
                <p className="text-xs text-muted-foreground">
                  +18s from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Search Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockSearchData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="searches" stroke="#8884d8" name="Searches" />
                  <Line type="monotone" dataKey="clicks" stroke="#82ca9d" name="Clicks" />
                  <Line type="monotone" dataKey="conversions" stroke="#ffc658" name="Conversions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Search Queries */}
            <Card>
              <CardHeader>
                <CardTitle>Top Search Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTopQueries.map((query, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{query.query}</p>
                        <p className="text-sm text-slate-500">{query.searches} searches</p>
                      </div>
                      <Badge variant="secondary">{query.ctr}% CTR</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Event Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockEventTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockEventTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Search Events</CardTitle>
              <p className="text-sm text-slate-600">
                Real-time events from your instant search widget
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentEvents.map((event) => (
                  <div key={event.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            event.type === "search" ? "default" :
                            event.type === "click" ? "secondary" :
                            event.type === "view" ? "outline" : "destructive"
                          }
                        >
                          {event.type}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Session: {event.sessionId}
                      </span>
                    </div>
                    
                    {event.type === "search" && (
                      <div>
                        <p className="font-medium">Query: "{event.query}"</p>
                        <p className="text-sm text-slate-600">{event.results} results found</p>
                      </div>
                    )}
                    
                    {event.type === "click" && (
                      <div>
                        <p className="font-medium">Clicked: {event.productName}</p>
                        <p className="text-sm text-slate-600">
                          Position {event.position} for query "{event.query}"
                        </p>
                      </div>
                    )}
                    
                    {(event.type === "view" || event.type === "conversion") && (
                      <div>
                        <p className="font-medium">Product: {event.productName}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Widget Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Search Widget Preview</CardTitle>
                <p className="text-sm text-slate-600">
                  Live preview of your instant search widget
                </p>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="text-left p-3 border border-slate-100 rounded">
                        <div className="font-medium">Wireless Headphones</div>
                        <div className="text-sm text-slate-600">Premium audio experience</div>
                        <div className="text-sm font-semibold text-green-600">$299.99</div>
                      </div>
                      <div className="text-left p-3 border border-slate-100 rounded">
                        <div className="font-medium">Laptop Pro 15"</div>
                        <div className="text-sm text-slate-600">High-performance laptop</div>
                        <div className="text-sm font-semibold text-green-600">$1,999.99</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Embed Code */}
            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
                <p className="text-sm text-slate-600">
                  Copy this code to embed the search widget on your website
                </p>
              </CardHeader>
              <CardContent>
                {embedCode ? (
                  <div className="space-y-4">
                    <pre className="bg-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                      <code>{embedCode}</code>
                    </pre>
                    <Button onClick={copyEmbedCode} className="w-full">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">
                      Click "Generate Embed Code" to create your widget code
                    </p>
                    <Button onClick={generateEmbedCode}>
                      <Code className="w-4 h-4 mr-2" />
                      Generate Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}