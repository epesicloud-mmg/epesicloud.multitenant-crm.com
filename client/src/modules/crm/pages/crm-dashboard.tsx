import { CRMLayout } from "../components/crm-layout";
import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";

// Lazy load CRM pages for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const AIDashboard = lazy(() => import("@/pages/ai-dashboard"));
const Contacts = lazy(() => import("@/pages/contacts"));
const Companies = lazy(() => import("@/pages/companies"));
const AllDeals = lazy(() => import("@/pages/all-deals"));
const Pipelines = lazy(() => import("@/pages/pipelines"));
const Activities = lazy(() => import("@/pages/activities"));
const UserManagement = lazy(() => import("@/pages/user-management"));
const ImportExport = lazy(() => import("@/pages/import-export"));

// Reports
const SalesPerformance = lazy(() => import("@/pages/reports/sales"));
const PipelineAnalysis = lazy(() => import("@/pages/reports/pipeline"));
const ActivityReports = lazy(() => import("@/pages/reports/activities"));
const RevenueReports = lazy(() => import("@/pages/reports/revenue"));

// Setup pages
const SetupProducts = lazy(() => import("@/pages/setup/products"));
const ActivityTypes = lazy(() => import("@/pages/setup/activity-types"));
const SalesPipelines = lazy(() => import("@/pages/setup/sales-pipelines"));

// Tools pages
const CRMAssistants = lazy(() => import("./crm-assistants"));
const CRMInstantSearch = lazy(() => import("./crm-instant-search"));
const ProductTypes = lazy(() => import("./products-types"));
const CustomerTypes = lazy(() => import("./setup-customer-types"));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function CRMDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          {/* CRM Dashboard Routes */}
          <Route path="/crm" component={AIDashboard} />
          <Route path="/crm/dashboard">
            <CRMLayout title="Dashboard">
              <Dashboard />
            </CRMLayout>
          </Route>
          
          {/* Core CRM Pages */}
          <Route path="/crm/contacts" component={() => <Contacts />} />
          <Route path="/crm/companies" component={() => <Companies />} />
          <Route path="/crm/deals" component={() => <AllDeals />} />
          <Route path="/crm/pipelines" component={() => <Pipelines />} />
          <Route path="/crm/activities" component={() => <Activities />} />
          
          {/* User Management */}
          <Route path="/crm/user-management">
            <CRMLayout title="User Management">
              <UserManagement />
            </CRMLayout>
          </Route>
          
          {/* Tools */}
          <Route path="/crm/import-export">
            <CRMLayout title="Import/Export">
              <ImportExport />
            </CRMLayout>
          </Route>
          
          {/* Reports */}
          <Route path="/crm/reports/sales">
            <CRMLayout title="Sales Reports">
              <SalesPerformance />
            </CRMLayout>
          </Route>
          <Route path="/crm/reports/pipeline">
            <CRMLayout title="Pipeline Analysis">
              <PipelineAnalysis />
            </CRMLayout>
          </Route>
          <Route path="/crm/reports/activities">
            <CRMLayout title="Activity Reports">
              <ActivityReports />
            </CRMLayout>
          </Route>
          <Route path="/crm/reports/revenue">
            <CRMLayout title="Revenue Reports">
              <RevenueReports />
            </CRMLayout>
          </Route>
          
          {/* Setup */}
          <Route path="/crm/setup/products" component={() => <SetupProducts />} />
          <Route path="/crm/setup/activity-types">
            <CRMLayout title="Activity Types">
              <ActivityTypes />
            </CRMLayout>
          </Route>
          <Route path="/crm/setup/sales-pipelines">
            <CRMLayout title="Sales Pipelines">
              <SalesPipelines />
            </CRMLayout>
          </Route>
          
          {/* Additional Reports */}
          <Route path="/crm/reports/custom">
            <CRMLayout title="Custom Reports">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Custom Reports</h2>
                <p>Build and customize reports to meet your specific needs.</p>
              </div>
            </CRMLayout>
          </Route>
          
          {/* Additional Setup Pages */}
          <Route path="/crm/setup/customer-types">
            <CRMLayout title="Customer Types">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Customer Types</h2>
                <p>Manage different customer categories and types.</p>
              </div>
            </CRMLayout>
          </Route>
          <Route path="/crm/setup/lead-sources">
            <CRMLayout title="Lead Sources">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Lead Sources</h2>
                <p>Configure where your leads come from.</p>
              </div>
            </CRMLayout>
          </Route>
          
          {/* Tools */}
          <Route path="/crm/assistants">
            <CRMLayout title="AI Assistants">
              <CRMAssistants />
            </CRMLayout>
          </Route>
          <Route path="/crm/instant-search">
            <CRMLayout title="Instant Search">
              <CRMInstantSearch />
            </CRMLayout>
          </Route>
          
          {/* Products pages */}
          <Route path="/crm/products/types">
            <CRMLayout title="Product Types">
              <ProductTypes />
            </CRMLayout>
          </Route>
          <Route path="/crm/products/categories">
            <CRMLayout title="Product Categories">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Product Categories</h2>
                <p>Organize products into categories.</p>
              </div>
            </CRMLayout>
          </Route>
          <Route path="/crm/products/offers">
            <CRMLayout title="Product Offers">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Product Offers</h2>
                <p>Manage special offers and promotions.</p>
              </div>
            </CRMLayout>
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
}