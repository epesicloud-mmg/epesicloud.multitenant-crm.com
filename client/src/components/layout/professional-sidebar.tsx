import { Link, useLocation } from "wouter";
import { Users, PieChart, Building, Handshake, Clock, BarChart, Download, Settings, Package, ChevronDown, ChevronRight, TrendingUp, Calendar, DollarSign, FileText, UserCog, Shield, UserCheck, MessageSquare, Target, Thermometer, Tag, Grid3X3, Percent, GitBranch } from "lucide-react";
import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { usePermissions } from "@/lib/permissions-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getNavigation = (modulePrefix: string) => [
  { name: "Dashboard", href: modulePrefix || "/", icon: PieChart, permission: "view_dashboard" },
  { name: "Deals", href: `${modulePrefix}/deals`, icon: Handshake, permission: "manage_deals" },
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
];

const getUserManagementSubMenu = (modulePrefix: string) => [
  { name: "Users Manager", href: `${modulePrefix}/user-management`, icon: UserCheck, permission: "manage_users" },
  { name: "Roles Manager", href: `${modulePrefix}/roles-management`, icon: Shield, permission: "manage_roles" },
];

const getProductsSubMenu = (modulePrefix: string) => [
  { name: "All Products", href: `${modulePrefix}/products`, icon: Package, permission: "manage_products" },
  { name: "Product Types", href: `${modulePrefix}/products/types`, icon: Tag, permission: "manage_products" },
  { name: "Categories", href: `${modulePrefix}/products/categories`, icon: Grid3X3, permission: "manage_products" },
  { name: "Offers & Deals", href: `${modulePrefix}/products/offers`, icon: Percent, permission: "manage_products" },
];

const getSetupSubMenu = (modulePrefix: string) => [
  { name: "Activity Types", href: `${modulePrefix}/setup/activity-types`, icon: MessageSquare, permission: "manage_interactions" },
  { name: "Sales Pipelines", href: `${modulePrefix}/setup/sales-pipelines`, icon: GitBranch, permission: "manage_setup" },
  { name: "Sales Stages", href: `${modulePrefix}/setup/sales-stages`, icon: Target, permission: "manage_setup" },
  { name: "Interest Levels", href: `${modulePrefix}/setup/interest-levels`, icon: Thermometer, permission: "manage_setup" },
];

interface ProfessionalSidebarProps {
  isCollapsed: boolean;
}

export function ProfessionalSidebar({ isCollapsed }: ProfessionalSidebarProps) {
  const [location] = useLocation();
  const { tenantName } = useTenant();
  const { hasPermission } = usePermissions();
  
  const getCurrentModulePrefix = () => {
    if (location.startsWith('/crm')) return '/crm';
    return '';
  };
  
  const modulePrefix = getCurrentModulePrefix();
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [userManagementExpanded, setUserManagementExpanded] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [setupExpanded, setSetupExpanded] = useState(false);

  const navigation = getNavigation(modulePrefix);
  const reportsSubMenu = getReportsSubMenu(modulePrefix);
  const userManagementSubMenu = getUserManagementSubMenu(modulePrefix);
  const productsSubMenu = getProductsSubMenu(modulePrefix);
  const setupSubMenu = getSetupSubMenu(modulePrefix);
  
  const filteredNavigation = navigation.filter(item => hasPermission(item.permission));
  const filteredReports = reportsSubMenu.filter(item => hasPermission(item.permission));
  const filteredUserManagement = userManagementSubMenu.filter(item => hasPermission(item.permission));
  const filteredProducts = productsSubMenu.filter(item => hasPermission(item.permission));
  const filteredSetup = setupSubMenu.filter(item => hasPermission(item.permission));

  if (!localStorage.getItem('userRole')) {
    localStorage.setItem('userRole', 'super admin');
  }

  const NavItem = ({ item }: { item: any }) => {
    const isActive = location === item.href;
    const content = (
      <Link 
        key={item.name} 
        href={item.href}
        className={`group flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-slate-700 hover:bg-slate-100"
        }`}
        data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <item.icon
          className={`${isCollapsed ? '' : 'mr-3'} w-5 h-5 ${
            isActive ? "text-primary" : "text-slate-500"
          }`}
        />
        {!isCollapsed && item.name}
      </Link>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  const ExpandableSection = ({ 
    title, 
    icon: Icon, 
    items, 
    expanded, 
    onToggle 
  }: { 
    title: string; 
    icon: any; 
    items: any[]; 
    expanded: boolean; 
    onToggle: () => void;
  }) => {
    if (items.length === 0) return null;

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center py-2.5 text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer">
                <Icon className="w-5 h-5 text-slate-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className="mt-1">
        <button
          onClick={onToggle}
          className="w-full text-slate-700 hover:bg-slate-100 group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200"
          data-testid={`button-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Icon className="text-slate-500 mr-3 w-5 h-5" />
          {title}
          {expanded ? (
            <ChevronDown className="ml-auto w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="ml-auto w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {expanded && (
          <div className="ml-6 space-y-0.5 mt-0.5">
            {items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                  data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className={`mr-3 w-4 h-4 ${
                    isActive ? "text-primary" : "text-slate-400"
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-18' : 'w-64'
    }`}>
      {/* Brand Section */}
      <div className={`flex items-center h-16 border-b border-slate-200 transition-all duration-300 ${
        isCollapsed ? 'justify-center px-2' : 'px-4'
      }`}>
        {isCollapsed ? (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <PieChart className="w-6 h-6 text-white" />
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-slate-900 text-base truncate">EpesiCRM</h1>
              <p className="text-xs text-slate-500 truncate">{tenantName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 bg-white overflow-y-auto ${isCollapsed ? 'py-4 px-2' : 'py-6 px-3'}`}>
        <div className="space-y-0.5">
          {filteredNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}

          <ExpandableSection
            title="Reports"
            icon={BarChart}
            items={filteredReports}
            expanded={reportsExpanded}
            onToggle={() => setReportsExpanded(!reportsExpanded)}
          />

          <ExpandableSection
            title="User Management"
            icon={UserCog}
            items={filteredUserManagement}
            expanded={userManagementExpanded}
            onToggle={() => setUserManagementExpanded(!userManagementExpanded)}
          />

          <ExpandableSection
            title="Products"
            icon={Package}
            items={filteredProducts}
            expanded={productsExpanded}
            onToggle={() => setProductsExpanded(!productsExpanded)}
          />

          <ExpandableSection
            title="Setup"
            icon={Settings}
            items={filteredSetup}
            expanded={setupExpanded}
            onToggle={() => setSetupExpanded(!setupExpanded)}
          />
        </div>
      </nav>
    </div>
  );
}
