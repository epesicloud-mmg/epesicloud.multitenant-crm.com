import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, UserCheck, Crown, Eye, Settings, Database, BarChart3, Building2, Contact, DollarSign, Briefcase, Activity } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const roles = [
  { 
    value: 'admin', 
    label: 'Super Admin', 
    icon: Crown, 
    color: 'bg-purple-100 text-purple-800', 
    userId: '4', 
    name: 'Admin User',
    permissions: [
      'view_all_data', 'manage_users', 'manage_roles', 'manage_companies', 
      'manage_contacts', 'manage_leads', 'manage_deals', 'manage_activities',
      'view_dashboard', 'manage_settings', 'view_reports', 'export_data'
    ]
  },
  { 
    value: 'sales_manager', 
    label: 'Sales Manager', 
    icon: Shield, 
    color: 'bg-blue-100 text-blue-800', 
    userId: '5', 
    name: 'Sarah Johnson',
    permissions: [
      'view_all_data', 'manage_team', 'manage_leads', 'manage_deals', 
      'manage_contacts', 'view_dashboard', 'view_reports', 'assign_leads'
    ]
  },
  { 
    value: 'supervisor', 
    label: 'Supervisor', 
    icon: UserCheck, 
    color: 'bg-green-100 text-green-800', 
    userId: '6', 
    managerId: '5', 
    name: 'Mike Wilson',
    permissions: [
      'view_team_data', 'manage_agents', 'manage_leads', 'assign_leads',
      'view_dashboard', 'manage_activities'
    ]
  },
  { 
    value: 'agent', 
    label: 'Agent', 
    icon: Users, 
    color: 'bg-gray-100 text-gray-800', 
    userId: '8', 
    managerId: '6', 
    name: 'John Smith',
    permissions: [
      'view_own_data', 'manage_own_leads', 'manage_activities', 'view_dashboard'
    ]
  },
];

const allPermissions = [
  { id: 'view_all_data', name: 'View All Data', category: 'Data Access', icon: Database },
  { id: 'view_team_data', name: 'View Team Data', category: 'Data Access', icon: Users },
  { id: 'view_own_data', name: 'View Own Data', category: 'Data Access', icon: Eye },
  { id: 'manage_users', name: 'Manage Users', category: 'User Management', icon: Users },
  { id: 'manage_roles', name: 'Manage Roles', category: 'User Management', icon: Shield },
  { id: 'manage_team', name: 'Manage Team', category: 'Team Management', icon: UserCheck },
  { id: 'manage_agents', name: 'Manage Agents', category: 'Team Management', icon: Users },
  { id: 'manage_companies', name: 'Manage Companies', category: 'CRM', icon: Building2 },
  { id: 'manage_contacts', name: 'Manage Contacts', category: 'CRM', icon: Contact },
  { id: 'manage_leads', name: 'Manage Leads', category: 'CRM', icon: Briefcase },
  { id: 'manage_own_leads', name: 'Manage Own Leads', category: 'CRM', icon: Briefcase },
  { id: 'assign_leads', name: 'Assign Leads', category: 'CRM', icon: Briefcase },
  { id: 'manage_deals', name: 'Manage Deals', category: 'CRM', icon: DollarSign },
  { id: 'manage_activities', name: 'Manage Activities', category: 'CRM', icon: Activity },
  { id: 'view_dashboard', name: 'View Dashboard', category: 'Analytics', icon: BarChart3 },
  { id: 'view_reports', name: 'View Reports', category: 'Analytics', icon: BarChart3 },
  { id: 'manage_settings', name: 'Manage Settings', category: 'System', icon: Settings },
  { id: 'export_data', name: 'Export Data', category: 'System', icon: Database },
];

const navigationItems = [
  { name: 'Dashboard', path: '/', permission: 'view_dashboard' },
  { name: 'Contacts', path: '/contacts', permission: 'manage_contacts' },
  { name: 'Companies', path: '/companies', permission: 'manage_companies' },
  { name: 'Leads', path: '/leads', permission: 'manage_leads' },
  { name: 'Deals', path: '/deals', permission: 'manage_deals' },
  { name: 'Activities', path: '/activities', permission: 'manage_activities' },
  { name: 'Products', path: '/products', permission: 'manage_companies' },
  { name: 'User Management', path: '/user-management', permission: 'manage_users' },
  { name: 'Roles Management', path: '/roles-management', permission: 'manage_roles' },
];

