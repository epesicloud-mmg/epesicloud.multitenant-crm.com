import { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import { AnalyticsLayout } from './layouts/analytics-layout';

// Lazy load Analytics pages for better performance
const AnalyticsDashboard = lazy(() => import('./pages/dashboard'));
const ReportsPage = lazy(() => import('./pages/reports'));
const InsightsPage = lazy(() => import('./pages/insights'));
const ForecastingPage = lazy(() => import('./pages/forecasting'));

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function AnalyticsModule() {
  return (
    <AnalyticsLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/analytics" component={AnalyticsDashboard} />
          
          {/* Placeholder routes for Analytics features */}
          <Route path="/analytics/overview">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Analytics Overview</h2>
              <p className="text-gray-600">Comprehensive analytics overview coming soon...</p>
            </div>
          </Route>
          
          <Route path="/analytics/user-behavior">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">User Behavior</h2>
              <p className="text-gray-600">User behavior analytics coming soon...</p>
            </div>
          </Route>
          
          <Route path="/analytics/performance">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Performance</h2>
              <p className="text-gray-600">Performance analytics coming soon...</p>
            </div>
          </Route>
          
          <Route path="/analytics/business-intelligence">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Business Intelligence</h2>
              <p className="text-gray-600">Business intelligence features coming soon...</p>
            </div>
          </Route>
          
          <Route path="/analytics/reports" component={ReportsPage} />
          <Route path="/analytics/insights" component={InsightsPage} />
          <Route path="/analytics/forecasting" component={ForecastingPage} />
          
          <Route path="/analytics/goals">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Goals & KPIs</h2>
              <p className="text-gray-600">Goals and KPI tracking coming soon...</p>
            </div>
          </Route>
          
          <Route path="/analytics/settings">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-gray-600">Analytics settings coming soon...</p>
            </div>
          </Route>
          
          <Route>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
              <p className="text-gray-600">The requested Analytics page was not found.</p>
            </div>
          </Route>
        </Switch>
      </Suspense>
    </AnalyticsLayout>
  );
}