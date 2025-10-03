
import { Switch, Route } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, FileText, TrendingUp, PieChart } from "lucide-react";
import { useLocation } from "wouter";
import { lazy, Suspense } from "react";

// Import the actual finance pages
import InvoicesPage from "./invoices";
import ExpensesPage from "./expenses";
import PaymentsPage from "./payments";
import BudgetPage from "./budget";
import FinancialReportsPage from "./financial-reports";

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  );
}

// Placeholder component for upcoming features
function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function FinanceHeader() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="border-b bg-white dark:bg-slate-900 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/")}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Button>
          <div className="h-6 w-px bg-slate-200"></div>
          <h1 className="text-2xl font-bold text-green-600">Finance Module</h1>
        </div>
      </div>
    </div>
  );
}

function FinanceOverview() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <p className="text-slate-500 mt-2">
          Manage your financial operations, invoicing, expenses, and reporting.
        </p>
      </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                $8,234.50 total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,234.56</div>
              <p className="text-xs text-muted-foreground">
                +5.2% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">73%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Finance Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Invoicing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Create, send, and manage invoices
              </p>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/finance/invoices'}>
                View Invoices
              </Button>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Track and categorize expenses
              </p>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/finance/expenses'}>
                View Expenses
              </Button>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Financial Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Generate financial reports and analytics
              </p>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/finance/reports'}>
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Finance Module Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Module Setup</span>
                <span className="text-sm text-green-600 font-medium">Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Core Features</span>
                <span className="text-sm text-yellow-600 font-medium">In Development</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Advanced Analytics</span>
                <span className="text-sm text-slate-400 font-medium">Planned</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
}

export default function FinanceDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <FinanceHeader />
      
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          {/* Finance Dashboard Routes */}
          <Route path="/finance" component={FinanceOverview} />
          
          {/* Finance Module Routes with new Layout */}
          <Route path="/finance/invoices">
            <FinanceLayout title="Invoices">
              <InvoicesPage />
            </FinanceLayout>
          </Route>
          
          <Route path="/finance/expenses">
            <FinanceLayout title="Expenses">
              <ExpensesPage />
            </FinanceLayout>
          </Route>
          
          <Route path="/finance/payments">
            <FinanceLayout title="Payments">
              <PaymentsPage />
            </FinanceLayout>
          </Route>
          
          <Route path="/finance/budget">
            <FinanceLayout title="Budget">
              <BudgetPage />
            </FinanceLayout>
          </Route>
          
          <Route path="/finance/cash-flow">
            <FinanceLayout title="Cash Flow">
              <FinancialReportsPage />
            </FinanceLayout>
          </Route>
          
          <Route path="/finance/reports/financial">
            <FinanceLayout title="Financial Reports">
              <FinancialReportsPage />
            </FinanceLayout>
          </Route>
          
          <Route path="/finance/reports/profit-loss">
            <FinanceLayout title="Profit & Loss">
              <FinancialReportsPage />
            </FinanceLayout>
          </Route>
          
          <Route path="/finance/reports/balance-sheet">
            <FinanceLayout title="Balance Sheet">
              <FinancialReportsPage />
            </FinanceLayout>
          </Route>
          
          <Route path="/finance/settings/accounts">
            <FinanceLayout title="Chart of Accounts">
              <PlaceholderPage title="Chart of Accounts" description="Account management coming soon" />
            </FinanceLayout>
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
}