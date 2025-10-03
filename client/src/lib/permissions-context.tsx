import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

export interface Permission {
  id: string;
  name: string;
  category: string;
}

export interface PermissionsContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isLoading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}

interface PermissionsProviderProps {
  children: ReactNode;
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user's role and permissions
  const { data: currentUser } = useQuery({
    queryKey: ['/api/users/current'],
    enabled: true,
  });

  useEffect(() => {
    if (currentUser) {
      // Extract permissions from user's role
      const userPermissions = currentUser.role?.permissions || [];
      setPermissions(userPermissions);
      setIsLoading(false);
    } else {
      // Fallback to localStorage role data for demo
      const userRole = localStorage.getItem('userRole') || 'super admin';
      const rolePermissions = getRolePermissions(userRole);
      setPermissions(rolePermissions);
      setIsLoading(false);
    }
  }, [currentUser]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  const contextValue: PermissionsContextType = {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
  };

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
}

// Helper function to get permissions based on role (for demo purposes)
function getRolePermissions(role: string): string[] {
  const rolePermissionMap: Record<string, string[]> = {
    'super admin': [
      'view_all_data', 'manage_users', 'manage_roles', 'manage_companies', 
      'manage_contacts', 'manage_leads', 'manage_deals', 'manage_activities',
      'view_dashboard', 'manage_settings', 'view_reports', 'view_analytics', 'export_data', 'manage_products', 'manage_interactions', 'manage_customers', 'manage_assistants', 'manage_workspaces'
    ],
    'admin': [
      'view_all_data', 'manage_users', 'manage_roles', 'manage_companies', 
      'manage_contacts', 'manage_leads', 'manage_deals', 'manage_activities',
      'view_dashboard', 'manage_settings', 'view_reports', 'view_analytics', 'export_data', 'manage_products', 'manage_interactions', 'manage_customers', 'manage_assistants', 'manage_workspaces'
    ],
    'workspace_admin': [
      'view_workspace_data', 'manage_workspace_users', 'manage_companies', 
      'manage_contacts', 'manage_leads', 'manage_deals', 'manage_activities',
      'view_dashboard', 'view_reports', 'view_analytics', 'manage_products', 'manage_interactions', 'manage_customers', 'manage_assistants'
    ],
    'sales manager': [
      'view_all_data', 'manage_team', 'manage_leads', 'manage_deals', 'manage_companies',
      'manage_contacts', 'view_dashboard', 'view_reports', 'assign_leads', 'manage_products', 'manage_interactions', 'manage_customers', 'manage_assistants'
    ],
    'sales_manager': [
      'view_all_data', 'manage_team', 'manage_leads', 'manage_deals', 'manage_companies',
      'manage_contacts', 'view_dashboard', 'view_reports', 'assign_leads', 'manage_products', 'manage_interactions', 'manage_customers', 'manage_assistants'
    ],
    'supervisor': [
      'view_team_data', 'manage_agents', 'manage_leads', 'assign_leads', 'manage_companies',
      'view_dashboard', 'manage_activities', 'manage_products', 'manage_interactions', 'manage_customers'
    ],
    'agent': [
      'view_own_data', 'manage_own_leads', 'manage_leads', 'manage_contacts', 'manage_companies',
      'manage_deals', 'manage_activities', 'view_dashboard', 'manage_products', 'manage_interactions', 'manage_customers'
    ]
  };

  return rolePermissionMap[role] || [];
}