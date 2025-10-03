import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Database, Mail, Bell, Lock, Clock, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SystemSetting {
  id: string;
  category: string;
  name: string;
  description: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  isSystem: boolean;
  lastUpdated: string;
}

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  email: boolean;
  inApp: boolean;
  sms: boolean;
}

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  value: any;
  type: string;
}

export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: systemSettings = [], isLoading } = useQuery({
    queryKey: ['/api/aam/settings/system'],
  });

  const { data: notificationSettings = [] } = useQuery({
    queryKey: ['/api/aam/settings/notifications'],
  });

  const { data: securitySettings = [] } = useQuery({
    queryKey: ['/api/aam/settings/security'],
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/aam/settings', { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/aam/settings'] });
      setHasUnsavedChanges(false);
      toast({ title: 'Success', description: 'Settings saved successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const mockSystemSettings: SystemSetting[] = [
    {
      id: 'app_name',
      category: 'general',
      name: 'Application Name',
      description: 'The name of your application displayed throughout the system',
      value: 'Epesicloud',
      type: 'string',
      isSystem: false,
      lastUpdated: '2024-01-15T10:00:00Z'
    },
    {
      id: 'app_description',
      category: 'general',
      name: 'Application Description',
      description: 'Brief description of your application',
      value: 'Comprehensive multi-tenant enterprise platform',
      type: 'string',
      isSystem: false,
      lastUpdated: '2024-01-15T10:00:00Z'
    },
    {
      id: 'session_timeout',
      category: 'security',
      name: 'Session Timeout',
      description: 'Time in minutes before inactive sessions expire',
      value: 60,
      type: 'number',
      isSystem: false,
      lastUpdated: '2024-01-15T10:00:00Z'
    },
    {
      id: 'max_login_attempts',
      category: 'security',
      name: 'Max Login Attempts',
      description: 'Maximum failed login attempts before account lockout',
      value: 5,
      type: 'number',
      isSystem: false,
      lastUpdated: '2024-01-15T10:00:00Z'
    },
    {
      id: 'enable_2fa',
      category: 'security',
      name: 'Two-Factor Authentication',
      description: 'Require two-factor authentication for all users',
      value: false,
      type: 'boolean',
      isSystem: false,
      lastUpdated: '2024-01-15T10:00:00Z'
    },
    {
      id: 'backup_frequency',
      category: 'backup',
      name: 'Backup Frequency',
      description: 'How often to perform automated backups',
      value: 'daily',
      type: 'select',
      options: ['hourly', 'daily', 'weekly', 'monthly'],
      isSystem: false,
      lastUpdated: '2024-01-15T10:00:00Z'
    },
    {
      id: 'backup_retention',
      category: 'backup',
      name: 'Backup Retention',
      description: 'Number of days to retain backup files',
      value: 30,
      type: 'number',
      isSystem: false,
      lastUpdated: '2024-01-15T10:00:00Z'
    }
  ];

  const mockNotificationSettings: NotificationSetting[] = [
    {
      id: 'security_alerts',
      name: 'Security Alerts',
      description: 'Failed login attempts and suspicious activity',
      email: true,
      inApp: true,
      sms: false
    },
    {
      id: 'system_maintenance',
      name: 'System Maintenance',
      description: 'Scheduled maintenance and system updates',
      email: true,
      inApp: true,
      sms: false
    },
    {
      id: 'backup_status',
      name: 'Backup Status',
      description: 'Backup completion and failure notifications',
      email: true,
      inApp: false,
      sms: false
    },
    {
      id: 'user_activity',
      name: 'User Activity',
      description: 'New user registrations and role changes',
      email: false,
      inApp: true,
      sms: false
    }
  ];

  const mockSecuritySettings: SecuritySetting[] = [
    {
      id: 'password_complexity',
      name: 'Password Complexity',
      description: 'Enforce strong password requirements',
      enabled: true,
      value: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      type: 'object'
    },
    {
      id: 'login_rate_limiting',
      name: 'Login Rate Limiting',
      description: 'Limit login attempts to prevent brute force attacks',
      enabled: true,
      value: {
        maxAttempts: 5,
        windowMinutes: 15,
        lockoutMinutes: 30
      },
      type: 'object'
    },
    {
      id: 'ip_whitelist',
      name: 'IP Address Whitelist',
      description: 'Restrict access to specific IP addresses',
      enabled: false,
      value: {
        enabled: false,
        addresses: ['192.168.1.0/24']
      },
      type: 'object'
    }
  ];

  const renderSettingInput = (setting: SystemSetting, value: any, onChange: (value: any) => void) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => {
              onChange(checked);
              setHasUnsavedChanges(true);
            }}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              onChange(parseInt(e.target.value) || 0);
              setHasUnsavedChanges(true);
            }}
            className="w-32"
          />
        );
      case 'select':
        return (
          <Select value={value} onValueChange={(newValue) => {
            onChange(newValue);
            setHasUnsavedChanges(true);
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setHasUnsavedChanges(true);
            }}
            className="max-w-md"
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AAM Settings</h1>
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
          <h1 className="text-2xl font-bold">AAM Settings</h1>
          <p className="text-muted-foreground">Configure system settings, security policies, and notifications</p>
        </div>
        <div className="flex space-x-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button
            onClick={() => saveSettingsMutation.mutate({})}
            disabled={!hasUnsavedChanges || saveSettingsMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Application Settings
              </CardTitle>
              <CardDescription>Configure basic application properties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockSystemSettings
                .filter(setting => setting.category === 'general')
                .map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{setting.name}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last updated: {new Date(setting.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderSettingInput(setting, setting.value, () => {})}
                      {setting.isSystem && <Badge variant="outline">System</Badge>}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Configuration
              </CardTitle>
              <CardDescription>Configure security policies and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockSystemSettings
                .filter(setting => setting.category === 'security')
                .map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{setting.name}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderSettingInput(setting, setting.value, () => {})}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Advanced Security Policies
              </CardTitle>
              <CardDescription>Configure advanced security features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockSecuritySettings.map((setting) => (
                <div key={setting.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">{setting.name}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => setHasUnsavedChanges(true)}
                    />
                  </div>
                  
                  {setting.enabled && setting.type === 'object' && (
                    <div className="pl-4 border-l-2 border-blue-200 space-y-2">
                      {Object.entries(setting.value).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4 pb-4 border-b">
                  <div className="font-medium">Notification Type</div>
                  <div className="text-center font-medium">Email</div>
                  <div className="text-center font-medium">In-App</div>
                  <div className="text-center font-medium">SMS</div>
                </div>
                
                {mockNotificationSettings.map((setting) => (
                  <div key={setting.id} className="grid grid-cols-4 gap-4 items-center">
                    <div>
                      <div className="font-medium">{setting.name}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                    </div>
                    <div className="text-center">
                      <Switch
                        checked={setting.email}
                        onCheckedChange={() => setHasUnsavedChanges(true)}
                      />
                    </div>
                    <div className="text-center">
                      <Switch
                        checked={setting.inApp}
                        onCheckedChange={() => setHasUnsavedChanges(true)}
                      />
                    </div>
                    <div className="text-center">
                      <Switch
                        checked={setting.sms}
                        onCheckedChange={() => setHasUnsavedChanges(true)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure SMTP settings for email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    placeholder="smtp.example.com"
                    onChange={() => setHasUnsavedChanges(true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    placeholder="587"
                    onChange={() => setHasUnsavedChanges(true)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">Username</Label>
                  <Input
                    id="smtp-username"
                    placeholder="your-email@example.com"
                    onChange={() => setHasUnsavedChanges(true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Password</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    placeholder="••••••••"
                    onChange={() => setHasUnsavedChanges(true)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch onChange={() => setHasUnsavedChanges(true)} />
                <Label>Use SSL/TLS encryption</Label>
              </div>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Backup Configuration
              </CardTitle>
              <CardDescription>Configure automated backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockSystemSettings
                .filter(setting => setting.category === 'backup')
                .map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{setting.name}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderSettingInput(setting, setting.value, () => {})}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Backup Status
              </CardTitle>
              <CardDescription>Monitor backup operations and history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Last Backup</div>
                  <div className="text-lg font-bold">2 hours ago</div>
                  <div className="text-sm text-green-600">Successful</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Next Backup</div>
                  <div className="text-lg font-bold">22 hours</div>
                  <div className="text-sm text-muted-foreground">Scheduled</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Backup Size</div>
                  <div className="text-lg font-bold">2.4 GB</div>
                  <div className="text-sm text-muted-foreground">Compressed</div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button>
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup Now
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}