import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Eye, AlertTriangle, UserCheck, Clock, Activity, Search } from 'lucide-react';

interface AccessRule {
  id: number;
  resource: string;
  action: string;
  condition: string;
  effect: 'allow' | 'deny';
  priority: number;
  isActive: boolean;
  createdAt: string;
  lastApplied?: string;
  appliedCount: number;
}

interface AccessLog {
  id: number;
  userId: number;
  userName: string;
  resource: string;
  action: string;
  result: 'granted' | 'denied';
  reason: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

interface SecurityPolicy {
  id: number;
  name: string;
  description: string;
  type: 'password' | 'session' | 'access' | 'audit';
  isEnabled: boolean;
  settings: Record<string, any>;
  lastUpdated: string;
}

export default function AccessControlPage() {
  const [selectedTab, setSelectedTab] = useState('rules');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');

  const { data: accessRules = [], isLoading } = useQuery({
    queryKey: ['/api/aam/access-rules'],
  });

  const { data: accessLogs = [] } = useQuery({
    queryKey: ['/api/aam/access-logs'],
  });

  const { data: securityPolicies = [] } = useQuery({
    queryKey: ['/api/aam/security-policies'],
  });

  const { data: accessStats } = useQuery({
    queryKey: ['/api/aam/access-stats'],
  });

  const mockAccessRules: AccessRule[] = [
    {
      id: 1,
      resource: 'financial-reports',
      action: 'view',
      condition: 'role.level >= 5 AND department = "Finance"',
      effect: 'allow',
      priority: 100,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastApplied: '2024-01-15T10:30:00Z',
      appliedCount: 45
    },
    {
      id: 2,
      resource: 'user-management',
      action: 'modify',
      condition: 'role.name = "Administrator"',
      effect: 'allow',
      priority: 200,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastApplied: '2024-01-15T09:15:00Z',
      appliedCount: 12
    },
    {
      id: 3,
      resource: 'sensitive-data',
      action: 'export',
      condition: 'time.hour >= 9 AND time.hour <= 17',
      effect: 'deny',
      priority: 300,
      isActive: true,
      createdAt: '2024-01-02T00:00:00Z',
      lastApplied: '2024-01-15T08:45:00Z',
      appliedCount: 3
    },
    {
      id: 4,
      resource: 'deals',
      action: 'delete',
      condition: 'user.id != resource.owner_id',
      effect: 'deny',
      priority: 150,
      isActive: true,
      createdAt: '2024-01-03T00:00:00Z',
      lastApplied: '2024-01-14T16:20:00Z',
      appliedCount: 28
    }
  ];

  const mockAccessLogs: AccessLog[] = [
    {
      id: 1,
      userId: 101,
      userName: 'John Doe',
      resource: 'financial-reports',
      action: 'view',
      result: 'granted',
      reason: 'Access rule #1 matched',
      timestamp: '2024-01-15T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0'
    },
    {
      id: 2,
      userId: 102,
      userName: 'Jane Smith',
      resource: 'user-management',
      action: 'modify',
      result: 'denied',
      reason: 'Insufficient role level',
      timestamp: '2024-01-15T10:25:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Firefox/121.0'
    },
    {
      id: 3,
      userId: 103,
      userName: 'Mike Johnson',
      resource: 'sensitive-data',
      action: 'export',
      result: 'denied',
      reason: 'Outside business hours',
      timestamp: '2024-01-15T08:45:00Z',
      ipAddress: '192.168.1.102',
      userAgent: 'Safari/17.0'
    },
    {
      id: 4,
      userId: 104,
      userName: 'Sarah Wilson',
      resource: 'deals',
      action: 'edit',
      result: 'granted',
      reason: 'Resource owner access',
      timestamp: '2024-01-15T09:15:00Z',
      ipAddress: '192.168.1.103',
      userAgent: 'Chrome/120.0'
    }
  ];

  const mockSecurityPolicies: SecurityPolicy[] = [
    {
      id: 1,
      name: 'Password Policy',
      description: 'Enforce strong password requirements',
      type: 'password',
      isEnabled: true,
      settings: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90
      },
      lastUpdated: '2024-01-15T00:00:00Z'
    },
    {
      id: 2,
      name: 'Session Management',
      description: 'Control user session behavior',
      type: 'session',
      isEnabled: true,
      settings: {
        maxDuration: 480, // 8 hours
        idleTimeout: 60, // 1 hour
        concurrentSessions: 3,
        requireReauth: true
      },
      lastUpdated: '2024-01-14T00:00:00Z'
    },
    {
      id: 3,
      name: 'Access Monitoring',
      description: 'Monitor and log access attempts',
      type: 'audit',
      isEnabled: true,
      settings: {
        logSuccessfulAttempts: true,
        logFailedAttempts: true,
        alertOnSuspicious: true,
        retentionDays: 365
      },
      lastUpdated: '2024-01-13T00:00:00Z'
    }
  ];

