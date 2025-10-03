import { lazy, Suspense } from 'react';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import { Route, Switch } from 'wouter';
import { AAMLayout } from './layouts/aam-layout';

// Lazy load AAM pages for better performance
const AAMDashboard = lazy(() => import('./pages/dashboard').then(m => ({ default: m.AAMDashboard })));
const PermissionsPage = lazy(() => import('./pages/permissions'));
const RoleManagementPage = lazy(() => import('./pages/role-management'));
const AccessControlPage = lazy(() => import('./pages/access-control'));
const SettingsPage = lazy(() => import('./pages/settings'));

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function AAMModule() {
  return (
    <AAMLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/aam" component={AAMDashboard} />
          
          {/* Placeholder routes for AAM features */}
          <Route path="/aam/users" component={UsersPage} />
          <Route path="/aam/roles" component={RolesPage} />
          
          <Route path="/aam/permissions" component={PermissionsPage} />
          <Route path="/aam/role-management" component={RoleManagementPage} />
          <Route path="/aam/access-control" component={AccessControlPage} />
          <Route path="/aam/settings" component={SettingsPage} />
          
          <Route>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
              <p className="text-gray-600">The requested AAM page was not found.</p>
            </div>
          </Route>
        </Switch>
      </Suspense>
    </AAMLayout>
  );
}