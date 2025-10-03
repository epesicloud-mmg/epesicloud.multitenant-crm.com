import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Search, User } from "lucide-react";
import { useLocation } from "wouter";

interface FinanceTopBarProps {
  title: string;
}

export function FinanceTopBar({ title }: FinanceTopBarProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Back button and title */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/")}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            <Bell className="w-4 h-4" />
          </Button>

          {/* User Menu */}
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}