export default function RBACDemo() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    enabled: true,
  });

  const { data: leads } = useQuery({
    queryKey: ['/api/leads'],
    enabled: true,
  });

  const handleRoleChange = async (newRole: string) => {
    setIsLoading(true);
    
    const roleConfig = roles.find(r => r.value === newRole);
    if (!roleConfig) return;

    // Update localStorage with new role data
    localStorage.setItem('userRole', newRole === 'admin' ? 'super admin' : newRole);
    localStorage.setItem('userId', roleConfig.userId);
    
    if (roleConfig.managerId) {
      localStorage.setItem('managerId', roleConfig.managerId);
    } else {
      localStorage.removeItem('managerId');
    }

    setSelectedRole(newRole);
    
    // Clear all query cache to refetch with new role
    queryClient.clear();
    
    setIsLoading(false);
  };

  const currentRole = roles.find(r => r.value === selectedRole);
  const CurrentIcon = currentRole?.icon || Users;

  const getPermissionsByCategory = () => {
    const categories: Record<string, typeof allPermissions> = {};
    allPermissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const hasPermission = (permissionId: string) => {
    return currentRole?.permissions.includes(permissionId) || false;
  };

  const getAccessibleMenuItems = () => {
    return navigationItems.filter(item => hasPermission(item.permission));
  };

  const getDataCounts = () => {
    const userCount = Array.isArray(users) ? users.length : 0;
    const leadCount = Array.isArray(leads) ? leads.length : 0;
    
    if (selectedRole === 'admin' || selectedRole === 'sales_manager') {
      return { users: userCount, leads: leadCount, scope: 'All Data' };
    } else if (selectedRole === 'supervisor') {
      return { users: 2, leads: 4, scope: 'Team Data' };
    } else if (selectedRole === 'agent') {
      return { users: 1, leads: 2, scope: 'Own Data' };
    }
    
    return { users: 0, leads: 0, scope: 'No Data' };
  };

  const dataCounts = getDataCounts();
  const accessibleMenuItems = getAccessibleMenuItems();
  const permissionsByCategory = getPermissionsByCategory();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <TopBar title="Role-Based Access Control Demo" />
        
        <div className="p-6 space-y-6">
          {/* Role Switcher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CurrentIcon className="w-5 h-5" />
                Role Switcher
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Current Role:</span>
                  <Badge className={currentRole?.color}>
                    {currentRole?.label}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  User: {currentRole?.name}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => {
                      const RoleIcon = role.icon;
                      return (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <RoleIcon className="w-4 h-4" />
                            <span>{role.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {isLoading && (
                  <div className="text-sm text-blue-600">
                    Switching role...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Access Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Access Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{dataCounts.scope}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Users: {dataCounts.users} | Leads: {dataCounts.leads}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accessible Menu Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{accessibleMenuItems.length}</div>
                <div className="text-sm text-gray-600 mt-1">
                  out of {navigationItems.length} total items
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{currentRole?.permissions.length || 0}</div>
                <div className="text-sm text-gray-600 mt-1">
                  out of {allPermissions.length} available
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Access */}
          <Card>
            <CardHeader>
              <CardTitle>Accessible Navigation Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {navigationItems.map((item) => {
                  const hasAccess = hasPermission(item.permission);
                  return (
                    <div
                      key={item.name}
                      className={`p-3 rounded-lg border ${
                        hasAccess 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs mt-1">
                        {hasAccess ? '✓ Accessible' : '✗ Restricted'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Permissions Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-gray-700 mb-3">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions.map((permission) => {
                        const hasAccess = hasPermission(permission.id);
                        const PermissionIcon = permission.icon;
                        return (
                          <div
                            key={permission.id}
                            className={`p-3 rounded-lg border flex items-center gap-3 ${
                              hasAccess 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <PermissionIcon className={`w-4 h-4 ${hasAccess ? 'text-green-600' : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <div className={`font-medium text-sm ${hasAccess ? 'text-green-800' : 'text-gray-600'}`}>
                                {permission.name}
                              </div>
                            </div>
                            <div className={`text-xs ${hasAccess ? 'text-green-600' : 'text-gray-400'}`}>
                              {hasAccess ? '✓' : '✗'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Testing Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Test Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Click the buttons below to test navigation with the current role's permissions.
              </div>
              <div className="flex flex-wrap gap-3">
                {accessibleMenuItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = item.path}
                    className="text-sm"
                  >
                    Go to {item.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}