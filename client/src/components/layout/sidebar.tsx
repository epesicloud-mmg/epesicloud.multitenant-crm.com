import { Link, useLocation } from "wouter";
import { Users, PieChart, Building, Handshake, Clock, BarChart, Download, Settings, Package, ChevronDown, ChevronRight, TrendingUp, Calendar, DollarSign, FileText, UserCog, Shield, UserCheck, Eye, MessageSquare, Target, Zap, GitBranch, Thermometer, Tag, Grid3X3, Percent, Wrench, Search, Bot } from "lucide-react";
import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { usePermissions } from "@/lib/permissions-context";

const getNavigation = (modulePrefix: string) => [
  { name: "Dashboard", href: modulePrefix || "/", icon: PieChart, permission: "view_dashboard" },
  { name: "Deals", href: `${modulePrefix}/deals`, icon: Handshake, permission: "manage_deals" },
  { name: "Pipelines", href: `${modulePrefix}/pipelines`, icon: GitBranch, permission: "manage_deals" },
  { name: "Activities", href: `${modulePrefix}/activities`, icon: Clock, permission: "manage_activities" },
  { name: "Contacts", href: `${modulePrefix}/contacts`, icon: Users, permission: "manage_contacts" },
  { name: "Companies", href: `${modulePrefix}/companies`, icon: Building, permission: "manage_companies" },
];

const getReportsSubMenu = (modulePrefix: string) => [
  { name: "Sales Performance", href: `${modulePrefix}/reports/sales`, icon: TrendingUp, permission: "view_reports" },
  { name: "Pipeline Analysis", href: `${modulePrefix}/reports/pipeline`, icon: BarChart, permission: "view_reports" },
  { name: "Activity Reports", href: `${modulePrefix}/reports/activities`, icon: Calendar, permission: "view_reports" },
  { name: "Revenue Reports", href: `${modulePrefix}/reports/revenue`, icon: DollarSign, permission: "view_reports" },
  { name: "Custom Reports", href: `${modulePrefix}/reports/custom`, icon: FileText, permission: "view_reports" },
  { name: "Event Analytics", href: `${modulePrefix}/analytics/events`, icon: Clock, permission: "manage_admin" },
];

const analyticsSubMenu: { name: string; href: string; icon: any; permission: string; }[] = [];

const getToolsSubMenu = (modulePrefix: string) => [
  { name: "Import/Export", href: `${modulePrefix}/import-export`, icon: Download, permission: "export_data" },
  { name: "Assistants", href: `${modulePrefix}/assistants`, icon: Bot, permission: "manage_assistants" },
  { name: "Instant Search", href: `${modulePrefix}/instant-search`, icon: Search, permission: "manage_products" },
];

const getUserManagementSubMenu = (modulePrefix: string) => [
  { name: "Users Manager", href: `${modulePrefix}/user-management`, icon: UserCheck, permission: "manage_users" },
  { name: "Roles Manager", href: `${modulePrefix}/roles-management`, icon: Shield, permission: "manage_roles" },
];

const getWorkspacesSubMenu = (modulePrefix: string) => [
  { name: "Workspaces", href: `${modulePrefix}/workspaces`, icon: Building, permission: "manage_workspaces" },
];

const getProductsSubMenu = (modulePrefix: string) => [
  { name: "Products", href: `${modulePrefix}/products`, icon: Package, permission: "manage_products" },
  { name: "Product Types", href: `${modulePrefix}/products/types`, icon: Tag, permission: "manage_products" },
  { name: "Categories", href: `${modulePrefix}/products/categories`, icon: Grid3X3, permission: "manage_products" },
  { name: "Offers & Deals", href: `${modulePrefix}/products/offers`, icon: Percent, permission: "manage_products" },
];

