import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Plus, Shield, Edit2, Trash2, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Role form schema
const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  level: z.number().min(1).max(4),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
  level: number;
  tenantId: number;
  createdAt: string;
}

// Permission categories for the UI
const PERMISSION_CATEGORIES = {
  "User Management": [
    "users:create",
    "users:read", 
    "users:update",
    "users:delete"
  ],
  "Role Management": [
    "roles:create",
    "roles:read",
    "roles:update", 
    "roles:delete"
  ],
  "Lead Management": [
    "leads:create",
    "leads:read",
    "leads:update",
    "leads:delete",
    "leads:assign"
  ],
  "Deal Management": [
    "deals:create",
    "deals:read",
    "deals:update",
    "deals:delete"
  ],
  "Contact Management": [
    "contacts:create",
    "contacts:read",
    "contacts:update",
    "contacts:delete"
  ],
  "Company Management": [
    "companies:create",
    "companies:read",
    "companies:update",
    "companies:delete"
  ],
  "Reporting": [
    "reports:view",
    "reports:export",
    "analytics:view"
  ],
  "System Settings": [
    "settings:read",
    "settings:update",
    "system:admin"
  ]
};

export default function RolesManagement() {
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/roles"],
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      return await apiRequest("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setShowNewRoleModal(false);
      form.reset();
      toast({ title: "Role created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create role", variant: "destructive" });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      if (!editingRole) return;
      return await apiRequest(`/api/roles/${editingRole.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setShowNewRoleModal(false);
      setEditingRole(null);
      form.reset();
      toast({ title: "Role updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update role", variant: "destructive" });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/roles/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({ title: "Role deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete role", variant: "destructive" });
    },
  });

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
      level: 1,
    },
  });

  const openNewRoleModal = () => {
    setEditingRole(null);
    form.reset({
      name: "",
      description: "",
      permissions: [],
      level: 1,
    });
    setShowNewRoleModal(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.reset({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
      level: role.level,
    });
    setShowNewRoleModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this role?")) {
      deleteRoleMutation.mutate(id);
    }
  };

  const onSubmit = (data: RoleFormData) => {
    if (editingRole) {
      updateRoleMutation.mutate(data);
    } else {
      createRoleMutation.mutate(data);
    }
  };

  const getLevelColor = (level: number) => {
    const colors = {
      4: "bg-red-100 text-red-800", // Admin
      3: "bg-purple-100 text-purple-800", // Sales Manager
      2: "bg-blue-100 text-blue-800", // Supervisor
      1: "bg-green-100 text-green-800", // Agent
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getLevelName = (level: number) => {
    const names = {
      4: "Admin Level",
      3: "Manager Level", 
      2: "Supervisor Level",
      1: "Agent Level",
    };
    return names[level as keyof typeof names] || "Unknown Level";
  };

  if (rolesLoading) {
    return (
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <TopBar title="Roles Management" />
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TopBar 
          title="Roles Management" 
          onNewContact={openNewRoleModal}
        />
        
        <div className="p-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">All Roles</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage user roles and permissions
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button onClick={openNewRoleModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Role
                  </Button>
                </div>
              </div>
            </div>

            {/* Roles Grid */}
            <div className="p-6">
              {roles.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first role</p>
                  <Button onClick={openNewRoleModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Role
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roles.map((role: Role) => (
                    <Card key={role.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">{role.name}</CardTitle>
                          </div>
                          <Badge className={getLevelColor(role.level)}>
                            Level {role.level}
                          </Badge>
                        </div>
                        <CardDescription>
                          {role.description || "No description provided"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-slate-700 mb-1">
                              Access Level
                            </div>
                            <Badge variant="outline" className={getLevelColor(role.level)}>
                              {getLevelName(role.level)}
                            </Badge>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-slate-700 mb-2">
                              Permissions ({role.permissions?.length || 0})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions?.slice(0, 3).map((permission) => (
                                <Badge key={permission} variant="secondary" className="text-xs">
                                  {permission.split(':')[1]}
                                </Badge>
                              ))}
                              {(role.permissions?.length || 0) > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{(role.permissions?.length || 0) - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-xs text-slate-500">
                              Created {new Date(role.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDelete(role.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Role Form Modal */}
      <Dialog open={showNewRoleModal} onOpenChange={setShowNewRoleModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Create New Role"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Sales Agent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Level</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="4" 
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe this role and its responsibilities..." 
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <div className="space-y-4">
                      {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                        <div key={category} className="border rounded-lg p-4">
                          <h4 className="font-medium text-sm text-slate-700 mb-3">{category}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {permissions.map((permission) => (
                              <FormField
                                key={permission}
                                control={form.control}
                                name="permissions"
                                render={({ field }) => {
                                  return (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(permission)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, permission])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== permission
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {permission.split(':')[1]}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowNewRoleModal(false);
                    setEditingRole(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                >
                  {createRoleMutation.isPending || updateRoleMutation.isPending ? "Saving..." : "Save Role"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}