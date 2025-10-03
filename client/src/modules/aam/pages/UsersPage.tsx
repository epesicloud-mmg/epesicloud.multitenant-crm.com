import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function UsersPage() {
  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'Sales Manager',
      department: 'Sales',
      status: 'active',
      lastLogin: '2024-08-11T14:30:00Z',
      permissions: ['manage_team', 'view_reports', 'create_deals']
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Super Admin',
      department: 'IT',
      status: 'active',
      lastLogin: '2024-08-11T09:15:00Z',
      permissions: ['manage_users', 'manage_system', 'view_all_data']
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike.chen@company.com',
      role: 'Agent',
      department: 'Sales',
      status: 'inactive',
      lastLogin: '2024-08-09T16:45:00Z',
      permissions: ['view_own_data', 'create_activities']
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      role: 'Supervisor',
      department: 'Support',
      status: 'active',
      lastLogin: '2024-08-11T11:20:00Z',
      permissions: ['manage_team', 'view_reports']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super admin': return 'bg-purple-100 text-purple-800';
      case 'sales manager': return 'bg-blue-100 text-blue-800';
      case 'supervisor': return 'bg-orange-100 text-orange-800';
      case 'agent': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage users, roles, and permissions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or role..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              Filter by Role
            </Button>
            <Button variant="outline">
              Filter by Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                    <p className="text-xs text-slate-500">{user.department}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    <div className="text-xs text-slate-500 mt-1">
                      Last login: {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Permissions Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">4</div>
              <div className="text-sm text-slate-600">Super Admins</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-slate-600">Managers</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">15</div>
              <div className="text-sm text-slate-600">Supervisors</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">42</div>
              <div className="text-sm text-slate-600">Agents</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}