  const getEffectBadge = (effect: string) => {
    return effect === 'allow' ? (
      <Badge className="bg-green-100 text-green-800">Allow</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Deny</Badge>
    );
  };

  const getResultBadge = (result: string) => {
    return result === 'granted' ? (
      <Badge className="bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 mr-1" />
        Granted
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <Lock className="h-3 w-3 mr-1" />
        Denied
      </Badge>
    );
  };

  const getPolicyTypeBadge = (type: string) => {
    const typeConfig = {
      password: { color: 'bg-blue-100 text-blue-800', label: 'Password' },
      session: { color: 'bg-purple-100 text-purple-800', label: 'Session' },
      access: { color: 'bg-green-100 text-green-800', label: 'Access' },
      audit: { color: 'bg-orange-100 text-orange-800', label: 'Audit' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: type };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredLogs = mockAccessLogs.filter((log) => {
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesResource = selectedResource === 'all' || log.resource === selectedResource;
    const matchesResult = selectedResult === 'all' || log.result === selectedResult;
    
    return matchesSearch && matchesResource && matchesResult;
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Access Control</h1>
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

  const mockStats = {
    totalRequests: 1247,
    granted: 1089,
    denied: 158,
    activeRules: 4
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Access Control & Security</h1>
          <p className="text-muted-foreground">Manage access rules, monitor security, and configure policies</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            View Activity
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Security Report
          </Button>
        </div>
      </div>

      {/* Access Control Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4 inline mr-2" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <UserCheck className="h-4 w-4 inline mr-2" />
              Granted Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.granted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((mockStats.granted / mockStats.totalRequests) * 100)}% success rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Lock className="h-4 w-4 inline mr-2" />
              Denied Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockStats.denied.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Security blocks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Shield className="h-4 w-4 inline mr-2" />
              Active Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeRules}</div>
            <p className="text-xs text-muted-foreground mt-1">Access control rules</p>
          </CardContent>
        </Card>
      </div>

      {/* Access Control Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Access Rules</TabsTrigger>
          <TabsTrigger value="logs">Access Logs</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Rules</CardTitle>
              <CardDescription>Define rules that control access to system resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Effect</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAccessRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <Badge variant="outline">{rule.resource}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{rule.action}</TableCell>
                        <TableCell className="max-w-xs truncate" title={rule.condition}>
                          {rule.condition}
                        </TableCell>
                        <TableCell>{getEffectBadge(rule.effect)}</TableCell>
                        <TableCell>{rule.priority}</TableCell>
                        <TableCell>{rule.appliedCount} times</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch checked={rule.isActive} />
                            <span className="text-sm">
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Access Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by user, resource, or action..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="resource-filter">Resource</Label>
                  <Select value={selectedResource} onValueChange={setSelectedResource}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      <SelectItem value="financial-reports">Financial Reports</SelectItem>
                      <SelectItem value="user-management">User Management</SelectItem>
                      <SelectItem value="sensitive-data">Sensitive Data</SelectItem>
                      <SelectItem value="deals">Deals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="result-filter">Result</Label>
                  <Select value={selectedResult} onValueChange={setSelectedResult}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Results</SelectItem>
                      <SelectItem value="granted">Granted</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Logs</CardTitle>
              <CardDescription>Recent access attempts and their outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No access logs found matching your criteria.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.userName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.resource}</Badge>
                          </TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{getResultBadge(log.result)}</TableCell>
                          <TableCell className="max-w-xs truncate" title={log.reason}>
                            {log.reason}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span className="text-sm">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockSecurityPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{policy.name}</span>
                        {getPolicyTypeBadge(policy.type)}
                      </CardTitle>
                      <CardDescription className="mt-1">{policy.description}</CardDescription>
                    </div>
                    <Switch checked={policy.isEnabled} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {policy.type === 'password' && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>Min Length: {policy.settings.minLength}</div>
                        <div>Max Age: {policy.settings.maxAge} days</div>
                        <div>Uppercase: {policy.settings.requireUppercase ? '✓' : '✗'}</div>
                        <div>Numbers: {policy.settings.requireNumbers ? '✓' : '✗'}</div>
                      </div>
                    )}
                    
                    {policy.type === 'session' && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>Max Duration: {policy.settings.maxDuration}m</div>
                        <div>Idle Timeout: {policy.settings.idleTimeout}m</div>
                        <div>Concurrent: {policy.settings.concurrentSessions}</div>
                        <div>Require Reauth: {policy.settings.requireReauth ? '✓' : '✗'}</div>
                      </div>
                    )}
                    
                    {policy.type === 'audit' && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>Log Success: {policy.settings.logSuccessfulAttempts ? '✓' : '✗'}</div>
                        <div>Log Failed: {policy.settings.logFailedAttempts ? '✓' : '✗'}</div>
                        <div>Alert Suspicious: {policy.settings.alertOnSuspicious ? '✓' : '✗'}</div>
                        <div>Retention: {policy.settings.retentionDays} days</div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                      </span>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}