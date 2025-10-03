import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

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
  department: string;
  currentWorkspaceId?: number;
  currentProjectId?: number;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  canAccessData: (scope: 'own' | 'team' | 'all') => boolean;
  switchWorkspace: (workspaceId: number) => Promise<void>;
  switchProject: (projectId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Simulate current user - in production this would come from session/JWT
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['/api/users/current'],
    queryFn: async () => {
      const response = await fetch('/api/users/current', {
        headers: {
          'X-User-Id': '1', // Mock user ID
          'X-Tenant-Id': '1', // Mock tenant ID
        }
      });
      if (response.ok) {
        return response.json();
      }
      // If no user found, return a mock admin user for development
      return {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: {
          id: 1,
          name: 'Admin',
          level: 5,
          permissions: ['manage_users', 'view_all_data', 'manage_deals', 'view_reports', 
                       'manage_pipeline', 'export_data', 'manage_settings', 'view_team_data']
        },
        department: 'administration',
        isActive: true,
        currentWorkspaceId: 1,
        currentProjectId: 1
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.role.permissions.includes(permission);
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return user.role.name.toLowerCase() === roleName.toLowerCase();
  };

  const canAccessData = (scope: 'own' | 'team' | 'all'): boolean => {
    if (!user) return false;
    
    switch (scope) {
      case 'all':
        return user.role.level >= 4; // Admin, Sales Manager
      case 'team':
        return user.role.level >= 3; // Supervisor and above
      case 'own':
        return true; // All users can access their own data
      default:
        return false;
    }
  };

  const switchWorkspace = async (workspaceId: number): Promise<void> => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/switch-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': '1',
        },
        body: JSON.stringify({ workspaceId }),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(prev => prev ? { ...prev, currentWorkspaceId: workspaceId } : null);
      }
    } catch (error) {
      console.error('Failed to switch workspace:', error);
    }
  };

  const switchProject = async (projectId: number): Promise<void> => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/switch-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': '1',
        },
        body: JSON.stringify({ projectId }),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(prev => prev ? { ...prev, currentProjectId: projectId } : null);
      }
    } catch (error) {
      console.error('Failed to switch project:', error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error: error?.message || null,
    hasPermission,
    hasRole,
    canAccessData,
    switchWorkspace,
    switchProject
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}