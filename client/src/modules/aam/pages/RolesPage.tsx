import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Users, Shield, Lock } from 'lucide-react';

export default function RolesPage() {
  const roles = [
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      userCount: 4,
      permissions: [
        'manage_users', 'manage_system', 'view_all_data', 'manage_roles',
        'access_audit_logs', 'system_configuration', 'billing_management'
      ],
      color: 'bg-purple-500',
      level: 1
    },
    {
      id: 2,
      name: 'Sales Manager',
      description: 'Manage sales team and view comprehensive reports',
      userCount: 8,
      permissions: [
        'manage_team', 'view_all_sales_data', 'create_deals', 'view_reports',
        'manage_pipelines', 'export_data'
      ],
      color: 'bg-blue-500',
      level: 2
    },
    {
      id: 3,
      name: 'Supervisor',
      description: 'Team supervision with limited management capabilities',
      userCount: 15,
      permissions: [
        'manage_team', 'view_team_data', 'create_activities', 'view_reports'
      ],
      color: 'bg-orange-500',
      level: 3
    },
    {
      id: 4,
      name: 'Agent',
      description: 'Basic access for individual contributors',
      userCount: 42,
      permissions: [
        'view_own_data', 'create_activities', 'update_own_records'
      ],
      color: 'bg-gray-500',
      level: 4
    }
  ];

  const allPermissions = [
    { id: 'manage_users', name: 'User Management', category: 'Admin' },
    { id: 'manage_system', name: 'System Management', category: 'Admin' },
    { id: 'manage_roles', name: 'Role Management', category: 'Admin' },
    { id: 'view_all_data', name: 'View All Data', category: 'Data' },
    { id: 'view_team_data', name: 'View Team Data', category: 'Data' },
    { id: 'view_own_data', name: 'View Own Data', category: 'Data' },
    { id: 'manage_team', name: 'Team Management', category: 'Management' },
    { id: 'create_deals', name: 'Create Deals', category: 'Sales' },
    { id: 'view_reports', name: 'View Reports', category: 'Reports' },
    { id: 'export_data', name: 'Export Data', category: 'Data' }
  ];

  const getPermissionsByCategory = (category: string) => {
    return allPermissions.filter(p => p.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Role Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Define roles and assign permissions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg ${role.color} flex items-center justify-center`}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{role.name}</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {role.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Users</span>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-slate-400" />
                  <span className="font-semibold">{role.userCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Permissions</span>
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-1 text-slate-400" />
                  <span className="font-semibold">{role.permissions.length}</span>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Categories</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Available permissions organized by category
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Admin', 'Data', 'Management', 'Sales', 'Reports'].map((category) => (
              <div key={category} className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 border-b pb-2">
                  {category}
                </h4>
                <div className="space-y-2">
                  {getPermissionsByCategory(category).map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {permission.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle>Role Hierarchy</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Organizational role structure and access levels
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roles.map((role, index) => (
              <div key={role.id} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-slate-400">
                    {role.level}
                  </div>
                  <div className={`w-8 h-8 rounded ${role.color} flex items-center justify-center`}>
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{role.name}</h4>
                  <p className="text-sm text-slate-600">{role.description}</p>
                </div>
                <Badge variant="outline">
                  {role.userCount} users
                </Badge>
                {index < roles.length - 1 && (
                  <div className="absolute left-8 mt-12 w-0.5 h-8 bg-slate-200"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}