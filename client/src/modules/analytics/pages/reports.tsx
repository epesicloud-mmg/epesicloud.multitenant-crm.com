import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Calendar, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: number;
  name: string;
  description: string;
  type: 'sales' | 'financial' | 'operational' | 'custom';
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'excel' | 'csv';
  lastRun: string;
  nextRun?: string;
  status: 'active' | 'inactive' | 'running' | 'failed';
  createdBy: string;
  recipients: string[];
}

export default function ReportsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [reportForm, setReportForm] = useState({
    name: '',
    description: '',
    type: '',
    schedule: '',
    format: '',
    recipients: ''
  });

  const { toast } = useToast();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['/api/analytics/reports'],
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['/api/analytics/report-templates'],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      running: { color: 'bg-blue-100 text-blue-800', label: 'Running' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      sales: 'bg-blue-100 text-blue-800',
      financial: 'bg-green-100 text-green-800',
      operational: 'bg-purple-100 text-purple-800',
      custom: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const filteredReports = reports.filter((report: Report) => 
    selectedFilter === 'all' || report.type === selectedFilter
  );

  const mockReports: Report[] = [
    {
      id: 1,
      name: 'Monthly Sales Report',
      description: 'Comprehensive monthly sales performance analysis',
      type: 'sales',
      schedule: 'monthly',
      format: 'pdf',
      lastRun: '2024-01-15T10:00:00Z',
      nextRun: '2024-02-15T10:00:00Z',
      status: 'active',
      createdBy: 'John Doe',
      recipients: ['manager@company.com', 'sales@company.com']
    },
    {
      id: 2,
      name: 'Financial Summary',
      description: 'Weekly financial performance and cash flow analysis',
      type: 'financial',
      schedule: 'weekly',
      format: 'excel',
      lastRun: '2024-01-12T09:00:00Z',
      nextRun: '2024-01-19T09:00:00Z',
      status: 'active',
      createdBy: 'Jane Smith',
      recipients: ['cfo@company.com', 'finance@company.com']
    },
    {
      id: 3,
      name: 'Operational Metrics',
      description: 'Daily operational KPIs and system performance',
      type: 'operational',
      schedule: 'daily',
      format: 'csv',
      lastRun: '2024-01-15T08:00:00Z',
      nextRun: '2024-01-16T08:00:00Z',
      status: 'running',
      createdBy: 'Mike Johnson',
      recipients: ['ops@company.com']
    },
    {
      id: 4,
      name: 'Custom Dashboard Export',
      description: 'Custom analytics dashboard data export',
      type: 'custom',
      schedule: 'manual',
      format: 'pdf',
      lastRun: '2024-01-10T14:30:00Z',
      status: 'inactive',
      createdBy: 'Sarah Wilson',
      recipients: ['analytics@company.com']
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
          <h1 className="text-2xl font-bold">Analytics Reports</h1>
          <p className="text-muted-foreground">Create, schedule, and manage automated reports</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>Set up a new automated report</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Report Name</Label>
                  <Input
                    id="name"
                    value={reportForm.name}
                    onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                    placeholder="e.g., Monthly Sales Report"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Brief description of the report"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Report Type</Label>
                    <Select value={reportForm.type} onValueChange={(value) => setReportForm({ ...reportForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule</Label>
                    <Select value={reportForm.schedule} onValueChange={(value) => setReportForm({ ...reportForm, schedule: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select value={reportForm.format} onValueChange={(value) => setReportForm({ ...reportForm, format: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipients">Recipients</Label>
                    <Input
                      id="recipients"
                      value={reportForm.recipients}
                      onChange={(e) => setReportForm({ ...reportForm, recipients: e.target.value })}
                      placeholder="email1@company.com, email2@company.com"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({ title: 'Success', description: 'Report created successfully' });
                  setIsCreateDialogOpen(false);
                }}>
                  Create Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="filter">Type:</Label>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReports.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All reports</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockReports.filter(r => r.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockReports.filter(r => r.schedule !== 'manual').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Automated reports</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground mt-1">Reports generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>Manage your automated reports and schedules</CardDescription>
        </CardHeader>
        <CardContent>
          {mockReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports found.</p>
              <p className="text-sm mt-2">Create your first automated report to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReports.map((report: Report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {report.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(report.type)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.schedule.charAt(0).toUpperCase() + report.schedule.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.lastRun), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell>
                        {report.nextRun ? format(new Date(report.nextRun), 'MMM dd, HH:mm') : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.createdBy}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}