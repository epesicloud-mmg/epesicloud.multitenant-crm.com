import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Shield, Plus, Edit, Trash2, Users, Crown, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Role {
  id: number;
  name: string;
  description: string;
  level: number;
  isSystem: boolean;
  isActive: boolean;
  userCount: number;
  permissions: string[];
  createdAt: string;
  color: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export default function RoleManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    level: 1,
    isActive: true,
    selectedPermissions: [] as string[]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['/api/aam/roles'],
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['/api/aam/permissions'],
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/aam/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/aam/roles'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: 'Success', description: 'Role created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await fetch(`/api/aam/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/aam/roles'] });
      setIsEditDialogOpen(false);
      setEditingRole(null);
      resetForm();
      toast({ title: 'Success', description: 'Role updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/aam/roles/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/aam/roles'] });
      toast({ title: 'Success', description: 'Role deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setRoleForm({
      name: '',
      description: '',
      level: 1,
      isActive: true,
      selectedPermissions: []
    });
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      level: role.level,
      isActive: role.isActive,
      selectedPermissions: role.permissions
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      deleteRoleMutation.mutate(id);
    }
  };

  const togglePermission = (permissionName: string) => {
    setRoleForm(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionName)
        ? prev.selectedPermissions.filter(p => p !== permissionName)
        : [...prev.selectedPermissions, permissionName]
    }));
  };

  const mockRoles: Role[] = [
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access with all permissions',
      level: 10,
      isSystem: true,
      isActive: true,
      userCount: 2,
      permissions: ['manage_users', 'view_reports', 'edit_deals', 'approve_expenses', 'system_settings'],
      createdAt: '2024-01-01T00:00:00Z',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 2,
      name: 'Sales Manager',
      description: 'Manage sales team and deals',
      level: 7,
      isSystem: false,
      isActive: true,
      userCount: 5,
      permissions: ['edit_deals', 'view_reports', 'manage_team'],
      createdAt: '2024-01-01T00:00:00Z',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 3,
      name: 'Accountant',
      description: 'Financial operations and reporting',
      level: 6,
      isSystem: false,
      isActive: true,
      userCount: 3,
      permissions: ['approve_expenses', 'view_reports', 'financial_records'],
      createdAt: '2024-01-02T00:00:00Z',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 4,
      name: 'Sales Agent',
      description: 'Basic sales operations',
      level: 3,
      isSystem: false,
      isActive: true,
      userCount: 12,
      permissions: ['view_deals', 'create_leads'],
      createdAt: '2024-01-02T00:00:00Z',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 5,
      name: 'Read-only User',
      description: 'View-only access to reports',
      level: 1,
      isSystem: false,
      isActive: true,
      userCount: 8,
      permissions: ['view_reports'],
      createdAt: '2024-01-03T00:00:00Z',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  const mockPermissions: Permission[] = [
    { id: 1, name: 'manage_users', description: 'Create, update, and delete users', resource: 'users', action: 'manage' },
    { id: 2, name: 'view_reports', description: 'View all system reports', resource: 'reports', action: 'view' },
    { id: 3, name: 'edit_deals', description: 'Create and modify deals', resource: 'deals', action: 'edit' },
    { id: 4, name: 'approve_expenses', description: 'Approve expense reports', resource: 'expenses', action: 'approve' },
    { id: 5, name: 'system_settings', description: 'Access system configuration', resource: 'system', action: 'manage' },
    { id: 6, name: 'manage_team', description: 'Manage team members', resource: 'team', action: 'manage' },
    { id: 7, name: 'financial_records', description: 'Access financial records', resource: 'finance', action: 'view' },
    { id: 8, name: 'view_deals', description: 'View deals and opportunities', resource: 'deals', action: 'view' },
    { id: 9, name: 'create_leads', description: 'Create new leads', resource: 'leads', action: 'create' }
  ];

  const getLevelBadge = (level: number) => {
    if (level >= 9) return <Badge className="bg-red-100 text-red-800">High</Badge>;
    if (level >= 5) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low</Badge>;
  };

  const getRoleIcon = (level: number) => {
    if (level >= 9) return <Crown className="h-4 w-4" />;
    if (level >= 5) return <Shield className="h-4 w-4" />;
    return <UserCheck className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Role Management</h1>
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
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Manage user roles and permission assignments</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>Define a new user role with specific permissions</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createRoleMutation.mutate(roleForm); }}>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Role Details</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Role Name</Label>
                      <Input
                        id="name"
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                        placeholder="e.g., Sales Manager"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={roleForm.description}
                        onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                        placeholder="Brief description of the role"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Authority Level (1-10)</Label>
                      <Input
                        id="level"
                        type="number"
                        min="1"
                        max="10"
                        value={roleForm.level}
                        onChange={(e) => setRoleForm({ ...roleForm, level: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={roleForm.isActive}
                        onCheckedChange={(checked) => setRoleForm({ ...roleForm, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active Role</Label>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="permissions" className="space-y-4">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {mockPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={roleForm.selectedPermissions.includes(permission.name)}
                            onCheckedChange={() => togglePermission(permission.name)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`permission-${permission.id}`} className="font-medium">
                              {permission.name}
                            </Label>
                            <div className="text-sm text-muted-foreground">
                              {permission.description}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {permission.resource}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRoleMutation.isPending}>
                    Create Role
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Shield className="h-4 w-4 inline mr-2" />
              Total Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRoles.length}</div>
            <p className="text-xs text-muted-foreground mt-1">System roles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4 inline mr-2" />
              Active Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockRoles.filter(r => r.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Crown className="h-4 w-4 inline mr-2" />
              System Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockRoles.filter(r => r.isSystem).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Built-in roles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <UserCheck className="h-4 w-4 inline mr-2" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockRoles.reduce((sum, role) => sum + role.userCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">With assigned roles</p>
          </CardContent>
        </Card>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRoles.map((role) => (
          <Card key={role.id} className="border-l-4" style={{ borderLeftColor: role.color.includes('red') ? '#ef4444' : role.color.includes('blue') ? '#3b82f6' : role.color.includes('green') ? '#10b981' : role.color.includes('yellow') ? '#f59e0b' : '#6b7280' }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(role.level)}
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <CardDescription className="mt-1">{role.description}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getLevelBadge(role.level)}
                  {role.isSystem && <Badge variant="outline">System</Badge>}
                  {!role.isActive && <Badge variant="secondary">Inactive</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Users assigned:</span>
                  <Badge variant="outline">{role.userCount}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Permissions:</span>
                  <Badge variant="outline">{role.permissions.length}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(role.createdAt).toLocaleDateString()}
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(role)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!role.isSystem && (
                    <Button variant="outline" size="sm" onClick={() => handleDelete(role.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role information and permissions</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); updateRoleMutation.mutate({ id: editingRole?.id, ...roleForm }); }}>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Role Details</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Role Name</Label>
                  <Input
                    id="edit-name"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Authority Level (1-10)</Label>
                  <Input
                    id="edit-level"
                    type="number"
                    min="1"
                    max="10"
                    value={roleForm.level}
                    onChange={(e) => setRoleForm({ ...roleForm, level: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isActive"
                    checked={roleForm.isActive}
                    onCheckedChange={(checked) => setRoleForm({ ...roleForm, isActive: checked })}
                  />
                  <Label htmlFor="edit-isActive">Active Role</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="permissions" className="space-y-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {mockPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={`edit-permission-${permission.id}`}
                        checked={roleForm.selectedPermissions.includes(permission.name)}
                        onCheckedChange={() => togglePermission(permission.name)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`edit-permission-${permission.id}`} className="font-medium">
                          {permission.name}
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          {permission.description}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {permission.resource}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateRoleMutation.isPending}>
                Update Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}