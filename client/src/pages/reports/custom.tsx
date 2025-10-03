import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, BarChart, PieChart as PieChartIcon, LineChart } from "lucide-react";
import type { Deal, Contact, Activity, Company } from "@shared/schema";

export default function CustomReports() {
  const [reportType, setReportType] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("last30");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<string>("");

  const { data: deals } = useQuery({ queryKey: ["/api/deals"] });
  const { data: contacts } = useQuery({ queryKey: ["/api/contacts"] });
  const { data: activities } = useQuery({ queryKey: ["/api/activities"] });
  const { data: companies } = useQuery({ queryKey: ["/api/companies"] });

  const dealsData = (deals as Deal[]) || [];
  const contactsData = (contacts as Contact[]) || [];
  const activitiesData = (activities as Activity[]) || [];
  const companiesData = (companies as Company[]) || [];

  const reportTypes = [
    { value: "sales-funnel", label: "Sales Funnel Analysis" },
    { value: "contact-engagement", label: "Contact Engagement" },
    { value: "deal-velocity", label: "Deal Velocity" },
    { value: "activity-analysis", label: "Activity Analysis" },
    { value: "company-performance", label: "Company Performance" }
  ];

  const availableMetrics = [
    { id: "total-revenue", label: "Total Revenue" },
    { id: "deal-count", label: "Deal Count" },
    { id: "conversion-rate", label: "Conversion Rate" },
    { id: "avg-deal-size", label: "Average Deal Size" },
    { id: "activity-count", label: "Activity Count" },
    { id: "contact-count", label: "Contact Count" }
  ];

  const groupByOptions = [
    { value: "month", label: "By Month" },
    { value: "quarter", label: "By Quarter" },
    { value: "stage", label: "By Deal Stage" },
    { value: "company", label: "By Company" },
    { value: "user", label: "By User" }
  ];

  // Generate report data based on selections
  const generateReportData = () => {
    if (!reportType) return [];

    switch (reportType) {
      case "sales-funnel":
        return dealsData.reduce((acc: any[], deal) => {
          const month = new Date(deal.createdAt).toLocaleDateString('en-US', { month: 'short' });
          const existing = acc.find(item => item.month === month);
          if (existing) {
            existing.deals += 1;
            existing.revenue += parseFloat(deal.value);
          } else {
            acc.push({ month, deals: 1, revenue: parseFloat(deal.value) });
          }
          return acc;
        }, []);

      case "contact-engagement":
        return contactsData.map(contact => {
          const contactActivities = activitiesData.filter(a => a.contactId === contact.id);
          return {
            contact: `${contact.firstName} ${contact.lastName}`,
            activities: contactActivities.length,
            lastActivity: contactActivities.length > 0 
              ? new Date(Math.max(...contactActivities.map(a => new Date(a.createdAt).getTime()))).toLocaleDateString()
              : 'No activity'
          };
        });

      case "activity-analysis":
        const activityTypes = ['call', 'email', 'meeting', 'note'];
        return activityTypes.map(type => ({
          type,
          count: activitiesData.filter(a => a.type === type).length
        }));

      default:
        return [];
    }
  };

  const reportData = generateReportData();

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(reportData[0] || {}).join(",") + "\n" +
      reportData.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Custom Reports</h1>
          <p className="text-slate-600">
            Build and customize reports to analyze your business data
          </p>
        </div>

        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>
              Configure your custom report settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7">Last 7 days</SelectItem>
                    <SelectItem value="last30">Last 30 days</SelectItem>
                    <SelectItem value="last90">Last 90 days</SelectItem>
                    <SelectItem value="last365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="groupBy">Group By</Label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupByOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={exportReport} disabled={!reportType} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div>
              <Label>Metrics to Include</Label>
              <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-6 mt-2">
                {availableMetrics.map(metric => (
                  <div key={metric.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMetrics([...selectedMetrics, metric.id]);
                        } else {
                          setSelectedMetrics(selectedMetrics.filter(m => m !== metric.id));
                        }
                      }}
                    />
                    <Label htmlFor={metric.id} className="text-sm">
                      {metric.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Results */}
        {reportType && reportData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart className="h-5 w-5" />
                <span>Report Results</span>
              </CardTitle>
              <CardDescription>
                {reportTypes.find(t => t.value === reportType)?.label} - {reportData.length} records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {item.contact || item.company || item.deal || item.type || item.month}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reportType === "contact-engagement" && `${item.activities} activities • Last: ${item.lastActivity}`}
                        {reportType === "company-performance" && `${item.deals} deals • ${item.contacts} contacts`}
                        {reportType === "deal-velocity" && `${item.days} days in pipeline • $${item.value?.toLocaleString()}`}
                        {reportType === "activity-analysis" && `${item.count} activities recorded`}
                        {reportType === "sales-funnel" && `${item.deals} deals • $${item.revenue?.toLocaleString()} revenue`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Reports</CardTitle>
            <CardDescription>
              Your previously saved custom reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <PieChartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No saved reports</h3>
              <p className="mt-1 text-sm text-gray-500">
                Save your custom reports to access them later
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}