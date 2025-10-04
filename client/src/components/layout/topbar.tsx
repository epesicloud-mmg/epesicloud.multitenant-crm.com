import { useState } from "react";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/global-search";

interface TopBarProps {
  title: string;
  onNewContact?: () => void;
}

export function TopBar({ title, onNewContact }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <div className="hidden md:flex items-center space-x-2 text-sm text-slate-500">
          <span>Last updated:</span>
          <span>2 minutes ago</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* Global Search */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center space-x-2 w-64 px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search contacts, deals, companies...</span>
            <kbd className="ml-auto px-2 py-1 text-xs bg-white border border-slate-200 rounded">
              ⌘K
            </kbd>
          </button>
        </div>
        
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

        <button className="relative p-2 text-slate-400 hover:text-slate-600">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {onNewContact && (
          <Button onClick={onNewContact} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Contact</span>
          </Button>
        )}
      </div>
    </header>
  );
}
