import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, UserPlus, Shield, Search, Filter, Eye, Edit, Trash2, Building, UserCog } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: number;
    name: string;
    level: number;
    permissions: string[];
  };
  managerId?: number;
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
    role: { name: string };
  };
  department: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  currentWorkspaceId?: number;
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
  level: number;
  permissions: string[];
  description?: string;
}

const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  roleId: z.number().min(1, 'Role is required'),
  managerId: z.number().optional(),
  department: z.string().default('sales'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const roleFormSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  level: z.number().min(1).max(5, 'Level must be between 1-5'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

const ROLE_COLORS = {
  'Admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Sales Manager': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Supervisor': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Agent': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  'Director': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const PERMISSION_OPTIONS = [
  'manage_users', 'view_all_data', 'manage_deals', 'view_reports', 
  'manage_pipeline', 'export_data', 'manage_settings', 'view_team_data'
];

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Fetch users
  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['/api/users', roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      
      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/users/roles'],
    queryFn: async () => {
      const response = await fetch('/api/users/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof userFormSchema>) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowUserDialog(false);
      toast({ title: 'Success', description: 'User created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create user', variant: 'destructive' });
    }
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: z.infer<typeof roleFormSchema>) => {
      const response = await fetch('/api/users/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData),
      });
      if (!response.ok) throw new Error('Failed to create role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/roles'] });
      setShowRoleDialog(false);
      toast({ title: 'Success', description: 'Role created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create role', variant: 'destructive' });
    }
  });

  // Filter users based on search query
  const filteredUsers = users.filter((user: User) =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      roleId: 0,
      department: 'sales',
      phone: '',
      password: '',
    }
  });

  const roleForm = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      level: 1,
      description: '',
      permissions: [],
    }
  });

  const onCreateUser = (data: z.infer<typeof userFormSchema>) => {
    createUserMutation.mutate(data);
  };

  const onCreateRole = (data: z.infer<typeof roleFormSchema>) => {
    createRoleMutation.mutate(data);
  };

  const getRoleColor = (roleName: string) => {
    return ROLE_COLORS[roleName as keyof typeof ROLE_COLORS] || ROLE_COLORS['Agent'];
  };

  const getUserStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (!user.lastLoginAt) {
      return <Badge variant="secondary">Never Logged In</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

    <MainLayout>
  if (usersError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load user data</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Retry
          </Button>
    </MainLayout>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, roles, and permissions across your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new role with specific permissions and access level
                </DialogDescription>
              </DialogHeader>
              <Form {...roleForm}>
                <form onSubmit={roleForm.handleSubmit(onCreateRole)} className="space-y-4">
                  <FormField
                    control={roleForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Senior Agent" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={roleForm.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Level (1-5)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="5" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={roleForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Role description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowRoleDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createRoleMutation.isPending}
                    >
                      {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with role and permissions
                </DialogDescription>
              </DialogHeader>
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onCreateUser)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={userForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={userForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role: Role) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name} (Level {role.level})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowUserDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createUserMutation.isPending}
                    >
                      {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role: Role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {usersLoading || rolesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-muted rounded w-20 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user: User) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <span>@{user.username}</span>
                      {user.manager && (
                        <span className="text-xs">
                          • Reports to {user.manager.firstName} {user.manager.lastName}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getRoleColor(user.role.name)}>
                    {user.role.name}
                  </Badge>
                  {getUserStatusBadge(user)}
                </div>
                
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{user.email}</span>
                  </p>
                  {user.phone && (
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{user.phone}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    <span className="capitalize">{user.department}</span>
                  </p>
                </div>
                
                {user.role.permissions.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                      {user.role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="pt-2 text-xs text-muted-foreground">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                  {user.lastLoginAt && (
                    <span className="block">
                      Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredUsers.length === 0 && !usersLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || roleFilter 
                ? "No users match your current filters. Try adjusting your search criteria."
                : "Get started by creating your first user account."
              }
            </p>
            {(!searchQuery && !roleFilter) && (
              <Button onClick={() => setShowUserDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add First User
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
