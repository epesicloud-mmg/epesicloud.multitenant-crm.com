import { useState } from "react";
import { Search, Bell, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlobalSearch } from "@/components/global-search";

interface TopBarProps {
  title: string;
  showWorkspaceSelector?: boolean;
  currentWorkspace?: string;
  onWorkspaceChange?: (workspace: string) => void;
  onNewContact?: () => void;
}

export function TopBar({ title, showWorkspaceSelector, currentWorkspace, onWorkspaceChange, onNewContact }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  
  const workspaces = [
    { id: 'sales-operations', name: 'Sales Operations', color: 'bg-blue-500' },
    { id: 'marketing-campaigns', name: 'Marketing Campaigns', color: 'bg-green-500' },
    { id: 'customer-success', name: 'Customer Success', color: 'bg-purple-500' },
    { id: 'product-development', name: 'Product Development', color: 'bg-orange-500' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        {showWorkspaceSelector ? (
          <Select value={currentWorkspace} onValueChange={onWorkspaceChange}>
            <SelectTrigger className="w-72 border-0 bg-transparent shadow-none text-xl font-semibold text-slate-900 hover:bg-slate-50 focus:ring-0 p-0">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${workspaces.find(w => w.id === currentWorkspace)?.color || 'bg-blue-500'}`}></div>
                <SelectValue placeholder="Select workspace" />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {workspaces.map(workspace => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${workspace.color}`}></div>
                    <span>{workspace.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        )}
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
