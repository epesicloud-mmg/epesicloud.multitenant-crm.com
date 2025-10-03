import { Link, useLocation } from "wouter";
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  CreditCard, 
  PieChart, 
  Calculator,
  Receipt,
  Wallet,
  Building,
  Users,
  Settings,
  BarChart,
  Target,
  Calendar,
  RefreshCw,
  Minus,
  Landmark
} from "lucide-react";
import { useState } from "react";

const financeNavigation = [
  { name: "Dashboard", href: "/finance", icon: PieChart },
  { name: "Transactions", href: "/finance/transactions", icon: RefreshCw },
  { name: "Invoices", href: "/finance/invoices", icon: FileText },
  { name: "Bills", href: "/finance/bills", icon: Receipt },
  { name: "Credit Notes", href: "/finance/credit-notes", icon: Minus },
  { name: "Payments", href: "/finance/payments", icon: CreditCard },
  { name: "Expenses", href: "/finance/expenses", icon: Receipt },
  { name: "Budget", href: "/finance/budget", icon: Calculator },
];

const financeReports = [
  { name: "Financial Reports", href: "/finance/reports", icon: BarChart },
  { name: "Transaction Trail", href: "/finance/transaction-trail", icon: RefreshCw },
  { name: "Profit & Loss", href: "/finance/reports", icon: TrendingUp },
  { name: "Balance Sheet", href: "/finance/reports", icon: FileText },
];

const financeSettings = [
  { name: "Chart of Accounts", href: "/finance/chart-of-accounts", icon: Building },
  { name: "Bank Accounts", href: "/finance/bank-accounts", icon: Landmark },
  { name: "Payment Methods", href: "/finance/payments", icon: CreditCard },
];

export function FinanceSidebar() {
  const [location] = useLocation();
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  const renderNavItem = (item: any) => {
    const isActive = location === item.href;
    return (
      <Link 
        key={item.name} 
        href={item.href}
        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          isActive
            ? "bg-green-100 text-green-700 border-r-2 border-green-500"
            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        }`}
      >
        <item.icon
          className={`mr-3 w-4 h-4 ${
            isActive ? "text-green-600" : "text-slate-400"
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
    const Icon = icon;
    return (
      <div className="mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <div className="flex items-center">
            <Icon className="mr-3 w-4 h-4 text-slate-400" />
            {title}
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
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
      {/* Finance Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-green-600 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Finance Module
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {/* Main Navigation */}
        <div className="mb-6">
          {financeNavigation.map(renderNavItem)}
        </div>

        {/* Reports Section */}
        {renderExpandableSection(
          "Reports", 
          financeReports, 
          reportsExpanded, 
          setReportsExpanded,
          BarChart
        )}

        {/* Settings Section */}
        {renderExpandableSection(
          "Settings", 
          financeSettings, 
          settingsExpanded, 
          setSettingsExpanded,
          Settings
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Finance Module v1.0
        </div>
      </div>
    </div>
  );
}