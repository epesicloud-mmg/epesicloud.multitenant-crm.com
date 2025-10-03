import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Users as UsersIcon, Shield, Edit2, Trash2, Eye, UserCheck, UserX, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/lib/tenant-context";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import type { User, Role, UserWithRole, UserWithManager } from "@shared/schema";

const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.number().min(1, "Role is required"),
  managerId: z.number().optional(),
  department: z.string().default("sales"),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userFormSchema>;

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  // Fetch users with roles
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("/api/users").then(res => res.json()),
  });

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/roles"],
    queryFn: () => apiRequest("/api/roles").then(res => res.json()),
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tenantId }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowNewUserModal(false);
      resetForm();
      toast({ title: "User created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create user", variant: "destructive" });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormData & { id: number }) => {
      const response = await apiRequest(`/api/users/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      setShowNewUserModal(false);
      resetForm();
      toast({ title: "User updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user status", variant: "destructive" });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/users/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      roleId: 0,
      department: "sales",
      phone: "",
      isActive: true,
    },
  });

  const resetForm = () => {
    form.reset({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      roleId: 0,
      department: "sales",
      phone: "",
      isActive: true,
    });
  };

  const openNewUserModal = () => {
    resetForm();
    setEditingUser(null);
    setShowNewUserModal(true);
  };

  const handleEdit = (user: UserWithRole) => {
    form.reset({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: "",
      roleId: user.roleId,
      managerId: user.managerId || undefined,
      department: user.department || "sales",
      phone: user.phone || "",
      isActive: user.isActive,
    });
    setEditingUser(user);
    setShowNewUserModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(id);
    }
  };

  const toggleUserStatus = (id: number, currentStatus: boolean) => {
    toggleUserStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  const onSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate({ ...data, id: editingUser.id });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleColor = (roleLevel: number) => {
    switch (roleLevel) {
      case 1: return "bg-blue-100 text-blue-800"; // Agent
      case 2: return "bg-green-100 text-green-800"; // Sales Manager
      case 3: return "bg-purple-100 text-purple-800"; // Super Admin
      case 4: return "bg-orange-100 text-orange-800"; // Director
      case 5: return "bg-red-100 text-red-800"; // Admin
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const toggleUserExpansion = (userId: number) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const buildUserHierarchy = (users: UserWithRole[]) => {
    const userMap = new Map<number, UserWithRole & { subordinates: UserWithRole[] }>();
    const rootUsers: (UserWithRole & { subordinates: UserWithRole[] })[] = [];

    // Initialize all users with empty subordinates array
    users.forEach(user => {
      userMap.set(user.id, { ...user, subordinates: [] });
    });

    // Build the hierarchy
    users.forEach(user => {
      if (user.managerId) {
        const manager = userMap.get(user.managerId);
        if (manager) {
          manager.subordinates.push(userMap.get(user.id)!);
        }
      } else {
        rootUsers.push(userMap.get(user.id)!);
      }
    });

    return rootUsers;
  };

  const filteredUsers = users.filter((user: UserWithRole) => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === "all" || user.role?.name === selectedRole;
    const matchesDepartment = selectedDepartment === "all" || user.department === selectedDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const userHierarchy = buildUserHierarchy(filteredUsers);

  const renderUserNode = (user: UserWithRole & { subordinates: UserWithRole[] }, level = 0) => {
    const hasSubordinates = user.subordinates.length > 0;
    const isExpanded = expandedUsers.has(user.id);

    return (
      <div key={user.id} className={`${level > 0 ? 'ml-8' : ''}`}>
        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {hasSubordinates && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleUserExpansion(user.id)}
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                )}
                {!hasSubordinates && <div className="w-8" />}
                
                <Avatar>
                  <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </span>
                    <Badge className={getRoleColor(user.role?.level || 0)}>
                      {user.role?.name}
                    </Badge>
                    {!user.isActive && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    {user.email} • {user.department}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={user.isActive}
                  onCheckedChange={() => toggleUserStatus(user.id, user.isActive)}
                  disabled={toggleUserStatusMutation.isPending}
                />
                <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {hasSubordinates && isExpanded && (
          <div className="ml-4">
            {user.subordinates.map(subordinate => 
              renderUserNode(subordinate, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const userCounts = {
    total: users.length,
    active: users.filter((u: UserWithRole) => u.isActive).length,
    inactive: users.filter((u: UserWithRole) => !u.isActive).length,
    agents: users.filter((u: UserWithRole) => u.role?.level === 1).length,
    managers: users.filter((u: UserWithRole) => u.role?.level === 2).length,
    admins: users.filter((u: UserWithRole) => u.role?.level >= 3).length,
  };

  const availableManagers = users.filter((user: UserWithRole) => 
    user.role?.level >= 2 && user.id !== editingUser?.id
  );

  const departments = [...new Set(users.map((u: UserWithRole) => u.department).filter(Boolean))];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TopBar title="User Management" onNewContact={openNewUserModal} />
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                <Button onClick={openNewUserModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-slate-900">{userCounts.total}</div>
                    <div className="text-sm text-slate-500">Total Users</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{userCounts.active}</div>
                    <div className="text-sm text-slate-500">Active</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">{userCounts.inactive}</div>
                    <div className="text-sm text-slate-500">Inactive</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{userCounts.agents}</div>
                    <div className="text-sm text-slate-500">Agents</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{userCounts.managers}</div>
                    <div className="text-sm text-slate-500">Managers</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">{userCounts.admins}</div>
                    <div className="text-sm text-slate-500">Admins</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[180px]">
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
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept: string) => (
                      <SelectItem key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* User Hierarchy */}
            <div className="space-y-4">
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                  <p className="mt-2 text-slate-500">Loading users...</p>
                </div>
              ) : userHierarchy.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
                  <p className="text-slate-500 mb-4">Get started by adding your first user to the system.</p>
                  <Button onClick={openNewUserModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              ) : (
                userHierarchy.map(user => renderUserNode(user))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* User Form Modal */}
      <Dialog open={showNewUserModal} onOpenChange={setShowNewUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {editingUser ? "New Password (optional)" : "Password"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={editingUser ? "Leave blank to keep current" : "Password"} 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role: Role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name} - Level {role.level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager (optional)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} value={field.value?.toString() || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No Manager</SelectItem>
                        {availableManagers.map((manager: UserWithRole) => (
                          <SelectItem key={manager.id} value={manager.id.toString()}>
                            {manager.firstName} {manager.lastName} ({manager.role?.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="sales" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Active User</FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowNewUserModal(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  {createUserMutation.isPending || updateUserMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}