const getSetupSubMenu = (modulePrefix: string) => [
  { name: "Projects", href: `${modulePrefix}/setup/projects`, icon: Target, permission: "manage_projects" },
  { name: "Activity Types", href: `${modulePrefix}/setup/activity-types`, icon: MessageSquare, permission: "manage_interactions" },
  { name: "Sales Pipelines", href: `${modulePrefix}/setup/sales-pipelines`, icon: GitBranch, permission: "manage_setup" },
  { name: "Interest Levels", href: `${modulePrefix}/setup/interest-levels`, icon: Thermometer, permission: "manage_setup" },
  { name: "Customer Types", href: `${modulePrefix}/setup/customer-types`, icon: Users, permission: "manage_customers" },
  { name: "Lead Sources", href: `${modulePrefix}/setup/lead-sources`, icon: Zap, permission: "manage_leads" },
];

const settingsSubMenu: { name: string; href: string; icon: any; permission: string; }[] = [];

export function Sidebar() {
  const [location] = useLocation();
  const { tenantName } = useTenant();
  const { hasPermission, permissions } = usePermissions();
  
  // Detect current module from location
  const getCurrentModulePrefix = () => {
    if (location.startsWith('/crm')) return '/crm';
    if (location.startsWith('/finance')) return '/finance';
    return '';
  };
  
  const modulePrefix = getCurrentModulePrefix();
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [userManagementExpanded, setUserManagementExpanded] = useState(false);
  const [workspacesExpanded, setWorkspacesExpanded] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [setupExpanded, setSetupExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  // Get module-aware navigation items
  const navigation = getNavigation(modulePrefix);
  const reportsSubMenu = getReportsSubMenu(modulePrefix);
  const toolsSubMenu = getToolsSubMenu(modulePrefix);
  const userManagementSubMenu = getUserManagementSubMenu(modulePrefix);
  const workspacesSubMenu = getWorkspacesSubMenu(modulePrefix);
  const productsSubMenu = getProductsSubMenu(modulePrefix);
  const setupSubMenu = getSetupSubMenu(modulePrefix);
  
  // Filter navigation items based on permissions
  const filteredNavigation = navigation.filter(item => hasPermission(item.permission));
  const filteredReports = reportsSubMenu.filter(item => hasPermission(item.permission));
  const filteredAnalytics = analyticsSubMenu.filter(item => hasPermission(item.permission));
  const filteredTools = toolsSubMenu.filter(item => hasPermission(item.permission));
  const filteredUserManagement = userManagementSubMenu.filter(item => hasPermission(item.permission));
  const filteredWorkspaces = workspacesSubMenu.filter(item => hasPermission(item.permission));
  const filteredProducts = productsSubMenu.filter(item => hasPermission(item.permission));
  const filteredSetup = setupSubMenu.filter(item => hasPermission(item.permission));
  const filteredSettings = settingsSubMenu.filter(item => hasPermission(item.permission));


  // Set localStorage to super admin for demo purposes if not set
  if (!localStorage.getItem('userRole')) {
    localStorage.setItem('userRole', 'super admin');
  }

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900">EpesiCRM</h1>
            <p className="text-xs text-slate-500">{tenantName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <div className="px-3 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <item.icon
                  className={`mr-3 w-4 h-4 ${
                    isActive ? "text-primary" : "text-slate-400"
                  }`}
                />
                {item.name}

              </Link>
            );
          })}
        </div>

        {/* Reports Section */}
        {filteredReports.length > 0 && (
          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reports
            </h3>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => setReportsExpanded(!reportsExpanded)}
                className="w-full text-slate-700 hover:bg-slate-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                <BarChart className="text-slate-400 mr-3 w-4 h-4" />
                Reports
                {reportsExpanded ? (
                  <ChevronDown className="ml-auto w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="ml-auto w-4 h-4 text-slate-400" />
                )}
              </button>
              
              {reportsExpanded && (
                <div className="ml-6 space-y-1">
                  {filteredReports.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm rounded-md ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <item.icon className={`mr-3 w-3 h-3 ${
                          isActive ? "text-primary" : "text-slate-400"
                        }`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {filteredAnalytics.length > 0 && (
          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Analytics
            </h3>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => setAnalyticsExpanded(!analyticsExpanded)}
                className="w-full text-slate-700 hover:bg-slate-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                <BarChart className="text-slate-400 mr-3 w-4 h-4" />
                Analytics
                {analyticsExpanded ? (
                  <ChevronDown className="ml-auto w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="ml-auto w-4 h-4 text-slate-400" />
                )}
              </button>
              
              {analyticsExpanded && (
                <div className="ml-6 space-y-1">
                  {filteredAnalytics.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm rounded-md ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <item.icon className={`mr-3 w-3 h-3 ${
                          isActive ? "text-primary" : "text-slate-400"
                        }`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tools Section */}
        {filteredTools.length > 0 && (
        <div className="mt-8 px-3">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tools
          </h3>
          <div className="mt-2 space-y-1">
            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="w-full text-slate-700 hover:bg-slate-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <Wrench className="text-slate-400 mr-3 w-4 h-4" />
              Tools
              {toolsExpanded ? (
                <ChevronDown className="ml-auto w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="ml-auto w-4 h-4 text-slate-400" />
              )}
            </button>
            
            {toolsExpanded && (
              <div className="ml-6 space-y-1">
                {toolsSubMenu.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm rounded-md ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className={`mr-3 w-3 h-3 ${
                        isActive ? "text-primary" : "text-slate-400"
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        )}

        {/* User Management Section */}
        {filteredUserManagement.length > 0 && (
          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              User Management
            </h3>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => setUserManagementExpanded(!userManagementExpanded)}
                className="w-full text-slate-700 hover:bg-slate-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                <UserCog className="text-slate-400 mr-3 w-4 h-4" />
                User Management
                {userManagementExpanded ? (
                  <ChevronDown className="ml-auto w-4 h-4" />
                ) : (
                  <ChevronRight className="ml-auto w-4 h-4" />
                )}
              </button>
              {userManagementExpanded && (
                <div className="ml-6 space-y-1">
                  {filteredUserManagement.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <item.icon
                          className={`mr-3 w-4 h-4 ${
                            isActive ? "text-primary" : "text-slate-400"
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Section */}
        {filteredProducts.length > 0 && (
          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Products
            </h3>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => setProductsExpanded(!productsExpanded)}
                className="w-full text-slate-700 hover:bg-slate-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                <Package className="text-slate-400 mr-3 w-4 h-4" />
                Products
                {productsExpanded ? (
                  <ChevronDown className="ml-auto w-4 h-4" />
                ) : (
                  <ChevronRight className="ml-auto w-4 h-4" />
                )}
              </button>
              {productsExpanded && (
                <div className="ml-6 space-y-1">
                  {filteredProducts.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <item.icon
                          className={`mr-3 w-4 h-4 ${
                            isActive ? "text-primary" : "text-slate-400"
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Setup Section */}
        {filteredSetup.length > 0 && (
          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Setup
            </h3>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => setSetupExpanded(!setupExpanded)}
                className="w-full text-slate-700 hover:bg-slate-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                <Settings className="text-slate-400 mr-3 w-4 h-4" />
                Setup
                {setupExpanded ? (
                  <ChevronDown className="ml-auto w-4 h-4" />
                ) : (
                  <ChevronRight className="ml-auto w-4 h-4" />
                )}
              </button>
              {setupExpanded && (
                <div className="ml-6 space-y-1">
                  {filteredSetup.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <item.icon
                          className={`mr-3 w-4 h-4 ${
                            isActive ? "text-primary" : "text-slate-400"
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Section */}
        {filteredSettings.length > 0 && (
          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Settings
            </h3>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className="w-full text-slate-700 hover:bg-slate-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                <Settings className="text-slate-400 mr-3 w-4 h-4" />
                Settings
                {settingsExpanded ? (
                  <ChevronDown className="ml-auto w-4 h-4" />
                ) : (
                  <ChevronRight className="ml-auto w-4 h-4" />
                )}
              </button>
              {settingsExpanded && (
                <div className="ml-6 space-y-1">
                  {filteredSettings.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <item.icon
                          className={`mr-3 w-4 h-4 ${
                            isActive ? "text-primary" : "text-slate-400"
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}


      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">Sarah Johnson</p>
            <p className="text-xs text-slate-500">Sales Manager</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Add default export for compatibility
export default Sidebar;