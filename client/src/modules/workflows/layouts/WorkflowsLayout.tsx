import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Workflow,
  ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkflowsLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/workflows', icon: LayoutDashboard },
  { name: 'Projects', href: '/workflows/projects', icon: FolderOpen },
  { name: 'Tasks', href: '/workflows/tasks', icon: CheckSquare },
  { name: 'Workflows', href: '/workflows/workflows', icon: Workflow },
];

export default function WorkflowsLayout({ children }: WorkflowsLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Modules
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Projects & Workflows
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-800 shadow-sm min-h-[calc(100vh-4rem)] border-r border-slate-200 dark:border-slate-700">
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <div className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                      }`}>
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}