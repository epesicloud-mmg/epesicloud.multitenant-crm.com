import { useState } from "react";
import { Search, Bell, Menu, ChevronDown, User, Settings, HelpCircle, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlobalSearch } from "@/components/global-search";
import { useAuth } from "@/lib/auth-context";
import { useTenant } from "@/lib/tenant-context";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface ProfessionalHeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export function ProfessionalHeader({ onToggleSidebar, isSidebarCollapsed }: ProfessionalHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const { user } = useAuth();
  const { tenantName } = useTenant();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", "POST");
      setLocation("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLocation("/login");
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 sm:px-6 z-50 relative">
      {/* Left Section - Hamburger + Workspace Selector */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
        {/* Hamburger Menu */}
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-11 h-11 rounded-md text-slate-600 hover:bg-slate-100 transition-all duration-200"
          aria-label="Toggle sidebar"
          data-testid="button-toggle-sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace/Tenant Selector */}
        <DropdownMenu open={workspaceDropdownOpen} onOpenChange={setWorkspaceDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center px-3 h-11 rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 min-w-[180px] sm:min-w-[220px]"
              data-testid="button-workspace-selector"
            >
              {/* Status Indicators */}
              <div className="flex items-center space-x-1 mr-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              
              {/* Workspace Name */}
              <span className="text-sm font-medium text-slate-900 truncate flex-1 text-left">
                {tenantName || "Select Workspace"}
              </span>
              
              {/* Chevron */}
              <ChevronDown
                className={`w-4 h-4 ml-2 text-slate-500 transition-transform duration-200 ${
                  workspaceDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            align="start"
            className="w-80 p-2 mt-1"
            data-testid="menu-workspace-dropdown"
          >
            <DropdownMenuLabel className="text-xs uppercase text-slate-500 font-semibold px-3 py-2">
              Workspaces
            </DropdownMenuLabel>
            
            {/* Current Workspace */}
            <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2.5 rounded-md">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                {tenantName?.[0] || "W"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {tenantName || "Workspace"}
                </div>
                <div className="text-xs text-slate-500">Active</div>
              </div>
              <div className="w-4 h-4 text-blue-600">✓</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Last Updated Indicator */}
        <div className="hidden xl:flex items-center space-x-2 text-xs text-slate-500">
          <span>Last updated:</span>
          <span>2 minutes ago</span>
        </div>
      </div>

      {/* Center Section - Global Search (Absolutely Centered) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
        <div className="relative hidden md:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200"
            data-testid="button-global-search"
          >
            <Search className="w-5 h-5 mr-3 text-slate-400" />
            <span className="flex-1 text-left">Search contacts, deals, companies...</span>
            <kbd className="hidden lg:inline-flex px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono text-slate-600">
              ⌘K
            </kbd>
          </button>
        </div>
        
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </div>

      {/* Right Section - Mobile Search + Notifications + User Menu */}
      <div className="flex items-center space-x-2 sm:space-x-4 ml-auto flex-shrink-0">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex md:hidden items-center justify-center w-10 h-10 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
          data-testid="button-mobile-search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-10 h-10 rounded-full text-slate-600 hover:bg-slate-100 transition-all duration-200"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
              data-testid="button-user-menu"
            >
              <Avatar className="w-9 h-9 border-2 border-white shadow-sm hover:shadow-md transition-shadow">
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            align="end"
            className="w-60 p-2 mt-2"
            data-testid="menu-user-dropdown"
          >
            {/* User Profile Header */}
            <div className="px-3 py-3 mb-2 bg-slate-50 rounded-md">
              <div className="text-sm font-semibold text-slate-900">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {user?.email}
              </div>
            </div>

            {/* Navigation Items */}
            <DropdownMenuItem
              className="px-3 py-2.5 cursor-pointer"
              data-testid="menu-item-manage-profile"
            >
              <User className="w-4 h-4 mr-3 text-slate-500" />
              <span>Manage Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="px-3 py-2.5 cursor-pointer"
              data-testid="menu-item-settings"
            >
              <Settings className="w-4 h-4 mr-3 text-slate-500" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="px-3 py-2.5 cursor-pointer"
              data-testid="menu-item-help"
            >
              <HelpCircle className="w-4 h-4 mr-3 text-slate-500" />
              <span>Help & Support</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2" />

            {/* Logout */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="px-3 py-2.5 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
              data-testid="menu-item-logout"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
