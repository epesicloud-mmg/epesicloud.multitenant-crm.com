import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCheck, Crown } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const roles = [
  { value: 'super admin', label: 'Super Admin', icon: Crown, color: 'bg-purple-100 text-purple-800', userId: '4', name: 'Admin User' },
  { value: 'sales manager', label: 'Sales Manager', icon: Shield, color: 'bg-blue-100 text-blue-800', userId: '5', name: 'Sarah Johnson' },
  { value: 'supervisor', label: 'Supervisor', icon: UserCheck, color: 'bg-green-100 text-green-800', userId: '6', managerId: '5', name: 'Mike Wilson' },
  { value: 'agent', label: 'Agent', icon: Users, color: 'bg-gray-100 text-gray-800', userId: '8', managerId: '6', name: 'John Smith' },
];

export function RoleSwitcher() {
  const [currentRole, setCurrentRole] = useState(localStorage.getItem('userRole') || 'super admin');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    setIsLoading(true);
    
    const roleConfig = roles.find(r => r.value === newRole);
    if (!roleConfig) return;

    // Update localStorage with new role data
    localStorage.setItem('userRole', newRole);
    localStorage.setItem('userId', roleConfig.userId);
    
    if (roleConfig.managerId) {
      localStorage.setItem('managerId', roleConfig.managerId);
    } else {
      localStorage.removeItem('managerId');
    }

    setCurrentRole(newRole);
    
    // Clear all query cache to refetch with new role
    queryClient.clear();
    
    // Trigger a page refresh to ensure all components reload with new role
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const currentRoleConfig = roles.find(r => r.value === currentRole);
  const Icon = currentRoleConfig?.icon || Users;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          Role-Based Access Control Demo
        </CardTitle>
        <CardDescription>
          Switch between different user roles to test data access restrictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Current Role:</span>
          <Badge className={currentRoleConfig?.color}>
            {currentRoleConfig?.label}
          </Badge>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Switch to Role:</label>
          <Select value={currentRole} onValueChange={handleRoleChange}>
            <SelectTrigger>
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
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Admin:</strong> All data access</p>
          <p><strong>Sales Manager:</strong> All data access</p>
          <p><strong>Supervisor:</strong> Team data only (2 agents)</p>
          <p><strong>Agent:</strong> Own data only (2 leads)</p>
        </div>

        <div className="text-xs text-blue-600 mt-2">
          <p><strong>Current User:</strong> {currentRoleConfig?.name || 'Unknown'}</p>
        </div>

        {isLoading && (
          <div className="text-center text-sm text-gray-500">
            Switching role and refreshing data...
          </div>
        )}
      </CardContent>
    </Card>
  );
}