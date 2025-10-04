import { Link, useLocation } from "wouter";
import { Users, PieChart, Building, Handshake, Clock, BarChart, Download, Settings, Package, ChevronDown, ChevronRight, TrendingUp, Calendar, DollarSign, FileText, UserCog, Shield, UserCheck, Eye, MessageSquare, Target, Zap, GitBranch, Thermometer, Tag, Grid3X3, Percent, Wrench, Search, Bot } from "lucide-react";
import { useState } from "react";
import { usePermissions } from "@/lib/permissions-context";

const crmNavigation = [
  { name: "Dashboard", href: "/crm", icon: PieChart, permission: "view_dashboard" },
  { name: "Deals", href: "/crm/deals", icon: Handshake, permission: "manage_deals" },
  { name: "Pipelines", href: "/crm/pipelines", icon: GitBranch, permission: "manage_deals" },
  { name: "Activities", href: "/crm/activities", icon: Clock, permission: "manage_activities" },
  { name: "Contacts", href: "/crm/contacts", icon: Users, permission: "manage_contacts" },
  { name: "Companies", href: "/crm/companies", icon: Building, permission: "manage_companies" },
];

const crmReportsSubMenu = [
  { name: "Sales Performance", href: "/crm/reports/sales", icon: TrendingUp, permission: "view_reports" },
  { name: "Pipeline Analysis", href: "/crm/reports/pipeline", icon: BarChart, permission: "view_reports" },
  { name: "Activity Reports", href: "/crm/reports/activities", icon: Calendar, permission: "view_reports" },
  { name: "Revenue Reports", href: "/crm/reports/revenue", icon: DollarSign, permission: "view_reports" },
  { name: "Custom Reports", href: "/crm/reports/custom", icon: FileText, permission: "view_reports" },
  { name: "Event Analytics", href: "/crm/analytics/events", icon: Clock, permission: "manage_admin" },
];

const crmToolsSubMenu = [
  { name: "Import/Export", href: "/crm/import-export", icon: Download, permission: "export_data" },
  { name: "Assistants", href: "/crm/assistants", icon: Bot, permission: "manage_assistants" },
  { name: "Instant Search", href: "/crm/instant-search", icon: Search, permission: "manage_products" },
];

const crmUserManagementSubMenu = [
  { name: "Users Manager", href: "/crm/user-management", icon: UserCheck, permission: "manage_users" },
  { name: "Roles Manager", href: "/crm/roles-management", icon: Shield, permission: "manage_roles" },
];

const crmProductsSubMenu = [
  { name: "Products", href: "/crm/products", icon: Package, permission: "manage_products" },
  { name: "Product Types", href: "/crm/products/types", icon: Tag, permission: "manage_products" },
  { name: "Categories", href: "/crm/products/categories", icon: Grid3X3, permission: "manage_products" },
  { name: "Offers & Deals", href: "/crm/products/offers", icon: Percent, permission: "manage_products" },
];

const crmSetupSubMenu = [
  { name: "Projects", href: "/crm/setup/projects", icon: Target, permission: "manage_projects" },
  { name: "Activity Types", href: "/crm/setup/activity-types", icon: MessageSquare, permission: "manage_interactions" },
  { name: "Sales Pipelines", href: "/crm/setup/sales-pipelines", icon: GitBranch, permission: "manage_setup" },
  { name: "Interest Levels", href: "/crm/setup/interest-levels", icon: Thermometer, permission: "manage_setup" },
  { name: "Customer Types", href: "/crm/setup/customer-types", icon: Users, permission: "manage_customers" },
  { name: "Lead Sources", href: "/crm/setup/lead-sources", icon: Zap, permission: "manage_leads" },
];

export function CRMSidebar() {
  const [location] = useLocation();
  const { hasPermission } = usePermissions();
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [userManagementExpanded, setUserManagementExpanded] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [setupExpanded, setSetupExpanded] = useState(false);

  // Filter navigation items based on permissions
  const filteredNavigation = crmNavigation.filter(item => hasPermission(item.permission));
  const filteredReports = crmReportsSubMenu.filter(item => hasPermission(item.permission));
  const filteredTools = crmToolsSubMenu.filter(item => hasPermission(item.permission));
  const filteredUserManagement = crmUserManagementSubMenu.filter(item => hasPermission(item.permission));
  const filteredProducts = crmProductsSubMenu.filter(item => hasPermission(item.permission));
  const filteredSetup = crmSetupSubMenu.filter(item => hasPermission(item.permission));

  const renderNavItem = (item: any) => {
    const isActive = location === item.href;
    return (
      <Link 
        key={item.name} 
        href={item.href}
        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
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
  };

  const renderExpandableSection = (
    title: string, 
    items: any[], 
    expanded: boolean, 
    setExpanded: (expanded: boolean) => void,
    icon: any
  ) => {
    if (items.length === 0) return null;

    const Icon = icon;
    return (
      <div className="mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <div className="flex items-center">
            <Icon className="mr-3 w-4 h-4 text-slate-400" />
            {title}
          </div>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {expanded && (
          <div className="ml-6 mt-1 space-y-1">
            {items.map(renderNavItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {/* Main Navigation */}
        <div className="mb-6">
          {filteredNavigation.map(renderNavItem)}
        </div>

        {/* Reports Section */}
        {renderExpandableSection(
          "Reports", 
          filteredReports, 
          reportsExpanded, 
          setReportsExpanded,
          BarChart
        )}

        {/* Tools Section */}
        {renderExpandableSection(
          "Tools", 
          filteredTools, 
          toolsExpanded, 
          setToolsExpanded,
          Wrench
        )}

        {/* User Management Section */}
        {renderExpandableSection(
          "User Management", 
          filteredUserManagement, 
          userManagementExpanded, 
          setUserManagementExpanded,
          UserCog
        )}

        {/* Products Section */}
        {renderExpandableSection(
          "Products", 
          filteredProducts, 
          productsExpanded, 
          setProductsExpanded,
          Package
        )}

        {/* Setup Section */}
        {renderExpandableSection(
          "Setup", 
          filteredSetup, 
          setupExpanded, 
          setSetupExpanded,
          Settings
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          CRM Module v1.0
        </div>
      </div>
    </div>
  );
}