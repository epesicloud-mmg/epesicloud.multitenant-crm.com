import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Lock, Plus, Edit, Trash2, Users, Settings, Eye, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
  isSystem: boolean;
  createdAt: string;
  assignedRoles: number;
  assignedUsers: number;
}

interface PermissionGroup {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
}

export default function PermissionsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [permissionForm, setPermissionForm] = useState({
    name: '',
    description: '',
    resource: '',
    action: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['/api/aam/permissions'],
  });

  const { data: permissionGroups = [] } = useQuery({
    queryKey: ['/api/aam/permission-groups'],
  });

  const createPermissionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/aam/permissions', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/aam/permissions'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: 'Success', description: 'Permission created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setPermissionForm({
      name: '',
      description: '',
      resource: '',
      action: ''
    });
  };

  const mockPermissions: Permission[] = [
    {
      id: 1,
      name: 'manage_users',
      description: 'Create, update, and delete users',
      resource: 'users',
      action: 'manage',
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z',
      assignedRoles: 2,
      assignedUsers: 5
    },
    {
      id: 2,
      name: 'view_reports',
      description: 'View all system reports and analytics',
      resource: 'reports',
      action: 'view',
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z',
      assignedRoles: 4,
      assignedUsers: 15
    },
    {
      id: 3,
      name: 'edit_deals',
      description: 'Create and modify deals in CRM',
      resource: 'deals',
      action: 'edit',
      isSystem: false,
      createdAt: '2024-01-02T00:00:00Z',
      assignedRoles: 3,
      assignedUsers: 8
    },
    {
      id: 4,
      name: 'approve_expenses',
      description: 'Approve expense reports and reimbursements',
      resource: 'expenses',
      action: 'approve',
      isSystem: false,
      createdAt: '2024-01-03T00:00:00Z',
      assignedRoles: 2,
      assignedUsers: 3
    }
  ];

  const mockGroups: PermissionGroup[] = [
    {
      id: 1,
      name: 'User Management',
      description: 'Permissions related to user administration',
      permissions: mockPermissions.filter(p => p.resource === 'users'),
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 2,
      name: 'CRM Operations',
      description: 'CRM-related permissions and operations',
      permissions: mockPermissions.filter(p => p.resource === 'deals'),
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 3,
      name: 'Financial Controls',
      description: 'Financial and expense management permissions',
      permissions: mockPermissions.filter(p => p.resource === 'expenses'),
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 4,
      name: 'Reporting & Analytics',
      description: 'Permissions for reports and analytics access',
      permissions: mockPermissions.filter(p => p.resource === 'reports'),
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  const getResourceBadge = (resource: string) => {
    const resourceColors = {
      users: 'bg-blue-100 text-blue-800',
      deals: 'bg-green-100 text-green-800',
      reports: 'bg-purple-100 text-purple-800',
      expenses: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={resourceColors[resource as keyof typeof resourceColors] || 'bg-gray-100 text-gray-800'}>
        {resource.charAt(0).toUpperCase() + resource.slice(1)}
      </Badge>
    );
  };

  const getActionIcon = (action: string) => {
    const icons = {
      view: Eye,
      edit: Edit,
      manage: Settings,
      approve: Check,
      delete: Trash2
    };
    
    const Icon = icons[action as keyof typeof icons] || Shield;
    return <Icon className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Permissions Management</h1>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Permissions Management</h1>
          <p className="text-muted-foreground">Manage system permissions and access controls</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Permission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Permission</DialogTitle>
                <DialogDescription>Define a new system permission</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createPermissionMutation.mutate(permissionForm); }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Permission Name</Label>
                    <Input
                      id="name"
                      value={permissionForm.name}
                      onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                      placeholder="e.g., manage_users"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={permissionForm.description}
                      onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                      placeholder="Brief description of what this permission allows"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resource">Resource</Label>
                      <Input
                        id="resource"
                        value={permissionForm.resource}
                        onChange={(e) => setPermissionForm({ ...permissionForm, resource: e.target.value })}
                        placeholder="e.g., users, deals, reports"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="action">Action</Label>
                      <Input
                        id="action"
                        value={permissionForm.action}
                        onChange={(e) => setPermissionForm({ ...permissionForm, action: e.target.value })}
                        placeholder="e.g., view, edit, manage"
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPermissionMutation.isPending}>
                    Create Permission
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Permission Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Shield className="h-4 w-4 inline mr-2" />
              Total Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPermissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">System permissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Lock className="h-4 w-4 inline mr-2" />
              System Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPermissions.filter(p => p.isSystem).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Built-in permissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4 inline mr-2" />
              Custom Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPermissions.filter(p => !p.isSystem).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">User-defined permissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Settings className="h-4 w-4 inline mr-2" />
              Permission Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGroups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Organized groups</p>
          </CardContent>
        </Card>
      </div>

      {/* Permission Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{group.name}</span>
                <Badge className={group.color}>
                  {group.permissions.length} permissions
                </Badge>
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getActionIcon(permission.action)}
                      <div>
                        <div className="font-medium text-sm">{permission.name}</div>
                        <div className="text-xs text-muted-foreground">{permission.description}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {permission.assignedRoles} roles, {permission.assignedUsers} users
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All System Permissions</CardTitle>
          <CardDescription>Complete list of permissions with assignment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assigned Roles</TableHead>
                  <TableHead>Assigned Users</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {permission.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getResourceBadge(permission.resource)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(permission.action)}
                        <span className="capitalize">{permission.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={permission.isSystem ? 'default' : 'secondary'}>
                        {permission.isSystem ? 'System' : 'Custom'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{permission.assignedRoles} roles</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{permission.assignedUsers} users</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(permission.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!permission.isSystem && (
                          <>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}