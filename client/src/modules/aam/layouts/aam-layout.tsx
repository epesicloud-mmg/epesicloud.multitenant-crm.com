import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Users, Shield, Settings, Key, UserCheck, Home, Lock } from 'lucide-react';

interface AAMLayoutProps {
  children: React.ReactNode;
}

export function AAMLayout({ children }: AAMLayoutProps) {
  const [location] = useLocation();
  
  const navigationItems = [
    { href: '/aam', icon: Home, label: 'Dashboard', exact: true },
    { href: '/aam/users', icon: Users, label: 'User Management' },
    { href: '/aam/roles', icon: Shield, label: 'Role Management' },
    { href: '/aam/permissions', icon: Key, label: 'Permissions' },
    { href: '/aam/assignments', icon: UserCheck, label: 'Role Assignments' },
    { href: '/aam/access-control', icon: Lock, label: 'Access Control' },
    { href: '/aam/settings', icon: Settings, label: 'Settings' },
  ];

  const isActiveLink = (href: string, exact = false) => {
    if (exact) {
      return location === href;
    }
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← Back to Modules
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Access Manager</h1>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-73px)]">
          <div className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActiveLink(item.href, item.exact)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}